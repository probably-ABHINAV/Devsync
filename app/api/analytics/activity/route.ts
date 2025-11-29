import { getServiceSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = getServiceSupabase()

    // Get current user from cookie or query param
    const cookieStore = await cookies()
    let userCookie = cookieStore.get('github_user')?.value
    
    // Fallback: try to get from query params
    if (!userCookie) {
      const username = searchParams.get('username')
      if (username) {
        userCookie = JSON.stringify({ login: username })
      }
    }

    if (!userCookie) {
      return Response.json({ activities: [], count: 0, success: true })
    }

    let userData
    try {
      userData = typeof userCookie === 'string' ? JSON.parse(userCookie) : userCookie
    } catch {
      return Response.json({ activities: [], count: 0, success: true })
    }

    // Get user ID from GitHub username
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', userData.login)
      .single()

    if (!user) {
      return Response.json({ error: 'User not found in database' }, { status: 404 })
    }

    // Fetch recent activities from Supabase
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Supabase activities error:', error)
      return Response.json({ error: 'Failed to fetch activities from database' }, { status: 500 })
    }

    return Response.json({ success: true, activities: activities || [], count: activities?.length || 0 })
  } catch (error) {
    console.error('Activity feed error:', error)
    return Response.json(
      { error: 'Failed to fetch activities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
