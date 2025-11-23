"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award } from "lucide-react"

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
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />
    return <Award className="w-4 h-4 text-muted-foreground" />
  }

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Spinner />
      </Card>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>No contributors yet. Be the first!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {leaderboard.map((entry, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className={`p-4 ${index < 3 ? 'border-primary/50 bg-primary/5' : ''} hover:border-primary/50 transition-all`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8">
                  {getMedalIcon(index)}
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={entry.users.avatar_url} alt={entry.users.username} />
                  <AvatarFallback>{entry.users.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{entry.users.name}</p>
                  <p className="text-sm text-muted-foreground truncate">@{entry.users.username}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{entry.xp} XP</p>
                <p className="text-xs text-muted-foreground">Level {entry.level}</p>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span>🔀 {entry.prs_opened} PRs</span>
              <span>✅ {entry.prs_merged} Merged</span>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
