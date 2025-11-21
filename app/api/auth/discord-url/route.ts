import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.DISCORD_OAUTH_ID
    if (!clientId) {
      return NextResponse.json({ error: "Discord OAuth ID not configured" }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const redirectUri = `${baseUrl}/api/auth/callback/discord`
    const scope = "identify email"

    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error("[v0] Discord OAuth URL error:", error)
    return NextResponse.json({ error: "Failed to generate OAuth URL" }, { status: 500 })
  }
}
