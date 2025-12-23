"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { FileText, CheckCircle, XCircle, HelpCircle, ArrowRightCircle } from "lucide-react"

interface Decision {
    id: string
    title: string
    description: string
    status: 'proposed' | 'accepted' | 'rejected' | 'implemented'
    tags: string[]
    created_at: string
}

export function DecisionFeed() {
    const [decisions, setDecisions] = useState<Decision[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDecisions = async () => {
            try {
                const res = await fetch('/api/decisions')
                if (res.ok) {
                    const data = await res.json()
                    setDecisions(data.decisions || [])
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchDecisions()
    }, [])

    if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>
    
    if (decisions.length === 0) {
        return (
            <div className="text-center p-12 text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No architectural decisions recorded yet.</p>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'accepted': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'implemented': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        }
    }

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'accepted': return <CheckCircle className="w-3 h-3" />
            case 'rejected': return <XCircle className="w-3 h-3" />
            case 'implemented': return <CheckCircle className="w-3 h-3" />
            default: return <HelpCircle className="w-3 h-3" />
        }
    }

    return (
        <div className="space-y-4">
            {decisions.map((decision, i) => (
                <motion.div
                    key={decision.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <Card className="p-4 bg-[#0d0d1a]/60 border-white/10 hover:border-white/20 transition-all flex gap-4">
                        <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center border ${getStatusColor(decision.status)} bg-opacity-10`}>
                             {getStatusIcon(decision.status)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-white font-semibold flex items-center gap-2">
                                        {decision.title}
                                        <Badge variant="outline" className={`capitalize text-[10px] px-2 py-0 h-5 ${getStatusColor(decision.status)}`}>
                                            {decision.status}
                                        </Badge>
                                    </h4>
                                    <div className="flex gap-2 mt-1">
                                        {decision.tags?.map(tag => (
                                            <span key={tag} className="text-xs text-gray-500 font-mono bg-white/5 px-1.5 rounded">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(decision.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {decision.description && (
                                <p className="text-gray-400 text-sm mt-2 leading-relaxed border-l-2 border-white/10 pl-3">
                                    {decision.description}
                                </p>
                            )}
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}
