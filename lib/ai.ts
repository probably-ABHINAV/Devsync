import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"

export async function summarizePullRequest(
  prNumber: number,
  title: string,
  body: string,
  repoName: string,
): Promise<string> {
  try {
    const prompt = `You are an expert code reviewer. Summarize this GitHub pull request concisely in 2-3 sentences, highlighting the key changes and their impact.

Repository: ${repoName}
PR #${prNumber}: ${title}

Description:
${body || "No description provided"}

Provide a clear, professional summary suitable for a development team.`

    const { text } = await generateText({
      model: "google/gemini-1.5-flash",
      prompt,
      maxTokens: 200,
    })

    return text.trim()
  } catch (error) {
    console.error("[AI] Error summarizing PR:", error)
    // Fallback summary
    return `PR #${prNumber}: ${title.substring(0, 80)}...`
  }
}

export async function generateCodeInsight(
  prNumber: number,
  title: string,
  files: string[],
  repoName: string,
): Promise<string> {
  try {
    const prompt = `As a code architect, provide key insights about this pull request:

Repository: ${repoName}
PR #${prNumber}: ${title}

Files changed: ${files.join(", ")}

Provide 2-3 key insights about the changes (performance, architecture, testing considerations, etc.)`

    const { text } = await generateText({
      model: "google/gemini-1.5-flash",
      prompt,
      maxTokens: 300,
    })

    return text.trim()
  } catch (error) {
    console.error("[AI] Error generating code insight:", error)
    return "Unable to generate code insights at this time."
  }
}

export async function processPRSummarizationJob(
  jobId: string,
  repoId: string,
  prNumber: number,
  repoFullName: string,
): Promise<void> {
  const supabase = await createClient()

  try {
    // Fetch PR from database
    const { data: prData, error: prError } = await supabase
      .from("github_pull_requests")
      .select("*")
      .eq("repo_id", repoId)
      .eq("pr_number", prNumber)
      .single()

    if (prError || !prData) {
      throw new Error("PR not found")
    }

    // Generate summary
    const summary = await summarizePullRequest(prNumber, prData.pr_title, prData.pr_body, repoFullName)

    // Update PR with summary
    const { error: updateError } = await supabase
      .from("github_pull_requests")
      .update({
        ai_summary: summary,
        processed_at: new Date().toISOString(),
      })
      .eq("id", repoId)
      .eq("pr_number", prNumber)

    if (updateError) throw updateError

    // Get repo info for Discord notification
    const { data: repoData } = await supabase.from("github_repositories").select("org_id").eq("id", repoId).single()

    if (repoData) {
      // Send Discord notification with summary
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/discord/send-notification`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repoId,
            type: "pr",
            prNumber,
            prTitle: prData.pr_title,
            prAuthor: prData.author_github_username,
            prUrl: prData.url,
            prSummary: summary,
          }),
        })
      } catch (notificationError) {
        console.error("[AI] Failed to send Discord notification:", notificationError)
      }
    }

    // Mark job as completed
    await supabase.from("job_queue").update({ status: "completed" }).eq("id", jobId)
  } catch (error) {
    console.error("[AI] Error processing PR summarization:", error)

    // Mark job as failed
    await supabase
      .from("job_queue")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", jobId)

    throw error
  }
}
