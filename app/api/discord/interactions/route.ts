import { NextRequest } from 'next/server'
import { verifyDiscordRequest } from '@/lib/discord-commands'
import { handleDiscordCommand } from '@/lib/discord-handlers'

export async function POST(request: NextRequest) {
  try {
    // Verify the request signature
    const body = await request.text()
    const signature = request.headers.get('x-signature-ed25519')
    const timestamp = request.headers.get('x-signature-timestamp')

    if (!signature || !timestamp) {
      return Response.json({ error: 'Missing signature headers' }, { status: 401 })
    }

    const isValid = verifyDiscordRequest(body, signature, timestamp)
    if (!isValid) {
      return Response.json({ error: 'Invalid request signature' }, { status: 401 })
    }

    const interaction = JSON.parse(body)

    // Handle Discord PING
    if (interaction.type === 1) {
      return Response.json({ type: 1 })
    }

    // Handle Application Commands
    if (interaction.type === 2) {
      const response = await handleDiscordCommand(interaction)
      return Response.json(response)
    }

    return Response.json({ error: 'Unknown interaction type' }, { status: 400 })
  } catch (error) {
    console.error('Discord interaction error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
