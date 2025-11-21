"use client"

import { useSession } from "next-auth/react"
import useSWR from "swr"
import { AlertCircle, Loader2 } from "lucide-react"
import { useState } from "react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function IssuesPage() {
  const { data: session } = useSession()
  const { data: issues, isLoading } = useSWR(session ? "/api/issues" : null, fetcher)
  const [categorizingIssue, setCategorizingIssue] = useState<string | null>(null)

  const handleCategorizeIssue = async (issue: any) => {
    setCategorizingIssue(issue.id)
    try {
      const response = await fetch("/api/ai/categorize-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId: issue.id,
          title: issue.title,
          body: issue.body,
        }),
      })
      // Refetch to show updated category
      window.location.reload()
    } catch (error) {
      console.error("Failed to categorize issue:", error)
    } finally {
      setCategorizingIssue(null)
    }
  }

  const severityColor = {
    low: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
    medium: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
    high: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Issues</h1>
        <p className="text-muted-foreground mt-2">Track and categorize your GitHub issues with AI</p>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading issues...
          </div>
        ) : issues && issues.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {issues.map((issue: any) => (
              <div key={issue.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-1" />
                    <div>
                      <a
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        #{issue.number}: {issue.title}
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">by {issue.author}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {issue.severity && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${severityColor[issue.severity as keyof typeof severityColor]}`}
                      >
                        {issue.severity}
                      </span>
                    )}
                  </div>
                </div>

                {issue.category && (
                  <div className="mb-3">
                    <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold">
                      {issue.category}
                    </span>
                  </div>
                )}

                {!issue.category && (
                  <button
                    onClick={() => handleCategorizeIssue(issue)}
                    disabled={categorizingIssue === issue.id}
                    className="mt-3 flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {categorizingIssue === issue.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Categorizing...
                      </>
                    ) : (
                      <>Categorize Issue</>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No issues found</p>
          </div>
        )}
      </div>
    </div>
  )
}
