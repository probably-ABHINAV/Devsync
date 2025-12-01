import { getServiceSupabase } from "@/lib/supabase"
import { sendDiscordMessage } from "@/lib/discord"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const cookieStore = await cookies()
    const token = cookieStore.get("github_token")?.value

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get GitHub user data
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!userResponse.ok) {
      return Response.json({ error: "Failed to verify GitHub token" }, { status: 401 })
    }

    const userData = await userResponse.json()
    const supabase = getServiceSupabase()

    // Get user from database
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('github_id', userData.id.toString())
      .single()

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    // Get Discord webhook URL
    const { data: discordConfig } = await supabase
      .from('discord_configs')
      .select('webhook_url')
      .eq('user_id', user.id)
      .single()

    if (!discordConfig?.webhook_url) {
      return Response.json({ 
        error: "No Discord webhook configured",
        userId: user.id,
        status: "NOT_CONFIGURED"
      }, { status: 404 })
    }

    // Send test message
    try {
      await sendDiscordMessage(discordConfig.webhook_url, {
        embeds: [{
          title: "🧪 Webhook Test",
          description: "This is a test message from OpsCord to verify your webhook is working correctly!",
          color: 0x7289da,
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "Status",
              value: "✅ Webhook is properly configured",
              inline: false
            },
            {
              name: "Next Steps",
              value: "Push or create a PR in your GitHub repository to see live updates!",
              inline: false
            }
          ]
        }]
      })

      return Response.json({ 
        success: true,
        message: "Test message sent successfully!",
        webhookConfigured: true,
        userId: user.id
      })
    } catch (sendError) {
      console.error("Failed to send test message:", sendError)
      return Response.json({ 
        error: "Failed to send test message",
        details: sendError instanceof Error ? sendError.message : String(sendError),
        webhookFound: true,
        userId: user.id
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Test webhook error:", error)
    return Response.json({ 
      error: "Failed to test webhook",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
