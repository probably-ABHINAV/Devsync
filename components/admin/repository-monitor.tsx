"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  RefreshCw,
  GitPullRequest,
  GitCommit,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  GitBranch,
  Activity,
  Zap,
} from "lucide-react"

interface PRStatistics {
  total_open: number
  total_merged_week: number
  avg_time_to_merge_hours: number
  avg_review_time_hours: number
}

interface ContributorMetric {
  username: string
  avatar_url: string
  commits: number
  prs_opened: number
  prs_merged: number
  reviews: number
}

interface CIMetric {
  workflow: string
  total_runs: number
  success_rate: number
  avg_duration_seconds: number
}

interface ActivityData {
  date: string
  commits: number
  prs: number
  issues: number
}

interface RepoMonitorData {
  pr_statistics: PRStatistics
  contributor_metrics: ContributorMetric[]
  ci_metrics: CIMetric[]
  activity_data: ActivityData[]
  repo_breakdown: Array<{ name: string; activity: number }>
}

const chartConfig = {
  commits: {
    label: "Commits",
    color: "hsl(var(--primary))",
  },
  prs: {
    label: "Pull Requests",
    color: "hsl(var(--accent))",
  },
  issues: {
    label: "Issues",
    color: "hsl(142 76% 36%)",
  },
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#8b5cf6"]

export default function RepositoryMonitor() {
  const [data, setData] = useState<RepoMonitorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const response = await fetch("/api/admin/system-health?type=repos")
      if (response.ok) {
        const result = await response.json()
        setData(result.repo_data || getMockData())
      } else {
        setData(getMockData())
      }
    } catch (error) {
      console.error("Failed to fetch repository data:", error)
      setData(getMockData())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getMockData = (): RepoMonitorData => ({
    pr_statistics: {
      total_open: 12,
      total_merged_week: 28,
      avg_time_to_merge_hours: 24.5,
      avg_review_time_hours: 4.2,
    },
    contributor_metrics: [
      { username: "dev1", avatar_url: "/placeholder-user.jpg", commits: 45, prs_opened: 12, prs_merged: 10, reviews: 25 },
      { username: "dev2", avatar_url: "/placeholder-user.jpg", commits: 32, prs_opened: 8, prs_merged: 7, reviews: 18 },
      { username: "dev3", avatar_url: "/placeholder-user.jpg", commits: 28, prs_opened: 6, prs_merged: 5, reviews: 15 },
    ],
    ci_metrics: [
      { workflow: "Build & Test", total_runs: 156, success_rate: 94.2, avg_duration_seconds: 180 },
      { workflow: "Deploy", total_runs: 45, success_rate: 97.8, avg_duration_seconds: 120 },
      { workflow: "Lint", total_runs: 156, success_rate: 88.5, avg_duration_seconds: 45 },
    ],
    activity_data: [
      { date: "Mon", commits: 12, prs: 3, issues: 2 },
      { date: "Tue", commits: 18, prs: 5, issues: 1 },
      { date: "Wed", commits: 15, prs: 4, issues: 3 },
      { date: "Thu", commits: 22, prs: 6, issues: 2 },
      { date: "Fri", commits: 20, prs: 4, issues: 4 },
      { date: "Sat", commits: 8, prs: 1, issues: 0 },
      { date: "Sun", commits: 5, prs: 1, issues: 1 },
    ],
    repo_breakdown: [
      { name: "main-app", activity: 45 },
      { name: "api-service", activity: 30 },
      { name: "web-client", activity: 15 },
      { name: "docs", activity: 10 },
    ],
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="border-border/30 bg-card/40">
        <CardContent className="py-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Failed to load repository data</p>
          <Button onClick={() => fetchData()} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Repository Monitoring</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-border/30 bg-gradient-to-br from-card/50 to-background/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open PRs</p>
                <p className="text-3xl font-bold text-foreground">{data.pr_statistics.total_open}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10">
                <GitPullRequest className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-gradient-to-br from-card/50 to-background/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Merged This Week</p>
                <p className="text-3xl font-bold text-foreground">{data.pr_statistics.total_merged_week}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-gradient-to-br from-card/50 to-background/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Time to Merge</p>
                <p className="text-3xl font-bold text-foreground">{data.pr_statistics.avg_time_to_merge_hours.toFixed(1)}h</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-gradient-to-br from-card/50 to-background/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Review Time</p>
                <p className="text-3xl font-bold text-foreground">{data.pr_statistics.avg_review_time_hours.toFixed(1)}h</p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/10">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/30 bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Weekly Activity
            </CardTitle>
            <CardDescription>Commits, PRs, and issues over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <AreaChart data={data.activity_data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="prs"
                  stackId="1"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="issues"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              Repository Breakdown
            </CardTitle>
            <CardDescription>Activity distribution across repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <PieChart>
                <Pie
                  data={data.repo_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="activity"
                  nameKey="name"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {data.repo_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/30 bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            CI/CD Success Rates
          </CardTitle>
          <CardDescription>Pipeline performance and success metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.ci_metrics.map((ci, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{ci.workflow}</span>
                    <Badge variant="secondary" className="text-xs">
                      {ci.total_runs} runs
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Avg: {(ci.avg_duration_seconds / 60).toFixed(1)}m
                    </span>
                    <Badge
                      className={
                        ci.success_rate >= 95
                          ? "bg-green-500/20 text-green-600 border-green-500/50"
                          : ci.success_rate >= 85
                          ? "bg-amber-500/20 text-amber-600 border-amber-500/50"
                          : "bg-red-500/20 text-red-600 border-red-500/50"
                      }
                    >
                      {ci.success_rate.toFixed(1)}% success
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={ci.success_rate}
                  className={`h-2 ${
                    ci.success_rate >= 95
                      ? "[&>div]:bg-green-500"
                      : ci.success_rate >= 85
                      ? "[&>div]:bg-amber-500"
                      : "[&>div]:bg-red-500"
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/30 bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Top Contributors
          </CardTitle>
          <CardDescription>Most active contributors this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.contributor_metrics.map((contributor, index) => (
              <motion.div
                key={contributor.username}
                className="p-4 rounded-lg border border-border/30 bg-background/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.username}
                    className="w-10 h-10 rounded-full border border-border/50"
                  />
                  <div>
                    <p className="font-medium text-foreground">{contributor.username}</p>
                    <p className="text-xs text-muted-foreground">Contributor</p>
                  </div>
                  {index === 0 && (
                    <Badge className="ml-auto bg-amber-500/20 text-amber-600 border-amber-500/50">
                      #1
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Commits:</span>
                    <span className="font-medium text-foreground">{contributor.commits}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">PRs:</span>
                    <span className="font-medium text-foreground">{contributor.prs_opened}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Merged:</span>
                    <span className="font-medium text-foreground">{contributor.prs_merged}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Reviews:</span>
                    <span className="font-medium text-foreground">{contributor.reviews}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
