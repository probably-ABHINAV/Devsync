import { GoogleGenerativeAI } from '@google/generative-ai'
import { getServiceSupabase } from '../supabase'

const apiKey = process.env.GEMINI_API_KEY || ''

if (!apiKey) {
  console.warn('GEMINI_API_KEY not set - AI release notes generation will be disabled')
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface PRInfo {
  number: number
  title: string
  body: string
  author: string
  labels: string[]
  merged_at: string
}

export interface ReleaseNotesInput {
  repoName: string
  version: string
  prs: PRInfo[]
  previousVersion?: string
  releaseDate?: string
}

export interface ReleaseNotesResult {
  title: string
  summary: string
  features: string[]
  bug_fixes: string[]
  breaking_changes: string[]
  improvements: string[]
  contributors: string[]
  pr_numbers: number[]
  markdown: string
}

export async function generateReleaseNotes(input: ReleaseNotesInput): Promise<ReleaseNotesResult> {
  if (!genAI) {
    throw new Error('Gemini API not configured')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prSummaries = input.prs.map(pr => 
    `- PR #${pr.number}: ${pr.title} (by @${pr.author}) [${pr.labels.join(', ') || 'no labels'}]`
  ).join('\n')

  const prompt = `You are an expert technical writer generating release notes for a software project.

Repository: ${input.repoName}
Version: ${input.version}
${input.previousVersion ? `Previous Version: ${input.previousVersion}` : ''}
Release Date: ${input.releaseDate || new Date().toISOString().split('T')[0]}

Merged Pull Requests since last release:
${prSummaries || 'No PRs found'}

Generate comprehensive release notes and respond in JSON format:
{
  "title": "Release title (e.g., 'Version ${input.version} - Feature Name')",
  "summary": "2-3 sentence executive summary of this release",
  "features": ["Array of new features with brief descriptions"],
  "bug_fixes": ["Array of bug fixes with brief descriptions"],
  "breaking_changes": ["Array of breaking changes with migration notes, or empty if none"],
  "improvements": ["Array of improvements, optimizations, refactors"],
  "highlights": ["Top 3 most important changes in this release"]
}

Guidelines:
- Group related changes together
- Write clear, user-friendly descriptions
- For breaking changes, include migration guidance
- Highlight security fixes if any
- Be concise but informative
- Use present tense (e.g., "Adds support for..." not "Added support for...")`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    const contributors = [...new Set(input.prs.map(pr => pr.author))]
    const prNumbers = input.prs.map(pr => pr.number)

    const releaseNotesResult: ReleaseNotesResult = {
      title: parsed.title || `${input.repoName} ${input.version}`,
      summary: parsed.summary || 'Release notes generated.',
      features: Array.isArray(parsed.features) ? parsed.features : [],
      bug_fixes: Array.isArray(parsed.bug_fixes) ? parsed.bug_fixes : [],
      breaking_changes: Array.isArray(parsed.breaking_changes) ? parsed.breaking_changes : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      contributors: contributors,
      pr_numbers: prNumbers,
      markdown: ''
    }

    releaseNotesResult.markdown = formatReleaseNotesMarkdown(releaseNotesResult, input)

    await storeReleaseNotes(input.repoName, input.version, releaseNotesResult)

    return releaseNotesResult
  } catch (error) {
    console.error('Release notes generation failed:', error)
    throw new Error('Failed to generate release notes')
  }
}

function formatReleaseNotesMarkdown(notes: ReleaseNotesResult, input: ReleaseNotesInput): string {
  const lines: string[] = []

  lines.push(`# ${notes.title}`)
  lines.push('')
  lines.push(`**Release Date:** ${input.releaseDate || new Date().toISOString().split('T')[0]}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(notes.summary)
  lines.push('')

  if (notes.breaking_changes.length > 0) {
    lines.push('## ⚠️ Breaking Changes')
    lines.push('')
    notes.breaking_changes.forEach(change => {
      lines.push(`- ${change}`)
    })
    lines.push('')
  }

  if (notes.features.length > 0) {
    lines.push('## ✨ New Features')
    lines.push('')
    notes.features.forEach(feature => {
      lines.push(`- ${feature}`)
    })
    lines.push('')
  }

  if (notes.bug_fixes.length > 0) {
    lines.push('## 🐛 Bug Fixes')
    lines.push('')
    notes.bug_fixes.forEach(fix => {
      lines.push(`- ${fix}`)
    })
    lines.push('')
  }

  if (notes.improvements.length > 0) {
    lines.push('## 🔧 Improvements')
    lines.push('')
    notes.improvements.forEach(improvement => {
      lines.push(`- ${improvement}`)
    })
    lines.push('')
  }

  if (notes.contributors.length > 0) {
    lines.push('## 👥 Contributors')
    lines.push('')
    lines.push(`Thanks to our contributors: ${notes.contributors.map(c => `@${c}`).join(', ')}`)
    lines.push('')
  }

  if (notes.pr_numbers.length > 0) {
    lines.push('## 📝 Pull Requests')
    lines.push('')
    lines.push(`This release includes ${notes.pr_numbers.length} merged pull requests: ${notes.pr_numbers.map(n => `#${n}`).join(', ')}`)
    lines.push('')
  }

  lines.push('---')
  lines.push(`*Generated by OpsCord AI on ${new Date().toISOString()}*`)

  return lines.join('\n')
}

async function storeReleaseNotes(
  repoName: string,
  version: string,
  notes: ReleaseNotesResult
): Promise<void> {
  const supabase = getServiceSupabase()

  const { error } = await supabase
    .from('release_notes')
    .upsert({
      repo_name: repoName,
      version: version,
      release_date: new Date().toISOString(),
      title: notes.title,
      summary: notes.summary,
      features: notes.features,
      bug_fixes: notes.bug_fixes,
      breaking_changes: notes.breaking_changes,
      improvements: notes.improvements,
      contributors: notes.contributors,
      pr_numbers: notes.pr_numbers,
      generated_by: 'ai',
      is_published: false,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'repo_name,version'
    })

  if (error) {
    console.error('Failed to store release notes:', error)
    throw new Error('Failed to store release notes in database')
  }
}

export async function getReleaseNotes(
  repoName: string,
  version: string
): Promise<ReleaseNotesResult | null> {
  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('release_notes')
    .select('*')
    .eq('repo_name', repoName)
    .eq('version', version)
    .single()

  if (error || !data) {
    return null
  }

  const result: ReleaseNotesResult = {
    title: data.title,
    summary: data.summary,
    features: data.features || [],
    bug_fixes: data.bug_fixes || [],
    breaking_changes: data.breaking_changes || [],
    improvements: data.improvements || [],
    contributors: data.contributors || [],
    pr_numbers: data.pr_numbers || [],
    markdown: ''
  }

  result.markdown = formatReleaseNotesMarkdown(result, {
    repoName,
    version,
    prs: [],
    releaseDate: data.release_date
  })

  return result
}

export async function getLatestReleaseNotes(repoName: string): Promise<ReleaseNotesResult | null> {
  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('release_notes')
    .select('*')
    .eq('repo_name', repoName)
    .order('release_date', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  const result: ReleaseNotesResult = {
    title: data.title,
    summary: data.summary,
    features: data.features || [],
    bug_fixes: data.bug_fixes || [],
    breaking_changes: data.breaking_changes || [],
    improvements: data.improvements || [],
    contributors: data.contributors || [],
    pr_numbers: data.pr_numbers || [],
    markdown: ''
  }

  result.markdown = formatReleaseNotesMarkdown(result, {
    repoName,
    version: data.version,
    prs: [],
    releaseDate: data.release_date
  })

  return result
}

export async function publishReleaseNotes(
  repoName: string,
  version: string,
  discordMessageId?: string
): Promise<void> {
  const supabase = getServiceSupabase()

  const updateData: Record<string, unknown> = {
    is_published: true,
    updated_at: new Date().toISOString()
  }

  if (discordMessageId) {
    updateData.discord_message_id = discordMessageId
  }

  const { error } = await supabase
    .from('release_notes')
    .update(updateData)
    .eq('repo_name', repoName)
    .eq('version', version)

  if (error) {
    console.error('Failed to publish release notes:', error)
    throw new Error('Failed to publish release notes')
  }
}
