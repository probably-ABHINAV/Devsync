import { GoogleGenerativeAI } from "@google/generative-ai"
import { prisma } from "@/lib/prisma"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

export async function generatePRSummary(
  title: string,
  body: string,
  changes: number,
  owner: string,
  repoName: string,
): Promise<string> {
  try {
    const prompt = `
    Analyze this GitHub Pull Request and provide a concise 2-3 sentence summary.
    
    Title: ${title}
    Description: ${body || "No description provided"}
    Files Changed: ${changes}
    Repository: ${owner}/${repoName}
    
    Provide a summary focused on:
    1. What was changed
    2. Why it was changed
    3. Any potential impacts
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text() || "Could not generate summary"
  } catch (error) {
    console.error("[v0] Error generating PR summary:", error)
    throw error
  }
}

export async function categorizeIssue(
  title: string,
  body: string,
): Promise<{ category: string; severity: "low" | "medium" | "high" }> {
  try {
    const prompt = `
    Categorize this GitHub issue and assign a severity level.
    
    Title: ${title}
    Body: ${body || "No description"}
    
    Respond in JSON format:
    {
      "category": "bug|enhancement|documentation|question|infrastructure",
      "severity": "low|medium|high"
    }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text() || "{}"
    return JSON.parse(text)
  } catch (error) {
    console.error("[v0] Error categorizing issue:", error)
    return { category: "question", severity: "low" }
  }
}

export async function generateDailySummary(repoName: string, days = 1): Promise<string> {
  try {
    const prs = await prisma.pullRequest.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
      include: { repo: true },
    })

    const issues = await prisma.githubIssue.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
    })

    const prompt = `
    Generate a developer standup summary for the past ${days} day(s):
    
    Merged PRs: ${prs.length}
    Open Issues: ${issues.filter((i) => i.state === "open").length}
    Closed Issues: ${issues.filter((i) => i.state === "closed").length}
    
    Recent PRs: ${prs.map((p) => p.title).join(", ")}
    Recent Issues: ${issues.map((i) => i.title).join(", ")}
    
    Provide a 3-4 sentence summary in markdown format highlighting key activities and blockers.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text() || ""
  } catch (error) {
    console.error("[v0] Error generating daily summary:", error)
    throw error
  }
}

export async function generateRepositoryInsights(
  repoId: string,
): Promise<{ health: number; blockers: string[]; recommendations: string[] }> {
  try {
    const repo = await prisma.repo.findUnique({
      where: { id: repoId },
      include: {
        prs: { take: 50 },
        issues: { take: 50 },
      },
    })

    if (!repo) throw new Error("Repository not found")

    const openIssues = repo.issues.filter((i) => i.state === "open").length
    const openPRs = repo.prs.filter((p) => p.state === "open").length
    const closedIssues = repo.issues.filter((i) => i.state === "closed").length

    const health = Math.max(0, 100 - openIssues * 2 - openPRs * 3)

    const blockers: string[] = []
    if (openIssues > 20) blockers.push("High number of open issues")
    if (openPRs > 10) blockers.push("Backlog of open pull requests")

    const recommendations: string[] = []
    if (openIssues > closedIssues) {
      recommendations.push("Focus on closing existing issues before opening new ones")
    }
    if (openPRs > 5) {
      recommendations.push("Review and merge pending pull requests to reduce bottlenecks")
    }

    return {
      health,
      blockers,
      recommendations,
    }
  } catch (error) {
    console.error("[v0] Error generating insights:", error)
    throw error
  }
}
