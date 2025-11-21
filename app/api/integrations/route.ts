import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const integrations = await prisma.integration.findMany({
      where: { userId: session.user.id },
    })

    return NextResponse.json(integrations)
  } catch (error) {
    console.error("[Integrations API] Error:", error)
    return NextResponse.json({ error: "Failed to fetch integrations" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const integrationId = searchParams.get("id")

    if (!integrationId) {
      return NextResponse.json({ error: "Integration ID required" }, { status: 400 })
    }

    await prisma.integration.delete({
      where: { id: integrationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Integrations API] Error:", error)
    return NextResponse.json({ error: "Failed to delete integration" }, { status: 500 })
  }
}
