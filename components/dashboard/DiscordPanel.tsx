"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle, ExternalLink, AlertCircle, Loader2 } from "lucide-react"

interface DiscordPanelProps {
  serverId?: string
  channelId?: string
}

export default function DiscordPanel({ 
  serverId = "REPLACE_SERVER_ID", 
  channelId = "REPLACE_CHANNEL_ID" 
}: DiscordPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return

    const loadWidgetBot = async () => {
      try {
        const existingScript = document.querySelector('script[src*="widgetbot"]')
        if (existingScript) {
          scriptLoaded.current = true
          setIsLoading(false)
          return
        }

        const script = document.createElement("script")
        script.src = "https://cdn.jsdelivr.net/npm/@widgetbot/html-embed"
        script.async = true
        
        script.onload = () => {
          scriptLoaded.current = true
          setIsLoading(false)
        }
        
        script.onerror = () => {
          setHasError(true)
          setIsLoading(false)
        }

        document.body.appendChild(script)
      } catch (error) {
        console.error("Failed to load WidgetBot:", error)
        setHasError(true)
        setIsLoading(false)
      }
    }

    loadWidgetBot()
  }, [])

  const isConfigured = serverId !== "REPLACE_SERVER_ID" && channelId !== "REPLACE_CHANNEL_ID"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(99, 102, 241, 0.2)",
                "0 0 40px rgba(99, 102, 241, 0.4)",
                "0 0 20px rgba(99, 102, 241, 0.2)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MessageCircle className="w-6 h-6 text-indigo-400" />
          </motion.div>
          <div>
            <motion.h2 
              className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Discord Panel
            </motion.h2>
            <p className="text-gray-400 text-sm mt-1">
              Connect with the community directly from your dashboard
            </p>
          </div>
        </div>
        
        {isConfigured && (
          <motion.a
            href={`https://discord.com/channels/${serverId}/${channelId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">Open in Discord</span>
          </motion.a>
        )}
      </div>

      <motion.div
        ref={containerRef}
        className="relative rounded-2xl border border-white/10 bg-[#0d0d1a]/80 backdrop-blur-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        style={{ minHeight: "600px" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        
        <motion.div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
          }}
        />

        {!isConfigured ? (
          <div className="flex flex-col items-center justify-center h-[600px] p-8 text-center">
            <motion.div
              className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-6"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertCircle className="w-12 h-12 text-yellow-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">Discord Not Configured</h3>
            <p className="text-gray-400 max-w-md mb-6">
              To embed your Discord server, you need to configure the server and channel IDs. 
              Replace the placeholder values in the DiscordPanel component.
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left max-w-lg w-full">
              <p className="text-sm text-gray-400 mb-2">Update these values:</p>
              <code className="text-xs text-indigo-400 block">
                serverId="YOUR_DISCORD_SERVER_ID"<br/>
                channelId="YOUR_DISCORD_CHANNEL_ID"
              </code>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-[600px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 text-indigo-400" />
            </motion.div>
            <p className="text-gray-400 mt-4">Loading Discord...</p>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center h-[600px] p-8 text-center">
            <motion.div
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6"
              animate={{ 
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertCircle className="w-12 h-12 text-red-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Discord</h3>
            <p className="text-gray-400 max-w-md">
              There was an error loading the Discord embed. Please check your connection and try again.
            </p>
          </div>
        ) : (
          <div className="w-full h-[600px]">
            <widgetbot
              server={serverId}
              channel={channelId}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        )}
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {[
          { 
            title: "View Channels", 
            description: "Browse and switch between different Discord channels",
            gradient: "from-cyan-500/10 to-blue-500/10",
            borderColor: "border-cyan-500/20"
          },
          { 
            title: "Send Messages", 
            description: "Chat with team members directly from the dashboard",
            gradient: "from-purple-500/10 to-pink-500/10",
            borderColor: "border-purple-500/20"
          },
          { 
            title: "Run Commands", 
            description: "Execute Opscord bot commands without leaving",
            gradient: "from-emerald-500/10 to-teal-500/10",
            borderColor: "border-emerald-500/20"
          },
        ].map((feature, idx) => (
          <motion.div
            key={feature.title}
            className={`p-4 rounded-xl bg-gradient-to-br ${feature.gradient} border ${feature.borderColor} backdrop-blur-sm`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
            <p className="text-xs text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      widgetbot: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          server: string
          channel: string
        },
        HTMLElement
      >
    }
  }
}
