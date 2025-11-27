"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, AlertCircle, TrendingUp, Target, Zap } from "lucide-react"
import { useState } from "react"

interface Phase {
  version: string
  status: "complete" | "in-progress" | "planned"
  timeline: string
  effort?: string
  description: string
  features: Feature[]
  color: string
}

interface Feature {
  name: string
  completed: boolean
  category: string
}

const roadmapPhases: Phase[] = [
  {
    version: "v1.0",
    status: "complete",
    timeline: "November 2025",
    description: "Core integrations and gamification",
    color: "from-green-500 to-emerald-600",
    features: [
      { name: "GitHub OAuth + repository integration", completed: true, category: "Core" },
      { name: "Discord webhook notifications", completed: true, category: "Core" },
      { name: "AI PR summarization (Gemini)", completed: true, category: "AI" },
      { name: "Gamification (XP, badges, leaderboards)", completed: true, category: "Gamification" },
      { name: "Real-time activity feed", completed: true, category: "Core" },
      { name: "Analytics dashboard", completed: true, category: "Analytics" },
    ],
  },
  {
    version: "v1.1",
    status: "planned",
    timeline: "December 2025",
    effort: "2 weeks",
    description: "Enhanced stability and performance",
    color: "from-blue-500 to-cyan-600",
    features: [
      { name: "Performance optimization", completed: false, category: "Infrastructure" },
      { name: "Database query optimization", completed: false, category: "Database" },
      { name: "Error handling improvements", completed: false, category: "Infrastructure" },
      { name: "Security audit and fixes", completed: false, category: "Security" },
      { name: "Webhook retry logic", completed: false, category: "Reliability" },
    ],
  },
  {
    version: "v2.0",
    status: "planned",
    timeline: "Q1 2026",
    effort: "8 weeks",
    description: "Advanced AI & background jobs",
    color: "from-purple-500 to-pink-600",
    features: [
      { name: "Issue auto-classification", completed: false, category: "AI" },
      { name: "Release notes generator", completed: false, category: "AI" },
      { name: "CI failure RCA", completed: false, category: "AI" },
      { name: "BullMQ job queue", completed: false, category: "Infrastructure" },
      { name: "Admin dashboard", completed: false, category: "Dashboard" },
      { name: "Extended analytics", completed: false, category: "Analytics" },
      { name: "Enhanced Discord commands", completed: false, category: "Discord" },
      { name: "RBAC & multi-tenancy", completed: false, category: "Security" },
    ],
  },
  {
    version: "v3.0",
    status: "planned",
    timeline: "Q2-Q3 2026",
    effort: "12 weeks",
    description: "ML & advanced automation",
    color: "from-orange-500 to-red-600",
    features: [
      { name: "Automated code review", completed: false, category: "AI" },
      { name: "Auto-approval system", completed: false, category: "Automation" },
      { name: "Failure prediction model", completed: false, category: "ML" },
      { name: "Anomaly detection", completed: false, category: "ML" },
      { name: "Conversational DevOps bot", completed: false, category: "AI" },
      { name: "GitLab support", completed: false, category: "Integrations" },
      { name: "Slack integration", completed: false, category: "Integrations" },
    ],
  },
  {
    version: "v4.0",
    status: "planned",
    timeline: "Q4 2026",
    effort: "16 weeks",
    description: "SaaS platform & marketplace",
    color: "from-indigo-500 to-blue-600",
    features: [
      { name: "Multi-tenant architecture", completed: false, category: "SaaS" },
      { name: "Subscription plans & Stripe", completed: false, category: "Billing" },
      { name: "Multi-cloud support", completed: false, category: "Infrastructure" },
      { name: "Kubernetes integration", completed: false, category: "Infrastructure" },
      { name: "Public REST API", completed: false, category: "API" },
      { name: "GraphQL API", completed: false, category: "API" },
      { name: "Plugin marketplace", completed: false, category: "Extensibility" },
    ],
  },
]

const successMetrics = [
  { label: "Monthly Active Teams", target: "1,000+", icon: "👥" },
  { label: "Paying Customers", target: "100+", icon: "💰" },
  { label: "API Uptime", target: "99.9%", icon: "⚡" },
  { label: "User Rating", target: "4.5+", icon: "⭐" },
]

const riskItems = [
  { type: "Technical", items: ["Redis complexity", "AI cost optimization", "Data privacy (GDPR/SOC2)"] },
  { type: "Market", items: ["GitHub Actions competition", "Platform API changes", "User adoption"] },
]

export default function RoadmapView() {
  const [selectedPhase, setSelectedPhase] = useState<string>("v1.0")

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="space-y-8">
      {/* Timeline Header */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Product Roadmap</h2>
        <p className="text-muted-foreground">Evolution from MVP to enterprise SaaS platform</p>
      </motion.div>

      {/* Timeline Visualization */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        {roadmapPhases.map((phase, idx) => (
          <motion.div key={phase.version} variants={itemVariants}>
            <div
              className="cursor-pointer transition-all duration-300"
              onClick={() => setSelectedPhase(phase.version)}
            >
              <Card
                className={`p-5 border-l-4 transition-all hover:shadow-lg ${
                  selectedPhase === phase.version
                    ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                    : "border-l-gray-400 hover:border-l-accent"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {phase.status === "complete" && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                      {phase.status === "in-progress" && (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                          <Circle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        </motion.div>
                      )}
                      {phase.status === "planned" && (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <h3 className="text-lg font-bold text-foreground">{phase.version}</h3>
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs ${
                          phase.status === "complete"
                            ? "bg-green-500/10 text-green-700 border-green-300"
                            : phase.status === "in-progress"
                              ? "bg-yellow-500/10 text-yellow-700 border-yellow-300"
                              : "bg-gray-500/10 text-gray-700 border-gray-300"
                        }`}
                      >
                        {phase.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">📅 {phase.timeline}</span>
                      {phase.effort && <span className="flex items-center gap-1">⏱️ {phase.effort}</span>}
                      <span className="flex items-center gap-1">📦 {phase.features.length} features</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Expanded Details */}
            {selectedPhase === phase.version && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3">
                <Card className="p-5 bg-card/50 border-accent/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {phase.features.map((feature, fIdx) => (
                      <motion.div
                        key={fIdx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: fIdx * 0.05 }}
                        className="flex items-start gap-2 p-2 rounded hover:bg-accent/5 transition-colors"
                      >
                        <div className="mt-1 flex-shrink-0">
                          {feature.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${feature.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {feature.name}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1 w-fit">
                            {feature.category}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Success Metrics */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-accent" />
          <h3 className="text-xl font-bold text-foreground">2026 Success Criteria</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {successMetrics.map((metric, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="p-4 text-center border-accent/30 hover:border-accent/50 transition-colors">
                <div className="text-3xl mb-2">{metric.icon}</div>
                <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {metric.target}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{metric.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Risks & Mitigation */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <h3 className="text-xl font-bold text-foreground">Known Risks & Mitigation</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskItems.map((risk, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="p-4 border-orange-500/20 bg-orange-500/5">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  {risk.type} Risks
                </h4>
                <ul className="space-y-2">
                  {risk.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Key Milestones */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          <h3 className="text-xl font-bold text-foreground">Key Milestones</h3>
        </div>
        <Card className="p-6 border-accent/30 bg-gradient-to-br from-accent/5 via-transparent to-primary/5">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border/30">
              <span className="text-foreground font-medium">Nov 2025</span>
              <span className="text-sm text-accent">✓ v1.0 Launch</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-border/30">
              <span className="text-foreground font-medium">Dec 2025</span>
              <span className="text-sm text-muted-foreground">→ v1.1 Stability</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-border/30">
              <span className="text-foreground font-medium">Q1 2026</span>
              <span className="text-sm text-muted-foreground">→ v2.0 Enterprise AI</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-border/30">
              <span className="text-foreground font-medium">Q2-Q3 2026</span>
              <span className="text-sm text-muted-foreground">→ v3.0 ML Intelligence</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium">Q4 2026</span>
              <span className="text-sm text-muted-foreground">→ v4.0 SaaS Platform</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
