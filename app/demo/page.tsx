
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Zap,
  MessageSquare,
  BarChart3,
  Github,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  GitPullRequest,
  Sparkles,
  Bot,
} from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-2" />
            Live Demo
          </Badge>
          <h1 className="text-5xl font-bold gradient-text">OpsCord in Action</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how AI-powered PR summaries and Discord integration streamline your workflow
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: GitPullRequest, label: "PRs Analyzed", value: "127", color: "text-blue-500" },
            { icon: Zap, label: "AI Summaries", value: "127", color: "text-yellow-500" },
            { icon: MessageSquare, label: "Discord Alerts", value: "342", color: "text-purple-500" },
            { icon: Users, label: "Active Users", value: "23", color: "text-green-500" },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <Card key={i} className="glass border-primary/20 card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* AI PR Summary Demo */}
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              AI-Powered PR Summary
            </CardTitle>
            <CardDescription>Google Gemini analyzes code changes and generates intelligent summaries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <div className="flex items-start gap-3 mb-3">
                <Github className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">PR #142: Add webhook retry mechanism</h3>
                  <p className="text-sm text-muted-foreground">by @developer • 2 hours ago</p>
                </div>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Open</Badge>
              </div>
              
              <Separator className="my-3" />
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">AI Summary</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                      This PR implements an exponential backoff retry mechanism for GitHub webhooks, improving reliability
                      when the Discord API is temporarily unavailable. The changes include a new queue system with
                      configurable retry attempts (default: 3) and automatic job cleanup after 24 hours.
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-white/5 dark:bg-black/20">
                    <p className="text-xs text-muted-foreground">Files Changed</p>
                    <p className="text-lg font-semibold">8 files</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 dark:bg-black/20">
                    <p className="text-xs text-muted-foreground">Additions</p>
                    <p className="text-lg font-semibold text-green-500">+234</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 dark:bg-black/20">
                    <p className="text-xs text-muted-foreground">Deletions</p>
                    <p className="text-lg font-semibold text-red-500">-67</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discord Integration */}
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              Discord Slash Commands
            </CardTitle>
            <CardDescription>Powerful commands to interact with your DevOps workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  command: "/summary",
                  description: "Get AI summary of latest PR",
                  example: "/summary #142",
                },
                {
                  command: "/stats",
                  description: "View your contribution statistics",
                  example: "/stats @username",
                },
                {
                  command: "/create-issue",
                  description: "Create GitHub issue from Discord",
                  example: '/create-issue "Fix bug" priority:high',
                },
                {
                  command: "/ping",
                  description: "Check bot status and latency",
                  example: "/ping",
                },
              ].map((cmd, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-purple-500" />
                    <code className="text-sm font-mono font-semibold text-purple-500">{cmd.command}</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{cmd.description}</p>
                  <code className="text-xs bg-white/5 dark:bg-black/20 px-2 py-1 rounded">{cmd.example}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Team Analytics
            </CardTitle>
            <CardDescription>Beautiful insights into your development workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* PR Timeline */}
              <div>
                <h3 className="text-sm font-medium mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {[
                    { type: "pr", title: "Merged PR #142", user: "@developer", time: "2h ago", status: "success" },
                    { type: "pr", title: "Opened PR #143", user: "@designer", time: "4h ago", status: "pending" },
                    { type: "issue", title: "Closed issue #89", user: "@tester", time: "6h ago", status: "success" },
                    { type: "pr", title: "Review requested #141", user: "@lead", time: "8h ago", status: "warning" },
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 dark:bg-black/20 hover:bg-white/10 dark:hover:bg-black/30 transition-all"
                    >
                      {activity.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {activity.status === "pending" && <Clock className="h-4 w-4 text-blue-500" />}
                      {activity.status === "warning" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard Preview */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-yellow-500" />
                  Top Contributors
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { rank: 1, name: "@developer", xp: 2450, badge: "🥇" },
                    { rank: 2, name: "@designer", xp: 1890, badge: "🥈" },
                    { rank: 3, name: "@tester", xp: 1720, badge: "🥉" },
                  ].map((user) => (
                    <div
                      key={user.rank}
                      className="p-3 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{user.badge}</span>
                        <span className="font-semibold">{user.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.xp} XP</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="glass border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to streamline your workflow?</h2>
            <p className="text-muted-foreground mb-6">Get started with OpsCord in minutes</p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/login">
                <Button size="lg" className="glow-button">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
