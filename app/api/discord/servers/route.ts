import { cookies } from "next/headers"

const DISCORD_API = "https://discord.com/api/v10"

export interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
}

export interface DiscordChannel {
  id: string
  name: string
  type: number
  parent_id: string | null
  topic: string | null
}

export async function GET() {
  try {
    const discordToken = process.env.DISCORD_TOKEN
    
    if (!discordToken) {
      return Response.json(
        { error: "Discord bot token not configured" },
        { status: 400 }
      )
    }

    // Fetch bot guilds
    const guildsResponse = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: {
        Authorization: `Bot ${discordToken}`,
        "User-Agent": "OpsCord (https://opscord.vercel.app)"
      }
    })

    if (!guildsResponse.ok) {
      throw new Error(`Failed to fetch Discord guilds: ${guildsResponse.statusText}`)
    }

    const guilds: DiscordGuild[] = await guildsResponse.json()

    // Fetch channels for each guild
    const serversWithChannels = await Promise.all(
      guilds.map(async (guild) => {
        try {
          const channelsResponse = await fetch(
            `${DISCORD_API}/guilds/${guild.id}/channels`,
            {
              headers: {
                Authorization: `Bot ${discordToken}`,
                "User-Agent": "OpsCord (https://opscord.vercel.app)"
              }
            }
          )

          if (!channelsResponse.ok) {
            console.error(`Failed to fetch channels for guild ${guild.id}`)
            return { ...guild, channels: [] }
          }

          const channels: DiscordChannel[] = await channelsResponse.json()
          
          // Filter to only text channels
          const textChannels = channels.filter(ch => ch.type === 0)

          return {
            ...guild,
            channels: textChannels
          }
        } catch (error) {
          console.error(`Error fetching channels for guild ${guild.id}:`, error)
          return { ...guild, channels: [] }
        }
      })
    )

    return Response.json({
      servers: serversWithChannels
    })
  } catch (error) {
    console.error("Discord servers fetch error:", error)
    return Response.json(
      { error: "Failed to fetch Discord servers" },
      { status: 500 }
    )
  }
}
