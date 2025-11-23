// Discord webhook utilities
export async function sendDiscordMessage(webhookUrl: string, message: string, title?: string) {
  const payload = {
    embeds: [
      {
        title: title || "GitHub Update",
        description: message,
        color: 0x7289da, // Discord blurple
        timestamp: new Date().toISOString(),
      },
    ],
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
    new URL(url)
    return url.includes("discord.com/api/webhooks/")
  } catch {
    return false
  }
}
