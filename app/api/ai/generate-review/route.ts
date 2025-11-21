import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { generateCodeReview } from "@/lib/ai-client"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, body, filesChanged } = await req.json()

    if (!title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate code review
    const review = await generateCodeReview(title, body || "", filesChanged || [])

    return NextResponse.json({ review })
  } catch (error) {
    console.error("[AI Code Review] Error:", error)
    return NextResponse.json({ error: "Failed to generate review" }, { status: 500 })
  }
}
