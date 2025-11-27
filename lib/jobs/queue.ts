import { getServiceSupabase } from '@/lib/supabase'

export enum JobType {
  AI_SUMMARY = 'ai_summary',
  NOTIFICATION = 'notification',
  ANALYTICS_ROLLUP = 'analytics_rollup',
  BADGE_AWARD = 'badge_award',
  ISSUE_CLASSIFICATION = 'issue_classification',
  RELEASE_NOTES = 'release_notes',
  CI_ANALYSIS = 'ci_analysis',
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying'

export interface Job {
  id: string
  job_id: string
  job_type: JobType
  status: JobStatus
  priority: number
  payload: Record<string, unknown>
  result: Record<string, unknown> | null
  error_message: string | null
  attempts: number
  max_attempts: number
  scheduled_at: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateJobInput {
  job_type: JobType
  payload: Record<string, unknown>
  priority?: number
  max_attempts?: number
  scheduled_at?: Date
}

function generateJobId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 10)
  return `job_${timestamp}_${randomPart}`
}

export async function createJob(input: CreateJobInput): Promise<Job> {
  const supabase = getServiceSupabase()

  const jobData = {
    job_id: generateJobId(),
    job_type: input.job_type,
    status: 'pending' as JobStatus,
    priority: input.priority ?? 0,
    payload: input.payload,
    max_attempts: input.max_attempts ?? 3,
    scheduled_at: input.scheduled_at?.toISOString() ?? null,
    attempts: 0,
    result: null,
    error_message: null,
  }

  const { data, error } = await supabase
    .from('job_queue')
    .insert(jobData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create job: ${error.message}`)
  }

  return data as Job
}

export async function getNextJob(jobTypes?: JobType[]): Promise<Job | null> {
  const supabase = getServiceSupabase()

  let query = supabase
    .from('job_queue')
    .select('*')
    .in('status', ['pending', 'retrying'])
    .or('scheduled_at.is.null,scheduled_at.lte.' + new Date().toISOString())
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)

  if (jobTypes && jobTypes.length > 0) {
    query = query.in('job_type', jobTypes)
  }

  const { data, error } = await query.single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch next job: ${error.message}`)
  }

  if (!data) {
    return null
  }

  const { error: updateError } = await supabase
    .from('job_queue')
    .update({
      status: 'processing',
      started_at: new Date().toISOString(),
      attempts: (data.attempts || 0) + 1,
    })
    .eq('id', data.id)
    .eq('status', data.status)

  if (updateError) {
    throw new Error(`Failed to claim job: ${updateError.message}`)
  }

  return {
    ...data,
    status: 'processing' as JobStatus,
    started_at: new Date().toISOString(),
    attempts: (data.attempts || 0) + 1,
  } as Job
}

export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  options?: {
    result?: Record<string, unknown>
    error_message?: string
  }
): Promise<Job> {
  const supabase = getServiceSupabase()

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'completed' || status === 'failed') {
    updateData.completed_at = new Date().toISOString()
  }

  if (options?.result !== undefined) {
    updateData.result = options.result
  }

  if (options?.error_message !== undefined) {
    updateData.error_message = options.error_message
  }

  const { data, error } = await supabase
    .from('job_queue')
    .update(updateData)
    .eq('id', jobId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update job status: ${error.message}`)
  }

  return data as Job
}

export async function getJobById(jobId: string): Promise<Job | null> {
  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('job_queue')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch job: ${error.message}`)
  }

  return data as Job
}

export async function getJobByJobId(jobId: string): Promise<Job | null> {
  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('job_queue')
    .select('*')
    .eq('job_id', jobId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch job: ${error.message}`)
  }

  return data as Job
}

export async function getPendingJobsCount(): Promise<number> {
  const supabase = getServiceSupabase()

  const { count, error } = await supabase
    .from('job_queue')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'retrying'])

  if (error) {
    throw new Error(`Failed to count pending jobs: ${error.message}`)
  }

  return count ?? 0
}

export async function getJobQueueStats(): Promise<{
  pending: number
  processing: number
  completed: number
  failed: number
  retrying: number
  by_type: Record<string, number>
}> {
  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('job_queue')
    .select('status, job_type')

  if (error) {
    throw new Error(`Failed to fetch job queue stats: ${error.message}`)
  }

  const stats = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    retrying: 0,
    by_type: {} as Record<string, number>,
  }

  for (const job of data || []) {
    stats[job.status as keyof typeof stats]++
    
    if (!stats.by_type[job.job_type]) {
      stats.by_type[job.job_type] = 0
    }
    stats.by_type[job.job_type]++
  }

  return stats
}

export async function cleanupOldJobs(olderThanDays: number = 30): Promise<number> {
  const supabase = getServiceSupabase()
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

  const { data, error } = await supabase
    .from('job_queue')
    .delete()
    .in('status', ['completed', 'failed'])
    .lt('completed_at', cutoffDate.toISOString())
    .select('id')

  if (error) {
    throw new Error(`Failed to cleanup old jobs: ${error.message}`)
  }

  return data?.length ?? 0
}

export async function retryFailedJobs(maxRetries: number = 3): Promise<number> {
  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('job_queue')
    .update({
      status: 'retrying',
      error_message: null,
    })
    .eq('status', 'failed')
    .lt('attempts', maxRetries)
    .select('id')

  if (error) {
    throw new Error(`Failed to retry failed jobs: ${error.message}`)
  }

  return data?.length ?? 0
}
