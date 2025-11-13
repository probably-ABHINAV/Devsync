"use client"

import type React from "react"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Github, Chrome, MessageCircle, ArrowRight, Zap } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push(searchParams.get("callbackUrl") || "/dashboard")
    }
  }

  const handleOAuth = async (provider: "github" | "google" | "discord") => {
    setIsLoading(true)
    await signIn(provider, {
      redirect: true,
      callbackUrl: "/dashboard",
    })
  }

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex min-h-svh items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">Opscord</h1>
              </div>
              <p className="text-sm text-muted-foreground">AI-powered GitHub ↔ Discord Operations Hub</p>
            </div>

            <Card className="glass border-primary/20">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Welcome Back</CardTitle>
                <CardDescription>Sign in to your Opscord account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-focus bg-white/50 dark:bg-black/30 border-primary/30 focus:bg-white dark:focus:bg-black/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-focus bg-white/50 dark:bg-black/30 border-primary/30 focus:bg-white dark:focus:bg-black/50"
                    />
                  </div>
                  {error && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive animate-in shake">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full glow-button bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Signing in..."
                    ) : (
                      <>
                        Sign in <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 bg-transparent"
                    onClick={() => handleOAuth("github")}
                    disabled={isLoading}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 bg-transparent"
                    onClick={() => handleOAuth("google")}
                    disabled={isLoading}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 bg-transparent"
                    onClick={() => handleOAuth("discord")}
                    disabled={isLoading}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Discord
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </CardContent>
            </Card>

            <p className="text-xs text-center text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
