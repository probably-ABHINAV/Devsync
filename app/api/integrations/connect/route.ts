import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, token, guildId, channelId } = await req.json()

    const integration = await prisma.integration.upsert({
      where: {
        userId_type: { userId: session.user.id, type },
      },
      create: {
        userId: session.user.id,
        type,
        token,
        guildId,
        channelId,
      },
      update: {
        token,
        guildId,
        channelId,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, integration })
  } catch (error) {
    console.error("[Integration] Error:", error)
    return NextResponse.json({ error: "Failed to connect integration" }, { status: 500 })
  }
}
