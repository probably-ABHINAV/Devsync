import { getServiceSupabase } from '@/lib/supabase'
import { checkAndAwardBadges } from '@/lib/gamification'

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
      return Response.json({ 
        success: true, 
        stats: null,
        badges: []
      })
    }

    // Get gamification stats
    let { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // If no stats exist, create default ones
    if (!stats) {
      const { data: newStats } = await supabase
        .from('user_stats')
        .insert({
          user_id: user.id,
          xp: 0,
          level: 1,
          prs_opened: 0,
          prs_merged: 0,
          prs_reviewed: 0,
          issues_created: 0,
          issues_closed: 0,
          commits_count: 0,
        })
        .select()
        .single()
      
      stats = newStats
    }

    // Check and award badges based on current stats
    await checkAndAwardBadges(user.id)

    // Get user's badges
    const { data: badges } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges:badge_id (*)
      `)
      .eq('user_id', user.id)

    return Response.json({
      success: true,
      stats,
      badges: badges || []
    })
  } catch (error) {
    console.error('Stats error:', error)
    return Response.json({ 
      success: true, 
      stats: null,
      badges: []
    })
  }
}
