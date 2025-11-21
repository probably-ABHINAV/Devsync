import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider")
  const baseUrl = request.nextUrl.origin

  if (!provider || !["github", "discord"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
  }

  try {
    if (provider === "github") {
      const clientId = process.env.GITHUB_OAUTH_ID
      if (!clientId) {
        console.error("[v0] GitHub OAuth ID not configured")
        return NextResponse.json({ error: "GitHub OAuth not configured" }, { status: 500 })
      }

      const redirectUri = `${baseUrl}/api/auth/callback/github`
      const scope = "repo,read:user,user:email"
      const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`

      console.log("[v0] GitHub OAuth URL generated:", url)
      return NextResponse.json({ url })
    }

    if (provider === "discord") {
      const clientId = process.env.DISCORD_OAUTH_ID
      if (!clientId) {
        console.error("[v0] Discord OAuth ID not configured")
        return NextResponse.json({ error: "Discord OAuth not configured" }, { status: 500 })
      }

      const redirectUri = `${baseUrl}/api/auth/callback/discord`
      const scope = "identify email"
      const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`

      console.log("[v0] Discord OAuth URL generated:", url)
      return NextResponse.json({ url })
    }

    return NextResponse.json({ error: "Provider not handled" }, { status: 400 })
  } catch (error) {
    console.error("[v0] OAuth URL error:", error)
    return NextResponse.json({ error: "Failed to generate OAuth URL", details: String(error) }, { status: 500 })
  }
}
