// Discord webhook utilities

// Color constants for different event types
export const DISCORD_COLORS: Record<string, number> = {
  SUCCESS: 0x00FF00,    // Green - merged, closed, success
  FAILURE: 0xFF0000,    // Red - failures or high-risk items
  INFO: 0x0077FF,       // Blue - informational events (opened, push)
  WARNING: 0xFFAA00,    // Yellow - warnings/pending
  PRIMARY: 0x7289DA,    // Discord blurple
  CRITICAL: 0xFF1744,   // Bright red for critical alerts
  NEUTRAL: 0x90A4AE,    // Gray for neutral info
  DEFAULT: 0x00D9FF,    // Cyan - default Opscord color
}

export interface DiscordEmbedField {
  name: string
  value: string
  inline?: boolean
}

export interface DiscordEmbedAuthor {
  name: string
  url?: string
  icon_url?: string
}

export interface DiscordEmbedFooter {
  text: string
  icon_url?: string
}

export interface RichDiscordEmbed {
  title?: string
  description?: string
  url?: string
  color?: number
  timestamp?: string
  author?: DiscordEmbedAuthor
  footer?: DiscordEmbedFooter
  fields?: DiscordEmbedField[]
  thumbnail?: { url: string }
}

export interface DiscordPayload {
  content?: string
  embeds?: RichDiscordEmbed[]
}

export async function sendDiscordMessage(
  webhookUrl: string, 
  messageOrPayload: string | DiscordPayload, 
  title?: string,
  options?: {
    color?: number
    url?: string
    author?: DiscordEmbedAuthor
    footer?: DiscordEmbedFooter
    fields?: DiscordEmbedField[]
    thumbnail?: string
  }
) {
  let payload: DiscordPayload

  // Handle direct payload object (for rich embeds)
  if (typeof messageOrPayload === 'object' && 'embeds' in messageOrPayload) {
    payload = messageOrPayload
  } else {
    // Build embed from message string and options
    const embed: RichDiscordEmbed = {
      title: title || "GitHub Update",
      description: messageOrPayload as string,
      color: options?.color ?? DISCORD_COLORS.DEFAULT,
      timestamp: new Date().toISOString(),
    }

    if (options?.url) embed.url = options.url
    if (options?.author) embed.author = options.author
    if (options?.footer) embed.footer = options.footer
    if (options?.fields) embed.fields = options.fields
    if (options?.thumbnail) embed.thumbnail = { url: options.thumbnail }

    payload = { embeds: [embed] }
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw new Error("Failed to send Discord message")
  return response.ok
}

export function validateDiscordWebhook(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return (
      (urlObj.hostname.includes("discord.com") || urlObj.hostname.includes("discordapp.com")) &&
      urlObj.pathname.includes("/api/webhooks/")
    )
  } catch {
    return false
  }
}

export function formatDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const durationMs = end - start
  
  const seconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

// Event type to emoji mapping
export const EVENT_EMOJIS: Record<string, string> = {
  push: "🚀",
  pull_request: "🔀",
  issues: "📝",
  release: "🎉",
  review: "👀",
  ci: "⚙️",
  fork: "🍴",
  star: "⭐",
  watch: "👁️",
}

// Create a formatted event notification embed
export function createEventEmbed(
  eventType: string,
  title: string,
  description: string,
  fields: DiscordEmbedField[],
  options?: {
    url?: string
    author?: DiscordEmbedAuthor
    color?: number
  }
): RichDiscordEmbed {
  const emoji = EVENT_EMOJIS[eventType] || "📌"
  
  return {
    title: `${emoji} ${title}`,
    description,
    color: options?.color || DISCORD_COLORS.DEFAULT,
    timestamp: new Date().toISOString(),
    url: options?.url,
    author: options?.author,
    fields,
    footer: {
      text: "Opscord • GitHub × Discord Integration"
    }
  }
}
