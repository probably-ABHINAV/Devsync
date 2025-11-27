import { getServiceSupabase } from '@/lib/supabase'
import { calculateTeamMetrics } from '@/lib/analytics/metrics-calculator'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const repo = searchParams.get('repo')
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | null
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const supabase = getServiceSupabase()
    
    let query = supabase
      .from('team_metrics')
      .select('*')
      .order('period_start', { ascending: false })
      .limit(limit)
    
    if (repo) query = query.eq('repo_name', repo)
    if (period) query = query.eq('period_type', period)
    if (startDate) query = query.gte('period_start', startDate)
    if (endDate) query = query.lte('period_end', endDate)
    
    const { data: teamMetrics, error: teamError } = await query
    
    if (teamError) throw teamError
    
    let reviewerQuery = supabase
      .from('reviewer_metrics')
      .select('*')
      .order('reviews_completed', { ascending: false })
      .limit(20)
    
    if (repo) reviewerQuery = reviewerQuery.eq('repo_name', repo)
    if (period) reviewerQuery = reviewerQuery.eq('period_type', period)
    if (startDate) reviewerQuery = reviewerQuery.gte('period_start', startDate)
    
    const { data: reviewerMetrics, error: reviewerError } = await reviewerQuery
    
    if (reviewerError) throw reviewerError
    
    const allContributors = teamMetrics?.flatMap(m => m.top_contributors || []) || []
    const contributorMap: Record<string, number> = {}
    allContributors.forEach((c: any) => {
      contributorMap[c.username] = (contributorMap[c.username] || 0) + (c.pr_count || 0)
    })
    
    const topContributors = Object.entries(contributorMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([username, total_prs]) => ({ username, total_prs }))
    
    const contributionTrends = teamMetrics?.map(m => ({
      period_start: m.period_start,
      period_end: m.period_end,
      period_type: m.period_type,
      total_prs: m.total_prs,
      merged_prs: m.merged_prs,
      active_contributors: m.active_contributors,
      avg_time_to_merge_hours: m.avg_time_to_merge_hours
    })) || []
    
    const reviewerWorkload = reviewerMetrics?.map(r => ({
      username: r.username,
      reviews_completed: r.reviews_completed,
      avg_review_time_hours: r.avg_review_time_hours,
      comments_given: r.comments_given,
      approvals: r.approvals,
      rejections: r.rejections
    })) || []
    
    return Response.json({
      success: true,
      team_metrics: teamMetrics || [],
      contribution_trends: contributionTrends,
      reviewer_workload: reviewerWorkload,
      top_contributors: topContributors
    })
  } catch (error) {
    console.error('Team metrics error:', error)
    return Response.json(
      { error: 'Failed to fetch team metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { repo_name, period_type, period_start, period_end } = body
    
    if (!repo_name || !period_type || !period_start || !period_end) {
      return Response.json(
        { error: 'Missing required fields: repo_name, period_type, period_start, period_end' },
        { status: 400 }
      )
    }
    
    if (!['daily', 'weekly', 'monthly'].includes(period_type)) {
      return Response.json(
        { error: 'Invalid period_type. Must be one of: daily, weekly, monthly' },
        { status: 400 }
      )
    }
    
    const result = await calculateTeamMetrics({
      repo_name,
      period_type,
      period_start,
      period_end
    })
    
    if (!result.success) {
      return Response.json({ error: result.error }, { status: 500 })
    }
    
    return Response.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Team metrics create error:', error)
    return Response.json(
      { error: 'Failed to calculate team metrics' },
      { status: 500 }
    )
  }
}
