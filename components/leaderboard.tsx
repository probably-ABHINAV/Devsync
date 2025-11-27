"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, Medal, Award, GitPullRequest, GitMerge, Users, TrendingUp, Crown, Star } from "lucide-react"

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

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/analytics/leaderboard?limit=10")
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-400" />
    if (index === 1) return <Medal className="w-5 h-5 text-gray-300" />
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />
    return null
  }

  const getRankGradient = (index: number) => {
    if (index === 0) return "from-yellow-500/20 via-amber-500/10 to-transparent border-yellow-500/40"
    if (index === 1) return "from-gray-400/15 via-slate-500/10 to-transparent border-gray-400/30"
    if (index === 2) return "from-amber-600/15 via-orange-500/10 to-transparent border-amber-600/30"
    return "from-white/5 to-transparent border-white/10"
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
      <Card className="p-8 flex items-center justify-center border-white/10 bg-white/5">
        <Spinner />
      </Card>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="p-12 text-center border-white/10 bg-white/5">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-400 font-medium">No contributors yet</p>
        <p className="text-gray-500 text-sm mt-1">Be the first to contribute!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <GitPullRequest className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Total PRs</span>
          </div>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {totalPRs}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <GitMerge className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Merged</span>
          </div>
          <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            {totalMerged}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-400">Merge Rate</span>
          </div>
          <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {calculateMergeRate(totalPRs, totalMerged)}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Contributors</span>
          </div>
          <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {leaderboard.length}
          </p>
        </motion.div>
      </div>

      {topContributor && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative p-5 rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-500/20 to-transparent rounded-bl-full" />
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-500/10 rounded-full blur-xl" />
          
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-50 blur"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Avatar className="w-14 h-14 ring-2 ring-yellow-500/50 relative">
                <AvatarImage src={topContributor.users.avatar_url} alt={topContributor.users.username} />
                <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-bold">
                  {topContributor.users.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-400 font-medium">Top Contributor</span>
              </div>
              <h3 className="text-lg font-bold text-white">{topContributor.users.name}</h3>
              <p className="text-sm text-gray-400">@{topContributor.users.username}</p>
            </div>
            
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {topContributor.xp}
              </p>
              <p className="text-xs text-gray-400">XP · Level {topContributor.level}</p>
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
            >
              <div className={`relative p-4 rounded-xl border bg-gradient-to-r ${getRankGradient(index)} overflow-hidden group hover:border-white/20 transition-all`}>
                {index < 3 && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
                )}
                
                <div className="relative flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      index === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-400 text-white" :
                      index === 1 ? "bg-gradient-to-br from-gray-300 to-slate-400 text-gray-800" :
                      index === 2 ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white" :
                      "bg-white/10 text-gray-400"
                    }`}>
                      {index < 3 ? getMedalIcon(index) : `#${index + 1}`}
                    </div>
                    
                    <Avatar className="w-10 h-10 ring-2 ring-white/10">
                      <AvatarImage src={entry.users.avatar_url} alt={entry.users.username} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-sm">
                        {entry.users.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                        {entry.users.name}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                        Lv.{entry.level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">@{entry.users.username}</p>
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                    <p className="text-lg font-bold text-cyan-400">{entry.xp}</p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-400">XP Progress</span>
                      <span className="text-gray-500">{Math.round(xpProgress)}% of top</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400 flex items-center gap-1">
                          <GitPullRequest className="w-3 h-3" /> PRs Opened
                        </span>
                        <span className="text-purple-400 font-medium">{entry.prs_opened}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400 flex items-center gap-1">
                          <GitMerge className="w-3 h-3" /> Merged
                        </span>
                        <span className="text-green-400 font-medium">{entry.prs_merged}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          mergeRate >= 80 ? "bg-green-400" : 
                          mergeRate >= 50 ? "bg-yellow-400" : 
                          "bg-red-400"
                        }`} />
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
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
