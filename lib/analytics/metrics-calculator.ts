import { getServiceSupabase } from '@/lib/supabase'

export interface PRMetricsInput {
  pr_number: number
  repo_name: string
  author: string
  title?: string
  lines_added?: number
  lines_removed?: number
  files_changed?: number
  commits_count?: number
  comments_count?: number
  review_comments_count?: number
  reviewers?: string[]
  time_to_first_review_hours?: number
  time_to_merge_hours?: number
  review_cycles?: number
  status: 'open' | 'merged' | 'closed'
  opened_at?: string
  merged_at?: string
  closed_at?: string
}

export interface TeamMetricsInput {
  repo_name: string
  period_type: 'daily' | 'weekly' | 'monthly'
  period_start: string
  period_end: string
}

export interface ReviewerMetricsInput {
  user_id?: string
  username: string
  repo_name: string
  period_type: 'daily' | 'weekly' | 'monthly'
  period_start: string
  reviews_completed?: number
  avg_review_time_hours?: number
  comments_given?: number
  approvals?: number
  rejections?: number
}

function calculateComplexityScore(linesChanged: number, filesChanged: number): 'low' | 'medium' | 'high' | 'very_high' {
  const totalChange = linesChanged + filesChanged * 10
  if (totalChange < 50) return 'low'
  if (totalChange < 200) return 'medium'
  if (totalChange < 500) return 'high'
  return 'very_high'
}

function calculateRiskScore(
  linesChanged: number,
  filesChanged: number,
  reviewCycles: number,
  hasTests: boolean = false
): number {
  let score = 0
  
  if (linesChanged > 500) score += 30
  else if (linesChanged > 200) score += 20
  else if (linesChanged > 50) score += 10
  
  if (filesChanged > 20) score += 25
  else if (filesChanged > 10) score += 15
  else if (filesChanged > 5) score += 5
  
  score += Math.min(reviewCycles * 10, 30)
  
  if (!hasTests) score += 15
  
  return Math.min(score, 100)
}

export async function calculatePRMetrics(input: PRMetricsInput): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getServiceSupabase()
    
    const linesChanged = (input.lines_added || 0) + (input.lines_removed || 0)
    const complexity_score = calculateComplexityScore(linesChanged, input.files_changed || 0)
    const risk_score = calculateRiskScore(
      linesChanged,
      input.files_changed || 0,
      input.review_cycles || 0
    )
    
    const metricsData = {
      pr_number: input.pr_number,
      repo_name: input.repo_name,
      author: input.author,
      title: input.title,
      lines_added: input.lines_added || 0,
      lines_removed: input.lines_removed || 0,
      files_changed: input.files_changed || 0,
      commits_count: input.commits_count || 0,
      comments_count: input.comments_count || 0,
      review_comments_count: input.review_comments_count || 0,
      reviewers: input.reviewers || [],
      time_to_first_review_hours: input.time_to_first_review_hours,
      time_to_merge_hours: input.time_to_merge_hours,
      review_cycles: input.review_cycles || 0,
      complexity_score,
      risk_score,
      status: input.status,
      opened_at: input.opened_at,
      merged_at: input.merged_at,
      closed_at: input.closed_at,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('pr_metrics')
      .upsert(metricsData, { onConflict: 'repo_name,pr_number' })
      .select()
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error('Error calculating PR metrics:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function calculateTeamMetrics(input: TeamMetricsInput): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getServiceSupabase()
    
    const { data: prMetrics, error: prError } = await supabase
      .from('pr_metrics')
      .select('*')
      .eq('repo_name', input.repo_name)
      .gte('opened_at', input.period_start)
      .lte('opened_at', input.period_end)
    
    if (prError) throw prError
    
    const prs = prMetrics || []
    const mergedPrs = prs.filter(pr => pr.status === 'merged')
    
    const avgTimeToMerge = mergedPrs.length > 0
      ? mergedPrs.reduce((sum, pr) => sum + (pr.time_to_merge_hours || 0), 0) / mergedPrs.length
      : null
    
    const avgReviewTime = prs.length > 0
      ? prs.reduce((sum, pr) => sum + (pr.time_to_first_review_hours || 0), 0) / prs.length
      : null
    
    const totalReviews = prs.reduce((sum, pr) => sum + (pr.review_comments_count || 0), 0)
    
    const contributorSet = new Set(prs.map(pr => pr.author))
    
    const contributorCounts: Record<string, number> = {}
    prs.forEach(pr => {
      contributorCounts[pr.author] = (contributorCounts[pr.author] || 0) + 1
    })
    
    const topContributors = Object.entries(contributorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([username, count]) => ({ username, pr_count: count }))
    
    const teamMetricsData = {
      repo_name: input.repo_name,
      period_type: input.period_type,
      period_start: input.period_start,
      period_end: input.period_end,
      total_prs: prs.length,
      merged_prs: mergedPrs.length,
      avg_time_to_merge_hours: avgTimeToMerge,
      avg_review_time_hours: avgReviewTime,
      total_reviews: totalReviews,
      total_issues_opened: 0,
      total_issues_closed: 0,
      total_commits: prs.reduce((sum, pr) => sum + (pr.commits_count || 0), 0),
      active_contributors: contributorSet.size,
      top_contributors: topContributors
    }
    
    const { data, error } = await supabase
      .from('team_metrics')
      .upsert(teamMetricsData, { onConflict: 'repo_name,period_type,period_start' })
      .select()
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error('Error calculating team metrics:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function calculateReviewerMetrics(input: ReviewerMetricsInput): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getServiceSupabase()
    
    const reviewerMetricsData = {
      user_id: input.user_id,
      username: input.username,
      repo_name: input.repo_name,
      period_type: input.period_type,
      period_start: input.period_start,
      reviews_completed: input.reviews_completed || 0,
      avg_review_time_hours: input.avg_review_time_hours,
      comments_given: input.comments_given || 0,
      approvals: input.approvals || 0,
      rejections: input.rejections || 0
    }
    
    const { data, error } = await supabase
      .from('reviewer_metrics')
      .upsert(reviewerMetricsData, { onConflict: 'username,repo_name,period_type,period_start' })
      .select()
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error('Error calculating reviewer metrics:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function getAggregatedPRStats(
  repo_name?: string,
  author?: string,
  status?: string,
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = getServiceSupabase()
    
    let query = supabase.from('pr_metrics').select('*')
    
    if (repo_name) query = query.eq('repo_name', repo_name)
    if (author) query = query.eq('author', author)
    if (status) query = query.eq('status', status)
    if (startDate) query = query.gte('opened_at', startDate)
    if (endDate) query = query.lte('opened_at', endDate)
    
    const { data: prs, error } = await query
    
    if (error) throw error
    
    if (!prs || prs.length === 0) {
      return {
        success: true,
        data: {
          total_prs: 0,
          merged_prs: 0,
          open_prs: 0,
          closed_prs: 0,
          avg_time_to_merge_hours: null,
          avg_review_time_hours: null,
          avg_lines_changed: 0,
          avg_files_changed: 0,
          avg_review_cycles: 0,
          prs: []
        }
      }
    }
    
    const mergedPrs = prs.filter(pr => pr.status === 'merged')
    const openPrs = prs.filter(pr => pr.status === 'open')
    const closedPrs = prs.filter(pr => pr.status === 'closed')
    
    const avgTimeToMerge = mergedPrs.length > 0
      ? mergedPrs.reduce((sum, pr) => sum + (pr.time_to_merge_hours || 0), 0) / mergedPrs.length
      : null
    
    const prsWithReviewTime = prs.filter(pr => pr.time_to_first_review_hours != null)
    const avgReviewTime = prsWithReviewTime.length > 0
      ? prsWithReviewTime.reduce((sum, pr) => sum + pr.time_to_first_review_hours, 0) / prsWithReviewTime.length
      : null
    
    const avgLinesChanged = prs.reduce((sum, pr) => sum + (pr.lines_added || 0) + (pr.lines_removed || 0), 0) / prs.length
    const avgFilesChanged = prs.reduce((sum, pr) => sum + (pr.files_changed || 0), 0) / prs.length
    const avgReviewCycles = prs.reduce((sum, pr) => sum + (pr.review_cycles || 0), 0) / prs.length
    
    return {
      success: true,
      data: {
        total_prs: prs.length,
        merged_prs: mergedPrs.length,
        open_prs: openPrs.length,
        closed_prs: closedPrs.length,
        avg_time_to_merge_hours: avgTimeToMerge ? Math.round(avgTimeToMerge * 100) / 100 : null,
        avg_review_time_hours: avgReviewTime ? Math.round(avgReviewTime * 100) / 100 : null,
        avg_lines_changed: Math.round(avgLinesChanged),
        avg_files_changed: Math.round(avgFilesChanged * 10) / 10,
        avg_review_cycles: Math.round(avgReviewCycles * 10) / 10,
        prs
      }
    }
  } catch (error) {
    console.error('Error getting aggregated PR stats:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
