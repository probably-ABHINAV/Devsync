import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

export interface PRSummary {
  summary: string;
  keyChanges: string[];
  risks: string[];
  recommendations: string[];
  complexity: "low" | "medium" | "high";
}

export async function summarizePR(
  prTitle: string,
  prDescription: string,
  diff: string,
  filesChanged: number
): Promise<PRSummary> {
  const genAI = getGenAI();
  if (!genAI) {
    throw new Error("Gemini API not configured - please add GEMINI_API_KEY");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert code reviewer analyzing a GitHub pull request. Provide a comprehensive yet concise analysis.

PR Title: ${prTitle}
PR Description: ${prDescription || "No description provided"}
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

Be concise and actionable. Focus on what matters most to reviewers.`;

  try {
    console.log("🤖 Calling Gemini API for PR summary...");
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log("✅ Received Gemini response, parsing...");

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(
        "❌ No JSON found in response:",
        response.substring(0, 200)
      );
      throw new Error("Failed to parse AI response - no JSON found");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log("✅ Successfully parsed AI response");

    return {
      summary: parsed.summary || "Summary not available",
      keyChanges: parsed.keyChanges || [],
      risks: parsed.risks || [],
      recommendations: parsed.recommendations || [],
      complexity: parsed.complexity || "medium",
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ AI summarization failed: ${errorMsg}`);
    throw error;
  }
}

export async function generateIssueFromDiscord(description: string): Promise<{
  title: string;
  body: string;
  labels: string[];
}> {
  const genAI = getGenAI();
  if (!genAI) {
    throw new Error("Gemini API not configured - please add GEMINI_API_KEY");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Convert this Discord message into a well-formatted GitHub issue.

Message: ${description}

Respond in JSON format:
{
  "title": "Clear, concise issue title (max 60 chars)",
  "body": "Detailed issue description with context",
  "labels": ["Array of relevant labels like bug, enhancement, documentation, etc."]
}

Make the title action-oriented and the body clear and structured.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Issue generation failed:", error);
    throw new Error("Failed to generate issue");
  }
}

export interface DeploymentSummary {
  summary: string;
  highlights: string[];
  potentialIssues: string[];
  recommendations: string[];
  impactLevel: "low" | "medium" | "high";
}

export interface VercelDeploymentInfo {
  projectName: string;
  environment: string;
  status: "succeeded" | "failed" | "canceled";
  url?: string;
  branch?: string;
  commitMessage?: string;
  commitSha?: string;
  errorMessage?: string;
  buildLogs?: string;
  duration?: number;
}

export async function generateDeploymentSummary(
  deployment: VercelDeploymentInfo
): Promise<DeploymentSummary> {
  const genAI = getGenAI();
  if (!genAI) {
    console.warn("⚠️ Gemini API not configured - returning basic summary");
    return {
      summary:
        deployment.status === "succeeded"
          ? `Deployment to ${deployment.environment} completed successfully.`
          : `Deployment to ${deployment.environment} failed.`,
      highlights: deployment.commitMessage ? [deployment.commitMessage] : [],
      potentialIssues: deployment.errorMessage ? [deployment.errorMessage] : [],
      recommendations: [],
      impactLevel: deployment.environment === "production" ? "high" : "medium",
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const statusContext =
    deployment.status === "succeeded"
      ? "successful deployment"
      : deployment.status === "failed"
      ? "failed deployment"
      : "canceled deployment";

  const prompt = `You are a DevOps expert analyzing a Vercel ${statusContext}. Provide a concise, actionable summary.

Project: ${deployment.projectName}
Environment: ${deployment.environment}
Status: ${deployment.status}
Branch: ${deployment.branch || "unknown"}
Commit: ${deployment.commitSha?.substring(0, 7) || "unknown"}
Commit Message: ${deployment.commitMessage || "No message"}
Duration: ${
    deployment.duration
      ? `${Math.round(deployment.duration / 1000)}s`
      : "unknown"
  }
${deployment.url ? `URL: ${deployment.url}` : ""}
${deployment.errorMessage ? `Error: ${deployment.errorMessage}` : ""}
${
  deployment.buildLogs
    ? `Build Logs (last 3000 chars):\n\`\`\`\n${deployment.buildLogs.slice(
        -3000
      )}\n\`\`\``
    : ""
}

Analyze this deployment and respond in JSON format:
{
  "summary": "A 1-2 sentence overview of what happened and its impact",
  "highlights": ["Array of 2-3 key points about this deployment"],
  "potentialIssues": ["Array of any concerns or issues detected, empty if none"],
  "recommendations": ["Array of actionable next steps, empty if none needed"],
  "impactLevel": "low|medium|high"
}

${
  deployment.status === "failed"
    ? "Focus on identifying the root cause and providing specific fix recommendations."
    : "Keep it brief and highlight what was deployed."
}
Be concise and actionable. Limit each array to 3 items max.`;

  try {
    console.log("🤖 Calling Gemini API for deployment summary...");
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log("✅ Received Gemini response for deployment, parsing...");

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(
        "❌ No JSON found in deployment response:",
        response.substring(0, 200)
      );
      throw new Error("Failed to parse AI response - no JSON found");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log("✅ Successfully parsed deployment AI response");

    return {
      summary: parsed.summary || "Summary not available",
      highlights: Array.isArray(parsed.highlights)
        ? parsed.highlights.slice(0, 3)
        : [],
      potentialIssues: Array.isArray(parsed.potentialIssues)
        ? parsed.potentialIssues.slice(0, 3)
        : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.slice(0, 3)
        : [],
      impactLevel: ["low", "medium", "high"].includes(parsed.impactLevel)
        ? parsed.impactLevel
        : "medium",
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Deployment AI summarization failed: ${errorMsg}`);

    return {
      summary:
        deployment.status === "succeeded"
          ? `Deployment to ${deployment.environment} completed successfully.`
          : `Deployment to ${deployment.environment} failed: ${
              deployment.errorMessage || "Unknown error"
            }`,
      highlights: deployment.commitMessage ? [deployment.commitMessage] : [],
      potentialIssues: deployment.errorMessage ? [deployment.errorMessage] : [],
      recommendations:
        deployment.status === "failed"
          ? ["Check build logs for details", "Verify environment variables"]
          : [],
      impactLevel: deployment.environment === "production" ? "high" : "medium",
    };
  }
}
