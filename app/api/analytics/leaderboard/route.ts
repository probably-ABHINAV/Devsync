import { getLeaderboard } from '@/lib/gamification'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const leaderboard = await getLeaderboard(limit)

    return Response.json({ success: true, leaderboard })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return Response.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
