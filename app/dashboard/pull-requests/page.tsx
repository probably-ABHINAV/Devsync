"use client"

import { useSession } from "next-auth/react"
import useSWR from "swr"
import { GitPullRequest, Loader2 } from "lucide-react"
import { useState } from "react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function PullRequestsPage() {
  const { data: session } = useSession()
  const { data: prs, isLoading } = useSWR(session ? "/api/pull-requests" : null, fetcher)
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null)

  const handleGenerateSummary = async (pr: any) => {
    setGeneratingSummary(pr.id)
    try {
      const response = await fetch("/api/ai/summarize-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prId: pr.id,
          title: pr.title,
          body: pr.body,
          repoName: pr.repository.name,
        }),
      })
      const data = await response.json()
      // Optionally refetch data to show updated summary
      window.location.reload()
    } catch (error) {
      console.error("Failed to generate summary:", error)
    } finally {
      setGeneratingSummary(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pull Requests</h1>
        <p className="text-muted-foreground mt-2">Monitor and summarize your pull requests with AI</p>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading pull requests...
          </div>
        ) : prs && prs.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {prs.map((pr: any) => (
              <div key={pr.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <GitPullRequest className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        #{pr.number}: {pr.title}
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">
                        by {pr.author} in {pr.repository.name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      pr.state === "open"
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {pr.state}
                  </span>
                </div>

                {pr.summary && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">AI Summary</p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">{pr.summary}</p>
                  </div>
                )}

                {!pr.summary && (
                  <button
                    onClick={() => handleGenerateSummary(pr)}
                    disabled={generatingSummary === pr.id}
                    className="mt-3 flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {generatingSummary === pr.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>Generate Summary</>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <GitPullRequest className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No pull requests found</p>
          </div>
        )}
      </div>
    </div>
  )
}
