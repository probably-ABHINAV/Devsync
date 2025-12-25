"use client"

import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { GitPullRequest, GitMerge, GitCommit, AlertCircle, CheckCircle, X, Clock, MessageSquare, Code, Sparkles } from "lucide-react"

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
          pulseColor: "bg-purple-500",
          shadowColor: "rgba(168, 85, 247, 0.4)"
        }
      case "pr_merged":
        return {
          iconBg: "bg-gradient-to-br from-green-500 to-emerald-500",
          iconColor: "text-white",
          borderColor: "border-green-500/30",
          glowColor: "from-green-500/20",
          pulseColor: "bg-green-500",
          shadowColor: "rgba(34, 197, 94, 0.4)"
        }
      case "pr_reviewed":
        return {
          iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
          iconColor: "text-white",
          borderColor: "border-blue-500/30",
          glowColor: "from-blue-500/20",
          pulseColor: "bg-blue-500",
          shadowColor: "rgba(59, 130, 246, 0.4)"
        }
      case "issue_opened":
        return {
          iconBg: "bg-gradient-to-br from-yellow-500 to-orange-500",
          iconColor: "text-white",
          borderColor: "border-yellow-500/30",
          glowColor: "from-yellow-500/20",
          pulseColor: "bg-yellow-500",
          shadowColor: "rgba(234, 179, 8, 0.4)"
        }
      case "issue_closed":
        return {
          iconBg: "bg-gradient-to-br from-gray-500 to-slate-500",
          iconColor: "text-white",
          borderColor: "border-gray-500/30",
          glowColor: "from-gray-500/20",
          pulseColor: "bg-gray-500",
          shadowColor: "rgba(107, 114, 128, 0.4)"
        }
      default:
        return {
          iconBg: "bg-gradient-to-br from-cyan-500 to-blue-500",
          iconColor: "text-white",
          borderColor: "border-cyan-500/30",
          glowColor: "from-cyan-500/20",
          pulseColor: "bg-cyan-500",
          shadowColor: "rgba(6, 182, 212, 0.4)"
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
      <Card className="p-8 flex items-center justify-center border-white/10 bg-[#0d0d1a]/80 backdrop-blur-xl">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Spinner />
        </motion.div>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="p-12 text-center border-white/10 bg-[#0d0d1a]/80 backdrop-blur-xl">
        <motion.div 
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center"
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(168, 85, 247, 0.2)",
              "0 0 40px rgba(168, 85, 247, 0.4)",
              "0 0 20px rgba(168, 85, 247, 0.2)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Clock className="w-8 h-8 text-gray-400" />
          </motion.div>
        </motion.div>
        <p className="text-gray-400 font-medium">No recent activity</p>
        <p className="text-gray-500 text-sm mt-1">Start contributing to see your timeline!</p>
      </Card>
    )
  }

  return (
    <div className="relative">
      <motion.div 
        className="absolute left-[27px] top-6 bottom-6 w-0.5"
        style={{
          background: "linear-gradient(to bottom, rgba(168, 85, 247, 0.5), rgba(6, 182, 212, 0.3), transparent)",
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      
      <motion.div
        className="absolute left-[26px] top-6 w-1 h-20 blur-sm"
        style={{
          background: "linear-gradient(to bottom, rgba(168, 85, 247, 0.8), transparent)",
        }}
        animate={{
          top: ["6px", "calc(100% - 80px)", "6px"],
          opacity: [1, 0.5, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => {
            const styles = getActivityStyles(activity.activity_type)
            const isFirst = index === 0
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.95 }}
                transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                className="relative"
                layout
              >
                <div className="flex gap-4">
                  <div className="relative z-10 flex-shrink-0">
                    <motion.div 
                      className={`w-14 h-14 rounded-xl ${styles.iconBg} flex items-center justify-center shadow-lg relative overflow-hidden`}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      style={{
                        boxShadow: `0 0 20px ${styles.shadowColor}`,
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                        }}
                      />
                      <motion.div 
                        className={styles.iconColor}
                        animate={{ 
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {getActivityIcon(activity.activity_type)}
                      </motion.div>
                    </motion.div>
                    
                    {isFirst && (
                      <>
                        <motion.div
                          className={`absolute -inset-2 rounded-xl ${styles.pulseColor} opacity-30`}
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0, 0.3]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <motion.div
                          className={`absolute -inset-3 rounded-xl ${styles.pulseColor} opacity-20`}
                          animate={{ 
                            scale: [1, 1.4, 1],
                            opacity: [0.2, 0, 0.2]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.3
                          }}
                        />
                      </>
                    )}
                  </div>
                  
                  <motion.div 
                    className={`flex-1 p-4 rounded-xl border ${styles.borderColor} bg-[#0d0d1a]/80 backdrop-blur-xl hover:bg-white/[0.08] transition-all group relative overflow-hidden`}
                    whileHover={{ x: 8, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-r ${styles.glowColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl`}
                    />
                    
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)",
                        backgroundSize: "200% 100%",
                      }}
                      animate={{
                        backgroundPosition: ["200% 0%", "-200% 0%"],
                      }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs px-2 py-0.5 ${styles.iconBg} text-white border-0`}
                            >
                              {getActivityLabel(activity.activity_type)}
                            </Badge>
                            {isFirst && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500 }}
                              >
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1"
                                >
                                  <motion.div
                                    animate={{ 
                                      rotate: [0, 180, 360],
                                      scale: [1, 1.2, 1],
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                  >
                                    <Sparkles className="w-3 h-3" />
                                  </motion.div>
                                  Latest
                                </Badge>
                              </motion.div>
                            )}
                          </div>
                          <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {activity.title}
                          </h4>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <motion.div 
                            className="flex items-center gap-1 text-xs text-gray-400"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(activity.created_at)}</span>
                          </motion.div>
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
                        <motion.span 
                          className="font-mono px-2 py-1 rounded bg-white/5 text-gray-300 border border-white/10"
                          whileHover={{ scale: 1.05, borderColor: "rgba(6, 182, 212, 0.5)" }}
                        >
                          {activity.repo_name}
                        </motion.span>
                        {activity.pr_number && (
                          <motion.span 
                            className="flex items-center gap-1 text-purple-400"
                            whileHover={{ scale: 1.1 }}
                          >
                            <GitPullRequest className="w-3 h-3" />
                            #{activity.pr_number}
                          </motion.span>
                        )}
                        {activity.issue_number && (
                          <motion.span 
                            className="flex items-center gap-1 text-yellow-400"
                            whileHover={{ scale: 1.1 }}
                          >
                            <AlertCircle className="w-3 h-3" />
                            #{activity.issue_number}
                          </motion.span>
                        )}
                      </div>
                    </div>
                    
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${styles.shadowColor}, transparent)`,
                      }}
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
})

ActivityFeed.displayName = "ActivityFeed"

export default ActivityFeed
