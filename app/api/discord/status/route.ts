import { getServiceSupabase } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("github_token")?.value

    if (!token) {
      return Response.json({
        connected: false,
        webhookUrl: null,
      })
    }

    // Get user data from token
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!userResponse.ok) {
      return Response.json({
        connected: false,
        webhookUrl: null,
      })
    }

    const userData = await userResponse.json()
    const supabase = getServiceSupabase()

    // Get user from database
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('github_id', userData.id.toString())
      .single()

    if (!user) {
      return Response.json({
        connected: false,
        webhookUrl: null,
      })
    }

    // Get Discord webhook from database
    const { data: discordConfig } = await supabase
      .from('discord_configs')
      .select('webhook_url')
      .eq('user_id', user.id)
      .single()

    const webhookUrl = discordConfig?.webhook_url

    return Response.json({
      connected: !!webhookUrl,
      webhookUrl: webhookUrl ? webhookUrl.substring(0, 50) + "..." : null,
    })
  } catch (error) {
    console.error("Discord status error:", error)
    return Response.json({
      connected: false,
      webhookUrl: null,
    })
  }
}
