import { getServiceSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const supabase = getServiceSupabase()

    // Get current user from cookie
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('github_user')?.value

    if (!userCookie) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userData = JSON.parse(userCookie)

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
