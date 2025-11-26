import { getUserStats } from '@/lib/gamification'
import type { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const { stats, badges } = await getUserStats(userId)

    if (!stats) {
      return Response.json({ error: 'User stats not found' }, { status: 404 })
    }

    return Response.json({ success: true, stats, badges })
  } catch (error) {
    console.error('Stats error:', error)
    return Response.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
