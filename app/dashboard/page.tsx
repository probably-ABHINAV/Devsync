"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { GitBranch, AlertCircle, CheckCircle2 } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { data: repos } = useSWR(session ? "/api/repositories" : null, fetcher)
  const { data: prs } = useSWR(session ? "/api/pull-requests" : null, fetcher)

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {session.user?.name}!</h1>
        <p className="text-muted-foreground mt-2">Monitor your repositories and integrations</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Repositories</p>
              <p className="text-3xl font-bold">{repos?.length || 0}</p>
            </div>
            <GitBranch className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open PRs</p>
              <p className="text-3xl font-bold">{prs?.filter((p: any) => p.state === "open").length || 0}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Integrations</p>
              <p className="text-3xl font-bold">2</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Repositories List */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Your Repositories</h2>
        <div className="space-y-3">
          {repos && repos.length > 0 ? (
            repos.map((repo: any) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded"
              >
                <div>
                  <p className="font-semibold">{repo.name}</p>
                  <p className="text-sm text-muted-foreground">{repo.fullName}</p>
                </div>
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  View
                </a>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No repositories connected yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
