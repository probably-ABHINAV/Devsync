import { NextRequest, NextResponse } from 'next/server'
import { processNextJob, processAllPendingJobs, JobType } from '@/lib/jobs/processor'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { mode = 'single', maxJobs = 10, jobTypes } = body as {
      mode?: 'single' | 'batch'
      maxJobs?: number
      jobTypes?: string[]
    }

    const validJobTypes = jobTypes?.filter((t) =>
      Object.values(JobType).includes(t as JobType)
    ) as JobType[] | undefined

    if (mode === 'single') {
      const result = await processNextJob(validJobTypes)

      if (!result.processed) {
        return NextResponse.json({
          success: true,
          message: 'No pending jobs to process',
          processed: 0,
        })
      }

      return NextResponse.json({
        success: true,
        processed: 1,
        job: {
          id: result.job?.id,
          job_id: result.job?.job_id,
          job_type: result.job?.job_type,
          status: result.result?.success ? 'completed' : 'failed',
        },
        result: result.result,
      })
    }

    const batchResult = await processAllPendingJobs({
      maxJobs: Math.min(maxJobs, 100),
      jobTypes: validJobTypes,
    })

    return NextResponse.json({
      success: true,
      processed: batchResult.processed,
      succeeded: batchResult.succeeded,
      failed: batchResult.failed,
      jobs: batchResult.results.map((r) => ({
        id: r.job.id,
        job_id: r.job.job_id,
        job_type: r.job.job_type,
        status: r.result.success ? 'completed' : 'failed',
        error: r.result.error,
      })),
    })
  } catch (error) {
    console.error('Job processing error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process jobs',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await processNextJob()

    if (!result.processed) {
      return NextResponse.json({
        success: true,
        message: 'No pending jobs to process',
        processed: 0,
      })
    }

    return NextResponse.json({
      success: true,
      processed: 1,
      job: {
        id: result.job?.id,
        job_id: result.job?.job_id,
        job_type: result.job?.job_type,
        status: result.result?.success ? 'completed' : 'failed',
      },
      result: result.result,
    })
  } catch (error) {
    console.error('Job processing error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process jobs',
      },
      { status: 500 }
    )
  }
}
