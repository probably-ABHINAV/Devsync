"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, GitBranch, Github, MessageSquare, BarChart3, Eye, ArrowLeft } from "lucide-react"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-2xl font-bold gradient-text">Opscord</div>
          </Link>
          <div className="flex gap-4">
            <Link href="/demo/admin">
              <Button variant="ghost">Admin Panel</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Preview Mode</span>
          </div>
          <h1 className="text-5xl font-bold">Explore Opscord</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            See all the features and capabilities of Opscord in action
          </p>
        </div>

        {/* Features Grid */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold">Feature Showcase</h2>

          {/* Row 1 */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass border-primary/20 card-hover group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary group-hover:text-secondary transition-colors" />
                  AI PR Summarizer
                </CardTitle>
                <CardDescription>Intelligent pull request analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">GPT-4o powered summaries including:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Code changes overview</li>
                    <li>Key insights</li>
                    <li>Risk assessment</li>
                    <li>Recommendations</li>
                  </ul>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  Automated
                </Badge>
              </CardContent>
            </Card>

            <Card className="glass border-primary/20 card-hover group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5 text-secondary group-hover:text-accent transition-colors" />
                  GitHub Integration
                </CardTitle>
                <CardDescription>Real-time repository webhooks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Connect & automate:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Multiple repositories</li>
                    <li>PR & Issue tracking</li>
                    <li>Deployment events</li>
                    <li>Webhook signatures</li>
                  </ul>
                </div>
                <Badge variant="outline" className="bg-secondary/10">
                  Connected
                </Badge>
              </CardContent>
            </Card>

            <Card className="glass border-primary/20 card-hover group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-accent group-hover:text-primary transition-colors" />
                  Discord Bot
                </CardTitle>
                <CardDescription>Slash commands & notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Smart Discord integration:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Slash commands</li>
                    <li>Rich embeds</li>
                    <li>Channel routing</li>
                    <li>Real-time alerts</li>
                  </ul>
                </div>
                <Badge variant="outline" className="bg-accent/10">
                  Active
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Row 2 */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass border-primary/20 card-hover group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500 group-hover:text-blue-500 transition-colors" />
                  Gamification
                </CardTitle>
                <CardDescription>XP, badges, leaderboards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Team engagement features:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>XP rewards system</li>
                    <li>Achievement badges</li>
                    <li>Leaderboards</li>
                    <li>Streak tracking</li>
                  </ul>
                </div>
                <Badge variant="outline" className="bg-green-500/10">
                  Live
                </Badge>
              </CardContent>
            </Card>

            <Card className="glass border-primary/20 card-hover group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-cyan-500 group-hover:text-purple-500 transition-colors" />
                  Dashboard
                </CardTitle>
                <CardDescription>Centralized control hub</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Management tools:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Repository overview</li>
                    <li>Integration settings</li>
                    <li>Real-time stats</li>
                    <li>Team management</li>
                  </ul>
                </div>
                <Badge variant="outline" className="bg-cyan-500/10">
                  Ready
                </Badge>
              </CardContent>
            </Card>

            <Card className="glass border-primary/20 card-hover group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-orange-500 group-hover:text-pink-500 transition-colors" />
                  System Monitor
                </CardTitle>
                <CardDescription>Admin observability panel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Monitor everything:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Webhook latency</li>
                    <li>Job queue status</li>
                    <li>Service health</li>
                    <li>Event logs</li>
                  </ul>
                </div>
                <Link href="/demo/admin">
                  <Badge variant="outline" className="bg-orange-500/10 cursor-pointer">
                    View Panel
                  </Badge>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 glass p-12 rounded-2xl border border-primary/20 text-center space-y-6">
          <h2 className="text-3xl font-bold">Experience the Full Power</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Opscord combines AI-powered automation with Google Gemini, team engagement, and DevOps excellence into one
            powerful platform.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/demo/admin">
              <Button size="lg" className="glow-button">
                View Admin Panel
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">
                Back Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
