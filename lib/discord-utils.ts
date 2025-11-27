import { getServiceSupabase } from './supabase'

const GITHUB_API = 'https://api.github.com'

export interface CIRun {
  id: string
  run_id: string
  repo_name: string
  workflow_name: string
  branch: string | null
  commit_sha: string | null
  status: string
  conclusion: string | null
  started_at: string | null
  completed_at: string | null
  duration_seconds: number | null
  html_url: string | null
  created_at: string
}

export interface TeamMetrics {
  repo_name: string
  period_type: string
  period_start: string
  period_end: string
  total_prs: number
  merged_prs: number
  avg_time_to_merge_hours: number | null
  avg_review_time_hours: number | null
  total_reviews: number
  total_issues_opened: number
  total_issues_closed: number
  total_commits: number
  active_contributors: number
  top_contributors: Array<{ username: string; pr_count: number }>
}

export interface PRMetrics {
  pr_number: number
  repo_name: string
  author: string
  title: string | null
  lines_added: number
  lines_removed: number
  files_changed: number
  commits_count: number
  complexity_score: string
  risk_score: number
  status: string
}

export async function getRecentCIRuns(repoName?: string, limit: number = 5): Promise<CIRun[]> {
  const supabase = getServiceSupabase()

  let query = supabase
    .from('ci_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (repoName) {
    query = query.eq('repo_name', repoName)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch CI runs:', error)
    throw new Error('Failed to fetch CI runs')
  }

  return data || []
}

export async function getTeamMetrics(repoName?: string, periodType: string = 'weekly'): Promise<TeamMetrics | null> {
  const supabase = getServiceSupabase()

  let query = supabase
    .from('team_metrics')
    .select('*')
    .eq('period_type', periodType)
    .order('period_start', { ascending: false })
    .limit(1)

  if (repoName) {
    query = query.eq('repo_name', repoName)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch team metrics:', error)
    throw new Error('Failed to fetch team metrics')
  }

  return data && data.length > 0 ? data[0] : null
}

export async function getPRMetrics(repoName?: string, limit: number = 10): Promise<PRMetrics[]> {
  const supabase = getServiceSupabase()

  let query = supabase
    .from('pr_metrics')
    .select('*')
    .order('opened_at', { ascending: false })
    .limit(limit)

  if (repoName) {
    query = query.eq('repo_name', repoName)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch PR metrics:', error)
    throw new Error('Failed to fetch PR metrics')
  }

  return data || []
}

export async function assignGitHubIssue(
  owner: string,
  repo: string,
  issueNumber: number,
  assignee: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/issues/${issueNumber}/assignees`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignees: [assignee],
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || `HTTP ${response.status}`
      return { success: false, message: `Failed to assign issue: ${errorMessage}` }
    }

    return { success: true, message: `Successfully assigned issue #${issueNumber} to @${assignee}` }
  } catch (error) {
    console.error('GitHub API error:', error)
    return { success: false, message: `GitHub API error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

export async function getNotificationSettings(guildId: string, repoName?: string) {
  const supabase = getServiceSupabase()

  try {
    let query = supabase
      .from('discord_notification_channels')
      .select('*')
      .eq('channel_id', guildId)

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch notification settings:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Notification settings error:', error)
    return []
  }
}

export async function updateNotificationSetting(
  guildId: string,
  channelId: string,
  eventType: string,
  enabled: boolean,
  repoName?: string
): Promise<{ success: boolean; message: string }> {
  const supabase = getServiceSupabase()

  try {
    const notificationTypes = eventType === 'all' 
      ? ['pr_opened', 'pr_merged', 'issue_created', 'ci_failure', 'releases']
      : [eventType]

    const updateData: Record<string, any> = {
      channel_id: channelId,
      channel_name: `discord-${channelId}`,
      webhook_url: `https://discord.com/api/webhooks/${channelId}`,
      notification_types: notificationTypes,
      is_active: enabled,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('discord_notification_channels')
      .upsert(updateData, {
        onConflict: 'channel_id',
      })

    if (error) {
      console.error('Failed to update notification setting:', error)
      return { success: false, message: `Failed to update: ${error.message}` }
    }

    return { success: true, message: `Notification ${enabled ? 'enabled' : 'disabled'} for ${eventType}` }
  } catch (error) {
    console.error('Notification update error:', error)
    return { success: false, message: `Database error - make sure Phase 2 tables are created` }
  }
}

export function formatRepoStatus(ciRuns: CIRun[]): {
  title: string
  description: string
  color: number
  fields: Array<{ name: string; value: string; inline?: boolean }>
} {
  if (ciRuns.length === 0) {
    return {
      title: '📊 Repository Status',
      description: 'No CI/CD runs found',
      color: 0x808080,
      fields: [],
    }
  }

  const latestRun = ciRuns[0]
  const statusEmoji = getStatusEmoji(latestRun.conclusion || latestRun.status)
  const statusColor = getStatusColor(latestRun.conclusion || latestRun.status)

  const successCount = ciRuns.filter(r => r.conclusion === 'success').length
  const failureCount = ciRuns.filter(r => r.conclusion === 'failure').length
  const successRate = ciRuns.length > 0 ? Math.round((successCount / ciRuns.length) * 100) : 0

  const fields: Array<{ name: string; value: string; inline?: boolean }> = [
    {
      name: '🔄 Latest Run',
      value: `${statusEmoji} ${latestRun.workflow_name || 'CI'}\n${latestRun.branch || 'main'}`,
      inline: true,
    },
    {
      name: '📈 Success Rate',
      value: `${successRate}% (${successCount}/${ciRuns.length})`,
      inline: true,
    },
    {
      name: '⏱️ Avg Duration',
      value: formatDuration(calculateAvgDuration(ciRuns)),
      inline: true,
    },
  ]

  const recentRuns = ciRuns.slice(0, 5).map(run => {
    const emoji = getStatusEmoji(run.conclusion || run.status)
    const name = run.workflow_name || 'CI'
    const duration = run.duration_seconds ? formatDuration(run.duration_seconds) : 'N/A'
    return `${emoji} **${name}** - ${duration}`
  }).join('\n')

  fields.push({
    name: '📋 Recent Runs',
    value: recentRuns || 'No runs',
    inline: false,
  })

  return {
    title: `📊 ${latestRun.repo_name || 'Repository'} Status`,
    description: `Overall CI/CD health: ${successRate >= 80 ? '✅ Healthy' : successRate >= 50 ? '⚠️ Needs Attention' : '❌ Critical'}`,
    color: statusColor,
    fields,
  }
}

export function formatTeamStats(metrics: TeamMetrics | null, topContributors?: Array<{ username: string; stats: any }>): {
  title: string
  description: string
  color: number
  fields: Array<{ name: string; value: string; inline?: boolean }>
} {
  if (!metrics) {
    return {
      title: '📊 Team Statistics',
      description: 'No team metrics available for this period',
      color: 0x808080,
      fields: [],
    }
  }

  const mergeRate = metrics.total_prs > 0 
    ? Math.round((metrics.merged_prs / metrics.total_prs) * 100) 
    : 0

  const fields: Array<{ name: string; value: string; inline?: boolean }> = [
    {
      name: '🔀 Pull Requests',
      value: `Total: ${metrics.total_prs}\nMerged: ${metrics.merged_prs}\nRate: ${mergeRate}%`,
      inline: true,
    },
    {
      name: '👀 Reviews',
      value: `Total: ${metrics.total_reviews}\nAvg Time: ${formatHours(metrics.avg_review_time_hours)}`,
      inline: true,
    },
    {
      name: '👥 Contributors',
      value: `Active: ${metrics.active_contributors}\nCommits: ${metrics.total_commits}`,
      inline: true,
    },
    {
      name: '📝 Issues',
      value: `Opened: ${metrics.total_issues_opened}\nClosed: ${metrics.total_issues_closed}`,
      inline: true,
    },
    {
      name: '⏱️ Avg Merge Time',
      value: formatHours(metrics.avg_time_to_merge_hours),
      inline: true,
    },
    {
      name: '📅 Period',
      value: `${metrics.period_type.charAt(0).toUpperCase() + metrics.period_type.slice(1)}`,
      inline: true,
    },
  ]

  if (metrics.top_contributors && metrics.top_contributors.length > 0) {
    const leaderboard = metrics.top_contributors.slice(0, 5).map((c, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`
      return `${medal} **${c.username}** - ${c.pr_count} PRs`
    }).join('\n')

    fields.push({
      name: '🏆 Top Contributors',
      value: leaderboard,
      inline: false,
    })
  }

  return {
    title: `📊 Team Stats - ${metrics.repo_name || 'All Repos'}`,
    description: `${metrics.period_type.charAt(0).toUpperCase() + metrics.period_type.slice(1)} performance overview`,
    color: 0x7289da,
    fields,
  }
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'success':
      return '✅'
    case 'failure':
      return '❌'
    case 'cancelled':
      return '⏹️'
    case 'in_progress':
    case 'queued':
      return '🔄'
    case 'skipped':
      return '⏭️'
    case 'timed_out':
      return '⏰'
    default:
      return '❓'
  }
}

function getStatusColor(status: string): number {
  switch (status) {
    case 'success':
      return 0x00ff00
    case 'failure':
      return 0xff0000
    case 'cancelled':
      return 0xff6600
    case 'in_progress':
    case 'queued':
      return 0xffff00
    default:
      return 0x808080
  }
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return 'N/A'
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

function formatHours(hours: number | null): string {
  if (hours === null || hours === undefined) return 'N/A'
  if (hours < 1) return `${Math.round(hours * 60)}m`
  if (hours < 24) return `${hours.toFixed(1)}h`
  return `${(hours / 24).toFixed(1)}d`
}

function calculateAvgDuration(ciRuns: CIRun[]): number {
  const durations = ciRuns
    .filter(r => r.duration_seconds && r.duration_seconds > 0)
    .map(r => r.duration_seconds!)

  if (durations.length === 0) return 0
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
}
