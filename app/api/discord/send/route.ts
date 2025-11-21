import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(req: Request) {
  try {
    const { channelId, botToken, embeds, content } = await req.json()

    if (!channelId || !botToken) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const response = await axios.post(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        content: content || "",
        embeds: embeds || [],
      },
      {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      },
    )

    return NextResponse.json({ success: true, messageId: response.data.id })
  } catch (error) {
    console.error("[Discord Send] Error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
