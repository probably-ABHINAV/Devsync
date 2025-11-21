import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function generatePRSummary(
  title: string,
  body: string,
  changes: number,
  repoName: string,
): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return `Summary: ${title} - ${changes} files changed`
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `Analyze this GitHub Pull Request and provide a concise 2-3 sentence summary.
    
Title: ${title}
Description: ${body || "No description provided"}
Files Changed: ${changes}
Repository: ${repoName}

Focus on: What changed, why it was changed, and potential impacts.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text() || `Summary: ${title}`
  } catch (error) {
    console.error("[AI] Error generating PR summary:", error)
    return `Summary: ${title}`
  }
}

export async function categorizeIssue(
  title: string,
  body: string,
): Promise<{ category: string; severity: "low" | "medium" | "high" }> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { category: "enhancement", severity: "medium" }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `Categorize this GitHub issue in JSON format only.

Title: ${title}
Body: ${body || "No description"}

Respond ONLY with valid JSON:
{"category":"bug|enhancement|documentation|question","severity":"low|medium|high"}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text() || '{"category":"question","severity":"low"}'
    const parsed = JSON.parse(text)
    return { category: parsed.category || "question", severity: parsed.severity || "low" }
  } catch (error) {
    console.error("[AI] Error categorizing issue:", error)
    return { category: "question", severity: "low" }
  }
}

export async function generateCodeReview(title: string, body: string, filesChanged: string[]): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "Automated code review: Please review for code quality and best practices."
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `As a code reviewer, provide key insights about this PR in 2-3 sentences.

Title: ${title}
Description: ${body}
Files: ${filesChanged.join(", ")}

Focus on: Architecture, performance, testing, and maintainability.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text() || "Please review this pull request for quality and best practices."
  } catch (error) {
    console.error("[AI] Error generating code review:", error)
    return "Code review analysis not available."
  }
}
