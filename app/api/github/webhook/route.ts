import { sendDiscordMessage } from "@/lib/discord"
import { summarizePR } from "@/lib/ai"
import { awardXP } from "@/lib/gamification"
import { getServiceSupabase } from "@/lib/supabase"
import type { NextRequest } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-hub-signature-256")
    const body = await request.text()

    // Verify webhook signature
    const secret = process.env.GITHUB_WEBHOOK_SECRET || ""
    if (signature && secret) {
      const hash = crypto.createHmac("sha256", secret).update(body).digest("hex")
      const expected = `sha256=${hash}`

      if (signature !== expected) {
        return Response.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const event = JSON.parse(body)
    const supabase = getServiceSupabase()

    // Get repository owner (who configured OpsCord) - this is who gets notifications
    const repoOwner = event.repository?.owner?.login
    let repoOwnerUserId: string | null = null
    let webhookUrl: string | null = null

    if (repoOwner) {
      const { data: ownerUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', repoOwner)
        .single()
      
      repoOwnerUserId = ownerUser?.id || null

      // Get Discord webhook URL from repository owner's config
      if (repoOwnerUserId) {
        const { data: discordConfig } = await supabase
          .from('discord_configs')
          .select('webhook_url')
          .eq('user_id', repoOwnerUserId)
          .single()
        
        webhookUrl = discordConfig?.webhook_url || null
      }
    }

    // Get contributor's user ID (who triggered the event) - for XP and activity tracking
    const contributorUsername = event.sender?.login
    let contributorUserId: string | null = null

    if (contributorUsername) {
      const { data: contributor } = await supabase
        .from('users')
        .select('id')
        .eq('username', contributorUsername)
        .single()
      
      contributorUserId = contributor?.id || null

      // Auto-create user record for new contributors
      if (!contributorUserId && event.sender) {
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            github_id: event.sender.id.toString(),
            username: event.sender.login,
            avatar_url: event.sender.avatar_url,
            name: event.sender.login,
            email: null,
            github_token: '', // Will be set when they log in
          })
          .select('id')
          .single()
        
        contributorUserId = newUser?.id || null
      }
    }

    // Handle different event types
    let message = ""
    let title = ""
    let activityType = ""
    let description = ""

    // PR Events
    if (event.action === "opened" && event.pull_request) {
      title = "🔀 New Pull Request"
      message = `**[${event.repository.name}]** ${event.pull_request.title}\n${event.pull_request.html_url}`
      activityType = "pr_opened"
      description = event.pull_request.title
      
      // Award XP to contributor
      if (contributorUserId) {
        await awardXP(contributorUserId, 'PR_OPENED')
      }

      // Generate AI summary
      try {
        const diff = await fetchPRDiff(event.pull_request.diff_url)
        const summary = await summarizePR(
          event.pull_request.title,
          event.pull_request.body || '',
          diff,
          event.pull_request.changed_files || 0
        )

        // Store summary in database
        await supabase.from('pr_summaries').insert({
          pr_number: event.pull_request.number,
          repo_name: event.repository.full_name,
          summary: summary.summary,
          key_changes: summary.keyChanges,
          risks: summary.risks,
          recommendations: summary.recommendations,
          complexity: summary.complexity,
        })

        // Enhanced Discord message with AI summary
        const complexityColor = summary.complexity === 'low' ? '🟢' : summary.complexity === 'high' ? '🔴' : '🟡'
        message = `**[${event.repository.name}]** ${event.pull_request.title}\n${event.pull_request.html_url}\n\n**🤖 AI Summary:**\n${summary.summary}\n\n**Complexity:** ${complexityColor} ${summary.complexity.toUpperCase()}\n\n**Key Changes:**\n${summary.keyChanges.map(c => `• ${c}`).join('\n')}`
        
        if (summary.risks.length > 0) {
          message += `\n\n**⚠️ Risks:**\n${summary.risks.map(r => `• ${r}`).join('\n')}`
        }
      } catch (aiError) {
        console.error('AI summary failed:', aiError)
        // Continue with basic notification
      }

      // Log activity for contributor
      if (contributorUserId) {
        await supabase.from('activities').insert({
          user_id: contributorUserId,
          activity_type: activityType,
          repo_name: event.repository.name,
          pr_number: event.pull_request.number,
          title: event.pull_request.title,
          description: `Opened PR #${event.pull_request.number}`,
          metadata: {
            url: event.pull_request.html_url,
            author: event.pull_request.user.login,
          }
        })
      }
    } 
    else if (event.action === "closed" && event.pull_request?.merged) {
      title = "✅ Pull Request Merged"
      message = `**[${event.repository.name}]** ${event.pull_request.title}\n${event.pull_request.html_url}\n\n🎉 Merged by ${event.pull_request.merged_by?.login || 'unknown'}`
      activityType = "pr_merged"
      
      // Award XP for merged PR to contributor
      if (contributorUserId) {
        await awardXP(contributorUserId, 'PR_MERGED')
      }

      // Log activity for contributor
      if (contributorUserId) {
        await supabase.from('activities').insert({
          user_id: contributorUserId,
          activity_type: activityType,
          repo_name: event.repository.name,
          pr_number: event.pull_request.number,
          title: event.pull_request.title,
          description: `Merged PR #${event.pull_request.number}`,
          metadata: {
            url: event.pull_request.html_url,
            merged_by: event.pull_request.merged_by?.login,
          }
        })
      }
    }
    else if (event.action === "submitted" && event.review) {
      title = "👀 PR Review Submitted"
      message = `**[${event.repository.name}]** Review on PR #${event.pull_request.number}\nBy: ${event.review.user.login}\n${event.review.html_url}`
      activityType = "pr_reviewed"
      
      // Award XP for review
      const { data: reviewer } = await supabase
        .from('users')
        .select('id')
        .eq('username', event.review.user.login)
        .single()
      
      if (reviewer) {
        await awardXP(reviewer.id, 'PR_REVIEWED')
      }
    }
    else if (event.action === "opened" && event.issue) {
      title = "📝 New Issue"
      message = `**[${event.repository.name}]** ${event.issue.title}\n${event.issue.html_url}`
      activityType = "issue_opened"
      
      // Award XP to contributor
      if (contributorUserId) {
        await awardXP(contributorUserId, 'ISSUE_CREATED')
      }

      // Log activity for contributor
      if (contributorUserId) {
        await supabase.from('activities').insert({
          user_id: contributorUserId,
          activity_type: activityType,
          repo_name: event.repository.name,
          issue_number: event.issue.number,
          title: event.issue.title,
          description: `Created issue #${event.issue.number}`,
          metadata: {
            url: event.issue.html_url,
          }
        })
      }
    }
    else if (event.action === "closed" && event.issue) {
      title = "✅ Issue Closed"
      message = `**[${event.repository.name}]** ${event.issue.title}\n${event.issue.html_url}`
      activityType = "issue_closed"
      
      // Award XP to contributor
      if (contributorUserId) {
        await awardXP(contributorUserId, 'ISSUE_CLOSED')
      }

      // Log activity for contributor
      if (contributorUserId) {
        await supabase.from('activities').insert({
          user_id: contributorUserId,
          activity_type: activityType,
          repo_name: event.repository.name,
          issue_number: event.issue.number,
          title: event.issue.title,
          description: `Closed issue #${event.issue.number}`,
          metadata: {
            url: event.issue.html_url,
          }
        })
      }
    }
    else if (event.ref && event.repository && event.commits) {
      title = "🚀 New Push"
      const branch = event.ref.split("/").pop()
      const commitCount = event.commits?.length || 0
      message = `**[${event.repository.name}:${branch}]** ${commitCount} new commit${commitCount !== 1 ? 's' : ''}`
      
      // Award XP for commits to contributor
      if (contributorUserId && commitCount > 0) {
        for (let i = 0; i < Math.min(commitCount, 10); i++) {
          await awardXP(contributorUserId, 'COMMIT')
        }
      }
    }

    // Send to Discord if configured
    if (message && webhookUrl) {
      await sendDiscordMessage(webhookUrl, message, title)
    }

    // Store webhook event (for repo owner)
    if (repoOwnerUserId) {
      await supabase.from('webhooks').insert({
        user_id: repoOwnerUserId,
        repo_name: event.repository?.name || 'unknown',
        event_type: event.action || 'unknown',
        payload: event,
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return Response.json({ success: true }) // Return success to prevent retries
  }
}

async function fetchPRDiff(diffUrl: string): Promise<string> {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.GITHUB_CLIENT_SECRET
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3.diff',
    }
    
    if (token) {
      headers['Authorization'] = `token ${token}`
    }

    const response = await fetch(diffUrl, { headers })
    if (!response.ok) {
      throw new Error('Failed to fetch diff')
    }
    return await response.text()
  } catch (error) {
    console.error('Error fetching PR diff:', error)
    return ''
  }
}
