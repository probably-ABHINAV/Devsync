import { verifyKey } from "discord-interactions"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || ""

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("x-signature-ed25519") || ""
  const timestamp = req.headers.get("x-signature-timestamp") || ""

  if (!verifyKey(body, signature, timestamp, PUBLIC_KEY)) {
    return NextResponse.json({ error: "Invalid request signature" }, { status: 401 })
  }

  const interaction = JSON.parse(body)

  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 })
  }

  if (interaction.type === 2) {
    const commandName = interaction.data?.name

    try {
      switch (commandName) {
        case "ping":
          return NextResponse.json({
            type: 4,
            data: { content: "Pong! OpsCord is online." }
          })
        
        case "help":
          return NextResponse.json({
            type: 4,
            data: { 
              content: "**OpsCord Commands**\n• `/ping` - Check bot status\n• `/help` - Show this help message" 
            }
          })

        default:
          return NextResponse.json({
            type: 4,
            data: { content: "Unknown command. Use `/help` for available commands." }
          })
      }
    } catch (error) {
      console.error("Interaction error:", error)
      return NextResponse.json({
        type: 4,
        data: { content: "An error occurred processing your command." }
      })
    }
  }

  return NextResponse.json({ error: "Unknown interaction type" }, { status: 400 })
}
