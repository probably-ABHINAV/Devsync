"use client"

import { Activity } from "@/components/activity-feed"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Github, MessageCircle, Activity as ActivityIcon, GitPullRequest, GitCommit, List, ExternalLink } from "lucide-react"

interface TimelineItemProps {
    activity: Activity
    onClick: () => void
}

const SOURCE_ICONS: Record<string, any> = {
    github: Github,
    slack: MessageCircle,
    jira: List,
    gitlab: GitPullRequest, // Using PR icon for GitLab generic
}

const SOURCE_COLORS: Record<string, string> = {
    github: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    slack: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    jira: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    gitlab: "text-orange-600 bg-orange-600/10 border-orange-600/20",
}

export function TimelineItem({ activity, onClick }: TimelineItemProps) {
    const Icon = SOURCE_ICONS[activity.source] || ActivityIcon
    const colorClass = SOURCE_COLORS[activity.source] || "text-gray-400 bg-gray-500/10 border-gray-500/20"

    // Parse description for regex links only for display (basic) 
    // Ideally we reuse the robust logic from ActivityFeed, but let's keep this clean for now
    // We will just show truncated description.
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.03)" }}
            onClick={onClick}
            className="group cursor-pointer relative p-4 rounded-xl border border-white/5 bg-[#0d0d1a] hover:border-cyan-500/30 transition-all duration-300"
        >
            <div className="flex items-start gap-4">
                {/* Icon Column */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-white truncate text-sm flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                            {activity.title}
                            {/* Metadata Badges */}
                            {activity.activity_type && (
                                <Badge variant="secondary" className="text-[10px] h-4 bg-white/5 text-gray-500 font-normal px-1.5 border-0">
                                    {activity.activity_type}
                                </Badge>
                            )}
                        </h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap font-mono">
                            {new Date(activity.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-2 font-mono flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                        {activity.repo_name}
                        {activity.actor_username && (
                            <>
                                <span className="opacity-30">/</span>
                                <span className="text-gray-400">@{activity.actor_username}</span>
                            </>
                        )}
                    </p>

                   {activity.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                            {activity.description}
                        </p>
                    )}
                </div>

                 {/* Chevron / Action Hint */}
                 <div className="flex-shrink-0 self-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-500">
                      <ExternalLink className="w-4 h-4" />
                 </div>
            </div>
            
            {/* Attention Score Indicator Line at bottom */}
            {activity.attention_score > 0 && (
                <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent group-hover:via-cyan-500/50" />
            )}
        </motion.div>
    )
}
