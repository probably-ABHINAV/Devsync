"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { Activity, Webhook, GitBranch } from "lucide-react"
import SystemHealth from "@/components/admin/system-health"
import WebhookLogs from "@/components/admin/webhook-logs"
import RepositoryMonitor from "@/components/admin/repository-monitor"

function AdminDashboardContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "health"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor system health, webhook events, and repository activity
          </p>
        </div>
      </div>

      <Tabs defaultValue={tab} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="health" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">System Health</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="w-4 h-4" />
            <span className="hidden sm:inline">Webhook Logs</span>
          </TabsTrigger>
          <TabsTrigger value="repos" className="gap-2">
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:inline">Repositories</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-6">
          <SystemHealth />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <WebhookLogs />
        </TabsContent>

        <TabsContent value="repos" className="mt-6">
          <RepositoryMonitor />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  )
}
