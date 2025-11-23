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
