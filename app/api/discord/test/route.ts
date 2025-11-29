import { getServiceSupabase } from '@/lib/supabase'
import { sendDiscordMessage } from '@/lib/discord'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('github_user')?.value

    if (!userCookie) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userData = JSON.parse(userCookie)
    const supabase = getServiceSupabase()

    // Get user and their Discord webhook
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', userData.login)
      .single()

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Get Discord config
    const { data: discordConfig } = await supabase
      .from('discord_configs')
      .select('webhook_url')
      .eq('user_id', user.id)
      .single()

    if (!discordConfig?.webhook_url) {
      return Response.json({ error: 'Discord webhook not configured', configured: false }, { status: 400 })
    }

    // Send test message
    await sendDiscordMessage(discordConfig.webhook_url, {
      embeds: [{
        title: '🧪 OpsCord Test Event',
        description: `Test notification from OpsCord at ${new Date().toLocaleTimeString()}`,
        color: 0x00FF00,
        fields: [
          {
            name: 'Status',
            value: '✅ Webhook is working correctly!',
            inline: false
          },
          {
            name: 'User',
            value: `${userData.name || userData.login}`,
            inline: true
          },
          {
            name: 'Timestamp',
            value: new Date().toISOString(),
            inline: true
          }
        ],
        footer: {
          text: 'OpsCord • Test Message'
        },
        timestamp: new Date().toISOString()
      }]
    })

    return Response.json({ 
      success: true, 
      message: 'Test event sent to Discord!',
      webhook: discordConfig.webhook_url.substring(0, 50) + '...'
    })
  } catch (error) {
    console.error('Discord test error:', error)
    return Response.json(
      { 
        error: 'Failed to send test event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
