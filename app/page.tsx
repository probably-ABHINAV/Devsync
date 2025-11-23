"use client"

import { useEffect, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import LoginPage from "@/components/login-page"
import Dashboard from "@/components/dashboard"
import LandingPage from "@/components/landing-page"

interface User {
  login: string
  avatar_url: string
  name: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLanding, setShowLanding] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setShowLanding(false)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner />
      </div>
    )
  }

  if (showLanding && !user) {
    return <LandingPage />
  }

  return user ? <Dashboard user={user} /> : <LoginPage />
}
