"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ThumbsUp, ThumbsDown, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"

interface AISummaryCardProps {
    type: 'daily' | 'incident' | 'context'
    title: string
    content: string
    confidence: number
    onFeedback?: (useful: boolean) => void
}

export function AISummaryCard({ type, title, content, confidence, onFeedback }: AISummaryCardProps) {
    const [feedback, setFeedback] = useState<'useful' | 'not-useful' | null>(null)
    const [collapsed, setCollapsed] = useState(false)

    const handleFeedback = (val: 'useful' | 'not-useful') => {
        setFeedback(val)
        onFeedback?.(val === 'useful')
    }

    const getTheme = () => {
        switch (type) {
            case 'incident': return { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle, color: 'text-red-400' }
            case 'daily': return { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Sparkles, color: 'text-purple-400' }
            default: return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: Sparkles, color: 'text-cyan-400' }
        }
    }

    const theme = getTheme()
    const Icon = theme.icon

    return (
        <Card className={`relative overflow-hidden border ${theme.border} bg-[#0d0d1a]`}>
            {/* Background Mesh Gradient */}
            <div className={`absolute inset-0 opacity-10 ${theme.bg}`} />
            
            <div className="relative p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme.bg} ${theme.color}`}>
                             <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white text-sm">{title}</h4>
                            <div className="flex items-center gap-2 text-xs">
                                <Badge variant="secondary" className="h-5 px-1 bg-white/10 text-gray-300 border-0">
                                    AI Insight
                                </Badge>
                                <span className={`font-mono ${confidence > 0.8 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                    {Math.round(confidence * 100)}% confidence
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-gray-300 leading-relaxed space-y-2">
                    <p>{content}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Was this helpful?</span>
                        <div className="flex gap-1">
                            <Button 
                                size="sm" variant="ghost" 
                                className={`h-7 w-7 p-0 rounded-full ${feedback === 'useful' ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-400 hover:text-white'}`}
                                onClick={() => handleFeedback('useful')}
                            >
                                <ThumbsUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                                size="sm" variant="ghost" 
                                className={`h-7 w-7 p-0 rounded-full ${feedback === 'not-useful' ? 'text-red-400 bg-red-500/10' : 'text-gray-400 hover:text-white'}`}
                                onClick={() => handleFeedback('not-useful')}
                            >
                                <ThumbsDown className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                    
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-gray-500 hover:text-white">
                        <RefreshCw className="w-3 h-3 mr-1.5" /> Regenerate
                    </Button>
                </div>
            </div>
        </Card>
    )
}
