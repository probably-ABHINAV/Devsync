"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Spinner } from "@/components/ui/spinner"
import { motion, AnimatePresence } from "framer-motion"
import {
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Webhook,
  Filter,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface WebhookLog {
  id: string
  webhook_id: string
  source: "github" | "discord" | "internal"
  event_type: string
  payload: Record<string, unknown>
  response_status: number | null
  response_body: Record<string, unknown> | null
  processing_time_ms: number | null
  retry_count: number
  status: "pending" | "processing" | "success" | "failed" | "retrying"
  error_message: string | null
  created_at: string
}

interface WebhookLogsData {
  logs: WebhookLog[]
  total: number
  page: number
  per_page: number
}

export default function WebhookLogs() {
  const [data, setData] = useState<WebhookLogsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [retrying, setRetrying] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    source: "all",
    status: "all",
    search: "",
    page: 1,
  })

  useEffect(() => {
    fetchData()
  }, [filters.source, filters.status, filters.page])

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const params = new URLSearchParams()
      if (filters.source !== "all") params.set("source", filters.source)
      if (filters.status !== "all") params.set("status", filters.status)
      if (filters.search) params.set("search", filters.search)
      params.set("page", filters.page.toString())

      const response = await fetch(`/api/admin/webhook-logs?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Failed to fetch webhook logs:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRetry = async (logId: string) => {
    setRetrying(logId)
    try {
      const response = await fetch(`/api/admin/webhook-logs?action=retry&id=${logId}`, {
        method: "POST",
      })
      if (response.ok) {
        await fetchData(true)
      }
    } catch (error) {
      console.error("Failed to retry webhook:", error)
    } finally {
      setRetrying(null)
    }
  }

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const getStatusBadge = (status: WebhookLog["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500/20 text-green-600 border-green-500/50">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Success
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      case "retrying":
        return (
          <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/50">
            <RotateCcw className="w-3 h-3 mr-1" />
            Retrying
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/50">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSourceBadge = (source: WebhookLog["source"]) => {
    switch (source) {
      case "github":
        return <Badge variant="outline" className="border-gray-500/50">GitHub</Badge>
      case "discord":
        return <Badge variant="outline" className="border-indigo-500/50 text-indigo-600">Discord</Badge>
      case "internal":
        return <Badge variant="outline" className="border-primary/50 text-primary">Internal</Badge>
      default:
        return <Badge variant="outline">{source}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Webhook Event Logs</h2>
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

      <Card className="border-border/30 bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by event type or webhook ID..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && fetchData(true)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.source}
              onValueChange={(value) => setFilters({ ...filters, source: value, page: 1 })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="retrying">Retrying</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => fetchData(true)}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/30 bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-primary" />
            Event History
          </CardTitle>
          <CardDescription>
            {data ? `Showing ${data.logs.length} of ${data.total} webhook events` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.logs.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.logs.map((log) => (
                    <Collapsible key={log.id} asChild>
                      <>
                        <TableRow className="cursor-pointer hover:bg-accent/5">
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <button
                                onClick={() => toggleRow(log.id)}
                                className="p-1 hover:bg-accent/10 rounded"
                              >
                                {expandedRows.has(log.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell className="font-medium">{log.event_type}</TableCell>
                          <TableCell>{getSourceBadge(log.source)}</TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell>
                            {log.processing_time_ms !== null ? `${log.processing_time_ms}ms` : "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-right">
                            {log.status === "failed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRetry(log.id)}
                                disabled={retrying === log.id}
                              >
                                {retrying === log.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-4 h-4" />
                                )}
                                <span className="ml-1">Retry</span>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <AnimatePresence>
                            {expandedRows.has(log.id) && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <td colSpan={7} className="bg-accent/5 p-4">
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                          Webhook ID
                                        </p>
                                        <p className="text-sm font-mono text-foreground">
                                          {log.webhook_id}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                          Retry Count
                                        </p>
                                        <p className="text-sm text-foreground">{log.retry_count}</p>
                                      </div>
                                    </div>

                                    {log.error_message && (
                                      <div>
                                        <p className="text-sm font-medium text-destructive mb-1">
                                          Error Message
                                        </p>
                                        <p className="text-sm text-muted-foreground bg-destructive/10 p-2 rounded">
                                          {log.error_message}
                                        </p>
                                      </div>
                                    )}

                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground mb-1">
                                        Request Payload
                                      </p>
                                      <pre className="text-xs bg-background/50 p-3 rounded-lg overflow-x-auto max-h-[200px] overflow-y-auto">
                                        {JSON.stringify(log.payload, null, 2)}
                                      </pre>
                                    </div>

                                    {log.response_body && (
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">
                                          Response Body
                                        </p>
                                        <pre className="text-xs bg-background/50 p-3 rounded-lg overflow-x-auto max-h-[200px] overflow-y-auto">
                                          {JSON.stringify(log.response_body, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))}
                </TableBody>
              </Table>

              {data.total > data.per_page && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">
                    Page {data.page} of {Math.ceil(data.total / data.per_page)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      disabled={filters.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      disabled={filters.page >= Math.ceil(data.total / data.per_page)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No webhook logs found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Webhook events will appear here when they are received
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
