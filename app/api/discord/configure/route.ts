import { validateDiscordWebhook, sendDiscordMessage } from "@/lib/discord"
import { getServiceSupabase } from "@/lib/supabase"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl, eventTypes } = await request.json()

    if (!webhookUrl) {
      return Response.json({ error: "Webhook URL required" }, { status: 400 })
    }

    if (!validateDiscordWebhook(webhookUrl)) {
      return Response.json({ error: "Invalid Discord webhook URL format. Expected: https://discord.com/api/webhooks/..." }, { status: 400 })
    }

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

    // Default event types if none provided
    const enabledEvents = eventTypes || ["push", "pull_request", "issues", "release", "review", "ci"]

    // Test the webhook with a rich embed
    try {
      await sendDiscordMessage(webhookUrl, {
        embeds: [{
          title: "Opscord Connected Successfully",
          description: "Your Discord channel is now configured to receive GitHub notifications.",
          color: 0x00D9FF,
          fields: [
            {
              name: "Enabled Events",
              value: enabledEvents.map((e: string) => `• ${formatEventType(e)}`).join("\n"),
              inline: false
            }
          ],
          footer: {
            text: "Opscord • GitHub × Discord Integration"
          },
          timestamp: new Date().toISOString()
        }]
      })
    } catch (error) {
      return Response.json({ error: "Webhook test failed. Please verify the URL is correct." }, { status: 400 })
    }

    // Store the webhook URL in database
    try {
      console.log(`💾 Storing Discord webhook for user ${user.id}`)
      
      const { data: existingConfig } = await supabase
        .from('discord_configs')
        .select('id')
        .eq('user_id', user.id)
        .single()

      let result
      if (existingConfig) {
        // Update existing config
        result = await supabase
          .from('discord_configs')
          .update({ webhook_url: webhookUrl })
          .eq('user_id', user.id)
      } else {
        // Insert new config
        result = await supabase
          .from('discord_configs')
          .insert({
            user_id: user.id,
            webhook_url: webhookUrl,
          })
      }

      if (result.error) {
        console.error("❌ Discord config save error:", result.error)
        return Response.json({ 
          error: "Failed to save webhook to database. Please try again." 
        }, { status: 500 })
      }

      console.log(`✅ Discord webhook stored successfully for user ${user.id}`)
      return Response.json({ success: true, eventTypes: enabledEvents })
    } catch (dbError) {
      console.error("❌ Database error:", dbError)
      return Response.json({ 
        error: "Failed to save webhook configuration" 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Discord configuration error:", error)
    return Response.json({ error: "Failed to configure Discord webhook" }, { status: 500 })
  }
}

function formatEventType(type: string): string {
  const labels: Record<string, string> = {
    push: "Push Events",
    pull_request: "Pull Requests",
    issues: "Issues",
    release: "Releases",
    review: "PR Reviews",
    ci: "CI/CD Status"
  }
  return labels[type] || type
}
