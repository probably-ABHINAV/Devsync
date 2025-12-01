import { exchangeCodeForToken, getUserData } from "@/lib/github"
import { getServiceSupabase } from "@/lib/supabase"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  // Get the base URL from environment or request headers
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!baseUrl) {
    // Auto-detect from request headers (for production)
    const host = request.headers.get("host") || "localhost:5000"
    const proto = request.headers.get("x-forwarded-proto") || "http"
    baseUrl = `${proto}://${host}`
  }

  if (error) {
    return Response.redirect(`${baseUrl}/`)
  }

  if (!code) {
    return Response.json({ error: "No code provided" }, { status: 400 })
  }

  try {
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    const redirectUri = `${baseUrl}/api/auth/callback`

    if (!clientId || !clientSecret) {
      return Response.json({ error: "GitHub credentials not configured" }, { status: 500 })
    }

    const token = await exchangeCodeForToken(code, clientId, clientSecret, redirectUri)
    const userData = await getUserData(token)

    // Upsert user to Supabase (create new or update existing placeholder)
    const supabase = getServiceSupabase()
    const { error: upsertError } = await supabase.from('users').upsert({
      github_id: userData.id.toString(),
      username: userData.login,
      avatar_url: userData.avatar_url,
      name: userData.name || userData.login,
      email: userData.email,
      github_token: token,
    }, {
      onConflict: 'github_id'
    })
    
    if (upsertError) {
      console.error("Supabase upsert error:", upsertError)
      throw new Error(`Failed to store user data: ${upsertError.message}`)
    }

    // Fetch user ID from database
    const { data: userRecord } = await supabase
      .from('users')
      .select('id')
      .eq('github_id', userData.id.toString())
      .single()

    // Create initial user_stats if they don't exist
    if (userRecord?.id) {
      const { data: existingStats } = await supabase
        .from('user_stats')
        .select('id')
        .eq('user_id', userRecord.id)
        .single()

      if (!existingStats) {
        await supabase.from('user_stats').insert({
          user_id: userRecord.id,
          xp: 10,
          level: 1,
          prs_opened: 0,
          prs_merged: 0,
          prs_reviewed: 0,
          issues_created: 0,
          issues_closed: 0,
          commits_count: 0,
        })
      }

      // Sync GitHub activities to database
      try {
        await fetch(`${baseUrl}/api/sync-activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userRecord.id,
            githubToken: token,
            username: userData.login,
          }),
        })
      } catch (syncError) {
        console.error("Failed to sync activities:", syncError)
        // Don't throw - continue even if activity sync fails
      }
    }

    const cookieStore = await cookies()
    cookieStore.set("github_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
    
    cookieStore.set("github_user", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })

    return Response.redirect(`${baseUrl}/dashboard`)
  } catch (error) {
    console.error("GitHub auth error:", error)
    return Response.redirect(`${baseUrl}/?error=auth_failed`)
  }
}
