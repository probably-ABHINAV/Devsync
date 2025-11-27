"use client"

import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { GitPullRequest, GitMerge, GitCommit, AlertCircle, CheckCircle, X, Clock, MessageSquare, Code } from "lucide-react"

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

export interface ActivityFeedRef {
  refresh: () => Promise<void>
}

const ActivityFeed = forwardRef<ActivityFeedRef, {}>((_props, ref) => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useImperativeHandle(ref, () => ({
    refresh: fetchActivities
  }))

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    setLoading(true)
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
        return <GitPullRequest className="w-5 h-5" />
      case "pr_merged":
        return <GitMerge className="w-5 h-5" />
      case "pr_reviewed":
        return <MessageSquare className="w-5 h-5" />
      case "issue_opened":
        return <AlertCircle className="w-5 h-5" />
      case "issue_closed":
        return <CheckCircle className="w-5 h-5" />
      case "commit":
        return <GitCommit className="w-5 h-5" />
      case "code_review":
        return <Code className="w-5 h-5" />
      default:
        return <GitCommit className="w-5 h-5" />
    }
  }

  const getActivityStyles = (type: string) => {
    switch (type) {
      case "pr_opened":
        return {
          iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
          iconColor: "text-white",
          borderColor: "border-purple-500/30",
          glowColor: "from-purple-500/20",
          pulseColor: "bg-purple-500"
        }
      case "pr_merged":
        return {
          iconBg: "bg-gradient-to-br from-green-500 to-emerald-500",
          iconColor: "text-white",
          borderColor: "border-green-500/30",
          glowColor: "from-green-500/20",
          pulseColor: "bg-green-500"
        }
      case "pr_reviewed":
        return {
          iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
          iconColor: "text-white",
          borderColor: "border-blue-500/30",
          glowColor: "from-blue-500/20",
          pulseColor: "bg-blue-500"
        }
      case "issue_opened":
        return {
          iconBg: "bg-gradient-to-br from-yellow-500 to-orange-500",
          iconColor: "text-white",
          borderColor: "border-yellow-500/30",
          glowColor: "from-yellow-500/20",
          pulseColor: "bg-yellow-500"
        }
      case "issue_closed":
        return {
          iconBg: "bg-gradient-to-br from-gray-500 to-slate-500",
          iconColor: "text-white",
          borderColor: "border-gray-500/30",
          glowColor: "from-gray-500/20",
          pulseColor: "bg-gray-500"
        }
      default:
        return {
          iconBg: "bg-gradient-to-br from-cyan-500 to-blue-500",
          iconColor: "text-white",
          borderColor: "border-cyan-500/30",
          glowColor: "from-cyan-500/20",
          pulseColor: "bg-cyan-500"
        }
    }
  }

  const getActivityLabel = (type: string) => {
    switch (type) {
      case "pr_opened":
        return "Pull Request Opened"
      case "pr_merged":
        return "Pull Request Merged"
      case "pr_reviewed":
        return "Code Review"
      case "issue_opened":
        return "Issue Created"
      case "issue_closed":
        return "Issue Closed"
      case "commit":
        return "Commit Pushed"
      case "code_review":
        return "Code Review"
      default:
        return "Activity"
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const formatFullDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center border-white/10 bg-white/5">
        <Spinner />
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="p-12 text-center border-white/10 bg-white/5">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-400 font-medium">No recent activity</p>
        <p className="text-gray-500 text-sm mt-1">Start contributing to see your timeline!</p>
      </Card>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-purple-500/50 via-cyan-500/30 to-transparent" />
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const styles = getActivityStyles(activity.activity_type)
          const isFirst = index === 0
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
              className="relative"
            >
              <div className="flex gap-4">
                <div className="relative z-10 flex-shrink-0">
                  <motion.div 
                    className={`w-14 h-14 rounded-xl ${styles.iconBg} flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className={styles.iconColor}>
                      {getActivityIcon(activity.activity_type)}
                    </div>
                  </motion.div>
                  
                  {isFirst && (
                    <motion.div
                      className={`absolute -inset-1 rounded-xl ${styles.pulseColor} opacity-30`}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.1, 0.3]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </div>
                
                <motion.div 
                  className={`flex-1 p-4 rounded-xl border ${styles.borderColor} bg-white/5 backdrop-blur-sm hover:bg-white/[0.08] transition-all group`}
                  whileHover={{ x: 4 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${styles.glowColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl`} />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs px-2 py-0.5 ${styles.iconBg} text-white border-0`}
                          >
                            {getActivityLabel(activity.activity_type)}
                          </Badge>
                          {isFirst && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            >
                              Latest
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                          {activity.title}
                        </h4>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(activity.created_at)}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {formatFullDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    {activity.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-mono px-2 py-1 rounded bg-white/5 text-gray-300 border border-white/10">
                        {activity.repo_name}
                      </span>
                      {activity.pr_number && (
                        <span className="flex items-center gap-1 text-purple-400">
                          <GitPullRequest className="w-3 h-3" />
                          #{activity.pr_number}
                        </span>
                      )}
                      {activity.issue_number && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <AlertCircle className="w-3 h-3" />
                          #{activity.issue_number}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
})

ActivityFeed.displayName = "ActivityFeed"

export default ActivityFeed
