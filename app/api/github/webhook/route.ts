import { sendDiscordMessage, DISCORD_COLORS, formatDuration, truncateText, type DiscordEmbedField } from "@/lib/discord"
import { summarizePR } from "@/lib/ai"
import { awardXP } from "@/lib/gamification"
import { getServiceSupabase } from "@/lib/supabase"
import type { NextRequest } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-hub-signature-256")
    const eventType = request.headers.get("x-github-event")
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
            github_token: '',
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
    let embedColor = DISCORD_COLORS.DEFAULT
    let embedUrl = ""
    let embedFields: DiscordEmbedField[] = []
    let embedAuthor = event.sender ? {
      name: event.sender.login,
      url: event.sender.html_url,
      icon_url: event.sender.avatar_url
    } : undefined
    let embedFooter = event.repository ? {
      text: event.repository.full_name,
      icon_url: event.repository.owner?.avatar_url
    } : undefined

    // PR Events
    if (event.action === "opened" && event.pull_request) {
      title = "🔀 New Pull Request"
      message = `**${event.pull_request.title}**\n\n${truncateText(event.pull_request.body || 'No description provided.', 500)}`
      activityType = "pr_opened"
      embedColor = DISCORD_COLORS.INFO
      embedUrl = event.pull_request.html_url
      
      embedFields = [
        { name: "Repository", value: event.repository.name, inline: true },
        { name: "Author", value: event.pull_request.user.login, inline: true },
        { name: "Branch", value: `${event.pull_request.head.ref} → ${event.pull_request.base.ref}`, inline: true },
      ]
      
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

        // Enhanced message with AI summary
        const complexityEmoji = summary.complexity === 'low' ? '🟢' : summary.complexity === 'high' ? '🔴' : '🟡'
        message = `**${event.pull_request.title}**\n\n**🤖 AI Summary:**\n${summary.summary}`
        
        embedFields.push(
          { name: "Complexity", value: `${complexityEmoji} ${summary.complexity.toUpperCase()}`, inline: true },
          { name: "Key Changes", value: summary.keyChanges.slice(0, 3).map(c => `• ${truncateText(c, 100)}`).join('\n') || 'None', inline: false }
        )
        
        if (summary.risks.length > 0) {
          embedFields.push({
            name: "⚠️ Risks",
            value: summary.risks.slice(0, 3).map(r => `• ${truncateText(r, 100)}`).join('\n'),
            inline: false
          })
          embedColor = DISCORD_COLORS.WARNING
        }
      } catch (aiError) {
        console.error('AI summary failed:', aiError)
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
      message = `**${event.pull_request.title}**\n\n🎉 Successfully merged into \`${event.pull_request.base.ref}\``
      activityType = "pr_merged"
      embedColor = DISCORD_COLORS.SUCCESS
      embedUrl = event.pull_request.html_url
      
      embedFields = [
        { name: "Repository", value: event.repository.name, inline: true },
        { name: "Merged By", value: event.pull_request.merged_by?.login || 'unknown', inline: true },
        { name: "Commits", value: `${event.pull_request.commits || 0}`, inline: true },
        { name: "Changes", value: `+${event.pull_request.additions || 0} / -${event.pull_request.deletions || 0}`, inline: true },
        { name: "Files Changed", value: `${event.pull_request.changed_files || 0}`, inline: true },
      ]
      
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
    else if (event.action === "closed" && event.pull_request && !event.pull_request.merged) {
      title = "❌ Pull Request Closed"
      message = `**${event.pull_request.title}**\n\nClosed without merging.`
      activityType = "pr_closed"
      embedColor = DISCORD_COLORS.FAILURE
      embedUrl = event.pull_request.html_url
      
      embedFields = [
        { name: "Repository", value: event.repository.name, inline: true },
        { name: "Closed By", value: event.sender?.login || 'unknown', inline: true },
      ]
    }
    else if (event.action === "submitted" && event.review) {
      const reviewState = event.review.state
      let reviewEmoji = "👀"
      
      if (reviewState === "approved") {
        reviewEmoji = "✅"
        embedColor = DISCORD_COLORS.SUCCESS
      } else if (reviewState === "changes_requested") {
        reviewEmoji = "🔄"
        embedColor = DISCORD_COLORS.WARNING
      } else {
        embedColor = DISCORD_COLORS.INFO
      }
      
      title = `${reviewEmoji} PR Review: ${reviewState.replace('_', ' ').toUpperCase()}`
      message = event.review.body ? truncateText(event.review.body, 500) : `Review submitted on PR #${event.pull_request.number}`
      activityType = "pr_reviewed"
      embedUrl = event.review.html_url
      
      embedFields = [
        { name: "Repository", value: event.repository.name, inline: true },
        { name: "Reviewer", value: event.review.user.login, inline: true },
        { name: "PR", value: `#${event.pull_request.number}: ${truncateText(event.pull_request.title, 50)}`, inline: false },
      ]
      
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
    // Issue Events
    else if (event.action === "opened" && event.issue) {
      title = "📝 New Issue"
      message = `**${event.issue.title}**\n\n${truncateText(event.issue.body || 'No description provided.', 500)}`
      activityType = "issue_opened"
      embedColor = DISCORD_COLORS.INFO
      embedUrl = event.issue.html_url
      
      const labels = event.issue.labels?.map((l: any) => l.name).join(', ') || 'None'
      embedFields = [
        { name: "Repository", value: event.repository.name, inline: true },
        { name: "Author", value: event.issue.user.login, inline: true },
        { name: "Labels", value: labels, inline: true },
      ]
      
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
      const isCompleted = event.issue.state_reason === "completed"
      title = isCompleted ? "✅ Issue Resolved" : "🔒 Issue Closed"
      message = `**${event.issue.title}**\n\n${isCompleted ? 'Issue has been resolved.' : 'Issue was closed as not planned.'}`
      activityType = "issue_closed"
      embedColor = isCompleted ? DISCORD_COLORS.SUCCESS : DISCORD_COLORS.WARNING
      embedUrl = event.issue.html_url
      
      embedFields = [
        { name: "Repository", value: event.repository.name, inline: true },
        { name: "Closed By", value: event.sender?.login || 'unknown', inline: true },
        { name: "Reason", value: event.issue.state_reason || 'Unknown', inline: true },
      ]
      
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
    // Push Events
    else if (eventType === "push" && event.ref && event.repository && event.commits) {
      const branch = event.ref.split("/").pop()
      const commitCount = event.commits?.length || 0
      
      title = "🚀 New Push"
      embedColor = DISCORD_COLORS.INFO
      embedUrl = event.compare || event.repository.html_url
      
      // Build commit details
      const commitDetails = event.commits.slice(0, 5).map((commit: any) => {
        const shortSha = commit.id.substring(0, 7)
        const commitMessage = truncateText(commit.message.split('\n')[0], 60)
        return `[\`${shortSha}\`](${commit.url}) ${commitMessage} - ${commit.author.username || commit.author.name}`
      }).join('\n')
      
      message = `**${commitCount} commit${commitCount !== 1 ? 's' : ''}** pushed to \`${branch}\`\n\n${commitDetails}`
      
      if (commitCount > 5) {
        message += `\n\n*...and ${commitCount - 5} more commit${commitCount - 5 !== 1 ? 's' : ''}*`
      }
      
      // Calculate total changes
      let totalAdded = 0
      let totalRemoved = 0
      let totalModified = 0
      event.commits.forEach((commit: any) => {
        totalAdded += commit.added?.length || 0
        totalRemoved += commit.removed?.length || 0
        totalModified += commit.modified?.length || 0
      })
      
      embedFields = [
        { name: "Repository", value: event.repository.name, inline: true },
        { name: "Branch", value: branch || 'unknown', inline: true },
        { name: "Pusher", value: event.pusher?.name || event.sender?.login || 'unknown', inline: true },
        { name: "Files Changed", value: `+${totalAdded} | ~${totalModified} | -${totalRemoved}`, inline: true },
      ]
      
      // Award XP for commits to contributor
      if (contributorUserId && commitCount > 0) {
        for (let i = 0; i < Math.min(commitCount, 10); i++) {
          await awardXP(contributorUserId, 'COMMIT')
        }
      }

      activityType = "push"
    }
    // Release Events
    else if (eventType === "release" && event.release) {
      const release = event.release
      const isPrerelease = release.prerelease
      const isDraft = release.draft
      
      if (event.action === "published" || event.action === "created") {
        title = isPrerelease ? "🧪 Pre-release Published" : "🎉 New Release Published"
        embedColor = isPrerelease ? DISCORD_COLORS.WARNING : DISCORD_COLORS.SUCCESS
        embedUrl = release.html_url
        
        const releaseNotes = release.body 
          ? truncateText(release.body, 800)
          : 'No release notes provided.'
        
        message = `**${release.name || release.tag_name}**\n\n${releaseNotes}`
        
        embedFields = [
          { name: "Repository", value: event.repository.name, inline: true },
          { name: "Tag", value: release.tag_name, inline: true },
          { name: "Author", value: release.author?.login || 'unknown', inline: true },
        ]
        
        if (release.assets && release.assets.length > 0) {
          const assetList = release.assets.slice(0, 3).map((asset: any) => 
            `[${asset.name}](${asset.browser_download_url})`
          ).join('\n')
          embedFields.push({
            name: "📦 Downloads",
            value: assetList + (release.assets.length > 3 ? `\n*...and ${release.assets.length - 3} more*` : ''),
            inline: false
          })
        }
        
        if (release.tarball_url) {
          embedFields.push({
            name: "Source Code",
            value: `[tar.gz](${release.tarball_url}) | [zip](${release.zipball_url})`,
            inline: true
          })
        }
        
        activityType = "release_published"
      }
    }
    // Workflow Run Events (CI/CD)
    else if (eventType === "workflow_run" && event.workflow_run) {
      const run = event.workflow_run
      const conclusion = run.conclusion
      const status = run.status
      
      // Only notify on completed runs or specific actions
      if (event.action === "completed") {
        let statusEmoji = "⏳"
        
        if (conclusion === "success") {
          statusEmoji = "✅"
          embedColor = DISCORD_COLORS.SUCCESS
        } else if (conclusion === "failure") {
          statusEmoji = "❌"
          embedColor = DISCORD_COLORS.FAILURE
        } else if (conclusion === "cancelled") {
          statusEmoji = "🚫"
          embedColor = DISCORD_COLORS.WARNING
        } else if (conclusion === "timed_out") {
          statusEmoji = "⏰"
          embedColor = DISCORD_COLORS.FAILURE
        } else if (conclusion === "skipped") {
          statusEmoji = "⏭️"
          embedColor = DISCORD_COLORS.DEFAULT
        }
        
        title = `${statusEmoji} Workflow: ${run.name}`
        embedUrl = run.html_url
        
        const duration = run.run_started_at && run.updated_at 
          ? formatDuration(run.run_started_at, run.updated_at)
          : 'Unknown'
        
        message = `**${conclusion?.toUpperCase() || status?.toUpperCase()}**\n\nWorkflow \`${run.name}\` has ${conclusion || status}.`
        
        embedFields = [
          { name: "Repository", value: event.repository.name, inline: true },
          { name: "Branch", value: run.head_branch || 'unknown', inline: true },
          { name: "Run #", value: `${run.run_number}`, inline: true },
          { name: "Duration", value: duration, inline: true },
          { name: "Triggered By", value: run.triggering_actor?.login || run.actor?.login || 'unknown', inline: true },
          { name: "Event", value: run.event || 'unknown', inline: true },
        ]
        
        if (run.head_commit?.message) {
          embedFields.push({
            name: "Commit",
            value: truncateText(run.head_commit.message.split('\n')[0], 100),
            inline: false
          })
        }
        
        activityType = "workflow_completed"
      } else if (event.action === "requested") {
        title = `⏳ Workflow Started: ${run.name}`
        embedColor = DISCORD_COLORS.INFO
        embedUrl = run.html_url
        message = `Workflow \`${run.name}\` has been triggered.`
        
        embedFields = [
          { name: "Repository", value: event.repository.name, inline: true },
          { name: "Branch", value: run.head_branch || 'unknown', inline: true },
          { name: "Triggered By", value: run.triggering_actor?.login || run.actor?.login || 'unknown', inline: true },
        ]
        
        activityType = "workflow_started"
      }
    }
    // Fork Events
    else if (eventType === "fork" && event.forkee) {
      title = "🍴 Repository Forked"
      embedColor = DISCORD_COLORS.INFO
      embedUrl = event.forkee.html_url
      
      message = `**${event.sender?.login}** forked this repository!\n\nNew fork: [${event.forkee.full_name}](${event.forkee.html_url})`
      
      embedFields = [
        { name: "Original Repository", value: event.repository.full_name, inline: true },
        { name: "Fork", value: event.forkee.full_name, inline: true },
        { name: "Forked By", value: event.sender?.login || 'unknown', inline: true },
      ]
      
      activityType = "fork"
    }
    // Star Events
    else if (eventType === "star" && event.action) {
      if (event.action === "created") {
        title = "⭐ New Star"
        embedColor = DISCORD_COLORS.SUCCESS
        embedUrl = event.repository.html_url
        
        const starCount = event.repository.stargazers_count || 0
        message = `**${event.sender?.login}** starred this repository!\n\n🌟 Total stars: **${starCount}**`
        
        embedFields = [
          { name: "Repository", value: event.repository.name, inline: true },
          { name: "Starred By", value: event.sender?.login || 'unknown', inline: true },
          { name: "Total Stars", value: `${starCount}`, inline: true },
        ]
        
        activityType = "star_added"
      } else if (event.action === "deleted") {
        title = "💔 Star Removed"
        embedColor = DISCORD_COLORS.WARNING
        embedUrl = event.repository.html_url
        
        const starCount = event.repository.stargazers_count || 0
        message = `**${event.sender?.login}** unstarred this repository.\n\n⭐ Total stars: **${starCount}**`
        
        embedFields = [
          { name: "Repository", value: event.repository.name, inline: true },
          { name: "Unstarred By", value: event.sender?.login || 'unknown', inline: true },
          { name: "Total Stars", value: `${starCount}`, inline: true },
        ]
        
        activityType = "star_removed"
      }
    }
    // Watch Events (alternative star tracking)
    else if (eventType === "watch" && event.action === "started") {
      title = "👀 New Watcher"
      embedColor = DISCORD_COLORS.INFO
      embedUrl = event.repository.html_url
      
      message = `**${event.sender?.login}** is now watching this repository!`
      
      embedFields = [
        { name: "Repository", value: event.repository.name, inline: true },
        { name: "Watcher", value: event.sender?.login || 'unknown', inline: true },
        { name: "Total Watchers", value: `${event.repository.watchers_count || 0}`, inline: true },
      ]
      
      activityType = "watch"
    }

    // Store webhook event (for repo owner) - ALWAYS do this for debugging
    if (repoOwnerUserId) {
      try {
        await supabase.from('webhooks').insert({
          user_id: repoOwnerUserId,
          repo_name: event.repository?.name || 'unknown',
          event_type: eventType || event.action || 'unknown',
          payload: event,
        })
        console.log(`✓ Webhook stored: ${eventType} for user ${repoOwnerUserId}`)
      } catch (dbError) {
        console.warn(`⚠ Could not store webhook:`, dbError)
      }
    } else {
      console.warn(`⚠ Repo owner not found in database: ${repoOwner}`)
    }

    // Send to Discord if configured
    if (message && webhookUrl) {
      try {
        console.log(`📤 Sending Discord notification to ${webhookUrl.substring(0, 50)}...`)
        await sendDiscordMessage(webhookUrl, message, title, {
          color: embedColor,
          url: embedUrl || undefined,
          author: embedAuthor,
          footer: embedFooter,
          fields: embedFields.length > 0 ? embedFields : undefined,
        })
        console.log(`✅ Discord message sent successfully`)
      } catch (discordError) {
        console.error(`❌ Discord send failed:`, discordError)
      }
    } else {
      console.warn(`⚠ No message or webhookUrl configured. Message: "${message}", WebhookUrl: ${webhookUrl ? 'found' : 'NOT FOUND'}`)
    }

    // Log activity for contributor (even if Discord fails)
    if (contributorUserId && activityType) {
      try {
        await supabase.from('activities').insert({
          user_id: contributorUserId,
          activity_type: activityType,
          repo_name: event.repository?.name || 'unknown',
          title: title || message,
          description: message || title,
          metadata: {
            url: embedUrl,
            event_type: eventType,
            action: event.action,
          }
        })
        console.log(`✓ Activity logged for user ${contributorUserId}`)
      } catch (activityError) {
        console.warn(`⚠ Could not log activity:`, activityError)
      }
    }

    return Response.json({ 
      success: true,
      debug: {
        repoOwner,
        repoOwnerUserId,
        webhookUrlFound: !!webhookUrl,
        messageSent: !!(message && webhookUrl),
        eventType,
        discordSent: !!webhookUrl
      }
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return Response.json({ 
      success: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    }) // Return success to prevent retries
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
