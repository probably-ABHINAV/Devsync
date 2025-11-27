import { GoogleGenerativeAI } from '@google/generative-ai'

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return null
  }
  return new GoogleGenerativeAI(apiKey)
}

export interface PRSummary {
  summary: string
  keyChanges: string[]
  risks: string[]
  recommendations: string[]
  complexity: 'low' | 'medium' | 'high'
}

export async function summarizePR(
  prTitle: string,
  prDescription: string,
  diff: string,
  filesChanged: number
): Promise<PRSummary> {
  const genAI = getGenAI()
  if (!genAI) {
    throw new Error('Gemini API not configured - please add GEMINI_API_KEY')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are an expert code reviewer analyzing a GitHub pull request. Provide a comprehensive yet concise analysis.

PR Title: ${prTitle}
PR Description: ${prDescription || 'No description provided'}
Files Changed: ${filesChanged}

Code Diff (truncated to first 5000 chars):
\`\`\`
${diff.slice(0, 5000)}
\`\`\`

Analyze this PR and respond in JSON format with:
{
  "summary": "A 2-3 sentence overview of what this PR does",
  "keyChanges": ["Array of 3-5 most important changes"],
  "risks": ["Array of potential risks or concerns, or empty array if none"],
  "recommendations": ["Array of suggestions for improvement, or empty array if none"],
  "complexity": "low|medium|high"
}

Be concise and actionable. Focus on what matters most to reviewers.`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }
    
    const parsed = JSON.parse(jsonMatch[0])
    
    return {
      summary: parsed.summary || 'Summary not available',
      keyChanges: parsed.keyChanges || [],
      risks: parsed.risks || [],
      recommendations: parsed.recommendations || [],
      complexity: parsed.complexity || 'medium'
    }
  } catch (error) {
    console.error('AI summarization failed:', error)
    throw new Error('Failed to generate AI summary')
  }
}

export async function generateIssueFromDiscord(description: string): Promise<{
  title: string
  body: string
  labels: string[]
}> {
  const genAI = getGenAI()
  if (!genAI) {
    throw new Error('Gemini API not configured - please add GEMINI_API_KEY')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Convert this Discord message into a well-formatted GitHub issue.

Message: ${description}

Respond in JSON format:
{
  "title": "Clear, concise issue title (max 60 chars)",
  "body": "Detailed issue description with context",
  "labels": ["Array of relevant labels like bug, enhancement, documentation, etc."]
}

Make the title action-oriented and the body clear and structured.`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response')
    }
    
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error('Issue generation failed:', error)
    throw new Error('Failed to generate issue')
  }
}
