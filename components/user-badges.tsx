"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Badge {
  badges: {
    id: string
    name: string
    description: string
    icon: string
  }
  earned_at: string
}

interface UserStats {
  xp: number
  level: number
  prs_opened: number
  prs_merged: number
  prs_reviewed: number
  issues_created: number
  issues_closed: number
}

interface UserBadgesProps {
  userId?: string
}

export default function UserBadges({ userId }: UserBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchUserData()
    } else {
      setLoading(false)
    }
  }, [userId])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/analytics/stats?username=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setBadges(data.badges || [])
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Spinner />
      </Card>
    )
  }

  if (!userId) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>Sign in to view your badges and stats!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.level}</p>
              <p className="text-sm text-muted-foreground">Level</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">{stats.xp}</p>
              <p className="text-sm text-muted-foreground">XP</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{stats.prs_merged}</p>
              <p className="text-sm text-muted-foreground">PRs Merged</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{stats.prs_reviewed}</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
          </div>
        </Card>
      )}

      {/* Badges */}
      <div>
        <h3 className="text-lg font-semibold mb-4">🏆 Your Badges</h3>
        {badges.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No badges earned yet. Keep contributing to unlock achievements!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <TooltipProvider>
              {badges.map((badge, index) => (
                <Tooltip key={badge.badges.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 text-center hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                        <div className="text-4xl mb-2">{badge.badges.icon}</div>
                        <p className="text-sm font-medium text-foreground">{badge.badges.name}</p>
                      </Card>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{badge.badges.name}</p>
                    <p className="text-sm text-muted-foreground">{badge.badges.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Earned: {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  )
}
