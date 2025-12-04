"use client"

import type { ReactNode } from "react"
import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useInView } from "framer-motion"
import Link from "next/link"
import RepoCard from "./repo-card"
import ActivityFeed, { ActivityFeedRef } from "./activity-feed"
import Leaderboard from "./leaderboard"
import UserBadges from "./user-badges"
import DiscordChannelSelector from "./discord-channel-selector"
import DiscordPanel from "./dashboard/DiscordPanel"
import { 
  LogOut, Github, MessageCircle, Activity, Trophy, Award, Settings, 
  Bell, GitPullRequest, GitCommit, AlertCircle, CheckCircle, 
  TrendingUp, Users, Zap, Shield, ExternalLink, RefreshCw,
  GitBranch, Bug, Tag, Eye, Clock, BarChart3, Home, List, Grid3X3,
  Folder, Code, FolderOpen, Sparkles
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

function FloatingOrb({ delay, duration, size, color, initialX, initialY }: { 
  delay: number, duration: number, size: number, color: string, initialX: string, initialY: string 
}) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        left: initialX,
        top: initialY,
      }}
      animate={{
        x: [0, 100, -50, 80, 0],
        y: [0, -80, 60, -40, 0],
        scale: [1, 1.2, 0.9, 1.1, 1],
        opacity: [0.3, 0.5, 0.3, 0.4, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

function Particle({ index }: { index: number }) {
  const [particleConfig, setParticleConfig] = useState<{
    x: number
    delay: number
    duration: number
    size: number
  } | null>(null)
  
  useEffect(() => {
    setParticleConfig({
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 20,
      size: 1 + Math.random() * 2,
    })
  }, [])
  
  if (!particleConfig) return null
  
  return (
    <motion.div
      className="absolute rounded-full bg-white/50 pointer-events-none"
      style={{
        width: particleConfig.size,
        height: particleConfig.size,
        left: `${particleConfig.x}%`,
        top: "100%",
      }}
      animate={{
        y: [0, -1500],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: particleConfig.duration,
        delay: particleConfig.delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
}

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}

function useCounter(end: number, duration: number = 2000, startCounting: boolean = true) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!startCounting) return
    
    let startTime: number
    let animationFrame: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, startCounting])
  
  return count
}

function AnimatedStatCard({ stat, idx, inView }: { 
  stat: { 
    label: string
    value: number | string
    icon: any
    gradient: string
    bg: string
  }
  idx: number
  inView: boolean 
}) {
  const isNumber = typeof stat.value === 'number'
  const count = useCounter(isNumber ? (stat.value as number) : 0, 2000, inView)
  
  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ delay: idx * 0.1, duration: 0.6, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.02, y: -5, rotateX: 5 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
    >
      <motion.div 
        className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-all duration-500`}
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0, 0.3, 0],
        }}
        transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
      />
      
      <motion.div 
        className="absolute -inset-px bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))` }}
      />
      
      <div className="relative p-5 rounded-2xl border border-white/10 bg-[#0d0d1a]/80 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
        <motion.div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity`}
          style={{
            background: `radial-gradient(circle at 50% 0%, ${stat.gradient.includes('cyan') ? 'rgba(6, 182, 212, 0.15)' : stat.gradient.includes('purple') ? 'rgba(139, 92, 246, 0.15)' : stat.gradient.includes('orange') ? 'rgba(249, 115, 22, 0.15)' : 'rgba(16, 185, 129, 0.15)'} 0%, transparent 60%)`,
          }}
        />
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
            <motion.p 
              className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
              initial={{ scale: 0.5 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ delay: idx * 0.1 + 0.3, type: "spring", stiffness: 200 }}
            >
              {isNumber ? count : stat.value}
            </motion.p>
          </div>
          <motion.div 
            className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.bg}`}
            animate={{ 
              rotateY: [0, 360],
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "linear",
              delay: idx * 0.5
            }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: idx * 0.3
              }}
            >
              <stat.icon className={`w-5 h-5`} style={{ color: stat.gradient.includes('cyan') ? '#06b6d4' : stat.gradient.includes('purple') ? '#a855f7' : stat.gradient.includes('orange') ? '#f97316' : '#10b981' }} />
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient}`}
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ delay: idx * 0.1 + 0.5, duration: 0.8 }}
          style={{ transformOrigin: "left" }}
        />
      </div>
      
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 4 + idx * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  )
}

function TiltCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 })
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"])
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }
  
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }
  
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  )
}

function AnimatedTabIndicator({ activeTab }: { activeTab: string }) {
  const tabs = ["overview", "activity", "analytics", "notifications"]
  const activeIndex = tabs.indexOf(activeTab)
  
  return (
    <motion.div
      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
      initial={false}
      animate={{
        width: "25%",
        x: `${activeIndex * 100}%`,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />
  )
}

export default function Dashboard({ user }: DashboardProps) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState("")
  const [discordConnected, setDiscordConnected] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [savingWebhook, setSavingWebhook] = useState(false)
  const [webhookMessage, setWebhookMessage] = useState({ type: "", text: "" })
  const [activeTab, setActiveTab] = useState("overview")
  const [viewMode, setViewMode] = useState<ViewMode>("grouped")
  const [showChannelSelector, setShowChannelSelector] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState({ serverId: "", channelId: "", channelName: "" })
  const activityFeedRef = useRef<ActivityFeedRef>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" })
  
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
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const username = user.login
      // Load insights and stats in parallel
      const [insightsRes, statsRes] = await Promise.all([
        fetch(`/api/analytics/activity-insights?username=${username}`),
        fetch(`/api/analytics/stats?username=${username}`)
      ])
      if (insightsRes.ok && statsRes.ok) {
        const insights = await insightsRes.json()
        const stats = await statsRes.json()
        console.log('Analytics loaded:', { insights, stats })
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

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

  const handleSyncActivities = async () => {
    setSyncing(true)
    setSyncMessage("")
    try {
      const response = await fetch("/api/sync-github-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await response.json()
      if (response.ok) {
        setSyncMessage(`✅ Synced ${data.synced} activities from GitHub`)
        setTimeout(() => activityFeedRef.current?.refresh(), 500)
      } else {
        setSyncMessage(`❌ ${data.error || "Sync failed"}`)
      }
    } catch (error) {
      setSyncMessage("❌ Error syncing activities")
    } finally {
      setSyncing(false)
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

  const stats = [
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
  ]

  return (
    <div className="min-h-screen bg-[#030308] overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(6, 182, 212, 0.12) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, 50, -30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -80, 60, 0],
            y: [0, -60, 40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[700px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(236, 72, 153, 0.08) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 60, -80, 0],
            y: [0, -40, 60, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />

        <FloatingOrb delay={0} duration={15} size={400} color="rgba(6, 182, 212, 0.06)" initialX="10%" initialY="20%" />
        <FloatingOrb delay={2} duration={18} size={300} color="rgba(139, 92, 246, 0.06)" initialX="70%" initialY="60%" />
        <FloatingOrb delay={4} duration={20} size={350} color="rgba(236, 72, 153, 0.05)" initialX="30%" initialY="70%" />
        <FloatingOrb delay={1} duration={17} size={250} color="rgba(16, 185, 129, 0.05)" initialX="80%" initialY="10%" />

        <GridBackground />

        <div className="absolute inset-0 overflow-hidden opacity-30">
          {Array.from({ length: 20 }).map((_, i) => (
            <Particle key={i} index={i} />
          ))}
        </div>
      </div>

      <motion.header
        className="sticky top-0 z-50 border-b border-white/5 bg-[#030308]/60 backdrop-blur-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative group">
              <motion.div 
                className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.img 
                src="/opscord-logo.jpg" 
                alt="Opscord" 
                className="relative w-11 h-11 rounded-xl object-cover ring-2 ring-white/10"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              />
            </div>
            <div className="flex flex-col">
              <motion.span 
                className="font-bold text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(6, 182, 212, 0)",
                    "0 0 30px rgba(6, 182, 212, 0.3)",
                    "0 0 20px rgba(6, 182, 212, 0)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Opscord
              </motion.span>
              <p className="text-xs text-gray-500">DevOps Intelligence</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 ml-6 pl-6 border-l border-white/10">
              <div className="relative group">
                <motion.div 
                  className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur opacity-40 group-hover:opacity-60"
                  animate={{ 
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute -inset-1 rounded-full border-2 border-transparent"
                  style={{
                    background: "linear-gradient(#030308, #030308) padding-box, linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899) border-box",
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.img
                  src={user.avatar_url || "/placeholder.svg"}
                  alt={user.login}
                  className="relative w-10 h-10 rounded-full ring-2 ring-white/20"
                  whileHover={{ scale: 1.1 }}
                />
              </div>
              <div>
                <h1 className="font-semibold text-sm text-white">{user.name}</h1>
                <p className="text-xs text-gray-500">@{user.login}</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-3">
            <Link href="/">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white gap-2 backdrop-blur-sm"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </motion.div>
            </Link>
            <motion.div 
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                discordConnected 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className={`w-2 h-2 rounded-full ${discordConnected ? "bg-emerald-400" : "bg-yellow-400"}`}
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {discordConnected ? "Discord Connected" : "Discord Pending"}
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 text-gray-300 hover:text-red-400 gap-2 backdrop-blur-sm transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          
          <motion.div ref={statsRef} variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ perspective: 1000 }}>
            {stats.map((stat, idx) => (
              <AnimatedStatCard key={idx} stat={stat} idx={idx} inView={statsInView} />
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={handleRefreshData}
                disabled={refreshing}
                className="relative bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white gap-2 disabled:opacity-50 backdrop-blur-sm overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <RefreshCw className={`w-4 h-4 relative z-10 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="relative z-10">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className="relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 gap-2 overflow-hidden group"
                onClick={handleSetupNotifications}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bell className="w-4 h-4 relative z-10" />
                </motion.div>
                <span className="relative z-10">Setup Notifications</span>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="relative">
                <TabsList className="w-full max-w-3xl mx-auto grid grid-cols-5 bg-white/5 border border-white/10 p-1.5 rounded-xl backdrop-blur-xl relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                    style={{ backgroundSize: "200% 200%" }}
                  />
                  {[
                    { value: "overview", icon: Github, label: "Overview", gradient: "from-cyan-500/20 to-blue-500/20" },
                    { value: "activity", icon: Activity, label: "Activity", gradient: "from-purple-500/20 to-pink-500/20" },
                    { value: "analytics", icon: BarChart3, label: "Analytics", gradient: "from-orange-500/20 to-red-500/20" },
                    { value: "notifications", icon: Bell, label: "Notifications", gradient: "from-emerald-500/20 to-teal-500/20" },
                    { value: "discord", icon: MessageCircle, label: "Discord", gradient: "from-indigo-500/20 to-purple-500/20" },
                  ].map((tab) => (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value} 
                      className={`relative data-[state=active]:bg-gradient-to-r data-[state=active]:${tab.gradient} data-[state=active]:text-white rounded-lg gap-2 transition-all duration-300 z-10`}
                    >
                      <motion.div
                        animate={activeTab === tab.value ? { 
                          scale: [1, 1.2, 1],
                        } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <tab.icon className="w-4 h-4" />
                      </motion.div>
                      <span className="hidden sm:inline">{tab.label}</span>
                      {activeTab === tab.value && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-lg -z-10`}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {activeTab && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 w-16 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layoutId="tabGlow"
                  />
                )}
              </div>

              <AnimatePresence mode="wait">
                <TabsContent value="overview" className="mt-8 space-y-6">
                  <motion.div 
                    className="flex items-center justify-between flex-wrap gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div>
                      <motion.h2 
                        className="text-2xl font-bold text-white"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        Your Repositories
                      </motion.h2>
                      <p className="text-gray-400 text-sm mt-1">Monitor and manage your GitHub repositories</p>
                    </div>
                    <motion.div 
                      className="flex items-center gap-2 p-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("grouped")}
                        className={`gap-2 transition-all ${viewMode === 'grouped' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                        <Folder className="w-4 h-4" />
                        Grouped
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={`gap-2 transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                        <List className="w-4 h-4" />
                        All
                      </Button>
                    </motion.div>
                  </motion.div>

                  {loading ? (
                    <div className="flex justify-center py-16">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Spinner />
                      </motion.div>
                    </div>
                  ) : repos.length === 0 ? (
                    <motion.div 
                      className="p-12 text-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Github className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-gray-400">No repositories found</p>
                      <p className="text-gray-500 text-sm mt-2">Connect your GitHub account to see your repos</p>
                    </motion.div>
                  ) : viewMode === "grouped" ? (
                    <div className="space-y-8">
                      {recentlyUpdatedRepos.length > 0 && (
                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center gap-3">
                            <motion.div 
                              className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                              animate={{ 
                                boxShadow: [
                                  "0 0 20px rgba(6, 182, 212, 0.2)",
                                  "0 0 40px rgba(6, 182, 212, 0.4)",
                                  "0 0 20px rgba(6, 182, 212, 0.2)",
                                ],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Clock className="w-5 h-5 text-cyan-400" />
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">Recently Updated</h3>
                              <p className="text-xs text-gray-500">Your most recently active repositories</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recentlyUpdatedRepos.map((repo, idx) => (
                              <motion.div
                                key={`recent-${repo.id || idx}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                style={{ perspective: 1000 }}
                              >
                                <TiltCard>
                                  <RepoCard repo={repo} />
                                </TiltCard>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {groupedRepos.map(([language, langRepos], groupIdx) => {
                        const style = getLanguageStyle(language)
                        return (
                          <motion.div 
                            key={language} 
                            className="space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: groupIdx * 0.1 }}
                          >
                            <div className="flex items-center gap-3">
                              <motion.div 
                                className={`p-2 rounded-lg bg-gradient-to-br ${style.bg}`}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                              >
                                <Code className={`w-5 h-5 ${style.text}`} />
                              </motion.div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-white">{language}</h3>
                                <motion.span 
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} border border-current/20`}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  {langRepos.length} {langRepos.length === 1 ? 'repo' : 'repos'}
                                </motion.span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {langRepos.map((repo, idx) => (
                                <motion.div
                                  key={`${language}-${repo.id || repo.name}-${idx}`}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  style={{ perspective: 1000 }}
                                >
                                  <TiltCard>
                                    <RepoCard repo={repo} />
                                  </TiltCard>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                          whileHover={{ scale: 1.1 }}
                        >
                          <FolderOpen className="w-5 h-5 text-purple-400" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">All Repositories</h3>
                          <p className="text-xs text-gray-500">{repos.length} repositories total</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {repos.map((repo, idx) => (
                          <motion.div
                            key={repo.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            style={{ perspective: 1000 }}
                          >
                            <TiltCard>
                              <RepoCard repo={repo} />
                            </TiltCard>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="mt-8 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ 
                            boxShadow: [
                              "0 0 20px rgba(139, 92, 246, 0.3)",
                              "0 0 40px rgba(139, 92, 246, 0.5)",
                              "0 0 20px rgba(139, 92, 246, 0.3)",
                            ],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                        >
                          <Activity className="w-5 h-5 text-purple-400" />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-white">Activity Timeline</h2>
                      </div>
                      <motion.button
                        onClick={handleSyncActivities}
                        disabled={syncing}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                        {syncing ? "Syncing..." : "Sync Activities"}
                      </motion.button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-sm mt-1">Track your recent contributions and events</p>
                      {syncMessage && (
                        <motion.p 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-cyan-400"
                        >
                          {syncMessage}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                  <ActivityFeed ref={activityFeedRef} />
                </TabsContent>

                <TabsContent value="analytics" className="mt-8 space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div
                        animate={{ 
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20"
                      >
                        <BarChart3 className="w-5 h-5 text-orange-400" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-white">Team Analytics</h2>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Performance insights and achievements</p>
                  </motion.div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center gap-2">
                        <motion.div 
                          className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20"
                          animate={{ 
                            boxShadow: [
                              "0 0 15px rgba(234, 179, 8, 0.2)",
                              "0 0 30px rgba(234, 179, 8, 0.4)",
                              "0 0 15px rgba(234, 179, 8, 0.2)",
                            ],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Trophy className="w-5 h-5 text-yellow-400" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
                      </div>
                      <Leaderboard />
                    </motion.div>
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-2">
                        <motion.div 
                          className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                          animate={{ 
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Award className="w-5 h-5 text-purple-400" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-white">Your Achievements</h3>
                      </div>
                      <UserBadges userId={user.login} />
                    </motion.div>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="mt-8 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div
                        animate={{ 
                          rotate: [0, 15, -15, 0],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
                      >
                        <Bell className="w-5 h-5 text-emerald-400" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-white">Discord Notifications</h2>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Configure a Discord channel to receive all GitHub events</p>
                  </motion.div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div 
                      className="relative p-6 rounded-2xl border border-white/10 bg-[#0d0d1a]/80 backdrop-blur-xl overflow-hidden group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <motion.div 
                        className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-bl-full"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.2, 0.3, 0.2],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      
                      <div className="relative space-y-6">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20"
                            animate={{ 
                              boxShadow: [
                                "0 0 20px rgba(99, 102, 241, 0.2)",
                                "0 0 40px rgba(99, 102, 241, 0.4)",
                                "0 0 20px rgba(99, 102, 241, 0.2)",
                              ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <MessageCircle className="w-6 h-6 text-indigo-400" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Discord Channel</h3>
                            <p className="text-sm text-gray-400">Webhook Configuration</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              onClick={() => setShowChannelSelector(true)}
                              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 relative overflow-hidden group"
                            >
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                              <Settings className="w-4 h-4 mr-2 relative z-10" />
                              <span className="relative z-10">Select Channel & Server</span>
                            </Button>
                          </motion.div>

                          <AnimatePresence>
                            {selectedChannel.channelId && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                              >
                                <p className="text-sm text-blue-400">
                                  ✓ Selected: <strong>#{selectedChannel.channelName}</strong>
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="space-y-2">
                            <Label htmlFor="webhook" className="text-gray-300">Webhook URL (Auto-generated)</Label>
                            <motion.div
                              whileFocus={{ scale: 1.01 }}
                              className="relative"
                            >
                              <Input
                                id="webhook"
                                type="password"
                                placeholder="https://discord.com/api/webhooks/..."
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                              />
                              <motion.div
                                className="absolute inset-0 rounded-md pointer-events-none border-2 border-transparent"
                                whileHover={{ borderColor: "rgba(99, 102, 241, 0.3)" }}
                              />
                            </motion.div>
                            <p className="text-xs text-gray-500">
                              Create a webhook: Server Settings → Integrations → Webhooks → New Webhook
                            </p>
                          </div>

                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              onClick={handleSaveWebhook}
                              disabled={savingWebhook || !webhookUrl}
                              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 disabled:opacity-50 relative overflow-hidden"
                            >
                              {savingWebhook ? (
                                <>
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                  </motion.div>
                                  Connecting...
                                </>
                              ) : (
                                <>
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    <Zap className="w-4 h-4 mr-2" />
                                  </motion.div>
                                  Connect Channel
                                </>
                              )}
                            </Button>
                          </motion.div>

                          <AnimatePresence>
                            {webhookMessage.text && (
                              <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                                  webhookMessage.type === "success"
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                                }`}
                              >
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 0.5 }}
                                >
                                  {webhookMessage.type === "success" ? (
                                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                  )}
                                </motion.div>
                                {webhookMessage.text}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="relative p-6 rounded-2xl border border-white/10 bg-[#0d0d1a]/80 backdrop-blur-xl overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <motion.div 
                        className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-bl-full"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.2, 0.3, 0.2],
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                      />
                      
                      <div className="relative space-y-6">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                            animate={{ 
                              boxShadow: [
                                "0 0 20px rgba(6, 182, 212, 0.2)",
                                "0 0 40px rgba(6, 182, 212, 0.4)",
                                "0 0 20px rgba(6, 182, 212, 0.2)",
                              ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Bell className="w-6 h-6 text-cyan-400" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Event Types</h3>
                            <p className="text-sm text-gray-400">Choose what to log</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {eventTypes.map((event, idx) => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                event.enabled 
                                  ? "border-white/20 bg-white/5" 
                                  : "border-white/5 bg-transparent"
                              }`}
                              whileHover={{ scale: 1.01, x: 5 }}
                            >
                              <div className="flex items-center gap-3">
                                <motion.div 
                                  className={`p-2 rounded-lg ${event.enabled ? "bg-white/10" : "bg-white/5"}`}
                                  animate={event.enabled ? { 
                                    boxShadow: [
                                      "0 0 10px rgba(6, 182, 212, 0.1)",
                                      "0 0 20px rgba(6, 182, 212, 0.2)",
                                      "0 0 10px rgba(6, 182, 212, 0.1)",
                                    ],
                                  } : {}}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  {event.icon}
                                </motion.div>
                                <div>
                                  <p className={`text-sm font-medium ${event.enabled ? "text-white" : "text-gray-400"}`}>
                                    {event.name}
                                  </p>
                                  <p className="text-xs text-gray-500">{event.description}</p>
                                </div>
                              </div>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Switch
                                  checked={event.enabled}
                                  onCheckedChange={() => toggleEventType(event.id)}
                                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-500 data-[state=checked]:to-blue-500"
                                />
                              </motion.div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div 
                    className="p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-xl relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.005 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5"
                      animate={{
                        opacity: [0, 0.5, 0],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
                      <div className="flex items-center gap-4">
                        <motion.div 
                          className={`p-3 rounded-xl ${
                            discordConnected 
                              ? "bg-gradient-to-br from-emerald-500/20 to-green-500/20" 
                              : "bg-gradient-to-br from-yellow-500/20 to-orange-500/20"
                          }`}
                          animate={{ 
                            boxShadow: discordConnected 
                              ? [
                                  "0 0 20px rgba(16, 185, 129, 0.2)",
                                  "0 0 40px rgba(16, 185, 129, 0.4)",
                                  "0 0 20px rgba(16, 185, 129, 0.2)",
                                ]
                              : [
                                  "0 0 20px rgba(234, 179, 8, 0.2)",
                                  "0 0 40px rgba(234, 179, 8, 0.4)",
                                  "0 0 20px rgba(234, 179, 8, 0.2)",
                                ],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {discordConnected ? (
                            <CheckCircle className="w-6 h-6 text-emerald-400" />
                          ) : (
                            <Clock className="w-6 h-6 text-yellow-400" />
                          )}
                        </motion.div>
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
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="outline"
                            className="border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 gap-2 backdrop-blur-sm"
                            onClick={() => window.open("https://discord.com/channels/@me", "_blank")}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open Discord
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="discord" className="mt-8">
                  <DiscordPanel 
                    serverId={selectedChannel.serverId || "1438479945667051622"} 
                    channelId={selectedChannel.channelId || "1438479946262777938"} 
                  />
                </TabsContent>
              </AnimatePresence>
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
