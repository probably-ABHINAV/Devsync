import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { generatePRSummary } from "@/lib/ai-client"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prId, title, body, repoName } = await req.json()

    if (!title || !repoName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate summary using AI
    const summary = await generatePRSummary(title, body || "", 0, repoName)

    // Update PR with summary
    if (prId) {
      await prisma.pullRequest.update({
        where: { id: prId },
        data: { summary },
      })
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("[AI Summarize PR] Error:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
