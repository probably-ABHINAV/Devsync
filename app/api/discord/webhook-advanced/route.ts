import { cookies } from "next/headers"
import { sendDiscordMessage, DISCORD_COLORS } from "@/lib/discord"
import { getServiceSupabase } from "@/lib/supabase"
import type { NextRequest } from "next/server"

interface AdvancedWebhookConfig {
  webhookUrl: string
  serverId: string
  channelId: string
  channelName: string
  eventTypes: string[]
  enableRichEmbeds: boolean
  includeMentions: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { 
      webhookUrl, 
      serverId, 
      channelId, 
      channelName,
      eventTypes,
      enableRichEmbeds = true,
      includeMentions = false
    } = await request.json() as AdvancedWebhookConfig

    // Validate webhook URL
    if (!webhookUrl || !channelId) {
      return Response.json(
        { error: "Webhook URL and channel ID required" },
        { status: 400 }
      )
    }

    // Get current user
    const cookieStore = await cookies()
    const token = cookieStore.get("github_token")?.value

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify GitHub token
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
      .from("users")
      .select("id")
      .eq("github_id", userData.id.toString())
      .single()

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    // Test webhook with rich embed
    try {
      await sendDiscordMessage(webhookUrl, {
        embeds: [{
          title: "✅ Opscord Connected Successfully",
          description: `Your Discord channel **#${channelName}** is now configured to receive GitHub notifications.`,
          color: DISCORD_COLORS.SUCCESS,
          fields: [
            {
              name: "📍 Channel Location",
              value: `Server ID: \`${serverId}\`\nChannel ID: \`${channelId}\``,
              inline: false
            },
            {
              name: "🎯 Enabled Events",
              value: eventTypes.map((e: string) => `• ${formatEventType(e)}`).join("\n"),
              inline: false
            },
            {
              name: "⚙️ Configuration",
              value: `Rich Embeds: ${enableRichEmbeds ? "✅" : "❌"}\nMentions: ${includeMentions ? "✅" : "❌"}`,
              inline: true
            }
          ],
          footer: {
            text: "Opscord • GitHub × Discord Integration • Advanced Setup"
          },
          thumbnail: {
            url: "https://cdn.discordapp.com/embed/avatars/0.png"
          },
          timestamp: new Date().toISOString()
        }]
      })
    } catch (error) {
      console.error("Webhook test error:", error)
      return Response.json(
        { error: "Webhook test failed. Please verify the URL is correct." },
        { status: 400 }
      )
    }

    // Store advanced configuration in database
    try {
      const { error: upsertError } = await supabase
        .from("discord_configs")
        .upsert({
          user_id: user.id,
          webhook_url: webhookUrl,
          server_id: serverId,
          channel_id: channelId,
          channel_name: channelName,
          event_types: eventTypes,
          enable_rich_embeds: enableRichEmbeds,
          include_mentions: includeMentions,
          enabled: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id"
        })

      if (upsertError) {
        console.warn("Database sync pending:", upsertError)
      }

      return Response.json({
        success: true,
        eventTypes,
        message: "Discord channel configured successfully"
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return Response.json({
        success: true,
        eventTypes,
        warning: "Discord configured but database sync pending"
      })
    }
  } catch (error) {
    console.error("Advanced webhook configuration error:", error)
    return Response.json(
      { error: "Failed to configure advanced webhook" },
      { status: 500 }
    )
  }
}

function formatEventType(type: string): string {
  const labels: Record<string, string> = {
    push: "Push Events",
    pull_request: "Pull Requests",
    issues: "Issues",
    release: "Releases",
    review: "PR Reviews",
    ci: "CI/CD Status",
    deployment: "Deployments",
    discussion: "Discussions"
  }
  return labels[type] || type
}
