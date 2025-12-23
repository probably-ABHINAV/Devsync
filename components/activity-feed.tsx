"use client"

import { Switch } from "@/components/ui/switch"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { 
  GitPullRequest, 
  GitMerge, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  GitCommit, 
  Code, 
  Sparkles, 
  Clock 
} from "lucide-react"

import { AISummaryCard } from "@/components/ai/ai-summary-card"
import { TimelineItem } from "@/components/timeline/timeline-item"
import { TimelineDrawer } from "@/components/timeline/timeline-drawer"

export interface ActivityFeedRef {
  refresh: () => Promise<void>
}

interface Activity {
  id: string
  activity_type: string
  source: string // Added source
  repo_name: string
  pr_number?: number
  issue_number?: number
  title: string
  description: string
  metadata: any
  created_at: string
  attention_score?: number
}

const RelatedContextPanel = ({ query }: { query: string }) => {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch('/api/context/related', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: query })
        })
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchRelated()
  }, [query])

  if (loading) {
    return <div className="p-4 flex justify-center"><Spinner className="w-4 h-4 text-cyan-400" /></div>
  }

  if (results.length === 0) {
    return <div className="p-3 text-xs text-gray-500 text-center">No related context found.</div>
  }

  return (
    <div className="p-3 space-y-2 bg-black/20 rounded-b-xl border-t border-white/5">
      <div className="flex items-center gap-2 mb-2">
         <Sparkles className="w-3 h-3 text-cyan-400" />
         <span className="text-xs font-semibold text-cyan-400">AI Context Analysis</span>
      </div>
      {results.map((item: any) => (
        <div key={item.id} className="flex items-start gap-2 p-2 rounded bg-white/5 border border-white/5">
           <div className="mt-0.5">
             {item.source === 'github' ? <GitCommit className="w-3 h-3 text-purple-400" /> : 
              item.source === 'jira' ? <AlertCircle className="w-3 h-3 text-blue-400" /> :
              <MessageSquare className="w-3 h-3 text-gray-400" />}
           </div>
           <div>
             <div className="text-xs text-gray-200 font-medium line-clamp-1">{item.title}</div>
             <div className="text-[10px] text-gray-500 flex items-center gap-2">
               <span>{Math.round(item.similarity * 100)}% relevant</span>
               <span>•</span>
               <span>{new Date(item.created_at).toLocaleDateString()}</span>
             </div>
           </div>
        </div>
      ))}
    </div>
  )
}

const ActivityFeed = forwardRef<ActivityFeedRef, {}>((_props, ref) => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [focusMode, setFocusMode] = useState(false)
  const [filterSource, setFilterSource] = useState<string>('all') // New Filter State
  const [expandedId, setExpandedId] = useState<string | null>(null) // State for context expansion

  useImperativeHandle(ref, () => ({
    refresh: fetchActivities
  }))

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/analytics/activity?limit=50")
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

  // Filter activities based on Focus Mode and Source
  const filteredActivities = activities.filter(a => {
    if (focusMode && (a.attention_score || 0) < 40) return false
    if (filterSource !== 'all' && a.source !== filterSource) return false
    return true
  })

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
      
      <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            Timeline
            {loading && <Spinner className="w-3 h-3" />}
            </h3>
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Focus Mode</span>
                <Switch 
                    checked={focusMode} 
                    onCheckedChange={setFocusMode} 
                    className="data-[state=checked]:bg-cyan-500"
                />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['all', 'github', 'jira', 'gitlab', 'slack'].map(source => (
                <button
                    key={source}
                    onClick={() => setFilterSource(source)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize border ${
                        filterSource === source 
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' 
                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                    }`}
                >
                    {source === 'all' ? 'All' : source}
                </button>
            ))}
          </div>
      </div>
      <div className="space-y-4">
        {/* AI Daily Summary (Mock for Phase 3) */}
        {!focusMode && (
             <AISummaryCard 
                 type="daily"
                 title="Daily Digest: Deployment & High Velocity"
                 content="Team merged 12 PRs today. Velocity is up 15%. Deployment to production (v2.4.0) triggered 3 alerts in #ops which were auto-resolved."
                 confidence={0.92}
             />
        )}

        <AnimatePresence mode="popLayout">
            <div className="space-y-4">
                {filteredActivities.map((activity) => (
                    <TimelineItem 
                        key={activity.id} 
                        activity={activity} 
                        onClick={() => {
                            setExpandedId(null)
                            setSelectedActivity(activity)
                            setDrawerOpen(true)
                        }}
                    />
                ))}
            </div>
        </AnimatePresence>

        <TimelineDrawer 
            activity={selectedActivity || activities[0]} 
            open={drawerOpen} 
            onOpenChange={setDrawerOpen} 
        />
      </div>
    </div>
  )
})

ActivityFeed.displayName = "ActivityFeed"

export default ActivityFeed
