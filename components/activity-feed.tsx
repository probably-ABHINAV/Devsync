"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { GitPullRequest, GitMerge, GitCommit, AlertCircle, CheckCircle, X } from "lucide-react"

interface Activity {
  id: string
  activity_type: string
  repo_name: string
  pr_number?: number
  issue_number?: number
  title: string
  description: string
  metadata: any
  created_at: string
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/analytics/activity?limit=10")
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pr_opened":
        return <GitPullRequest className="w-5 h-5 text-primary" />
      case "pr_merged":
        return <GitMerge className="w-5 h-5 text-green-500" />
      case "pr_reviewed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      case "issue_opened":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case "issue_closed":
        return <X className="w-5 h-5 text-gray-500" />
      default:
        return <GitCommit className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "pr_opened":
        return "border-primary/50"
      case "pr_merged":
        return "border-green-500/50"
      case "pr_reviewed":
        return "border-blue-500/50"
      case "issue_opened":
        return "border-yellow-500/50"
      case "issue_closed":
        return "border-gray-500/50"
      default:
        return "border-border/30"
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Spinner />
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>No recent activity. Start contributing to see your timeline!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className={`p-4 border-l-4 ${getActivityColor(activity.activity_type)} hover:border-primary/50 transition-all`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.activity_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="font-mono">{activity.repo_name}</span>
                      {activity.pr_number && <span>PR #{activity.pr_number}</span>}
                      {activity.issue_number && <span>Issue #{activity.issue_number}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTime(activity.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
