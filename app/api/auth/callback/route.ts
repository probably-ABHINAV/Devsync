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
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"}/api/auth/callback`

    if (!clientId || !clientSecret) {
      return Response.json({ error: "GitHub credentials not configured" }, { status: 500 })
    }

    const token = await exchangeCodeForToken(code, clientId, clientSecret)
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

    // Sync GitHub activities to database
    if (userRecord?.id) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"}/api/sync-activities`, {
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
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    cookieStore.set("github_user", JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    })

    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"}/`)
  } catch (error) {
    console.error("OAuth callback error:", error)
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`)
  }
}
