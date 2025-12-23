import { NextRequest, NextResponse } from 'next/server'
import { ingestEvent } from '@/lib/ingest'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const eventType = req.headers.get('x-github-event')
    const payload = JSON.parse(rawBody)

    console.log(`🔥 GITHUB WEBHOOK HIT: ${eventType}`)

    // Extract basic info
    const repoName = payload.repository?.full_name || 'unknown/repo'
    
    // Determine normalized fields based on event type
    let activityType = 'unknown'
    let title = `GitHub Event: ${eventType}`
    let description = ''
    let prNumber = undefined
    let issueNumber = undefined
    let externalId = ''

    if (eventType === 'push') {
        activityType = 'push'
        title = `Pushed to ${payload.ref.replace('refs/heads/', '')}`
        description = payload.head_commit?.message || ''
        externalId = payload.head_commit?.id || payload.after
    } else if (eventType === 'pull_request') {
        activityType = `pr_${payload.action}`
        title = payload.pull_request.title
        prNumber = payload.pull_request.number
        description = payload.pull_request.body
        externalId = String(payload.pull_request.id)
    } else if (eventType === 'issues') {
        activityType = `issue_${payload.action}`
        title = payload.issue.title
        issueNumber = payload.issue.number
        description = payload.issue.body
        externalId = String(payload.issue.id)
    } else {
        // Fallback for other events
        externalId = String(Date.now()) // Not ideal for idempotency but prevents failure
    }

    if (!externalId) {
       console.warn('⚠️ No external ID found for GitHub event', eventType)
       externalId = `github_${Date.now()}_${Math.random()}`
    }

    // Call ingestEvent
    // Note: We are NOT passing userId here to keep the route thin. 
    // User mapping can be improved later by enhancing ingestEvent or a middleware.
    await ingestEvent({
      source: 'github',
      eventType: eventType || 'unknown',
      externalId,
      activityType,
      title,
      description,
      repoName,
      prNumber,
      issueNumber,
      metadata: payload
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('GitHub Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
