
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, MessageSquare, BarChart3, Sparkles, Github, Bot } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-8">
        <div className="text-center space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1">
            <Sparkles className="h-3 w-3 mr-2" />
            OpsCord - AI-Powered DevOps
          </Badge>
          
          <h1 className="text-6xl md:text-7xl font-bold leading-tight text-balance">
            <span className="gradient-text">Intelligent PR</span>
            <br />
            Summaries for
            <br />
            Discord Teams
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automate your workflow with AI-powered PR summarization, real-time Discord notifications,
            and beautiful analytics - all powered by Google Gemini.
          </p>
          
          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <Link href="/demo">
              <Button size="lg" className="glow-button gap-2">
                <Sparkles className="h-4 w-4" />
                View Demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                Get Started Free
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
              description: "Google Gemini analyzes pull requests and generates intelligent summaries automatically",
              color: "text-yellow-500",
              gradient: "from-yellow-500/20 to-yellow-500/5"
            },
            {
              icon: MessageSquare,
              title: "Discord Integration",
              description: "Real-time notifications with slash commands like /summary, /stats, and /create-issue",
              color: "text-purple-500",
              gradient: "from-purple-500/20 to-purple-500/5"
            },
            {
              icon: BarChart3,
              title: "Beautiful Analytics",
              description: "Interactive dashboard with PR timeline, team stats, and gamification leaderboards",
              color: "text-blue-500",
              gradient: "from-blue-500/20 to-blue-500/5"
            }
          ].map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="glass border-primary/20 card-hover group relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <CardHeader className="relative">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {/* Tech Stack */}
        <div className="pt-12">
          <Card className="glass border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Powered by Modern Tech
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { icon: "⚡", name: "Next.js 15" },
                  { icon: "🤖", name: "Google Gemini" },
                  { icon: "💬", name: "Discord.js" },
                  { icon: "🐙", name: "GitHub API" },
                  { icon: "🎨", name: "Tailwind CSS" },
                  { icon: "📊", name: "Supabase" }
                ].map((tech, i) => (
                  <Badge key={i} variant="outline" className="px-4 py-2 text-sm">
                    <span className="mr-2">{tech.icon}</span>
                    {tech.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <div className="pt-8">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle>Quick Start - 3 Simple Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { step: "1", title: "Connect GitHub", desc: "Link your repositories" },
                  { step: "2", title: "Setup Discord", desc: "Add bot to your server" },
                  { step: "3", title: "Enable AI", desc: "Activate PR summaries" }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 rounded-lg bg-white/5 dark:bg-black/20 hover:bg-white/10 dark:hover:bg-black/30 transition-all group cursor-pointer">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary text-white text-lg font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 OpsCord. Built with ❤️ using Next.js & Google Gemini
            </p>
            <div className="flex gap-4">
              <Link href="/demo" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Demo
              </Link>
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
