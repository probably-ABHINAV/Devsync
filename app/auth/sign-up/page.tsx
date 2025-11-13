"use client"

import type React from "react"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Github, Chrome, MessageCircle, ArrowRight, Zap, CheckCircle2 } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Registration failed")
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      })

      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
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
    <div className="relative min-h-svh w-full overflow-hidden bg-gradient-to-br from-background via-background to-secondary/5">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex min-h-svh items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-secondary to-primary">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">Opscord</h1>
              </div>
              <p className="text-sm text-muted-foreground">Join the AI-powered DevOps revolution</p>
            </div>

            <Card className="glass border-secondary/20">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Create your account</CardTitle>
                <CardDescription>Connect GitHub and Discord seamlessly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Developer"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-focus bg-white/50 dark:bg-black/30 border-secondary/30 focus:bg-white dark:focus:bg-black/50"
                    />
                  </div>
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
                      className="input-focus bg-white/50 dark:bg-black/30 border-secondary/30 focus:bg-white dark:focus:bg-black/50"
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
                      className="input-focus bg-white/50 dark:bg-black/30 border-secondary/30 focus:bg-white dark:focus:bg-black/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repeat-password" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="input-focus bg-white/50 dark:bg-black/30 border-secondary/30 focus:bg-white dark:focus:bg-black/50"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-medium text-muted-foreground">Password requirements:</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        At least 8 characters
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        Mix of uppercase and lowercase
                      </li>
                    </ul>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive animate-in shake">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full glow-button bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Creating account..."
                    ) : (
                      <>
                        Create account <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-secondary/30 hover:bg-secondary/5 hover:border-secondary/50 transition-all duration-200 bg-transparent"
                    onClick={() => handleOAuth("github")}
                    disabled={isLoading}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-secondary/30 hover:bg-secondary/5 hover:border-secondary/50 transition-all duration-200 bg-transparent"
                    onClick={() => handleOAuth("google")}
                    disabled={isLoading}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-secondary/30 hover:bg-secondary/5 hover:border-secondary/50 transition-all duration-200 bg-transparent"
                    onClick={() => handleOAuth("discord")}
                    disabled={isLoading}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Discord
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="font-semibold text-secondary hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardContent>
            </Card>

            <p className="text-xs text-center text-muted-foreground">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
