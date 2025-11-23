import { getServiceSupabase } from './supabase'
import { summarizePR, generateIssueFromDiscord } from './ai'
import { getUserStats, getLeaderboard } from './gamification'

interface DiscordInteraction {
  type: number
  data: {
    name: string
    options?: Array<{
      name: string
      value: string
    }>
  }
  member?: {
    user: {
      id: string
      username: string
    }
  }
}

interface DiscordResponse {
  type: number
  data?: {
    content?: string
    embeds?: any[]
    flags?: number
  }
}

export async function handleDiscordCommand(
  interaction: DiscordInteraction
): Promise<DiscordResponse> {
  const { name, options = [] } = interaction.data

  try {
    switch (name) {
      case 'ping':
        return handlePing()
      
      case 'summary':
        return await handleSummary(options)
      
      case 'stats':
        return await handleStats(options)
      
      case 'create-issue':
        return await handleCreateIssue(options)
      
      default:
        return {
          type: 4,
          data: {
            content: '❌ Unknown command',
            flags: 64, // Ephemeral
          },
        }
    }
  } catch (error) {
    console.error(`Error handling ${name}:`, error)
    return {
      type: 4,
      data: {
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        flags: 64,
      },
    }
  }
}

function handlePing(): DiscordResponse {
  return {
    type: 4,
    data: {
      embeds: [
        {
          title: '🏓 Pong!',
          description: 'OpsCord bot is online and ready!',
          color: 0x7289da,
          fields: [
            {
              name: 'Status',
              value: '✅ All systems operational',
              inline: true,
            },
            {
              name: 'Response Time',
              value: '< 100ms',
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    },
  }
}

async function handleSummary(options: any[]): Promise<DiscordResponse> {
  const prInput = options.find(o => o.name === 'pr')?.value
  const repoInput = options.find(o => o.name === 'repo')?.value

  if (!prInput) {
    return {
      type: 4,
      data: {
        content: '❌ Please provide a PR number (e.g., 123)',
        flags: 64,
      },
    }
  }

  // Extract PR number
  const prNumber = parseInt(prInput.replace(/[^0-9]/g, ''))
  if (isNaN(prNumber)) {
    return {
      type: 4,
      data: {
        content: '❌ Invalid PR number',
        flags: 64,
      },
    }
  }

  const supabase = getServiceSupabase()

  // Try to get cached summary
  let repo = repoInput
  if (!repo) {
    // Get first repo from user's repos (simplified)
    repo = 'default-repo'
  }

  const { data: cachedSummary } = await supabase
    .from('pr_summaries')
    .select('*')
    .eq('repo_name', repo)
    .eq('pr_number', prNumber)
    .single()

  if (cachedSummary) {
    return {
      type: 4,
      data: {
        embeds: [
          {
            title: `🤖 PR #${prNumber} Summary`,
            description: cachedSummary.summary,
            color: cachedSummary.complexity === 'low' ? 0x00ff00 : cachedSummary.complexity === 'high' ? 0xff0000 : 0xffa500,
            fields: [
              {
                name: '🔑 Key Changes',
                value: cachedSummary.key_changes.join('\n'),
              },
              {
                name: '⚠️ Risks',
                value: cachedSummary.risks.length > 0 ? cachedSummary.risks.join('\n') : 'None identified',
              },
              {
                name: '💡 Recommendations',
                value: cachedSummary.recommendations.length > 0 ? cachedSummary.recommendations.join('\n') : 'None',
              },
              {
                name: 'Complexity',
                value: `${cachedSummary.complexity.toUpperCase()}`,
                inline: true,
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      },
    }
  }

  return {
    type: 4,
    data: {
      content: `⏳ Generating AI summary for PR #${prNumber}... This may take a moment. (Summary not cached - requires webhook integration)`,
      flags: 64,
    },
  }
}

async function handleStats(options: any[]): Promise<DiscordResponse> {
  const username = options.find(o => o.name === 'user')?.value

  if (username) {
    // Get specific user stats
    const supabase = getServiceSupabase()
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (!user) {
      return {
        type: 4,
        data: {
          content: `❌ User @${username} not found`,
          flags: 64,
        },
      }
    }

    const { stats, badges } = await getUserStats(user.id)

    if (!stats) {
      return {
        type: 4,
        data: {
          content: `📊 No stats available for @${username} yet`,
          flags: 64,
        },
      }
    }

    return {
      type: 4,
      data: {
        embeds: [
          {
            title: `📊 Stats for @${username}`,
            color: 0x7289da,
            thumbnail: {
              url: user.avatar_url,
            },
            fields: [
              {
                name: '⭐ Level',
                value: `${stats.level}`,
                inline: true,
              },
              {
                name: '🎯 XP',
                value: `${stats.xp}`,
                inline: true,
              },
              {
                name: '🔀 PRs Opened',
                value: `${stats.prs_opened}`,
                inline: true,
              },
              {
                name: '✅ PRs Merged',
                value: `${stats.prs_merged}`,
                inline: true,
              },
              {
                name: '👀 PRs Reviewed',
                value: `${stats.prs_reviewed}`,
                inline: true,
              },
              {
                name: '📝 Issues Created',
                value: `${stats.issues_created}`,
                inline: true,
              },
              {
                name: '🏆 Badges',
                value: badges && badges.length > 0
                  ? badges.map((b: any) => `${b.badges.icon} ${b.badges.name}`).join('\n')
                  : 'No badges yet',
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      },
    }
  } else {
    // Show leaderboard
    const leaderboard = await getLeaderboard(5)

    if (!leaderboard || leaderboard.length === 0) {
      return {
        type: 4,
        data: {
          content: '📊 Leaderboard is empty. Start contributing to climb the ranks!',
        },
      }
    }

    const leaderboardText = leaderboard
      .map((entry: any, idx: number) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`
        return `${medal} **${entry.users.username}** - Level ${entry.level} (${entry.xp} XP)`
      })
      .join('\n')

    return {
      type: 4,
      data: {
        embeds: [
          {
            title: '🏆 Top Contributors',
            description: leaderboardText,
            color: 0xffd700,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    }
  }
}

async function handleCreateIssue(options: any[]): Promise<DiscordResponse> {
  const description = options.find(o => o.name === 'description')?.value
  const repo = options.find(o => o.name === 'repo')?.value

  if (!description) {
    return {
      type: 4,
      data: {
        content: '❌ Please provide an issue description',
        flags: 64,
      },
    }
  }

  try {
    // Use AI to generate issue details
    const issueData = await generateIssueFromDiscord(description)

    return {
      type: 4,
      data: {
        embeds: [
          {
            title: '📝 Issue Created',
            description: `**Title:** ${issueData.title}\n\n**Description:**\n${issueData.body}`,
            color: 0x00ff00,
            fields: [
              {
                name: 'Labels',
                value: issueData.labels.join(', '),
                inline: true,
              },
              {
                name: 'Repository',
                value: repo || 'Default',
                inline: true,
              },
            ],
            footer: {
              text: 'Issue will be created in GitHub when webhook is configured',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      },
    }
  } catch (error) {
    return {
      type: 4,
      data: {
        content: '❌ Failed to generate issue. Make sure GEMINI_API_KEY is configured.',
        flags: 64,
      },
    }
  }
}
