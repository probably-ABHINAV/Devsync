
// Scripts must load env vars manually
import { config } from 'dotenv'
config({ path: '.env.local' })

import { Client, GatewayIntentBits, Events } from 'discord.js'

const token = process.env.DISCORD_BOT_TOKEN
if (!token) {
  console.error('❌ DISCORD_BOT_TOKEN is missing in .env.local')
  process.exit(1)
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

client.once(Events.ClientReady, c => {
  console.log(`✅ OpsCord Discord Bot Logged in as ${c.user.tag}`)
})

client.on(Events.MessageCreate, async (message) => {
  // Ignore own messages
  if (message.author.bot) return

  // Basic info
  const content = message.content
  if (!content) return // Ignore empty messages (e.g. just image, handle later)

  const guildId = message.guild?.id || 'dm'
  const channelId = message.channelId
  const messageId = message.id
  const authorId = message.author.id
  const authorUsername = message.author.username

  console.log(`📩 [Discord] New message from ${authorUsername}: ${content.substring(0, 20)}...`)

  // Try to find OpsCord user by Discord ID (if mapped)
  // Currently we don't have a `discord_id` column on users, 
  // but we can look for it if we add it or just store as "discord-user".
  // Phase 1 schema has `discord_configs` but that maps `user_id` -> `webhook_url`.
  // It doesn't strictly map discord_user_id -> user_id.
  // For now, we will store `user_id` as NULL if not found, 
  // or we could add `discord_id` to the Users table in a future migration.
  
  // Clean Architecture: Delegate to ingestEvent
  // We use dynamic import to verify env vars are loaded before 'lib/supabase' initializes
  const { ingestEvent } = await import('../lib/ingest')
  
  await ingestEvent({
    source: 'discord',
    eventType: 'message_create',
    activityType: 'message',
    externalId: messageId,
    title: `Message in #${(message.channel as any).name || 'channel'}`,
    description: content,
    repoName: `discord/${guildId}`, // Virtual repo concept for Discord Guild
    metadata: {
      guildId,
      channelId,
      authorId,
      authorUsername,
      attachments: message.attachments.map(a => a.url)
    },
    // userId: ... // Leave undefined for now, ingestEvent will create activity with null user_id
  })
})

client.login(token)
