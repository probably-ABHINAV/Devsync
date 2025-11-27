import { GoogleGenerativeAI } from '@google/generative-ai'
import { getServiceSupabase } from '../supabase'

const apiKey = process.env.GEMINI_API_KEY || ''

if (!apiKey) {
  console.warn('GEMINI_API_KEY not set - AI issue classification will be disabled')
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export type IssueType = 'bug' | 'feature' | 'documentation' | 'question' | 'enhancement' | 'other'
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'trivial'

export interface IssueClassificationInput {
  issueNumber: number
  repoName: string
  title: string
  body: string
  labels: string[]
  author?: string
}

export interface IssueClassificationResult {
  issue_type: IssueType
  severity: IssueSeverity
  severity_score: number
  suggested_labels: string[]
  suggested_assignees: string[]
  is_duplicate: boolean
  duplicate_of_issue: number | null
  ai_confidence: number
  ai_reasoning: string
}

const ASSIGNEE_PATTERNS: Record<string, string[]> = {
  'bug': ['maintainer', 'debugger'],
  'feature': ['feature-lead', 'product'],
  'documentation': ['docs-team', 'tech-writer'],
  'security': ['security-team'],
  'performance': ['perf-team'],
  'database': ['db-admin'],
  'frontend': ['frontend-team'],
  'backend': ['backend-team'],
  'api': ['api-team'],
  'ci': ['devops', 'ci-team'],
  'test': ['qa-team']
}

function inferAssignees(issueType: IssueType, title: string, body: string): string[] {
  const content = `${title} ${body}`.toLowerCase()
  const suggestedAssignees: string[] = []

  for (const [pattern, assignees] of Object.entries(ASSIGNEE_PATTERNS)) {
    if (content.includes(pattern)) {
      suggestedAssignees.push(...assignees)
    }
  }

  if (ASSIGNEE_PATTERNS[issueType]) {
    suggestedAssignees.push(...ASSIGNEE_PATTERNS[issueType])
  }

  return [...new Set(suggestedAssignees)].slice(0, 5)
}

export async function classifyIssue(input: IssueClassificationInput): Promise<IssueClassificationResult> {
  if (!genAI) {
    throw new Error('Gemini API not configured')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are an expert at analyzing and classifying GitHub issues. Analyze the following issue and provide a detailed classification.

Issue Title: ${input.title}
Issue Body: ${input.body || 'No description provided'}
Current Labels: ${input.labels.length > 0 ? input.labels.join(', ') : 'None'}
Author: ${input.author || 'Unknown'}

Analyze this issue and respond in JSON format with:
{
  "issue_type": "bug|feature|documentation|question|enhancement|other",
  "severity": "critical|high|medium|low|trivial",
  "severity_score": <number 0-100>,
  "suggested_labels": ["array", "of", "relevant", "labels"],
  "is_duplicate": <boolean>,
  "duplicate_hint": "<if duplicate, brief explanation of what it might duplicate>",
  "ai_confidence": <number 0-1>,
  "ai_reasoning": "Brief explanation of the classification decision"
}

Classification Guidelines:
- issue_type:
  - "bug": Something isn't working as expected, errors, crashes
  - "feature": New functionality request
  - "documentation": Documentation updates, clarifications
  - "question": User needs help or clarification
  - "enhancement": Improvement to existing functionality
  - "other": Doesn't fit other categories

- severity (for bugs):
  - "critical": System down, data loss, security vulnerability, affects all users
  - "high": Major functionality broken, no workaround, affects many users
  - "medium": Important issue with workaround available
  - "low": Minor issue, cosmetic, affects few users
  - "trivial": Very minor, nice-to-have fix

- severity_score: 0-100 where 100 is most severe

- suggested_labels: Include labels like priority, component, type that would help organize this issue

Be accurate and provide clear reasoning.`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    const validIssueTypes: IssueType[] = ['bug', 'feature', 'documentation', 'question', 'enhancement', 'other']
    const validSeverities: IssueSeverity[] = ['critical', 'high', 'medium', 'low', 'trivial']

    const issueType: IssueType = validIssueTypes.includes(parsed.issue_type) 
      ? parsed.issue_type 
      : 'other'

    const severity: IssueSeverity = validSeverities.includes(parsed.severity) 
      ? parsed.severity 
      : 'medium'

    const severityScore = Math.min(100, Math.max(0, Number(parsed.severity_score) || 50))
    const aiConfidence = Math.min(1, Math.max(0, Number(parsed.ai_confidence) || 0.5))

    const suggestedAssignees = inferAssignees(issueType, input.title, input.body)

    const classificationResult: IssueClassificationResult = {
      issue_type: issueType,
      severity: severity,
      severity_score: severityScore,
      suggested_labels: Array.isArray(parsed.suggested_labels) ? parsed.suggested_labels : [],
      suggested_assignees: suggestedAssignees,
      is_duplicate: Boolean(parsed.is_duplicate),
      duplicate_of_issue: null,
      ai_confidence: aiConfidence,
      ai_reasoning: parsed.ai_reasoning || 'Classification completed'
    }

    await storeClassification(input.issueNumber, input.repoName, classificationResult)

    return classificationResult
  } catch (error) {
    console.error('Issue classification failed:', error)
    throw new Error('Failed to classify issue')
  }
}

async function storeClassification(
  issueNumber: number,
  repoName: string,
  classification: IssueClassificationResult
): Promise<void> {
  const supabase = getServiceSupabase()

  const { error } = await supabase
    .from('issue_classifications')
    .upsert({
      issue_number: issueNumber,
      repo_name: repoName,
      issue_type: classification.issue_type,
      severity: classification.severity,
      severity_score: classification.severity_score,
      suggested_labels: classification.suggested_labels,
      suggested_assignees: classification.suggested_assignees,
      is_duplicate: classification.is_duplicate,
      duplicate_of_issue: classification.duplicate_of_issue,
      ai_confidence: classification.ai_confidence,
      ai_reasoning: classification.ai_reasoning,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'repo_name,issue_number'
    })

  if (error) {
    console.error('Failed to store issue classification:', error)
    throw new Error('Failed to store classification in database')
  }
}

export async function getClassification(
  repoName: string,
  issueNumber: number
): Promise<IssueClassificationResult | null> {
  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('issue_classifications')
    .select('*')
    .eq('repo_name', repoName)
    .eq('issue_number', issueNumber)
    .single()

  if (error || !data) {
    return null
  }

  return {
    issue_type: data.issue_type,
    severity: data.severity,
    severity_score: data.severity_score,
    suggested_labels: data.suggested_labels || [],
    suggested_assignees: data.suggested_assignees || [],
    is_duplicate: data.is_duplicate,
    duplicate_of_issue: data.duplicate_of_issue,
    ai_confidence: data.ai_confidence,
    ai_reasoning: data.ai_reasoning
  }
}

export async function batchClassifyIssues(
  issues: IssueClassificationInput[]
): Promise<Map<number, IssueClassificationResult>> {
  const results = new Map<number, IssueClassificationResult>()

  for (const issue of issues) {
    try {
      const classification = await classifyIssue(issue)
      results.set(issue.issueNumber, classification)
    } catch (error) {
      console.error(`Failed to classify issue #${issue.issueNumber}:`, error)
    }
  }

  return results
}
