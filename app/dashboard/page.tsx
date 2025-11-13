"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardOverview } from "@/components/dashboard/overview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, GitBranch, Users, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Welcome back, {session.user?.name}!</h1>
        <p className="text-muted-foreground">Monitor your GitHub repositories and Discord integrations in real-time</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-primary/20 card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-primary" />
              Repositories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Connected repos</p>
          </CardContent>
        </Card>

        <Card className="glass border-primary/20 card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-secondary" />
              Pull Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="glass border-primary/20 card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card className="glass border-primary/20 card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Your XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Total points</p>
          </CardContent>
        </Card>
      </div>

      {/* Getting started */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle>Getting Started with Opscord</CardTitle>
          <CardDescription>Follow these steps to set up your AI-powered DevOps bot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: 1,
                title: "Connect GitHub",
                description: "Link your GitHub account and repositories",
              },
              {
                step: 2,
                title: "Setup Discord",
                description: "Add the Opscord bot to your Discord server",
              },
              {
                step: 3,
                title: "Configure Webhooks",
                description: "Enable GitHub webhook notifications",
              },
              {
                step: 4,
                title: "Enable AI",
                description: "Activate Gemini AI summarization and insights",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
              >
                <Badge className="mb-2 bg-primary/20 text-primary">Step {item.step}</Badge>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overview component */}
      <DashboardOverview />
    </div>
  )
}
