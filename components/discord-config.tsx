"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { MessageCircle, Check, AlertCircle } from "lucide-react"

interface DiscordConfigProps {
  onConnected: () => void
}

export default function DiscordConfig({ onConnected }: DiscordConfigProps) {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/discord/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl }),
      })

      if (response.ok) {
        setMessage("Discord webhook configured successfully!")
        setMessageType("success")
        setWebhookUrl("")
        onConnected()
      } else {
        setMessage("Failed to configure Discord webhook")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("Error: " + (error instanceof Error ? error.message : "Unknown error"))
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card className="relative p-8 border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden group hover:border-accent/50 hover:bg-card/60 transition-all duration-300">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Discord Integration</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="webhook" className="text-foreground font-medium">
                Discord Webhook URL
              </Label>
              <Input
                id="webhook"
                type="password"
                placeholder="https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground/50 h-11"
              />
              <p className="text-xs text-muted-foreground">
                Create a webhook in your Discord server: Server Settings → Integrations → Webhooks
              </p>
            </div>

            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Button
                type="submit"
                disabled={loading || !webhookUrl}
                className="flex-1 h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold disabled:opacity-50"
              >
                {loading ? "Connecting..." : "Connect Discord"}
              </Button>
            </motion.div>

            {message && (
              <motion.div
                className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${
                  messageType === "success"
                    ? "bg-accent/10 border-accent/30 text-accent"
                    : "bg-destructive/10 border-destructive/30 text-destructive"
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {messageType === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message}
              </motion.div>
            )}
          </form>
        </div>
      </Card>
    </motion.div>
  )
}
