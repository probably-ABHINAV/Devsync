"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { 
  Shield, 
  Activity, 
  Webhook, 
  GitBranch, 
  ArrowLeft,
  Settings
} from "lucide-react"

interface User {
  login: string
  avatar_url: string
  name: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-background">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background">
      <motion.header
        className="sticky top-0 z-40 border-b border-border/10 bg-background/40 backdrop-blur-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-4">
                <img src="/opscord-logo.jpg" alt="Opscord" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-foreground">Opscord</span>
                  <p className="text-xs text-muted-foreground">Admin Dashboard</p>
                </div>
              </Link>
              <div className="flex items-center gap-2 ml-6 pl-6 border-l border-border/20">
                <Shield className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-foreground">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar_url || "/placeholder.svg"}
                  alt={user.login}
                  className="w-9 h-9 rounded-full border border-border/50"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">@{user.login}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <nav className="border-b border-border/10 bg-background/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-2">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
            >
              <Activity className="w-4 h-4" />
              System Health
            </Link>
            <Link
              href="/admin?tab=webhooks"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
            >
              <Webhook className="w-4 h-4" />
              Webhook Logs
            </Link>
            <Link
              href="/admin?tab=repos"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              Repository Monitor
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
