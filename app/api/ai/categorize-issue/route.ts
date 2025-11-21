import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { categorizeIssue } from "@/lib/ai-client"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { issueId, title, body } = await req.json()

    if (!title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Categorize using AI
    const { category, severity } = await categorizeIssue(title, body || "")

    // Update issue with category and severity
    if (issueId) {
      await prisma.issue.update({
        where: { id: issueId },
        data: { category, severity },
      })
    }

    return NextResponse.json({ category, severity })
  } catch (error) {
    console.error("[AI Categorize Issue] Error:", error)
    return NextResponse.json({ error: "Failed to categorize issue" }, { status: 500 })
  }
}
