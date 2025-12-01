import { fetchUserActivities } from "@/lib/fetch-github-activities"
import { getServiceSupabase } from "@/lib/supabase"
import { XP_REWARDS, calculateLevel, checkAndAwardBadges } from "@/lib/gamification"
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

    // Store in Supabase
    const supabase = getServiceSupabase()

    if (activities.length === 0) {
      return Response.json({ success: true, activities: [], xpAwarded: 0 })
    }

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

    // Calculate XP from activities and update user_stats
    let totalXP = 0
    let prsOpened = 0
    let prsMerged = 0
    let prsReviewed = 0
    let issuesCreated = 0
    let issuesClosed = 0
    let commitsCount = 0

    for (const activity of activities) {
      switch (activity.activity_type) {
        case 'pr_opened':
          totalXP += XP_REWARDS.PR_OPENED
          prsOpened++
          break
        case 'pr_merged':
          totalXP += XP_REWARDS.PR_MERGED
          prsMerged++
          break
        case 'pr_reviewed':
        case 'review':
          totalXP += XP_REWARDS.PR_REVIEWED
          prsReviewed++
          break
        case 'issue_created':
        case 'issue_opened':
          totalXP += XP_REWARDS.ISSUE_CREATED
          issuesCreated++
          break
        case 'issue_closed':
          totalXP += XP_REWARDS.ISSUE_CLOSED
          issuesClosed++
          break
        case 'commit':
        case 'push':
          totalXP += XP_REWARDS.COMMIT
          commitsCount++
          break
      }
    }

    // Update user_stats with calculated values
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
            prs_opened: existingStats.prs_opened + prsOpened,
            prs_merged: existingStats.prs_merged + prsMerged,
            prs_reviewed: existingStats.prs_reviewed + prsReviewed,
            issues_created: existingStats.issues_created + issuesCreated,
            issues_closed: existingStats.issues_closed + issuesClosed,
            commits_count: existingStats.commits_count + commitsCount,
          })
          .eq('user_id', userId)
      } else {
        await supabase.from('user_stats').insert({
          user_id: userId,
          xp: totalXP,
          level: calculateLevel(totalXP),
          prs_opened: prsOpened,
          prs_merged: prsMerged,
          prs_reviewed: prsReviewed,
          issues_created: issuesCreated,
          issues_closed: issuesClosed,
          commits_count: commitsCount,
        })
      }

      // Check and award badges based on new stats
      await checkAndAwardBadges(userId)
    }

    return Response.json({ 
      success: true, 
      count: activitiesToInsert.length,
      xpAwarded: totalXP
    })
  } catch (error) {
    console.error("Sync activities error:", error)
    return Response.json({ error: "Failed to sync activities" }, { status: 500 })
  }
}
