import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=no_code", request.url))
  }

  try {
    const clientId = process.env.DISCORD_OAUTH_ID
    const clientSecret = process.env.DISCORD_OAUTH_SECRET
    const baseUrl = new URL(request.url).origin

    if (!clientId || !clientSecret) {
      console.error("[v0] Discord OAuth credentials not configured")
      return NextResponse.redirect(new URL("/auth/login?error=config_error", request.url))
    }

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${baseUrl}/api/auth/callback/discord`,
      }).toString(),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error("[v0] Failed to get Discord access token:", tokenData)
      return NextResponse.redirect(new URL("/auth/login?error=token_error", request.url))
    }

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    const sessionData = {
      provider: "discord",
      providerId: userData.id,
      email: userData.email,
      name: userData.username,
      avatar: userData.avatar,
      accessToken: tokenData.access_token,
    }

    // For now, redirect to dashboard - in production you'd store this properly
    const dashboardUrl = new URL("/dashboard", baseUrl)
    dashboardUrl.searchParams.set("session", Buffer.from(JSON.stringify(sessionData)).toString("base64"))

    return NextResponse.redirect(dashboardUrl)
  } catch (error) {
    console.error("[v0] Discord callback error:", error)
    return NextResponse.redirect(new URL("/auth/login?error=callback_failed", request.url))
  }
}
