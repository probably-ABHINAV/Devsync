"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import RepoCard from "./repo-card"
import DiscordConfig from "./discord-config"
import ActivityFeed from "./activity-feed"
import Leaderboard from "./leaderboard"
import UserBadges from "./user-badges"
import { LogOut, Github, MessageCircle, Gauge, Activity, Trophy, Award, Settings } from "lucide-react"

interface Repo {
  id: number
  name: string
  description: string | null
  url: string
  stars: number
  language: string | null
  openIssues: number
  openPRs: number
}

interface User {
  login: string
  avatar_url: string
  name: string
}

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [discordConnected, setDiscordConnected] = useState(false)

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 border-b border-border/10 bg-background/40 backdrop-blur-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-lg blur opacity-75" />
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Gauge className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Opscord
              </span>
              <p className="text-xs text-muted-foreground">GitHub × Discord</p>
            </div>
            <div className="flex items-center gap-3 ml-6 pl-6 border-l border-border/20">
              <img
                src={user.avatar_url || "/placeholder.svg"}
                alt={user.login}
                className="w-9 h-9 rounded-full border border-border/50 hover:border-accent/50 transition-colors"
              />
              <div className="hidden sm:block">
                <h1 className="font-semibold text-sm text-foreground">{user.name}</h1>
                <p className="text-xs text-muted-foreground">@{user.login}</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-border/50 bg-transparent hover:bg-accent/5 hover:border-accent/50 gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Stats Overview */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: "Repositories", value: repos.length, icon: Github, color: "from-primary" },
              {
                label: "Open Issues",
                value: repos.reduce((sum, r) => sum + r.openIssues, 0),
                icon: null,
                color: "from-accent",
              },
              {
                label: "Discord Status",
                value: discordConnected ? "Connected" : "Not Connected",
                icon: MessageCircle,
                color: "from-primary",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                className="group relative p-6 rounded-xl border border-border/30 bg-gradient-to-br from-card/50 to-background/50 backdrop-blur-sm hover:border-accent/50 hover:from-card/80 transition-all duration-300 overflow-hidden"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    {stat.icon && <stat.icon className="w-4 h-4" />}
                    {stat.label}
                  </p>
                  <p
                    className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${stat.color} to-accent bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
                <TabsTrigger value="overview" className="gap-2">
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">Your Repositories</h2>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Spinner />
                  </div>
                ) : repos.length === 0 ? (
                  <Card className="p-12 text-center border-border/30 bg-card/40">
                    <p className="text-muted-foreground">No repositories found</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {repos.map((repo) => (
                      <RepoCard key={repo.id} repo={repo} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">Activity Timeline</h2>
                <p className="text-muted-foreground">Track your recent contributions and events</p>
                <ActivityFeed />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-6">Team Analytics</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Leaderboard
                      </h3>
                      <Leaderboard />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        Your Progress
                      </h3>
                      <UserBadges userId={user.login} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">Settings</h2>
                <DiscordConfig
                  onConnected={() => {
                    setDiscordConnected(true)
                    checkDiscordStatus()
                  }}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
