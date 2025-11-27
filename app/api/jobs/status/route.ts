import { NextRequest, NextResponse } from 'next/server'
import { getJobQueueStats, getPendingJobsCount, getJobById, getJobByJobId } from '@/lib/jobs/queue'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('id')
    const jobIdString = searchParams.get('job_id')

    if (jobId) {
      const job = await getJobById(jobId)
      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, job })
    }

    if (jobIdString) {
      const job = await getJobByJobId(jobIdString)
      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ success: true, job })
    }

    const stats = await getJobQueueStats()
    const pendingCount = await getPendingJobsCount()

    const supabase = getServiceSupabase()

    const { data: recentJobs } = await supabase
      .from('job_queue')
      .select('id, job_id, job_type, status, created_at, completed_at, attempts, error_message')
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: recentFailures } = await supabase
      .from('job_queue')
      .select('id, job_id, job_type, error_message, attempts, created_at')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: healthMetrics } = await supabase
      .from('system_health')
      .select('*')
      .eq('metric_type', 'worker_status')
      .order('recorded_at', { ascending: false })
      .limit(20)

    const successCount = healthMetrics?.filter(
      (m) => m.metric_name === 'job_completed'
    ).length ?? 0

    const failureCount = healthMetrics?.filter(
      (m) => m.metric_name === 'job_failed'
    ).length ?? 0

    const recentSuccessRate =
      successCount + failureCount > 0
        ? ((successCount / (successCount + failureCount)) * 100).toFixed(1)
        : '100.0'

    return NextResponse.json({
      success: true,
      queue: {
        pending: stats.pending,
        processing: stats.processing,
        completed: stats.completed,
        failed: stats.failed,
        retrying: stats.retrying,
        total_pending: pendingCount,
      },
      by_type: stats.by_type,
      metrics: {
        recent_success_rate: `${recentSuccessRate}%`,
        recent_successes: successCount,
        recent_failures: failureCount,
      },
      recent_jobs: recentJobs ?? [],
      recent_failures: recentFailures ?? [],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Job status error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get job status',
      },
      { status: 500 }
    )
  }
}
