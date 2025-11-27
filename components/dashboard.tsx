"use client"

import type { ReactNode } from "react"
import { useEffect, useState, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import RepoCard from "./repo-card"
import ActivityFeed, { ActivityFeedRef } from "./activity-feed"
import Leaderboard from "./leaderboard"
import UserBadges from "./user-badges"
import DiscordChannelSelector from "./discord-channel-selector"
import { 
  LogOut, Github, MessageCircle, Activity, Trophy, Award, Settings, 
  Bell, GitPullRequest, GitCommit, AlertCircle, CheckCircle, 
  TrendingUp, Users, Zap, Shield, ExternalLink, RefreshCw,
  GitBranch, Bug, Tag, Eye, Clock, BarChart3, Home, List, Grid3X3,
  Folder, Code, FolderOpen
} from "lucide-react"

interface Repo {
  id: number
  name: string
  description: string | null
  url: string
  stars: number
  language: string | null
  openIssues: number
  openPRs: number
  updated_at?: string
}

interface User {
  login: string
  avatar_url: string
  name: string
}

interface DashboardProps {
  user: User
}

interface EventType {
  id: string
  name: string
  icon: ReactNode
  enabled: boolean
  description: string
}

type ViewMode = "grouped" | "list"

const LANGUAGE_COLORS: Record<string, { gradient: string; bg: string; text: string }> = {
  TypeScript: { gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10", text: "text-blue-400" },
  JavaScript: { gradient: "from-yellow-500 to-orange-500", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  Python: { gradient: "from-green-500 to-emerald-500", bg: "bg-green-500/10", text: "text-green-400" },
  Rust: { gradient: "from-orange-500 to-red-500", bg: "bg-orange-500/10", text: "text-orange-400" },
  Go: { gradient: "from-cyan-500 to-teal-500", bg: "bg-cyan-500/10", text: "text-cyan-400" },
  Java: { gradient: "from-red-500 to-orange-500", bg: "bg-red-500/10", text: "text-red-400" },
  "C++": { gradient: "from-purple-500 to-pink-500", bg: "bg-purple-500/10", text: "text-purple-400" },
  C: { gradient: "from-gray-500 to-slate-500", bg: "bg-gray-500/10", text: "text-gray-400" },
  Ruby: { gradient: "from-red-600 to-pink-600", bg: "bg-red-500/10", text: "text-red-400" },
  PHP: { gradient: "from-indigo-500 to-purple-500", bg: "bg-indigo-500/10", text: "text-indigo-400" },
  Swift: { gradient: "from-orange-400 to-red-500", bg: "bg-orange-500/10", text: "text-orange-400" },
  Kotlin: { gradient: "from-purple-400 to-orange-500", bg: "bg-purple-500/10", text: "text-purple-400" },
  Shell: { gradient: "from-green-600 to-lime-500", bg: "bg-green-500/10", text: "text-green-400" },
  HTML: { gradient: "from-orange-500 to-red-400", bg: "bg-orange-500/10", text: "text-orange-400" },
  CSS: { gradient: "from-blue-400 to-purple-500", bg: "bg-blue-500/10", text: "text-blue-400" },
  Other: { gradient: "from-gray-400 to-slate-500", bg: "bg-gray-500/10", text: "text-gray-400" },
}

export default function Dashboard({ user }: DashboardProps) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [discordConnected, setDiscordConnected] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [savingWebhook, setSavingWebhook] = useState(false)
  const [webhookMessage, setWebhookMessage] = useState({ type: "", text: "" })
  const [activeTab, setActiveTab] = useState("overview")
  const [viewMode, setViewMode] = useState<ViewMode>("grouped")
  const [showChannelSelector, setShowChannelSelector] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState({ serverId: "", channelId: "", channelName: "" })
  const activityFeedRef = useRef<ActivityFeedRef>(null)
  
  const [eventTypes, setEventTypes] = useState<EventType[]>([
    { id: "push", name: "Push Events", icon: <GitCommit className="w-4 h-4" />, enabled: true, description: "Code pushes to branches" },
    { id: "pull_request", name: "Pull Requests", icon: <GitPullRequest className="w-4 h-4" />, enabled: true, description: "PR opened, closed, merged" },
    { id: "issues", name: "Issues", icon: <Bug className="w-4 h-4" />, enabled: true, description: "Issue created, closed, assigned" },
    { id: "release", name: "Releases", icon: <Tag className="w-4 h-4" />, enabled: true, description: "New releases published" },
    { id: "review", name: "PR Reviews", icon: <Eye className="w-4 h-4" />, enabled: true, description: "Code review comments" },
    { id: "ci", name: "CI/CD Status", icon: <CheckCircle className="w-4 h-4" />, enabled: true, description: "Build pass/fail alerts" },
  ])

  useEffect(() => {
    loadRepos()
    checkDiscordStatus()
  }, [])

  const loadRepos = async () => {
    try {
      const response = await fetch("/api/repos")
      if (response.ok) {
        const data = await response.json()
        setRepos(data.repos || [])
      }
    } catch (error) {
      console.error("Failed to load repos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshData = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        loadRepos(),
        activityFeedRef.current?.refresh()
      ])
    } finally {
      setTimeout(() => setRefreshing(false), 500)
    }
  }

  const handleSetupNotifications = () => {
    setActiveTab("notifications")
  }

  const checkDiscordStatus = async () => {
    try {
      const response = await fetch("/api/discord/status")
      if (response.ok) {
        const data = await response.json()
        setDiscordConnected(data.connected)
      }
    } catch (error) {
      console.error("Failed to check Discord status:", error)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.reload()
  }

  const handleSaveWebhook = async () => {
    if (!webhookUrl) return
    setSavingWebhook(true)
    setWebhookMessage({ type: "", text: "" })

    try {
      const response = await fetch("/api/discord/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          webhookUrl,
          eventTypes: eventTypes.filter(e => e.enabled).map(e => e.id)
        }),
      })

      if (response.ok) {
        setWebhookMessage({ type: "success", text: "Discord channel configured! All selected events will be logged here." })
        setDiscordConnected(true)
      } else {
        setWebhookMessage({ type: "error", text: "Failed to configure webhook. Please check the URL." })
      }
    } catch (error) {
      setWebhookMessage({ type: "error", text: "Connection error. Please try again." })
    } finally {
      setSavingWebhook(false)
    }
  }

  const toggleEventType = (id: string) => {
    setEventTypes(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e))
  }

  const recentlyUpdatedRepos = useMemo(() => {
    return [...repos]
      .sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 4)
  }, [repos])

  const groupedRepos = useMemo(() => {
    const groups: Record<string, Repo[]> = {}
    repos.forEach(repo => {
      const lang = repo.language || "Other"
      if (!groups[lang]) {
        groups[lang] = []
      }
      groups[lang].push(repo)
    })
    const sortedGroups = Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
    return sortedGroups
  }, [repos])

  const getLanguageStyle = (lang: string) => {
    return LANGUAGE_COLORS[lang] || LANGUAGE_COLORS.Other
  }

  const totalIssues = repos.reduce((sum, r) => sum + r.openIssues, 0)
  const totalPRs = repos.reduce((sum, r) => sum + r.openPRs, 0)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-full blur-3xl" />
      </div>

      <motion.header
        className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-50" />
              <img src="/opscord-logo.jpg" alt="Opscord" className="relative w-10 h-10 rounded-xl object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white">Opscord</span>
              <p className="text-xs text-gray-500">DevOps Intelligence</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 ml-6 pl-6 border-l border-white/10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-40" />
                <img
                  src={user.avatar_url || "/placeholder.svg"}
                  alt={user.login}
                  className="relative w-9 h-9 rounded-full ring-2 ring-white/10"
                />
              </div>
              <div>
                <h1 className="font-semibold text-sm text-white">{user.name}</h1>
                <p className="text-xs text-gray-500">@{user.login}</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="outline"
                className="border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white gap-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              discordConnected 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
            }`}>
              <div className={`w-2 h-2 rounded-full ${discordConnected ? "bg-emerald-400" : "bg-yellow-400"} animate-pulse`} />
              {discordConnected ? "Discord Connected" : "Discord Pending"}
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                label: "Repositories", 
                value: repos.length, 
                icon: Github, 
                gradient: "from-cyan-500 to-blue-500",
                bg: "from-cyan-500/10 to-blue-500/10"
              },
              { 
                label: "Open PRs", 
                value: totalPRs, 
                icon: GitPullRequest, 
                gradient: "from-purple-500 to-pink-500",
                bg: "from-purple-500/10 to-pink-500/10"
              },
              { 
                label: "Open Issues", 
                value: totalIssues, 
                icon: AlertCircle, 
                gradient: "from-orange-500 to-red-500",
                bg: "from-orange-500/10 to-red-500/10"
              },
              { 
                label: "Discord", 
                value: discordConnected ? "Active" : "Setup", 
                icon: MessageCircle, 
                gradient: "from-emerald-500 to-teal-500",
                bg: "from-emerald-500/10 to-teal-500/10"
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="group relative"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                      <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.bg}`}>
                      <stat.icon className={`w-5 h-5 bg-gradient-to-r ${stat.gradient} bg-clip-text`} style={{ color: 'currentColor' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
            <Button 
              onClick={handleRefreshData}
              disabled={refreshing}
              className="bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 gap-2"
              onClick={handleSetupNotifications}
            >
              <Bell className="w-4 h-4" />
              Setup Notifications
            </Button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-4 bg-white/5 border border-white/10 p-1 rounded-xl">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-white rounded-lg gap-2">
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white rounded-lg gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-white rounded-lg gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-teal-500/20 data-[state=active]:text-white rounded-lg gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-8 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Your Repositories</h2>
                    <p className="text-gray-400 text-sm mt-1">Monitor and manage your GitHub repositories</p>
                  </div>
                  <div className="flex items-center gap-2 p-1 rounded-lg bg-white/5 border border-white/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode("grouped")}
                      className={`gap-2 ${viewMode === 'grouped' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Folder className="w-4 h-4" />
                      Grouped
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={`gap-2 ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      <List className="w-4 h-4" />
                      All
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-16">
                    <Spinner />
                  </div>
                ) : repos.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl border border-white/10 bg-white/5">
                    <Github className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No repositories found</p>
                    <p className="text-gray-500 text-sm mt-2">Connect your GitHub account to see your repos</p>
                  </div>
                ) : viewMode === "grouped" ? (
                  <div className="space-y-8">
                    {recentlyUpdatedRepos.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                            <Clock className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Recently Updated</h3>
                            <p className="text-xs text-gray-500">Your most recently active repositories</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {recentlyUpdatedRepos.map((repo) => (
                            <RepoCard key={`recent-${repo.id}`} repo={repo} />
                          ))}
                        </div>
                      </div>
                    )}

                    {groupedRepos.map(([language, langRepos]) => {
                      const style = getLanguageStyle(language)
                      return (
                        <motion.div 
                          key={language} 
                          className="space-y-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${style.bg}`}>
                              <Code className={`w-5 h-5 ${style.text}`} />
                            </div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-white">{language}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} border border-current/20`}>
                                {langRepos.length} {langRepos.length === 1 ? 'repo' : 'repos'}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {langRepos.map((repo) => (
                              <RepoCard key={repo.id} repo={repo} />
                            ))}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <FolderOpen className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">All Repositories</h3>
                        <p className="text-xs text-gray-500">{repos.length} repositories total</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {repos.map((repo) => (
                        <RepoCard key={repo.id} repo={repo} />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Activity Timeline</h2>
                  <p className="text-gray-400 text-sm mt-1">Track your recent contributions and events</p>
                </div>
                <ActivityFeed ref={activityFeedRef} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-8 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white">Team Analytics</h2>
                  <p className="text-gray-400 text-sm mt-1">Performance insights and achievements</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
                    </div>
                    <Leaderboard />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <Award className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Your Achievements</h3>
                    </div>
                    <UserBadges userId={user.login} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Discord Notifications</h2>
                  <p className="text-gray-400 text-sm mt-1">Configure a Discord channel to receive all GitHub events</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div 
                    className="relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-bl-full" />
                    
                    <div className="relative space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                          <MessageCircle className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Discord Channel</h3>
                          <p className="text-sm text-gray-400">Webhook Configuration</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Button
                          onClick={() => setShowChannelSelector(true)}
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Select Channel & Server
                        </Button>

                        {selectedChannel.channelId && (
                          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-sm text-blue-400">
                              ✓ Selected: <strong>#{selectedChannel.channelName}</strong>
                            </p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="webhook" className="text-gray-300">Webhook URL (Auto-generated)</Label>
                          <Input
                            id="webhook"
                            type="password"
                            placeholder="https://discord.com/api/webhooks/..."
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50"
                          />
                          <p className="text-xs text-gray-500">
                            Create a webhook: Server Settings → Integrations → Webhooks → New Webhook
                          </p>
                        </div>

                        <Button
                          onClick={handleSaveWebhook}
                          disabled={savingWebhook || !webhookUrl}
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 disabled:opacity-50"
                        >
                          {savingWebhook ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Connect Channel
                            </>
                          )}
                        </Button>

                        <AnimatePresence>
                          {webhookMessage.text && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                                webhookMessage.type === "success"
                                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                  : "bg-red-500/10 border border-red-500/20 text-red-400"
                              }`}
                            >
                              {webhookMessage.type === "success" ? (
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              )}
                              {webhookMessage.text}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-bl-full" />
                    
                    <div className="relative space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                          <Bell className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Event Types</h3>
                          <p className="text-sm text-gray-400">Choose what to log</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {eventTypes.map((event) => (
                          <motion.div
                            key={event.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              event.enabled 
                                ? "border-white/20 bg-white/5" 
                                : "border-white/5 bg-transparent"
                            }`}
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${event.enabled ? "bg-white/10" : "bg-white/5"}`}>
                                {event.icon}
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${event.enabled ? "text-white" : "text-gray-400"}`}>
                                  {event.name}
                                </p>
                                <p className="text-xs text-gray-500">{event.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={event.enabled}
                              onCheckedChange={() => toggleEventType(event.id)}
                              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-blue-500"
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  className="p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        discordConnected 
                          ? "bg-gradient-to-br from-emerald-500/20 to-green-500/20" 
                          : "bg-gradient-to-br from-yellow-500/20 to-orange-500/20"
                      }`}>
                        {discordConnected ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Clock className="w-6 h-6 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {discordConnected ? "Notifications Active" : "Setup Required"}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {discordConnected 
                            ? `${eventTypes.filter(e => e.enabled).length} event types enabled`
                            : "Add a webhook URL to start receiving notifications"
                          }
                        </p>
                      </div>
                    </div>
                    {discordConnected && (
                      <Button 
                        variant="outline"
                        className="border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 gap-2"
                        onClick={() => window.open("https://discord.com/channels/@me", "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Discord
                      </Button>
                    )}
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>

      <AnimatePresence>
        {showChannelSelector && (
          <DiscordChannelSelector
            onSelect={(serverId, channelId, channelName) => {
              setSelectedChannel({ serverId, channelId, channelName })
              setShowChannelSelector(false)
            }}
            onClose={() => setShowChannelSelector(false)}
            loading={savingWebhook}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
