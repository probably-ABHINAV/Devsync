import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.GITHUB_OAUTH_ID
    if (!clientId) {
      return NextResponse.json({ error: "GitHub OAuth ID not configured" }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const redirectUri = `${baseUrl}/api/auth/callback/github`
    const scope = "repo,read:user,user:email"

    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error("[v0] GitHub OAuth URL error:", error)
    return NextResponse.json({ error: "Failed to generate OAuth URL" }, { status: 500 })
  }
}
