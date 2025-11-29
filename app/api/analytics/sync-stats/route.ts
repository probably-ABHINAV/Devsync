import { getServiceSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('github_token')?.value

    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabase = getServiceSupabase()

    // Get user from GitHub token
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!userResponse.ok) {
      return Response.json({ error: 'Failed to verify token' }, { status: 401 })
    }

    const userData = await userResponse.json()

    // Get user from database
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('github_id', userData.id.toString())
      .single()

    if (!user) {
      return Response.json({
        success: true,
        stats: {
          total_activities: 0,
          activities_by_type: {},
          last_sync: null,
          sync_count: 0,
        }
      })
    }

    // Get activity statistics
    const { data: activities } = await supabase
      .from('activities')
      .select('activity_type, created_at')
      .eq('user_id', user.id)

    const stats = {
      total_activities: activities?.length || 0,
      activities_by_type: {} as Record<string, number>,
      last_sync: activities?.[0]?.created_at || null,
      sync_count: Math.ceil((activities?.length || 0) / 10),
    }

    // Count by type
    activities?.forEach((activity: any) => {
      stats.activities_by_type[activity.activity_type] = (stats.activities_by_type[activity.activity_type] || 0) + 1
    })

    return Response.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error('Sync stats error:', error)
    return Response.json(
      { error: 'Failed to fetch sync statistics' },
      { status: 500 }
    )
  }
}
