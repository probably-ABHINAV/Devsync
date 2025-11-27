import { GoogleGenerativeAI } from '@google/generative-ai'
import { getServiceSupabase } from '../supabase'

const apiKey = process.env.GEMINI_API_KEY || ''

if (!apiKey) {
  console.warn('GEMINI_API_KEY not set - AI CI analysis will be disabled')
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface CIRunInput {
  runId: string
  repoName: string
  workflowName: string
  branch?: string
  commitSha?: string
  logs: string
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  conclusion?: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required'
  startedAt?: string
  completedAt?: string
  logsUrl?: string
  htmlUrl?: string
}

export interface CIFailureAnalysisResult {
  error_type: string
  root_cause: string
  affected_files: string[]
  suggested_fixes: string[]
  related_prs: number[]
  ai_confidence: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
}

const ERROR_PATTERNS: Record<string, { category: string; severity: 'critical' | 'high' | 'medium' | 'low' }> = {
  'ECONNREFUSED': { category: 'network', severity: 'high' },
  'ETIMEDOUT': { category: 'network', severity: 'high' },
  'OutOfMemoryError': { category: 'resource', severity: 'critical' },
  'heap out of memory': { category: 'resource', severity: 'critical' },
  'No space left on device': { category: 'resource', severity: 'critical' },
  'Permission denied': { category: 'permissions', severity: 'high' },
  'Module not found': { category: 'dependency', severity: 'medium' },
  'Cannot find module': { category: 'dependency', severity: 'medium' },
  'SyntaxError': { category: 'syntax', severity: 'high' },
  'TypeError': { category: 'type', severity: 'medium' },
  'ReferenceError': { category: 'reference', severity: 'medium' },
  'AssertionError': { category: 'test', severity: 'medium' },
  'Expected': { category: 'test', severity: 'medium' },
  'FAILED': { category: 'test', severity: 'medium' },
  'error: build failed': { category: 'build', severity: 'high' },
  'compilation failed': { category: 'build', severity: 'high' },
  'npm ERR!': { category: 'package', severity: 'medium' },
  'yarn error': { category: 'package', severity: 'medium' },
  'docker': { category: 'container', severity: 'high' },
  'exit code 1': { category: 'general', severity: 'medium' },
  'exit status 1': { category: 'general', severity: 'medium' }
}

function detectErrorPatterns(logs: string): { category: string; severity: 'critical' | 'high' | 'medium' | 'low' } {
  const lowerLogs = logs.toLowerCase()
  
  for (const [pattern, info] of Object.entries(ERROR_PATTERNS)) {
    if (lowerLogs.includes(pattern.toLowerCase())) {
      return info
    }
  }
  
  return { category: 'unknown', severity: 'medium' }
}

function extractAffectedFiles(logs: string): string[] {
  const files: string[] = []
  
  const filePatterns = [
    /(?:in|at|from)\s+([^\s:]+\.[a-z]{1,4})(?::\d+)?/gi,
    /(?:Error|Failed|Warning)\s+(?:in|at)\s+([^\s:]+)/gi,
    /([a-zA-Z0-9_\-/]+\.(ts|js|tsx|jsx|py|go|rs|java|cpp|c|h|css|scss|json|yaml|yml))(?::\d+)?/gi
  ]
  
  for (const pattern of filePatterns) {
    const matches = logs.matchAll(pattern)
    for (const match of matches) {
      if (match[1] && !files.includes(match[1])) {
        files.push(match[1])
      }
    }
  }
  
  return [...new Set(files)].slice(0, 10)
}

export async function analyzeCIFailure(input: CIRunInput): Promise<CIFailureAnalysisResult> {
  if (!genAI) {
    throw new Error('Gemini API not configured')
  }

  await storeCIRun(input)

  const patternInfo = detectErrorPatterns(input.logs)
  const detectedFiles = extractAffectedFiles(input.logs)

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const truncatedLogs = input.logs.slice(-10000)

  const prompt = `You are an expert DevOps engineer analyzing a CI/CD pipeline failure. Provide actionable insights.

Repository: ${input.repoName}
Workflow: ${input.workflowName}
Branch: ${input.branch || 'unknown'}
Commit: ${input.commitSha || 'unknown'}
Status: ${input.status}
Conclusion: ${input.conclusion || 'unknown'}

CI Logs (last 10000 chars):
\`\`\`
${truncatedLogs}
\`\`\`

Detected Pattern Category: ${patternInfo.category}
Detected Files: ${detectedFiles.join(', ') || 'None detected'}

Analyze this CI failure and respond in JSON format:
{
  "error_type": "Specific error type (e.g., 'TypeScript Compilation Error', 'Test Failure', 'Dependency Resolution Error')",
  "root_cause": "Detailed explanation of the root cause",
  "affected_files": ["Array of files that need attention"],
  "suggested_fixes": ["Array of specific, actionable fixes to try"],
  "related_patterns": ["Common patterns this error matches"],
  "ai_confidence": <number 0-1>,
  "is_flaky": <boolean - true if this looks like a flaky test or intermittent issue>,
  "requires_human": <boolean - true if this needs human investigation>
}

Provide practical, copy-paste-ready fixes when possible. Focus on the most likely cause first.`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    const analysisResult: CIFailureAnalysisResult = {
      error_type: parsed.error_type || 'Unknown Error',
      root_cause: parsed.root_cause || 'Unable to determine root cause',
      affected_files: Array.isArray(parsed.affected_files) 
        ? parsed.affected_files 
        : detectedFiles,
      suggested_fixes: Array.isArray(parsed.suggested_fixes) 
        ? parsed.suggested_fixes 
        : [],
      related_prs: [],
      ai_confidence: Math.min(1, Math.max(0, Number(parsed.ai_confidence) || 0.5)),
      severity: patternInfo.severity,
      category: patternInfo.category
    }

    await storeFailureAnalysis(input.runId, analysisResult)

    return analysisResult
  } catch (error) {
    console.error('CI failure analysis failed:', error)
    throw new Error('Failed to analyze CI failure')
  }
}

async function storeCIRun(input: CIRunInput): Promise<string> {
  const supabase = getServiceSupabase()

  const durationSeconds = input.startedAt && input.completedAt
    ? Math.floor((new Date(input.completedAt).getTime() - new Date(input.startedAt).getTime()) / 1000)
    : null

  const { data, error } = await supabase
    .from('ci_runs')
    .upsert({
      run_id: input.runId,
      repo_name: input.repoName,
      workflow_name: input.workflowName,
      branch: input.branch,
      commit_sha: input.commitSha,
      status: input.status,
      conclusion: input.conclusion,
      started_at: input.startedAt,
      completed_at: input.completedAt,
      duration_seconds: durationSeconds,
      logs_url: input.logsUrl,
      html_url: input.htmlUrl
    }, {
      onConflict: 'run_id'
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to store CI run:', error)
    throw new Error('Failed to store CI run in database')
  }

  return data.id
}

async function storeFailureAnalysis(
  runId: string,
  analysis: CIFailureAnalysisResult
): Promise<void> {
  const supabase = getServiceSupabase()

  const { data: ciRun } = await supabase
    .from('ci_runs')
    .select('id')
    .eq('run_id', runId)
    .single()

  if (!ciRun) {
    console.error('CI run not found for analysis storage')
    return
  }

  const { error } = await supabase
    .from('ci_failure_analysis')
    .insert({
      ci_run_id: ciRun.id,
      error_type: analysis.error_type,
      root_cause: analysis.root_cause,
      affected_files: analysis.affected_files,
      suggested_fixes: analysis.suggested_fixes,
      related_prs: analysis.related_prs,
      ai_confidence: analysis.ai_confidence,
      is_resolved: false
    })

  if (error) {
    console.error('Failed to store CI failure analysis:', error)
    throw new Error('Failed to store CI failure analysis in database')
  }
}

export async function getFailureAnalysis(runId: string): Promise<CIFailureAnalysisResult | null> {
  const supabase = getServiceSupabase()

  const { data: ciRun } = await supabase
    .from('ci_runs')
    .select('id')
    .eq('run_id', runId)
    .single()

  if (!ciRun) {
    return null
  }

  const { data, error } = await supabase
    .from('ci_failure_analysis')
    .select('*')
    .eq('ci_run_id', ciRun.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return {
    error_type: data.error_type,
    root_cause: data.root_cause,
    affected_files: data.affected_files || [],
    suggested_fixes: data.suggested_fixes || [],
    related_prs: data.related_prs || [],
    ai_confidence: data.ai_confidence,
    severity: 'medium',
    category: 'unknown'
  }
}

export async function markFailureResolved(
  runId: string,
  resolvedBy: string
): Promise<void> {
  const supabase = getServiceSupabase()

  const { data: ciRun } = await supabase
    .from('ci_runs')
    .select('id')
    .eq('run_id', runId)
    .single()

  if (!ciRun) {
    throw new Error('CI run not found')
  }

  const { error } = await supabase
    .from('ci_failure_analysis')
    .update({
      is_resolved: true,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString()
    })
    .eq('ci_run_id', ciRun.id)

  if (error) {
    console.error('Failed to mark failure as resolved:', error)
    throw new Error('Failed to mark failure as resolved')
  }
}

export async function getRecentFailures(
  repoName: string,
  limit: number = 10
): Promise<Array<{
  runId: string
  workflowName: string
  branch: string
  errorType: string
  rootCause: string
  createdAt: string
}>> {
  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('ci_runs')
    .select(`
      run_id,
      workflow_name,
      branch,
      created_at,
      ci_failure_analysis (
        error_type,
        root_cause
      )
    `)
    .eq('repo_name', repoName)
    .eq('conclusion', 'failure')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    return []
  }

  return data
    .filter(run => run.ci_failure_analysis && run.ci_failure_analysis.length > 0)
    .map(run => ({
      runId: run.run_id,
      workflowName: run.workflow_name,
      branch: run.branch || 'unknown',
      errorType: run.ci_failure_analysis[0]?.error_type || 'Unknown',
      rootCause: run.ci_failure_analysis[0]?.root_cause || 'Unknown',
      createdAt: run.created_at
    }))
}
