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

    let query = prisma.pullRequest.findMany({
      include: { repository: true },
      orderBy: { createdAt: "desc" },
    })

    if (repoId) {
      query = prisma.pullRequest.findMany({
        where: { repositoryId: repoId },
        include: { repository: true },
        orderBy: { createdAt: "desc" },
      })
    }

    const prs = await query

    return NextResponse.json(prs)
  } catch (error) {
    console.error("[PRs API] Error:", error)
    return NextResponse.json({ error: "Failed to fetch pull requests" }, { status: 500 })
  }
}
