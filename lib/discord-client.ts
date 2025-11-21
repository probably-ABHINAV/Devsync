import axios from "axios"

const DISCORD_API = "https://discord.com/api/v10"

export interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: Array<{
    name: string
    value: string
    inline?: boolean
  }>
  footer?: {
    text: string
  }
  url?: string
}

export async function sendDiscordMessage(
  channelId: string,
  message: { content?: string; embeds?: DiscordEmbed[] },
  botToken: string,
): Promise<string> {
  try {
    const response = await axios.post(`${DISCORD_API}/channels/${channelId}/messages`, message, {
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
    })
    return response.data.id
  } catch (error) {
    console.error("[Discord] Error sending message:", error)
    throw error
  }
}

export async function editDiscordMessage(
  channelId: string,
  messageId: string,
  message: { content?: string; embeds?: DiscordEmbed[] },
  botToken: string,
): Promise<void> {
  try {
    await axios.patch(`${DISCORD_API}/channels/${channelId}/messages/${messageId}`, message, {
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("[Discord] Error editing message:", error)
    throw error
  }
}

export function createPREmbed(
  prNumber: number,
  title: string,
  author: string,
  url: string,
  summary?: string,
): DiscordEmbed {
  return {
    title: `Pull Request #${prNumber}`,
    description: summary || `**${title}**\n\nAwaiting AI summary...`,
    color: 0x6366f1,
    fields: [
      {
        name: "Author",
        value: author,
        inline: true,
      },
      {
        name: "Status",
        value: "Open",
        inline: true,
      },
    ],
    footer: {
      text: "OpsCord | AI-Powered DevOps",
    },
    url,
  }
}

export function createIssueEmbed(
  issueNumber: number,
  title: string,
  author: string,
  url: string,
  labels?: string[],
): DiscordEmbed {
  return {
    title: `Issue #${issueNumber}`,
    description: `**${title}**`,
    color: 0xf97316,
    fields: [
      {
        name: "Author",
        value: author,
        inline: true,
      },
      ...(labels && labels.length > 0
        ? [
            {
              name: "Labels",
              value: labels.join(", "),
              inline: true,
            },
          ]
        : []),
    ],
    footer: {
      text: "OpsCord | AI-Powered DevOps",
    },
    url,
  }
}

export function createSummaryEmbed(title: string, summary: string, author: string): DiscordEmbed {
  return {
    title: "AI Summary Generated",
    description: summary,
    color: 0x10b981,
    fields: [
      {
        name: "Generated For",
        value: title,
        inline: false,
      },
    ],
    footer: {
      text: "OpsCord | Powered by Google Gemini",
    },
  }
}
