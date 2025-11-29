import { getServiceSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    
    const supabase = getServiceSupabase()

    // Get user from database by username
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (!user) {
      return Response.json({ success: true, stats: { total_activities: 0, activities_by_type: {}, last_sync: null, sync_count: 0 } })
    }

    // Get activity stats
    const { data: activities } = await supabase
      .from('activities')
      .select('activity_type, created_at')
      .eq('user_id', user.id)

    if (!activities) {
      return Response.json({ success: true, stats: { total_activities: 0, activities_by_type: {}, last_sync: null, sync_count: 0 } })
    }

    // Calculate stats
    const activities_by_type: Record<string, number> = {}
    let lastSync: string | null = null

    activities.forEach(act => {
      activities_by_type[act.activity_type] = (activities_by_type[act.activity_type] || 0) + 1
      if (!lastSync || new Date(act.created_at) > new Date(lastSync)) {
        lastSync = act.created_at
      }
    })

    return Response.json({
      success: true,
      stats: {
        total_activities: activities.length,
        activities_by_type,
        last_sync: lastSync,
        sync_count: activities.length
      }
    })
  } catch (error) {
    console.error('Stats error:', error)
    return Response.json({ success: true, stats: { total_activities: 0, activities_by_type: {}, last_sync: null, sync_count: 0 } })
  }
}
