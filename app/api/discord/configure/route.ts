import { validateDiscordWebhook, sendDiscordMessage } from "@/lib/discord"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl } = await request.json()

    if (!webhookUrl) {
      return Response.json({ error: "Webhook URL required" }, { status: 400 })
    }

    if (!validateDiscordWebhook(webhookUrl)) {
      return Response.json({ error: "Invalid Discord webhook URL" }, { status: 400 })
    }

    // Test the webhook
    await sendDiscordMessage(webhookUrl, "GitHub Discord integration connected! 🎉")

    // Store the webhook URL in cookies
    const cookieStore = await cookies()
    cookieStore.set("discord_webhook", webhookUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Discord configuration error:", error)
    return Response.json({ error: "Failed to configure Discord webhook" }, { status: 500 })
  }
}
