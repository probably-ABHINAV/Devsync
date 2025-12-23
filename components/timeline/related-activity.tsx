"use client"

import { useState, useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"
import { GitPullRequest, List, MessageCircle, ArrowRight, GitCommit } from "lucide-react"

interface RelatedActivityProps {
    activityId: string
}

interface LinkedEvent {
    id: string
    title: string
    source: 'github' | 'jira' | 'slack' | 'gitlab'
    type: string
    url?: string
}

export function RelatedActivity({ activityId }: RelatedActivityProps) {
    const [loading, setLoading] = useState(true)
    const [links, setLinks] = useState<LinkedEvent[]>([])

    useEffect(() => {
        const fetchGraph = async () => {
            if (!activityId) return
            setLoading(true)
            try {
                const res = await fetch(`/api/activities/links?id=${activityId}`)
                if (!res.ok) throw new Error('Failed to fetch links')
                const data = await res.json()
                setLinks(data.links || [])
            } catch (err) {
                console.error(err)
                setLinks([])
            } finally {
                setLoading(false)
            }
        }
        fetchGraph()
    }, [activityId])

    if (loading) return <div className="py-8 flex justify-center"><Spinner className="w-5 h-5 text-cyan-400" /></div>

    if (links.length === 0) return <div className="text-gray-500 text-sm text-center py-4">No related activity found.</div>

    return (
        <div className="space-y-4 px-1">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-purple-400" />
                Context Chain
            </h3>
            
            <div className="relative border-l-2 border-white/10 ml-3 pl-6 space-y-6">
                {links.map((link, i) => (
                    <div key={link.id} className="relative">
                        {/* Dot */}
                        <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-[#0d0d1a] ${
                            link.source === 'slack' ? 'bg-orange-400' :
                            link.source === 'jira' ? 'bg-blue-400' :
                            'bg-purple-400'
                        }`} />
                        
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                {link.source === 'slack' && <MessageCircle className="w-3 h-3 text-orange-400" />}
                                {link.source === 'jira' && <List className="w-3 h-3 text-blue-400" />}
                                {link.source === 'github' && <GitPullRequest className="w-3 h-3 text-purple-400" />}
                                <span className="text-[10px] uppercase font-bold text-gray-500">{link.source}</span>
                            </div>
                            <h4 className="text-sm text-white font-medium">{link.title}</h4>
                        </div>
                        
                        {i < links.length - 1 && (
                             <div className="absolute left-[50%] -bottom-4 transform -translate-x-1/2 opacity-20">
                                 {/* Arrow could go here if layout was horizontal */}
                             </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
