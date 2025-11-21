import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get repositories
    const repos = await prisma.repository.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { pullRequests: true, issues: true },
        },
      },
    })

    // Get all PRs
    const pullRequests = await prisma.pullRequest.findMany({
      where: {
        repository: {
          userId: session.user.id,
        },
      },
    })

    // Get all issues
    const issues = await prisma.issue.findMany({
      where: {
        repository: {
          userId: session.user.id,
        },
      },
    })

    // Calculate stats
    const stats = {
      totalRepos: repos.length,
      totalPRs: pullRequests.length,
      openPRs: pullRequests.filter((p) => p.state === "open").length,
      closedPRs: pullRequests.filter((p) => p.state === "closed").length,
      totalIssues: issues.length,
      openIssues: issues.filter((i) => i.state === "open").length,
      closedIssues: issues.filter((i) => i.state === "closed").length,
      bugIssues: issues.filter((i) => i.category === "bug").length,
      enhancementIssues: issues.filter((i) => i.category === "enhancement").length,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[Analytics API] Error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
