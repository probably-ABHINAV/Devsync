import { validateDiscordWebhook, sendDiscordMessage } from "@/lib/discord"
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

    // Store the webhook URL and event types in cookies
    const cookieStore = await cookies()
    cookieStore.set("discord_webhook", webhookUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    })
    
    cookieStore.set("discord_event_types", JSON.stringify(enabledEvents), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    })

    return Response.json({ success: true, eventTypes: enabledEvents })
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
