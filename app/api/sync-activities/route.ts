import { fetchUserActivities } from "@/lib/fetch-github-activities"
import { getServiceSupabase } from "@/lib/supabase"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, githubToken, username } = await request.json()

    if (!userId || !githubToken || !username) {
      return Response.json(
        { error: "Missing required fields: userId, githubToken, username" },
        { status: 400 }
      )
    }

    // Fetch activities from GitHub
    const activities = await fetchUserActivities(githubToken, username)

    if (activities.length === 0) {
      return Response.json({ success: true, activities: [] })
    }

    // Store in Supabase
    const supabase = getServiceSupabase()

    // First, try to delete old activities for this user to avoid duplicates
    await supabase.from("activities").delete().eq("user_id", userId)

    // Insert new activities
    const activitiesToInsert = activities.map((activity) => ({
      user_id: userId,
      repo_name: activity.repo_name,
      activity_type: activity.activity_type,
      pr_number: activity.pr_number || null,
      issue_number: activity.issue_number || null,
      title: activity.title,
      description: activity.description,
      metadata: {
        ...activity.metadata,
        pr_number: activity.pr_number,
        issue_number: activity.issue_number,
      },
      created_at: activity.created_at,
    }))

    const { error } = await supabase.from("activities").insert(activitiesToInsert)

    if (error) {
      console.error("Supabase insert error:", error)
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, count: activitiesToInsert.length })
  } catch (error) {
    console.error("Sync activities error:", error)
    return Response.json({ error: "Failed to sync activities" }, { status: 500 })
  }
}
