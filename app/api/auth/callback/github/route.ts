import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=no_code", request.url))
  }

  try {
    const clientId = process.env.GITHUB_OAUTH_ID
    const clientSecret = process.env.GITHUB_OAUTH_SECRET
    const baseUrl = new URL(request.url).origin

    if (!clientId || !clientSecret) {
      console.error("[v0] GitHub OAuth credentials not configured")
      return NextResponse.redirect(new URL("/auth/login?error=config_error", request.url))
    }

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${baseUrl}/api/auth/callback/github`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error("[v0] Failed to get GitHub access token:", tokenData)
      return NextResponse.redirect(new URL("/auth/login?error=token_error", request.url))
    }

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
      },
    })

    const userData = await userResponse.json()

    const supabase = await createClient()

    // Store the session data - you can use localStorage or cookies
    const sessionData = {
      provider: "github",
      providerId: userData.id,
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar_url,
      accessToken: tokenData.access_token,
    }

    // For now, redirect to dashboard - in production you'd store this properly
    const dashboardUrl = new URL("/dashboard", baseUrl)
    dashboardUrl.searchParams.set("session", Buffer.from(JSON.stringify(sessionData)).toString("base64"))

    return NextResponse.redirect(dashboardUrl)
  } catch (error) {
    console.error("[v0] GitHub callback error:", error)
    return NextResponse.redirect(new URL("/auth/login?error=callback_failed", request.url))
  }
}
