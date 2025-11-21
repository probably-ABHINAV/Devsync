import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, MessageSquare, BarChart3, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-8">
        <div className="text-center space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 justify-center">
            <Sparkles className="h-3 w-3 mr-2" />
            OpsCord Lite - Lightweight DevOps
          </Badge>

          <h1 className="text-6xl md:text-7xl font-bold leading-tight text-balance">
            <span className="gradient-text">AI-Powered PR</span>
            <br />
            Summaries for
            <br />
            Discord Teams
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect GitHub and Discord. Get automatic AI-powered PR summaries, issue categorization, and real-time
            notifications.
          </p>

          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <Link href="/auth/login">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 pt-12">
          {[
            {
              icon: Zap,
              title: "AI PR Summaries",
              description: "Google Gemini analyzes pull requests and generates summaries instantly",
              color: "text-yellow-500",
            },
            {
              icon: MessageSquare,
              title: "Discord Integration",
              description: "Real-time notifications delivered directly to your Discord server",
              color: "text-indigo-500",
            },
            {
              icon: BarChart3,
              title: "Analytics Dashboard",
              description: "Track activity, categorize issues, and monitor team performance",
              color: "text-green-500",
            },
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-primary/20 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {/* Tech Stack */}
        <div className="pt-12">
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Lightweight & Modern Tech Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-3">
                {["Next.js 15", "Google Gemini", "Discord API", "GitHub API", "Prisma ORM", "Tailwind CSS"].map(
                  (tech, i) => (
                    <Badge key={i} variant="outline" className="px-4 py-2 text-sm">
                      {tech}
                    </Badge>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <div className="pt-8">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Get Started in 3 Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { step: "1", title: "Sign In", desc: "Connect with GitHub or Discord" },
                  { step: "2", title: "Connect Integration", desc: "Authorize your repositories" },
                  { step: "3", title: "Enable AI", desc: "Automatic PR summaries start" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 OpsCord Lite. Built with Next.js & Google Gemini
          </p>
        </div>
      </footer>
    </div>
  )
}
