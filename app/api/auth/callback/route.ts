import { exchangeCodeForToken, getUserData } from "@/lib/github"
import { getServiceSupabase } from "@/lib/supabase"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`)
  }

  if (!code) {
    return Response.json({ error: "No code provided" }, { status: 400 })
  }

  try {
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/callback`

    if (!clientId || !clientSecret) {
      return Response.json({ error: "GitHub credentials not configured" }, { status: 500 })
    }

    const token = await exchangeCodeForToken(code, clientId, clientSecret)
    const userData = await getUserData(token)

    // Upsert user to Supabase (create new or update existing placeholder)
    const supabase = getServiceSupabase()
    await supabase.from('users').upsert(
      {
        github_id: userData.id.toString(),
        username: userData.login,
        avatar_url: userData.avatar_url,
        name: userData.name || userData.login,
        email: userData.email,
        github_token: token,
      },
      {
        onConflict: 'github_id', // Update existing record if github_id already exists
      }
    )

    const cookieStore = await cookies()
    cookieStore.set("github_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    cookieStore.set("github_user", JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    })

    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/`)
  } catch (error) {
    console.error("OAuth callback error:", error)
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`)
  }
}
