import { registerDiscordCommands } from '@/lib/discord-commands'

export async function POST() {
  try {
    const result = await registerDiscordCommands()
    return Response.json({
      success: true,
      message: 'Discord commands registered successfully',
      commands: result,
    })
  } catch (error) {
    console.error('Failed to register commands:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to register commands',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST()
}
