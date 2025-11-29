import { getServiceSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cookieStore = await cookies()
    let token = cookieStore.get('github_token')?.value
    let username = searchParams.get('username')

    // Fallback for production
    if (!token || !username) {
      try {
        const userCookie = cookieStore.get('github_user')?.value
        if (userCookie) {
          const userData = JSON.parse(userCookie)
          username = userData.login
        }
      } catch {}
    }

    if (!token && !username) {
      return Response.json({ success: true, insights: { most_active_repo: null, activity_trend: 'new', top_activity_type: null, streak: 0, recommendations: [] } })
    }

    const supabase = getServiceSupabase()

    let userData: any = { login: username, id: 0 }
    
    // Try to get full user data from GitHub if token available
    if (token) {
      try {
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        })
        if (userResponse.ok) {
          userData = await userResponse.json()
        }
      } catch {}
    }

    // Get user from database
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', userData.login || username)
      .single()

    if (!user) {
      return Response.json({
        success: true,
        insights: {
          most_active_repo: null,
          activity_trend: 'stable',
          top_activity_type: null,
          streak: 0,
          recommendations: [],
        }
      })
    }

    // Get activity statistics
    const { data: activities } = await supabase
      .from('activities')
      .select('activity_type, repo_name, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!activities || activities.length === 0) {
      return Response.json({
        success: true,
        insights: {
          most_active_repo: null,
          activity_trend: 'new',
          top_activity_type: null,
          streak: 0,
          recommendations: ['Start by syncing your GitHub activities!', 'Create a pull request to start earning XP', 'Review team member pull requests for more XP'],
        }
      })
    }

    // Calculate insights
    const repoCount: Record<string, number> = {}
    const typeCount: Record<string, number> = {}
    
    activities.forEach((activity: any) => {
      repoCount[activity.repo_name] = (repoCount[activity.repo_name] || 0) + 1
      typeCount[activity.activity_type] = (typeCount[activity.activity_type] || 0) + 1
    })

    const mostActiveRepo = Object.entries(repoCount).sort(([,a], [,b]) => b - a)[0]?.[0] || null
    const topActivityType = Object.entries(typeCount).sort(([,a], [,b]) => b - a)[0]?.[0] || null

    // Calculate streak (consecutive days with activity)
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 100; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const hasActivity = activities.some(a => {
        const actDate = new Date(a.created_at)
        return actDate.toDateString() === date.toDateString()
      })
      if (hasActivity) streak++
      else break
    }

    const trend = activities.length > 20 ? 'increasing' : activities.length > 5 ? 'stable' : 'starting'

    const recommendations = [
      streak > 7 ? '🔥 Amazing streak! Keep it going!' : 'Build a contribution streak by staying active',
      activities.length > 50 ? '🎯 You\'re a superstar contributor!' : 'Keep coding and syncing to unlock achievements',
      topActivityType === 'pr_merged' ? '💯 Great at shipping code!' : 'Try opening more pull requests for review',
    ]

    return Response.json({
      success: true,
      insights: {
        most_active_repo: mostActiveRepo,
        activity_trend: trend,
        top_activity_type: topActivityType,
        streak,
        recommendations,
        total_count: activities.length,
      }
    })
  } catch (error) {
    console.error('Activity insights error:', error)
    return Response.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}
