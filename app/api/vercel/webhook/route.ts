import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { generateDeploymentSummary, VercelDeploymentInfo } from '@/lib/ai'
import { sendDiscordMessage, DISCORD_COLORS, RichDiscordEmbed, DiscordEmbedField } from '@/lib/discord'
import { getServiceSupabase } from '@/lib/supabase'

const VERCEL_WEBHOOK_SECRET = process.env.VERCEL_WEBHOOK_SECRET

interface VercelWebhookPayload {
  id: string
  type: string
  createdAt: number
  payload: {
    deployment?: {
      id: string
      name: string
      url: string
      meta?: {
        githubCommitRef?: string
        githubCommitSha?: string
        githubCommitMessage?: string
        githubCommitAuthorName?: string
      }
    }
    project?: {
      id: string
      name: string
    }
    target?: 'production' | 'preview' | 'development'
    url?: string
    name?: string
    alias?: string[]
    error?: {
      message: string
      code: string
    }
    links?: {
      deployment?: string
      project?: string
    }
    plan?: string
    regions?: string[]
    readyState?: string
    buildingAt?: number
    ready?: number
  }
}

function verifyVercelSignature(body: string, signature: string | null): boolean {
  if (!VERCEL_WEBHOOK_SECRET || !signature) {
    console.warn('⚠️ Vercel webhook signature verification skipped - no secret configured')
    return true
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha1', VERCEL_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error('❌ Signature verification failed:', error)
    return false
  }
}

async function getDiscordWebhookUrl(environment: string, isFailure: boolean): Promise<string | null> {
  const supabase = getServiceSupabase()
  
  const { data: config } = await supabase
    .from('discord_configs')
    .select('webhook_url')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (config?.webhook_url) {
    if (isFailure && environment === 'production') {
      console.log('📢 Production deployment FAILED - sending to configured Discord channel')
    } else if (environment === 'production') {
      console.log('📢 Production deployment notification - sending to configured Discord channel')
    } else {
      console.log(`📢 ${environment} deployment notification - sending to Discord`)
    }
    return config.webhook_url
  }

  console.warn('⚠️ No Discord webhook URL configured in database')
  return null
}

function formatDurationMs(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(seconds / 60)
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

function getStatusEmoji(type: string): string {
  switch (type) {
    case 'deployment.succeeded':
    case 'deployment.ready':
      return '✅'
    case 'deployment.error':
    case 'deployment.failed':
      return '❌'
    case 'deployment.canceled':
      return '⚠️'
    case 'deployment.created':
      return '🚀'
    default:
      return '📦'
  }
}

function getStatusColor(type: string): number {
  switch (type) {
    case 'deployment.succeeded':
    case 'deployment.ready':
      return DISCORD_COLORS.SUCCESS
    case 'deployment.error':
    case 'deployment.failed':
      return DISCORD_COLORS.FAILURE
    case 'deployment.canceled':
      return DISCORD_COLORS.WARNING
    default:
      return DISCORD_COLORS.INFO
  }
}

function mapVercelStatus(type: string): 'succeeded' | 'failed' | 'canceled' {
  switch (type) {
    case 'deployment.succeeded':
    case 'deployment.ready':
      return 'succeeded'
    case 'deployment.error':
    case 'deployment.failed':
      return 'failed'
    case 'deployment.canceled':
      return 'canceled'
    default:
      return 'succeeded'
  }
}

async function storeDeploymentEvent(payload: VercelWebhookPayload): Promise<void> {
  const supabase = getServiceSupabase()
  
  try {
    await supabase.from('webhooks').insert({
      event_type: payload.type,
      payload: payload,
      source: 'vercel',
      processed: true
    })
  } catch (error) {
    console.error('Failed to store deployment event:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-vercel-signature')

    if (!verifyVercelSignature(body, signature)) {
      console.error('❌ Invalid Vercel webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload: VercelWebhookPayload = JSON.parse(body)
    console.log(`📦 Received Vercel webhook: ${payload.type}`)

    const relevantEvents = [
      'deployment.succeeded',
      'deployment.ready',
      'deployment.error',
      'deployment.failed',
      'deployment.canceled'
    ]

    if (!relevantEvents.includes(payload.type)) {
      console.log(`ℹ️ Ignoring event type: ${payload.type}`)
      return NextResponse.json({ message: 'Event type ignored' }, { status: 200 })
    }

    await storeDeploymentEvent(payload)

    const projectName = payload.payload.project?.name || payload.payload.name || 'Unknown Project'
    const environment = payload.payload.target || 'preview'
    const isFailure = ['deployment.error', 'deployment.failed'].includes(payload.type)

    const discordWebhookUrl = await getDiscordWebhookUrl(environment, isFailure)
    if (!discordWebhookUrl) {
      console.warn('⚠️ No Discord webhook configured for deployments')
      return NextResponse.json({ 
        message: 'Webhook received but no Discord channel configured',
        type: payload.type 
      }, { status: 200 })
    }
    const deploymentUrl = payload.payload.url 
      ? `https://${payload.payload.url}` 
      : payload.payload.deployment?.url 
      ? `https://${payload.payload.deployment.url}` 
      : undefined
    
    const meta = payload.payload.deployment?.meta
    const duration = payload.payload.buildingAt && payload.payload.ready
      ? payload.payload.ready - payload.payload.buildingAt
      : undefined

    const deploymentInfo: VercelDeploymentInfo = {
      projectName,
      environment,
      status: mapVercelStatus(payload.type),
      url: deploymentUrl,
      branch: meta?.githubCommitRef,
      commitMessage: meta?.githubCommitMessage,
      commitSha: meta?.githubCommitSha,
      errorMessage: payload.payload.error?.message,
      duration
    }

    console.log('🤖 Generating AI deployment summary...')
    const aiSummary = await generateDeploymentSummary(deploymentInfo)
    console.log('✅ AI summary generated successfully')

    const statusEmoji = getStatusEmoji(payload.type)
    const statusColor = getStatusColor(payload.type)
    const statusText = payload.type.replace('deployment.', '').toUpperCase()

    const fields: DiscordEmbedField[] = [
      {
        name: '🌍 Environment',
        value: environment.charAt(0).toUpperCase() + environment.slice(1),
        inline: true
      },
      {
        name: '📊 Status',
        value: `${statusEmoji} ${statusText}`,
        inline: true
      }
    ]

    if (meta?.githubCommitRef) {
      fields.push({
        name: '🌿 Branch',
        value: meta.githubCommitRef,
        inline: true
      })
    }

    if (meta?.githubCommitSha) {
      fields.push({
        name: '📝 Commit',
        value: `\`${meta.githubCommitSha.substring(0, 7)}\``,
        inline: true
      })
    }

    if (duration) {
      fields.push({
        name: '⏱️ Duration',
        value: formatDurationMs(duration),
        inline: true
      })
    }

    if (meta?.githubCommitAuthorName) {
      fields.push({
        name: '👤 Author',
        value: meta.githubCommitAuthorName,
        inline: true
      })
    }

    fields.push({
      name: '🤖 AI Summary',
      value: aiSummary.summary,
      inline: false
    })

    if (aiSummary.highlights.length > 0) {
      fields.push({
        name: '✨ Highlights',
        value: aiSummary.highlights.map(h => `• ${h}`).join('\n'),
        inline: false
      })
    }

    if (aiSummary.potentialIssues.length > 0) {
      fields.push({
        name: '⚠️ Potential Issues',
        value: aiSummary.potentialIssues.map(i => `• ${i}`).join('\n'),
        inline: false
      })
    }

    if (aiSummary.recommendations.length > 0 && deploymentInfo.status === 'failed') {
      fields.push({
        name: '💡 Recommendations',
        value: aiSummary.recommendations.map(r => `• ${r}`).join('\n'),
        inline: false
      })
    }

    const embed: RichDiscordEmbed = {
      title: `${statusEmoji} Deployment ${statusText}: ${projectName}`,
      description: meta?.githubCommitMessage 
        ? `**Commit:** ${meta.githubCommitMessage}` 
        : deploymentInfo.status === 'failed'
        ? `**Error:** ${payload.payload.error?.message || 'Unknown error'}`
        : 'Deployment notification',
      url: deploymentUrl,
      color: statusColor,
      timestamp: new Date().toISOString(),
      fields,
      footer: {
        text: `OpsCord • Vercel Deployments • Impact: ${aiSummary.impactLevel.toUpperCase()}`
      }
    }

    await sendDiscordMessage(discordWebhookUrl, { embeds: [embed] })
    console.log(`✅ Deployment notification sent to Discord for ${projectName}`)

    return NextResponse.json({ 
      success: true,
      type: payload.type,
      project: projectName,
      environment,
      aiSummaryGenerated: true,
      discordNotified: true
    })

  } catch (error) {
    console.error('❌ Vercel webhook handler error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Vercel webhook endpoint active',
    supportedEvents: [
      'deployment.succeeded',
      'deployment.ready',
      'deployment.error',
      'deployment.failed',
      'deployment.canceled'
    ],
    features: [
      'Signature verification (x-vercel-signature)',
      'AI-powered deployment summaries (Gemini)',
      'Discord notifications with rich embeds',
      'Production deployment tracking'
    ],
    setup: {
      step1: 'Go to Vercel Dashboard → Settings → Webhooks',
      step2: 'Add webhook URL: https://your-domain.com/api/vercel/webhook',
      step3: 'Select events: deployment.succeeded, deployment.error',
      step4: 'Optional: Add VERCEL_WEBHOOK_SECRET for signature verification',
      step5: 'Configure Discord webhook URL in OpsCord dashboard'
    }
  })
}
