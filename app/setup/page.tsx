"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Copy, ExternalLink } from "lucide-react"

interface EnvVar {
  key: string
  value: string | undefined
  required: boolean
  category: string
  docs: string
}

export default function SetupPage() {
  const [envVars, setEnvVars] = useState<EnvVar[]>([])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    // Check environment variables
    const vars: EnvVar[] = [
      {
        key: "NEXT_PUBLIC_SUPABASE_URL",
        value: process.env.NEXT_PUBLIC_SUPABASE_URL,
        required: true,
        category: "Supabase",
        docs: "https://supabase.com/docs",
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "***hidden***" : undefined,
        required: true,
        category: "Supabase",
        docs: "https://supabase.com/docs",
      },
      {
        key: "NEXT_PUBLIC_APP_URL",
        value: process.env.NEXT_PUBLIC_APP_URL,
        required: true,
        category: "Application",
        docs: "#",
      },
      {
        key: "GEMINI_API_KEY",
        value: process.env.GEMINI_API_KEY ? "***hidden***" : undefined,
        required: true,
        category: "Google Gemini",
        docs: "https://ai.google.dev/docs",
      },
      {
        key: "JOB_QUEUE_SECRET",
        value: process.env.JOB_QUEUE_SECRET ? "***hidden***" : undefined,
        required: true,
        category: "Job Queue",
        docs: "#",
      },
      {
        key: "DISCORD_BOT_TOKEN",
        value: process.env.DISCORD_BOT_TOKEN ? "***hidden***" : undefined,
        required: false,
        category: "Discord",
        docs: "https://discord.com/developers",
      },
    ]

    setEnvVars(vars)
  }, [])

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const configured = envVars.filter((v) => v.value && v.required).length
  const required = envVars.filter((v) => v.required).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold gradient-text">Setup Opscord</h1>
          <p className="text-muted-foreground">Configure environment variables for full functionality</p>
        </div>

        {/* Progress */}
        <Card className="glass border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Configuration Status</span>
                <span className="text-sm font-bold text-primary">
                  {configured}/{required} Required
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${(configured / required) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables by Category */}
        {["Supabase", "Application", "Google Gemini", "Discord", "Job Queue"].map((category) => {
          const categoryVars = envVars.filter((v) => v.category === category)
          if (categoryVars.length === 0) return null

          return (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-semibold">{category}</h2>
              <div className="grid gap-3">
                {categoryVars.map((env) => (
                  <Card key={env.key} className="glass border-primary/10">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">{env.key}</code>
                              <button
                                onClick={() => copyToClipboard(env.key)}
                                className="p-1 hover:bg-muted rounded transition-colors"
                                title="Copy variable name"
                              >
                                {copiedKey === env.key ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {env.value
                                ? env.value === "***hidden***"
                                  ? "✓ Configured (value hidden for security)"
                                  : `Value: ${env.value.substring(0, 30)}...`
                                : "Not configured"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {env.value ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : env.required ? (
                              <AlertCircle className="w-5 h-5 text-amber-500" />
                            ) : null}
                          </div>
                        </div>
                        {env.docs !== "#" && (
                          <Button variant="ghost" size="sm" asChild className="w-fit text-xs">
                            <a
                              href={env.docs}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              Documentation <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}

        {/* Setup Instructions */}
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Get your Opscord application fully configured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button asChild variant="default" className="glow-button">
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                  Setup Supabase →
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="https://ai.google.dev/docs" target="_blank" rel="noopener noreferrer">
                  Get Google Gemini API Key →
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer">
                  Create GitHub OAuth App →
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer">
                  Create Discord App →
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documentation Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">For detailed setup instructions, see</p>
          <Button variant="ghost" asChild className="text-primary font-semibold">
            <a href="/SETUP_GUIDE.md">SETUP_GUIDE.md</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
