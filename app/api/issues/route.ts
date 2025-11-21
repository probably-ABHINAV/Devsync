import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const repoId = searchParams.get("repoId")

    const issues = await prisma.issue.findMany({
      where: repoId ? { repositoryId: repoId } : {},
      include: { repository: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(issues)
  } catch (error) {
    console.error("[Issues API] Error:", error)
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 })
  }
}
