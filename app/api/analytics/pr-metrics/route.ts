import { getServiceSupabase } from '@/lib/supabase'
import { getAggregatedPRStats, calculatePRMetrics } from '@/lib/analytics/metrics-calculator'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const repo = searchParams.get('repo')
    const author = searchParams.get('author')
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    
    const result = await getAggregatedPRStats(
      repo || undefined,
      author || undefined,
      status || undefined,
      startDate || undefined,
      endDate || undefined
    )
    
    if (!result.success) {
      return Response.json({ error: result.error }, { status: 500 })
    }
    
    return Response.json({ success: true, ...result.data })
  } catch (error) {
    console.error('PR metrics error:', error)
    return Response.json(
      { error: 'Failed to fetch PR metrics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { pr_number, repo_name, author, status } = body
    
    if (!pr_number || !repo_name || !author || !status) {
      return Response.json(
        { error: 'Missing required fields: pr_number, repo_name, author, status' },
        { status: 400 }
      )
    }
    
    if (!['open', 'merged', 'closed'].includes(status)) {
      return Response.json(
        { error: 'Invalid status. Must be one of: open, merged, closed' },
        { status: 400 }
      )
    }
    
    const result = await calculatePRMetrics(body)
    
    if (!result.success) {
      return Response.json({ error: result.error }, { status: 500 })
    }
    
    return Response.json({ success: true, data: result.data })
  } catch (error) {
    console.error('PR metrics create error:', error)
    return Response.json(
      { error: 'Failed to create PR metrics' },
      { status: 500 }
    )
  }
}
