import { getServiceSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cookieStore = await cookies()
    let token = cookieStore.get('github_token')?.value
    let username = searchParams.get('username')

    if (!username) {
      try {
        const userCookie = cookieStore.get('github_user')?.value
        if (userCookie) {
          const userData = JSON.parse(userCookie)
          username = userData.login
        }
      } catch {}
    }

    if (!token && !username) {
      return Response.json({ success: true, stats: { total_activities: 0, activities_by_type: {}, last_sync: null, sync_count: 0 } })
    }

    const supabase = getServiceSupabase()

    // Get user from database by username
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
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
