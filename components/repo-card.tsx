"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ExternalLink, GitFork, Star } from "lucide-react"

interface RepoCardProps {
  repo: {
    name: string
    description: string | null
    url: string
    stars: number
    language: string | null
    openIssues: number
    openPRs: number
  }
}

export default function RepoCard({ repo }: RepoCardProps) {
  return (
    <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 10 }}>
      <Card className="relative h-full p-6 border-border/30 bg-card/40 backdrop-blur-sm hover:border-accent/50 hover:bg-card/60 transition-all duration-300 group overflow-hidden">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <motion.h3
                className="font-semibold text-lg text-foreground truncate group-hover:text-accent transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {repo.name}
              </motion.h3>
              {repo.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{repo.description}</p>
              )}
            </div>
            <motion.a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors flex-shrink-0"
              whileHover={{ scale: 1.2, rotate: 45 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-5 h-5" />
            </motion.a>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {repo.language && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                {repo.language}
              </Badge>
            )}
            {repo.stars > 0 && (
              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30 flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {repo.stars}
              </Badge>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <motion.div
              className="p-3 rounded-lg bg-card/50 border border-border/30 text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <p className="text-xs text-muted-foreground mb-1">Issues</p>
              <p className="text-xl font-bold text-accent">{repo.openIssues}</p>
            </motion.div>
            <motion.div
              className="p-3 rounded-lg bg-card/50 border border-border/30 text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                <GitFork className="w-3 h-3" /> PRs
              </p>
              <p className="text-xl font-bold text-primary">{repo.openPRs}</p>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
