"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Check, Clock, AlertTriangle, MessageSquare, Zap } from "lucide-react"

interface Activity {
    id: string
    title: string
    description: string
    source: string
    attention_score: number
    created_at: string
}

export function AttentionInbox() {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInbox = async () => {
            try {
                // Fetch events with high attention score only
                const res = await fetch('/api/analytics/activity?limit=20') // In real app, filtered by score > 50
                if (res.ok) {
                    const data = await res.json()
                    // Filter in frontend for now to demonstrate logic
                    const highPriority = (data.activities || []).filter((a: Activity) => (a.attention_score || 0) > 40)
                    setActivities(highPriority)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchInbox()
    }, [])

    const handleDismiss = (id: string) => {
        setActivities(prev => prev.filter(a => a.id !== id))
        // In real app: Call API to mark as read/archived
    }

    if (loading) return <div className="p-12 flex justify-center"><Spinner className="w-6 h-6 text-cyan-400" /></div>

    if (activities.length === 0) {
        return (
            <div className="text-center p-16 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Inbox Zero</h3>
                <p>You're all caught up on high-priority items!</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 max-w-3xl mx-auto">
             <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-400" />
                    Attention Inbox
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        {activities.length}
                    </Badge>
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setActivities([])} className="text-xs text-gray-400 hover:text-white">
                    Mark all as read
                </Button>
            </div>

            <AnimatePresence mode="popLayout">
                {activities.map((activity) => (
                    <motion.div
                        key={activity.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="group relative"
                    >
                        <Card className="p-4 bg-[#0d0d1a] border-white/10 hover:border-cyan-500/30 transition-colors">
                            <div className="flex gap-4">
                                <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                                    activity.attention_score > 70 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-orange-400'
                                }`} />
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="text-white font-medium truncate pr-4">{activity.title}</h4>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                <Badge variant="outline" className="capitalize text-[10px] h-5 px-1.5 border-white/10 text-gray-400">
                                                    {activity.source}
                                                </Badge>
                                                <span>•</span>
                                                <span>{new Date(activity.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-bold ${
                                                activity.attention_score > 70 ? 'text-red-400' : 'text-orange-400'
                                            }`}>
                                                {activity.attention_score}
                                            </div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Score</div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                                        {activity.description}
                                    </p>
                                </div>
                            </div>

                            {/* Actions Overlay */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="h-8 w-8 p-0 rounded-full bg-white/10 hover:bg-white/20"
                                    onClick={() => handleDismiss(activity.id)}
                                    title="Mark as Done"
                                >
                                    <Check className="w-4 h-4" />
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="h-8 w-8 p-0 rounded-full bg-white/10 hover:bg-white/20"
                                    title="Snooze"
                                >
                                    <Clock className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
