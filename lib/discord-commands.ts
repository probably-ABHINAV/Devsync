import nacl from 'tweetnacl'

export function verifyDiscordRequest(
  body: string,
  signature: string,
  timestamp: string
): boolean {
  const publicKey = process.env.DISCORD_PUBLIC_KEY
  if (!publicKey) {
    console.warn('DISCORD_PUBLIC_KEY not set')
    return false
  }

  try {
    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, 'hex'),
      Buffer.from(publicKey, 'hex')
    )
    return isVerified
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}

// Discord command definitions
export const DISCORD_COMMANDS = [
  {
    name: 'ping',
    description: 'Check if the bot is online',
    type: 1,
  },
  {
    name: 'summary',
    description: 'Get AI-powered summary of a pull request',
    type: 1,
    options: [
      {
        name: 'pr',
        description: 'PR number (e.g., #123)',
        type: 3,
        required: true,
      },
      {
        name: 'repo',
        description: 'Repository name (optional, uses default if not specified)',
        type: 3,
        required: false,
      },
    ],
  },
  {
    name: 'stats',
    description: 'View contribution statistics and badges',
    type: 1,
    options: [
      {
        name: 'user',
        description: 'GitHub username (optional)',
        type: 3,
        required: false,
      },
    ],
  },
  {
    name: 'create-issue',
    description: 'Create a GitHub issue from Discord',
    type: 1,
    options: [
      {
        name: 'description',
        description: 'Issue description',
        type: 3,
        required: true,
      },
      {
        name: 'repo',
        description: 'Repository name',
        type: 3,
        required: false,
      },
    ],
  },
  {
    name: 'assign',
    description: 'Auto-assign GitHub issues to team members',
    type: 1,
    options: [
      {
        name: 'issue',
        description: 'Issue number (e.g., 123)',
        type: 4,
        required: true,
      },
      {
        name: 'member',
        description: 'GitHub username to assign',
        type: 3,
        required: true,
      },
      {
        name: 'repo',
        description: 'Repository name (owner/repo)',
        type: 3,
        required: false,
      },
    ],
  },
  {
    name: 'repo-status',
    description: 'Show latest CI/CD status and recent activity',
    type: 1,
    options: [
      {
        name: 'repo',
        description: 'Repository name (owner/repo)',
        type: 3,
        required: false,
      },
      {
        name: 'limit',
        description: 'Number of CI runs to show (default: 5)',
        type: 4,
        required: false,
      },
    ],
  },
  {
    name: 'setup-notifications',
    description: 'Configure notification channels and event types',
    type: 1,
    options: [
      {
        name: 'action',
        description: 'Action to perform',
        type: 3,
        required: true,
        choices: [
          { name: 'Enable notifications', value: 'enable' },
          { name: 'Disable notifications', value: 'disable' },
          { name: 'List current settings', value: 'list' },
        ],
      },
      {
        name: 'event_type',
        description: 'Event type to configure',
        type: 3,
        required: false,
        choices: [
          { name: 'Pull Requests', value: 'pull_request' },
          { name: 'Issues', value: 'issues' },
          { name: 'CI/CD Runs', value: 'ci_runs' },
          { name: 'Releases', value: 'releases' },
          { name: 'All Events', value: 'all' },
        ],
      },
      {
        name: 'repo',
        description: 'Repository name (owner/repo)',
        type: 3,
        required: false,
      },
    ],
  },
  {
    name: 'ai-review',
    description: 'Get AI-powered code review suggestions for a PR',
    type: 1,
    options: [
      {
        name: 'pr',
        description: 'PR number (e.g., 123)',
        type: 4,
        required: true,
      },
      {
        name: 'repo',
        description: 'Repository name (owner/repo)',
        type: 3,
        required: false,
      },
      {
        name: 'focus',
        description: 'Focus area for review',
        type: 3,
        required: false,
        choices: [
          { name: 'Security', value: 'security' },
          { name: 'Performance', value: 'performance' },
          { name: 'Code Quality', value: 'quality' },
          { name: 'All Areas', value: 'all' },
        ],
      },
    ],
  },
  {
    name: 'team-stats',
    description: 'Show detailed team statistics and leaderboard',
    type: 1,
    options: [
      {
        name: 'period',
        description: 'Time period for stats',
        type: 3,
        required: false,
        choices: [
          { name: 'Daily', value: 'daily' },
          { name: 'Weekly', value: 'weekly' },
          { name: 'Monthly', value: 'monthly' },
        ],
      },
      {
        name: 'repo',
        description: 'Repository name (owner/repo)',
        type: 3,
        required: false,
      },
      {
        name: 'metric',
        description: 'Specific metric to focus on',
        type: 3,
        required: false,
        choices: [
          { name: 'PRs', value: 'prs' },
          { name: 'Reviews', value: 'reviews' },
          { name: 'Issues', value: 'issues' },
          { name: 'All Metrics', value: 'all' },
        ],
      },
    ],
  },
  {
    name: 'health-check',
    description: 'Check system health and status',
    type: 1,
  },
  {
    name: 'alert-config',
    description: 'Configure alert preferences and thresholds',
    type: 1,
    options: [
      {
        name: 'threshold',
        description: 'Alert threshold type',
        type: 3,
        required: false,
        choices: [
          { name: 'Critical', value: 'critical' },
          { name: 'High', value: 'high' },
          { name: 'Medium', value: 'medium' },
        ],
      },
    ],
  },
  {
    name: 'recent-activity',
    description: 'Show recent activity across all repositories',
    type: 1,
    options: [
      {
        name: 'limit',
        description: 'Number of activities to show (max 20)',
        type: 4,
        required: false,
      },
    ],
  },
  {
    name: 'pr-insights',
    description: 'Get insights about pull request metrics and trends',
    type: 1,
    options: [
      {
        name: 'repo',
        description: 'Repository name (owner/repo)',
        type: 3,
        required: false,
      },
      {
        name: 'period',
        description: 'Time period to analyze',
        type: 3,
        required: false,
        choices: [
          { name: 'Last 7 days', value: '7d' },
          { name: 'Last 30 days', value: '30d' },
          { name: 'Last 90 days', value: '90d' },
        ],
      },
    ],
  },
]

export async function registerDiscordCommands() {
  const appId = process.env.DISCORD_CLIENT_ID
  const botToken = process.env.DISCORD_TOKEN

  if (!appId || !botToken) {
    throw new Error('Discord credentials not configured')
  }

  const url = `https://discord.com/api/v10/applications/${appId}/commands`

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${botToken}`,
    },
    body: JSON.stringify(DISCORD_COMMANDS),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to register commands: ${error}`)
  }

  return response.json()
}
