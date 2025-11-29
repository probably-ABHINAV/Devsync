'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Sparkles, TrendingUp, Flame, Target } from 'lucide-react'

interface Insights {
  most_active_repo: string | null
  activity_trend: string
  top_activity_type: string | null
  streak: number
  recommendations: string[]
  total_count: number
}

export default function ActivityInsights() {
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/analytics/activity-insights')
      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights)
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !insights) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Streak Card */}
        <Card className="p-4 border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 rounded-lg bg-orange-500/20"
            >
              <Flame className="w-5 h-5 text-orange-400" />
            </motion.div>
            <div>
              <p className="text-sm text-gray-400">Current Streak</p>
              <p className="text-2xl font-bold text-white">{insights.streak} days</p>
            </div>
          </div>
        </Card>

        {/* Trend Card */}
        <Card className="p-4 border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-2 rounded-lg bg-cyan-500/20"
            >
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </motion.div>
            <div>
              <p className="text-sm text-gray-400">Activity Trend</p>
              <p className="text-2xl font-bold text-white capitalize">{insights.activity_trend}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Activity Type */}
      {insights.top_activity_type && (
        <Card className="p-4 border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 rounded-lg bg-purple-500/20"
            >
              <Target className="w-5 h-5 text-purple-400" />
            </motion.div>
            <div>
              <p className="text-sm text-gray-400">Top Activity</p>
              <p className="text-lg font-bold text-white capitalize">{insights.top_activity_type.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="p-4 border-white/10 bg-[#0d0d1a]/80">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <p className="font-semibold text-white">Recommendations</p>
        </div>
        <div className="space-y-2">
          {insights.recommendations.map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="text-sm text-gray-300 flex items-start gap-2"
            >
              <span className="text-cyan-400 mt-1">→</span>
              <span>{rec}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
