"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Cpu,
  Database,
  Zap,
  TrendingUp,
} from "lucide-react"

interface QueueStats {
  pending: number
  processing: number
  completed: number
  failed: number
  retrying: number
  by_type: Record<string, number>
}

interface ApiMetric {
  endpoint: string
  avg_response_time: number
  request_count: number
  error_rate: number
}

interface WorkerStatus {
  id: string
  name: string
  status: "active" | "idle" | "offline"
  jobs_processed: number
  last_heartbeat: string
}

interface SystemHealthData {
  queue_stats: QueueStats
  api_metrics: ApiMetric[]
  worker_status: WorkerStatus[]
  error_rate_history: Array<{ time: string; rate: number }>
  response_time_history: Array<{ time: string; avg: number }>
}

const chartConfig = {
  rate: {
    label: "Error Rate",
    color: "hsl(var(--destructive))",
  },
  avg: {
    label: "Response Time",
    color: "hsl(var(--primary))",
  },
}

export default function SystemHealth() {
  const [data, setData] = useState<SystemHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const response = await fetch("/api/admin/system-health")
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Failed to fetch system health:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

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
          <p className="text-muted-foreground">Failed to load system health data</p>
          <Button onClick={() => fetchData()} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const totalJobs =
    data.queue_stats.pending +
    data.queue_stats.processing +
    data.queue_stats.completed +
    data.queue_stats.failed +
    data.queue_stats.retrying

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">System Health Overview</h2>
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
                <p className="text-sm text-muted-foreground">Pending Jobs</p>
                <p className="text-3xl font-bold text-foreground">{data.queue_stats.pending}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-gradient-to-br from-card/50 to-background/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-3xl font-bold text-foreground">{data.queue_stats.processing}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-gradient-to-br from-card/50 to-background/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-foreground">{data.queue_stats.completed}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-gradient-to-br from-card/50 to-background/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-3xl font-bold text-foreground">{data.queue_stats.failed}</p>
              </div>
              <div className="p-3 rounded-full bg-red-500/10">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/30 bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              API Response Times
            </CardTitle>
            <CardDescription>Average response time over the last hour</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <AreaChart data={data.response_time_history}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="avg"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Error Rate History
            </CardTitle>
            <CardDescription>Error rate percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={data.error_rate_history}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="rate" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/30 bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Worker Status
          </CardTitle>
          <CardDescription>Background job processor status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.worker_status.map((worker) => (
              <div
                key={worker.id}
                className="p-4 rounded-lg border border-border/30 bg-background/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-foreground">{worker.name}</span>
                  <Badge
                    variant={
                      worker.status === "active"
                        ? "default"
                        : worker.status === "idle"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {worker.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Jobs Processed</span>
                    <span className="text-foreground font-medium">{worker.jobs_processed}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Last Active</span>
                    <span className="text-foreground">{worker.last_heartbeat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/30 bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Jobs by Type
          </CardTitle>
          <CardDescription>Distribution of jobs across different types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.queue_stats.by_type).map(([type, count]) => (
              <div
                key={type}
                className="p-4 rounded-lg border border-border/30 bg-background/50 text-center"
              >
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-sm text-muted-foreground mt-1 capitalize">
                  {type.replace(/_/g, " ")}
                </p>
              </div>
            ))}
            {Object.keys(data.queue_stats.by_type).length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No jobs in queue
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/30 bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            API Metrics
          </CardTitle>
          <CardDescription>Performance metrics for API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.api_metrics.map((metric, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-background/50"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{metric.endpoint}</p>
                  <p className="text-sm text-muted-foreground">{metric.request_count} requests</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-foreground">{metric.avg_response_time}ms</p>
                    <p className="text-xs text-muted-foreground">Avg Response</p>
                  </div>
                  <Badge
                    variant={
                      metric.error_rate > 5
                        ? "destructive"
                        : metric.error_rate > 1
                        ? "secondary"
                        : "default"
                    }
                  >
                    {metric.error_rate.toFixed(2)}% error
                  </Badge>
                </div>
              </div>
            ))}
            {data.api_metrics.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No API metrics available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
