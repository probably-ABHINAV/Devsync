import { NextResponse } from "next/server"

export async function POST() {
  try {
    const clientId = process.env.DISCORD_CLIENT_ID
    const token = process.env.DISCORD_TOKEN

    if (!clientId || !token) {
      throw new Error("Missing Discord credentials")
    }

    const commands = [
      {
        name: "ping",
        description: "Check bot status",
      },
      {
        name: "help",
        description: "Get help with OpsCord commands",
      },
    ]

    const response = await fetch(`https://discord.com/api/v10/applications/${clientId}/commands`, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    })

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.statusText}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Command registration failed:", error)
    return NextResponse.json({ error: "Failed to register commands" }, { status: 500 })
  }
}
