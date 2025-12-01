import { getServiceSupabase } from "@/lib/supabase"
import { XP_REWARDS, calculateLevel, checkAndAwardBadges } from "@/lib/gamification"
import { cookies } from "next/headers"

interface GitHubActivity {
  id: string
  type: string
  actor: { login: string }
  repo: { name: string }
  payload: any
  created_at: string
}

async function fetchGitHubActivities(token: string, username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const events: GitHubActivity[] = await response.json()
    return events
  } catch (error) {
    console.error("Failed to fetch GitHub activities:", error)
    return []
  }
}

function mapGitHubEventToActivity(event: GitHubActivity) {
  let activityType = "other"
  let title = ""
  let description = ""
  let pr_number = null
  let issue_number = null

  switch (event.type) {
    case "PushEvent":
      activityType = "commit"
      title = `Pushed to ${event.repo.name}`
      description = event.payload.ref?.split("/").pop() || "main branch"
      break
    case "PullRequestEvent":
      if (event.payload.action === "opened") {
        activityType = "pr_opened"
        title = event.payload.pull_request?.title || "Opened PR"
        description = event.payload.pull_request?.body || ""
        pr_number = event.payload.pull_request?.number
      } else if (event.payload.action === "closed" && event.payload.pull_request?.merged) {
        activityType = "pr_merged"
        title = event.payload.pull_request?.title || "Merged PR"
        description = event.payload.pull_request?.body || ""
        pr_number = event.payload.pull_request?.number
      }
      break
    case "PullRequestReviewEvent":
      activityType = "code_review"
      title = `Reviewed PR #${event.payload.pull_request?.number}`
      description = event.payload.review?.body || "Code review"
      pr_number = event.payload.pull_request?.number
      break
    case "IssuesEvent":
      if (event.payload.action === "opened") {
        activityType = "issue_opened"
        title = event.payload.issue?.title || "Opened issue"
        description = event.payload.issue?.body || ""
        issue_number = event.payload.issue?.number
      } else if (event.payload.action === "closed") {
        activityType = "issue_closed"
        title = event.payload.issue?.title || "Closed issue"
        description = event.payload.issue?.body || ""
        issue_number = event.payload.issue?.number
      }
      break
  }

  return {
    activity_type: activityType,
    repo_name: event.repo.name,
    title,
    description,
    pr_number,
    issue_number,
    metadata: {
      github_event_id: event.id,
      github_event_type: event.type,
    },
    created_at: event.created_at,
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    let token = cookieStore.get("github_token")?.value
    let userCookie = cookieStore.get("github_user")?.value

    // Fallback: try to get from request body for production reliability
    if (!token || !userCookie) {
      try {
        const body = await request.json().catch(() => ({}))
        token = body.token || token
        userCookie = typeof body.user === 'string' ? body.user : (body.user ? JSON.stringify(body.user) : userCookie)
      } catch {}
    }

    if (!token || !userCookie) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    let userData
    try {
      userData = typeof userCookie === 'string' ? JSON.parse(userCookie) : userCookie
    } catch {
      return Response.json({ error: "Invalid user data" }, { status: 401 })
    }
    const supabase = getServiceSupabase()

    // Get or create user in database
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("github_id", userData.id.toString())
      .single()

    let userId = existingUser?.id

    if (!userId) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          github_id: userData.id.toString(),
          username: userData.login,
          name: userData.name || userData.login,
          avatar_url: userData.avatar_url,
          email: userData.email,
          github_token: token,
        })
        .select("id")
        .single()

      if (createError) {
        throw createError
      }

      userId = newUser?.id
    }

    if (!userId) {
      return Response.json({ error: "Failed to get user ID" }, { status: 500 })
    }

    // Fetch GitHub activities
    const githubActivities = await fetchGitHubActivities(token, userData.login)

    if (githubActivities.length === 0) {
      return Response.json({ success: true, synced: 0, message: "No new activities found" })
    }

    // Map and filter activities
    const activitiesToStore = githubActivities
      .map(mapGitHubEventToActivity)
      .filter((a) => a.activity_type !== "other")

    if (activitiesToStore.length === 0) {
      return Response.json({ success: true, synced: 0, message: "No mappable activities found" })
    }

    // Map activity types to GitHub event types
    const mapActivityToEventType = (activityType: string): string => {
      switch (activityType) {
        case 'commit': return 'PushEvent'
        case 'pr_opened': return 'PullRequestEvent'
        case 'pr_merged': return 'PullRequestEvent'
        case 'code_review': return 'PullRequestReviewEvent'
        case 'issue_opened': return 'IssuesEvent'
        case 'issue_closed': return 'IssuesEvent'
        default: return 'UnknownEvent'
      }
    }

    // Store activities in Supabase
    const { error } = await supabase.from("activities").insert(
      activitiesToStore.map((activity) => ({
        user_id: userId,
        event_type: mapActivityToEventType(activity.activity_type),
        activity_type: activity.activity_type,
        repo_name: activity.repo_name,
        pr_number: activity.pr_number || null,
        issue_number: activity.issue_number || null,
        title: activity.title,
        description: activity.description || null,
        metadata: activity.metadata,
        created_at: activity.created_at,
      }))
    )

    if (error) {
      console.error("Error storing activities:", error)
      return Response.json({ error: "Failed to store activities", details: error.message }, { status: 500 })
    }

    // Calculate XP from activities
    let totalXP = 0
    for (const activity of activitiesToStore) {
      switch (activity.activity_type) {
        case 'pr_opened':
          totalXP += XP_REWARDS.PR_OPENED
          break
        case 'pr_merged':
          totalXP += XP_REWARDS.PR_MERGED
          break
        case 'code_review':
        case 'pr_reviewed':
          totalXP += XP_REWARDS.PR_REVIEWED
          break
        case 'issue_opened':
        case 'issue_created':
          totalXP += XP_REWARDS.ISSUE_CREATED
          break
        case 'issue_closed':
          totalXP += XP_REWARDS.ISSUE_CLOSED
          break
        case 'commit':
          totalXP += XP_REWARDS.COMMIT
          break
      }
    }

    // Update user stats with XP
    if (totalXP > 0) {
      const { data: existingStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (existingStats) {
        const newXP = existingStats.xp + totalXP
        await supabase
          .from('user_stats')
          .update({
            xp: newXP,
            level: calculateLevel(newXP),
          })
          .eq('user_id', userId)
      } else {
        await supabase.from('user_stats').insert({
          user_id: userId,
          xp: totalXP,
          level: calculateLevel(totalXP),
        })
      }

      // Check and award badges
      await checkAndAwardBadges(userId)
    }

    return Response.json({
      success: true,
      synced: activitiesToStore.length,
      message: `Synced ${activitiesToStore.length} activities from GitHub`,
      xpAwarded: totalXP,
    })
  } catch (error) {
    console.error("Sync error:", error)
    return Response.json(
      { error: "Failed to sync activities", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// GET endpoint to trigger sync
export async function GET() {
  return POST(new Request("", { method: "POST" }))
}
