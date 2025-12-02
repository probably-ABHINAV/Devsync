"use client"

import { useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, Medal, Award, GitPullRequest, GitMerge, Users, TrendingUp, Crown, Star, Sparkles, Zap } from "lucide-react"
import { useRef } from "react"

interface LeaderboardEntry {
  users: {
    username: string
    avatar_url: string
    name: string
  }
  xp: number
  level: number
  prs_opened: number
  prs_merged: number
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

function AnimatedStatMini({ value, icon: Icon, label, gradient, delay, inView }: { 
  value: number, 
  icon: any, 
  label: string, 
  gradient: string,
  delay: number,
  inView: boolean
}) {
  const count = useCounter(value, 1500, true)
  
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.03, y: -3 }}
      className="relative p-4 rounded-xl border border-white/10 bg-[#0d0d1a]/80 backdrop-blur-xl overflow-hidden group"
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            animate={{ 
              scale: [1, 1.15, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, delay }}
          >
            <Icon className={`w-4 h-4 ${gradient.includes('purple') ? 'text-purple-400' : gradient.includes('green') ? 'text-green-400' : gradient.includes('cyan') ? 'text-cyan-400' : 'text-yellow-400'}`} />
          </motion.div>
          <span className="text-xs text-gray-400">{label}</span>
        </div>
        <motion.p 
          className="text-2xl font-bold text-white"
        >
          {count}
        </motion.p>
      </div>
    </motion.div>
  )
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { once: false, margin: "-50px" }) || true

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/analytics/leaderboard?limit=10")
      const data = await response.json()
      console.log("Leaderboard response:", data)
      
      if (response.ok) {
        const leaderboardData = data.leaderboard || []
        console.log("Setting leaderboard with", leaderboardData.length, "entries")
        setLeaderboard(leaderboardData)
      } else {
        console.error("Leaderboard API error:", data)
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Crown className="w-4 h-4 text-yellow-400" />
    if (index === 1) return <Medal className="w-4 h-4 text-gray-300" />
    if (index === 2) return <Medal className="w-4 h-4 text-amber-600" />
    return null
  }

  const getRankGradient = (index: number) => {
    if (index === 0) return "from-yellow-500/20 via-amber-500/10 to-transparent border-yellow-500/40"
    if (index === 1) return "from-gray-400/15 via-slate-500/10 to-transparent border-gray-400/30"
    if (index === 2) return "from-amber-600/15 via-orange-500/10 to-transparent border-amber-600/30"
    return "from-white/5 to-transparent border-white/10"
  }

  const getRankShadow = (index: number) => {
    if (index === 0) return "0 0 30px rgba(234, 179, 8, 0.3)"
    if (index === 1) return "0 0 20px rgba(156, 163, 175, 0.2)"
    if (index === 2) return "0 0 20px rgba(217, 119, 6, 0.2)"
    return "none"
  }

  const calculateMergeRate = (opened: number, merged: number) => {
    if (opened === 0) return 0
    return Math.round((merged / opened) * 100)
  }

  const totalPRs = leaderboard.reduce((sum, e) => sum + e.prs_opened, 0)
  const totalMerged = leaderboard.reduce((sum, e) => sum + e.prs_merged, 0)
  const topContributor = leaderboard[0]
  const maxXP = leaderboard[0]?.xp || 1

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

  if (leaderboard.length === 0) {
    return (
      <Card className="p-12 text-center border-white/10 bg-[#0d0d1a]/80 backdrop-blur-xl">
        <motion.div 
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center"
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(234, 179, 8, 0.2)",
              "0 0 40px rgba(234, 179, 8, 0.4)",
              "0 0 20px rgba(234, 179, 8, 0.2)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            animate={{ y: [0, -5, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-8 h-8 text-gray-400" />
          </motion.div>
        </motion.div>
        <p className="text-gray-400 font-medium">No contributors yet</p>
        <p className="text-gray-500 text-sm mt-1">Be the first to contribute!</p>
      </Card>
    )
  }

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AnimatedStatMini 
          value={totalPRs} 
          icon={GitPullRequest} 
          label="Total PRs" 
          gradient="from-purple-500/10 to-pink-500/10"
          delay={0}
          inView={inView}
        />
        <AnimatedStatMini 
          value={totalMerged} 
          icon={GitMerge} 
          label="Merged" 
          gradient="from-green-500/10 to-emerald-500/10"
          delay={0.05}
          inView={inView}
        />
        <AnimatedStatMini 
          value={calculateMergeRate(totalPRs, totalMerged)} 
          icon={TrendingUp} 
          label="Merge Rate" 
          gradient="from-cyan-500/10 to-blue-500/10"
          delay={0.1}
          inView={inView}
        />
        <AnimatedStatMini 
          value={leaderboard.length} 
          icon={Users} 
          label="Contributors" 
          gradient="from-yellow-500/10 to-orange-500/10"
          delay={0.15}
          inView={inView}
        />
      </div>

      {topContributor && (
        <motion.div
          initial={{ opacity: 1, scale: 1, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.02 }}
          className="relative p-5 rounded-2xl border border-yellow-500/30 bg-[#0d0d1a]/80 backdrop-blur-xl overflow-hidden"
          style={{
            boxShadow: "0 0 40px rgba(234, 179, 8, 0.15)",
          }}
        >
          <motion.div 
            className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-yellow-500/20 to-transparent rounded-bl-full"
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(234, 179, 8, 0.05) 50%, transparent 60%)",
              backgroundSize: "200% 100%",
            }}
            animate={{
              backgroundPosition: ["200% 0%", "-200% 0%"],
            }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-50 blur-md"
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Avatar className="w-16 h-16 ring-2 ring-yellow-500/50 relative">
                <AvatarImage src={topContributor.users.avatar_url} alt={topContributor.users.username} />
                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-bold text-lg">
                  {topContributor.users.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <motion.div 
                className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-4 h-4 text-white" />
              </motion.div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-4 h-4 text-yellow-400" />
                </motion.div>
                <span className="text-xs text-yellow-400 font-medium">Top Contributor</span>
              </div>
              <h3 className="text-lg font-bold text-white">{topContributor.users.name}</h3>
              <p className="text-sm text-gray-400">@{topContributor.users.username}</p>
            </div>
            
            <div className="text-right">
              <motion.p 
                className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(234, 179, 8, 0.3)",
                    "0 0 40px rgba(234, 179, 8, 0.5)",
                    "0 0 20px rgba(234, 179, 8, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {topContributor.xp}
              </motion.p>
              <div className="flex items-center gap-1 justify-end">
                <Zap className="w-3 h-3 text-yellow-400" />
                <p className="text-xs text-gray-400">XP · Level {topContributor.level}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {leaderboard.map((entry, index) => {
          const mergeRate = calculateMergeRate(entry.prs_opened, entry.prs_merged)
          const xpProgress = (entry.xp / maxXP) * 100
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.05, type: "spring", stiffness: 100 }}
              whileHover={{ x: 8, scale: 1.01 }}
            >
              <div 
                className={`relative p-4 rounded-xl border bg-gradient-to-r ${getRankGradient(index)} bg-[#0d0d1a]/60 backdrop-blur-xl overflow-hidden group hover:border-white/20 transition-all`}
                style={{ boxShadow: getRankShadow(index) }}
              >
                {index < 3 && (
                  <motion.div 
                    className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  />
                )}
                
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                />
                
                <div className="relative flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                        index === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-lg shadow-yellow-500/30" :
                        index === 1 ? "bg-gradient-to-br from-gray-300 to-slate-400 text-gray-800 shadow-lg shadow-gray-400/20" :
                        index === 2 ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20" :
                        "bg-white/10 text-gray-400"
                      }`}
                      whileHover={{ scale: 1.15, rotate: index < 3 ? 10 : 0 }}
                      animate={index < 3 ? {
                        scale: [1, 1.05, 1],
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                    >
                      {index < 3 ? getMedalIcon(index) : `#${index + 1}`}
                    </motion.div>
                    
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.1 }}
                    >
                      {index < 3 && (
                        <motion.div
                          className={`absolute -inset-1 rounded-full blur-md ${
                            index === 0 ? "bg-yellow-500/30" :
                            index === 1 ? "bg-gray-400/20" :
                            "bg-amber-500/20"
                          }`}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        />
                      )}
                      <Avatar className="w-11 h-11 ring-2 ring-white/10 relative">
                        <AvatarImage src={entry.users.avatar_url} alt={entry.users.username} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-sm">
                          {entry.users.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                        {entry.users.name}
                      </p>
                      <motion.span 
                        className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400 flex items-center gap-1"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        Lv.{entry.level}
                      </motion.span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">@{entry.users.username}</p>
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                    <motion.p 
                      className="text-lg font-bold text-cyan-400"
                      animate={{ 
                        textShadow: [
                          "0 0 10px rgba(6, 182, 212, 0.2)",
                          "0 0 20px rgba(6, 182, 212, 0.4)",
                          "0 0 10px rgba(6, 182, 212, 0.2)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                    >
                      {entry.xp}
                    </motion.p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-400">XP Progress</span>
                      <span className="text-gray-500">{Math.round(xpProgress)}% of top</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full relative overflow-hidden"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${xpProgress}%` } : {}}
                        transition={{ delay: 0.3 + index * 0.05, duration: 0.8, ease: "easeOut" }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400 flex items-center gap-1">
                          <GitPullRequest className="w-3 h-3" /> PRs Opened
                        </span>
                        <motion.span 
                          className="text-purple-400 font-medium"
                          whileHover={{ scale: 1.2 }}
                        >
                          {entry.prs_opened}
                        </motion.span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400 flex items-center gap-1">
                          <GitMerge className="w-3 h-3" /> Merged
                        </span>
                        <motion.span 
                          className="text-green-400 font-medium"
                          whileHover={{ scale: 1.2 }}
                        >
                          {entry.prs_merged}
                        </motion.span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <motion.div 
                          className={`w-2 h-2 rounded-full ${
                            mergeRate >= 80 ? "bg-green-400" : 
                            mergeRate >= 50 ? "bg-yellow-400" : 
                            "bg-red-400"
                          }`}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className={`text-xs font-medium ${
                          mergeRate >= 80 ? "text-green-400" : 
                          mergeRate >= 50 ? "text-yellow-400" : 
                          "text-red-400"
                        }`}>
                          {mergeRate}% merged
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    background: index === 0 
                      ? "linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.5), transparent)"
                      : index === 1 
                      ? "linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.5), transparent)"
                      : index === 2
                      ? "linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.5), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3), transparent)",
                  }}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
