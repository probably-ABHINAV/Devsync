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
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch recent activities
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return Response.json({ success: true, activities })
  } catch (error) {
    console.error('Activity feed error:', error)
    return Response.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}
