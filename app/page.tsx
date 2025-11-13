"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Zap, Users, BarChart3, Eye, Rocket, Lock, Layers } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold gradient-text">Opscord</div>
          <div className="flex gap-4">
            <Link href="/demo">
              <Button variant="ghost">View Demo</Button>
            </Link>
            <Link href="/demo/admin">
              <Button variant="ghost">Admin Panel</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-8">
        <div className="text-center space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          <h1 className="text-6xl md:text-7xl font-bold leading-tight text-balance">
            <span className="gradient-text">AI-Powered</span>
            <br />
            GitHub ↔ Discord
            <br />
            Operations Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automate your development workflow with intelligent PR summarization, real-time Discord notifications,
            AI-powered insights using Google Gemini, and comprehensive team analytics.
          </p>
          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <Link href="/demo">
              <Button size="lg" className="glow-button gap-2">
                Explore Demo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo/admin">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                <Eye className="h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid - Enhanced with more features */}
        <div className="grid md:grid-cols-3 gap-6 pt-20">
          <div className="glass p-8 rounded-xl card-hover group animate-in fade-in-0 duration-700 delay-100">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI PR Summarizer</h3>
            <p className="text-sm text-muted-foreground">
              Automated pull request summaries powered by Google Gemini with code analysis and insights
            </p>
          </div>

          <div className="glass p-8 rounded-xl card-hover group animate-in fade-in-0 duration-700 delay-200">
            <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
              <Github className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">GitHub Integration</h3>
            <p className="text-sm text-muted-foreground">Real-time webhooks for PR, issues, and deployments</p>
          </div>

          <div className="glass p-8 rounded-xl card-hover group animate-in fade-in-0 duration-700 delay-300">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Discord Notifications</h3>
            <p className="text-sm text-muted-foreground">Smart Discord bot with slash commands and rich embeds</p>
          </div>

          <div className="glass p-8 rounded-xl card-hover group animate-in fade-in-0 duration-700 delay-100">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gamification</h3>
            <p className="text-sm text-muted-foreground">XP system, badges, and leaderboards for team engagement</p>
          </div>

          <div className="glass p-8 rounded-xl card-hover group animate-in fade-in-0 duration-700 delay-200">
            <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
              <Zap className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Workers & Jobs</h3>
            <p className="text-sm text-muted-foreground">Background job queue with automatic retry and monitoring</p>
          </div>

          <div className="glass p-8 rounded-xl card-hover group animate-in fade-in-0 duration-700 delay-300">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
              <Eye className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Admin Dashboard</h3>
            <p className="text-sm text-muted-foreground">Real-time system monitoring and observability</p>
          </div>

          <div className="glass p-8 rounded-xl card-hover group animate-in fade-in-0 duration-700 delay-100">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
            <p className="text-sm text-muted-foreground">Row-level security, OAuth integration, and audit logs</p>
          </div>

          <div className="glass p-8 rounded-xl card-hover group animate-in fade-in-0 duration-700 delay-200">
            <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
              <Layers className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Modern Stack</h3>
            <p className="text-sm text-muted-foreground">Next.js 16, PostgreSQL, and serverless architecture</p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="glass p-12 rounded-2xl mt-20 animate-in fade-in-0 duration-700 delay-500">
          <h2 className="text-2xl font-bold mb-8 text-center">Built with Modern Stack</h2>
          <div className="grid md:grid-cols-5 gap-6 text-center">
            <div>
              <p className="font-semibold">Frontend</p>
              <p className="text-sm text-muted-foreground mt-1">Next.js 16 + React 19</p>
            </div>
            <div>
              <p className="font-semibold">Database</p>
              <p className="text-sm text-muted-foreground mt-1">Supabase + PostgreSQL</p>
            </div>
            <div>
              <p className="font-semibold">AI Engine</p>
              <p className="text-sm text-muted-foreground mt-1">Google Gemini API</p>
            </div>
            <div>
              <p className="font-semibold">Cache</p>
              <p className="text-sm text-muted-foreground mt-1">Upstash Redis</p>
            </div>
            <div>
              <p className="font-semibold">Integrations</p>
              <p className="text-sm text-muted-foreground mt-1">GitHub + Discord</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-8 mt-20">
          <h3 className="text-xl font-bold mb-4">Quick Start</h3>
          <div className="space-y-3 text-sm">
            <p>Explore Opscord demo pages:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <Link href="/demo" className="text-primary hover:underline">
                  /demo
                </Link>
                {" - "}Feature showcase with all components
              </li>
              <li>
                <Link href="/demo/admin" className="text-primary hover:underline">
                  /demo/admin
                </Link>
                {" - "}Live admin monitoring panel with real-time charts
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
