import { getServiceSupabase } from '@/lib/supabase'
import type { NextRequest } from 'next/server'

type ReportType = 'weekly_summary' | 'monthly_summary' | 'pr_analysis' | 'team_performance' | 'custom'

interface ReportContent {
  summary?: string
  metrics?: Record<string, any>
  highlights?: string[]
  recommendations?: string[]
  charts_data?: Record<string, any>[]
}

async function generateWeeklySummary(repoName: string, periodStart: string, periodEnd: string): Promise<ReportContent> {
  const supabase = getServiceSupabase()
  
  const { data: teamMetrics } = await supabase
    .from('team_metrics')
    .select('*')
    .eq('repo_name', repoName)
    .eq('period_type', 'weekly')
    .gte('period_start', periodStart)
    .lte('period_end', periodEnd)
    .single()
  
  const { data: prMetrics } = await supabase
    .from('pr_metrics')
    .select('*')
    .eq('repo_name', repoName)
    .gte('opened_at', periodStart)
    .lte('opened_at', periodEnd)
  
  const mergedPrs = prMetrics?.filter(pr => pr.status === 'merged') || []
  const openPrs = prMetrics?.filter(pr => pr.status === 'open') || []
  
  return {
    summary: `Weekly summary for ${repoName} from ${periodStart} to ${periodEnd}`,
    metrics: {
      total_prs: prMetrics?.length || 0,
      merged_prs: mergedPrs.length,
      open_prs: openPrs.length,
      avg_time_to_merge_hours: teamMetrics?.avg_time_to_merge_hours || null,
      avg_review_time_hours: teamMetrics?.avg_review_time_hours || null,
      active_contributors: teamMetrics?.active_contributors || 0,
      top_contributors: teamMetrics?.top_contributors || []
    },
    highlights: [
      `${mergedPrs.length} PRs were merged this week`,
      `${openPrs.length} PRs are still open`,
      `${teamMetrics?.active_contributors || 0} contributors were active`
    ],
    recommendations: generateRecommendations(teamMetrics, prMetrics || [])
  }
}

async function generateMonthlySummary(repoName: string, periodStart: string, periodEnd: string): Promise<ReportContent> {
  const supabase = getServiceSupabase()
  
  const { data: teamMetrics } = await supabase
    .from('team_metrics')
    .select('*')
    .eq('repo_name', repoName)
    .gte('period_start', periodStart)
    .lte('period_end', periodEnd)
  
  const { data: prMetrics } = await supabase
    .from('pr_metrics')
    .select('*')
    .eq('repo_name', repoName)
    .gte('opened_at', periodStart)
    .lte('opened_at', periodEnd)
  
  const mergedPrs = prMetrics?.filter(pr => pr.status === 'merged') || []
  
  const totalMerged = teamMetrics?.reduce((sum, m) => sum + (m.merged_prs || 0), 0) || 0
  const avgTimeToMerge = teamMetrics?.length 
    ? teamMetrics.reduce((sum, m) => sum + (m.avg_time_to_merge_hours || 0), 0) / teamMetrics.length 
    : null
  
  const contributorSet = new Set<string>()
  teamMetrics?.forEach(m => {
    (m.top_contributors || []).forEach((c: any) => contributorSet.add(c.username))
  })
  
  return {
    summary: `Monthly summary for ${repoName} from ${periodStart} to ${periodEnd}`,
    metrics: {
      total_prs: prMetrics?.length || 0,
      merged_prs: totalMerged,
      avg_time_to_merge_hours: avgTimeToMerge ? Math.round(avgTimeToMerge * 100) / 100 : null,
      unique_contributors: contributorSet.size,
      weeks_analyzed: teamMetrics?.length || 0
    },
    highlights: [
      `${totalMerged} PRs were merged this month`,
      `${contributorSet.size} unique contributors`,
      avgTimeToMerge ? `Average time to merge: ${Math.round(avgTimeToMerge)} hours` : 'No merge time data available'
    ],
    charts_data: teamMetrics?.map(m => ({
      period: m.period_start,
      prs: m.total_prs,
      merged: m.merged_prs,
      contributors: m.active_contributors
    })) || []
  }
}

async function generatePRAnalysis(repoName: string, periodStart: string, periodEnd: string): Promise<ReportContent> {
  const supabase = getServiceSupabase()
  
  const { data: prMetrics } = await supabase
    .from('pr_metrics')
    .select('*')
    .eq('repo_name', repoName)
    .gte('opened_at', periodStart)
    .lte('opened_at', periodEnd)
    .order('opened_at', { ascending: false })
  
  if (!prMetrics || prMetrics.length === 0) {
    return {
      summary: `No PRs found for ${repoName} in the specified period`,
      metrics: { total_prs: 0 },
      highlights: [],
      recommendations: []
    }
  }
  
  const complexityDistribution = {
    low: prMetrics.filter(pr => pr.complexity_score === 'low').length,
    medium: prMetrics.filter(pr => pr.complexity_score === 'medium').length,
    high: prMetrics.filter(pr => pr.complexity_score === 'high').length,
    very_high: prMetrics.filter(pr => pr.complexity_score === 'very_high').length
  }
  
  const avgRiskScore = prMetrics.reduce((sum, pr) => sum + (pr.risk_score || 0), 0) / prMetrics.length
  const highRiskPrs = prMetrics.filter(pr => (pr.risk_score || 0) > 70)
  
  const authorStats: Record<string, { count: number, merged: number }> = {}
  prMetrics.forEach(pr => {
    if (!authorStats[pr.author]) {
      authorStats[pr.author] = { count: 0, merged: 0 }
    }
    authorStats[pr.author].count++
    if (pr.status === 'merged') authorStats[pr.author].merged++
  })
  
  return {
    summary: `PR Analysis for ${repoName} from ${periodStart} to ${periodEnd}`,
    metrics: {
      total_prs: prMetrics.length,
      complexity_distribution: complexityDistribution,
      avg_risk_score: Math.round(avgRiskScore),
      high_risk_prs: highRiskPrs.length,
      author_stats: Object.entries(authorStats).map(([author, stats]) => ({
        author,
        ...stats,
        merge_rate: stats.count > 0 ? Math.round(stats.merged / stats.count * 100) : 0
      }))
    },
    highlights: [
      `${highRiskPrs.length} high-risk PRs detected`,
      `Average risk score: ${Math.round(avgRiskScore)}`,
      `Most PRs are ${Object.entries(complexityDistribution).sort(([,a], [,b]) => b - a)[0][0]} complexity`
    ],
    recommendations: highRiskPrs.length > 0 
      ? ['Consider adding more reviewers for high-risk PRs', 'Break down large PRs into smaller, focused changes']
      : ['PR risk levels are manageable']
  }
}

async function generateTeamPerformance(repoName: string, periodStart: string, periodEnd: string): Promise<ReportContent> {
  const supabase = getServiceSupabase()
  
  const { data: reviewerMetrics } = await supabase
    .from('reviewer_metrics')
    .select('*')
    .eq('repo_name', repoName)
    .gte('period_start', periodStart)
  
  const { data: teamMetrics } = await supabase
    .from('team_metrics')
    .select('*')
    .eq('repo_name', repoName)
    .gte('period_start', periodStart)
    .lte('period_end', periodEnd)
  
  const reviewerStats: Record<string, { reviews: number, avg_time: number, approvals: number }> = {}
  reviewerMetrics?.forEach(r => {
    if (!reviewerStats[r.username]) {
      reviewerStats[r.username] = { reviews: 0, avg_time: 0, approvals: 0 }
    }
    reviewerStats[r.username].reviews += r.reviews_completed || 0
    reviewerStats[r.username].approvals += r.approvals || 0
    reviewerStats[r.username].avg_time = r.avg_review_time_hours || 0
  })
  
  const topReviewers = Object.entries(reviewerStats)
    .sort(([,a], [,b]) => b.reviews - a.reviews)
    .slice(0, 5)
    .map(([username, stats]) => ({ username, ...stats }))
  
  return {
    summary: `Team Performance Report for ${repoName}`,
    metrics: {
      total_reviews: reviewerMetrics?.reduce((sum, r) => sum + (r.reviews_completed || 0), 0) || 0,
      unique_reviewers: Object.keys(reviewerStats).length,
      avg_review_time: reviewerMetrics?.length 
        ? reviewerMetrics.reduce((sum, r) => sum + (r.avg_review_time_hours || 0), 0) / reviewerMetrics.length 
        : null,
      top_reviewers: topReviewers,
      team_trends: teamMetrics?.map(m => ({
        period: m.period_start,
        active_contributors: m.active_contributors,
        total_prs: m.total_prs
      })) || []
    },
    highlights: [
      `${Object.keys(reviewerStats).length} reviewers participated`,
      topReviewers[0] ? `Top reviewer: ${topReviewers[0].username} with ${topReviewers[0].reviews} reviews` : 'No review data'
    ],
    recommendations: [
      'Distribute review workload more evenly across team members',
      'Set up code owners to automate reviewer assignment'
    ]
  }
}

function generateRecommendations(teamMetrics: any, prMetrics: any[]): string[] {
  const recommendations: string[] = []
  
  if (teamMetrics?.avg_time_to_merge_hours > 48) {
    recommendations.push('Consider reducing PR size to speed up merge times')
  }
  
  if (teamMetrics?.avg_review_time_hours > 24) {
    recommendations.push('Set up automated PR review reminders')
  }
  
  const largePrs = prMetrics.filter(pr => (pr.lines_added || 0) + (pr.lines_removed || 0) > 500)
  if (largePrs.length > prMetrics.length * 0.3) {
    recommendations.push('Many PRs are large - encourage smaller, focused changes')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Team is performing well - keep up the good work!')
  }
  
  return recommendations
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') as ReportType | null
    const repo = searchParams.get('repo')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const supabase = getServiceSupabase()
    
    let query = supabase
      .from('analytics_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (reportType) query = query.eq('report_type', reportType)
    if (repo) query = query.eq('repo_name', repo)
    
    const { data: reports, error } = await query
    
    if (error) throw error
    
    return Response.json({ success: true, reports: reports || [] })
  } catch (error) {
    console.error('Reports fetch error:', error)
    return Response.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { report_type, repo_name, period_start, period_end, generated_for } = body
    
    if (!report_type || !repo_name) {
      return Response.json(
        { error: 'Missing required fields: report_type, repo_name' },
        { status: 400 }
      )
    }
    
    const validTypes: ReportType[] = ['weekly_summary', 'monthly_summary', 'pr_analysis', 'team_performance', 'custom']
    if (!validTypes.includes(report_type)) {
      return Response.json(
        { error: `Invalid report_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }
    
    const now = new Date()
    const defaultPeriodEnd = period_end || now.toISOString()
    let defaultPeriodStart = period_start
    
    if (!defaultPeriodStart) {
      const startDate = new Date(now)
      if (report_type === 'weekly_summary') {
        startDate.setDate(startDate.getDate() - 7)
      } else if (report_type === 'monthly_summary') {
        startDate.setMonth(startDate.getMonth() - 1)
      } else {
        startDate.setDate(startDate.getDate() - 30)
      }
      defaultPeriodStart = startDate.toISOString()
    }
    
    let content: ReportContent
    let title: string
    
    switch (report_type) {
      case 'weekly_summary':
        content = await generateWeeklySummary(repo_name, defaultPeriodStart, defaultPeriodEnd)
        title = `Weekly Summary - ${repo_name}`
        break
      case 'monthly_summary':
        content = await generateMonthlySummary(repo_name, defaultPeriodStart, defaultPeriodEnd)
        title = `Monthly Summary - ${repo_name}`
        break
      case 'pr_analysis':
        content = await generatePRAnalysis(repo_name, defaultPeriodStart, defaultPeriodEnd)
        title = `PR Analysis - ${repo_name}`
        break
      case 'team_performance':
        content = await generateTeamPerformance(repo_name, defaultPeriodStart, defaultPeriodEnd)
        title = `Team Performance - ${repo_name}`
        break
      default:
        content = { summary: 'Custom report', metrics: body.custom_metrics || {} }
        title = body.title || `Custom Report - ${repo_name}`
    }
    
    const supabase = getServiceSupabase()
    
    const { data: report, error } = await supabase
      .from('analytics_reports')
      .insert({
        report_type,
        repo_name,
        title,
        content,
        generated_for,
        period_start: defaultPeriodStart,
        period_end: defaultPeriodEnd
      })
      .select()
      .single()
    
    if (error) throw error
    
    return Response.json({ success: true, report })
  } catch (error) {
    console.error('Report generation error:', error)
    return Response.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
