"use client"

import { useSession } from "next-auth/react"
import useSWR from "swr"
import { TrendingUp, Activity, GitBranch, AlertCircle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const { data: repos } = useSWR(session ? "/api/repositories" : null, fetcher)
  const { data: prs } = useSWR(session ? "/api/pull-requests" : null, fetcher)
  const { data: issues } = useSWR(session ? "/api/issues" : null, fetcher)

  const stats = [
    {
      title: "Total Repositories",
      value: repos?.length || 0,
      icon: GitBranch,
      color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Open Pull Requests",
      value: prs?.filter((p: any) => p.state === "open").length || 0,
      icon: Activity,
      color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    },
    {
      title: "Open Issues",
      value: issues?.filter((i: any) => i.state === "open").length || 0,
      icon: AlertCircle,
      color: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
    },
    {
      title: "Total Activity",
      value: (repos?.length || 0) + (prs?.length || 0) + (issues?.length || 0),
      icon: TrendingUp,
      color: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">Overview of your GitHub activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Repositories */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">Most Active Repositories</h2>
          <div className="space-y-3">
            {repos?.slice(0, 5).map((repo: any) => (
              <div
                key={repo.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded"
              >
                <div>
                  <p className="font-semibold text-sm">{repo.name}</p>
                  <p className="text-xs text-muted-foreground">{repo._count?.pullRequests || 0} PRs</p>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400 px-2 py-1 rounded">
                  {repo._count?.issues || 0} Issues
                </span>
              </div>
            )) || <p className="text-muted-foreground text-sm">No repositories yet</p>}
          </div>
        </div>

        {/* PR Summary */}
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4">PR Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Open</span>
              <span className="text-2xl font-bold text-green-600">
                {prs?.filter((p: any) => p.state === "open").length || 0}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${((prs?.filter((p: any) => p.state === "open").length || 0) / (prs?.length || 1)) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-sm font-semibold">Merged</span>
              <span className="text-2xl font-bold text-blue-600">
                {prs?.filter((p: any) => p.state === "closed").length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Latest Activity</h2>
        <div className="space-y-4">
          {prs?.slice(0, 5).map((pr: any) => (
            <div
              key={pr.id}
              className="flex items-start gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 last:border-b-0"
            >
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
              <div>
                <p className="font-semibold text-sm">{pr.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(pr.createdAt).toLocaleDateString()} in {pr.repository.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
