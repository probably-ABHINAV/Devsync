"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle, ExternalLink, Loader2 } from "lucide-react"

interface DiscordPanelProps {
  serverId?: string
  channelId?: string
}

export default function DiscordPanel({ 
  serverId = "1438479945667051622", 
  channelId = "1438479946262777938" 
}: DiscordPanelProps) {
  const [isLoading, setIsLoading] = useState(true)

  const embedUrl = `https://e.widgetbot.io/channels/${serverId}/${channelId}`

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
      </div>

      <motion.div
        className="relative rounded-2xl border border-white/10 bg-[#0d0d1a]/80 backdrop-blur-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        style={{ minHeight: "600px" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        
        <motion.div
          className="absolute inset-0 opacity-30 pointer-events-none z-0"
          style={{
            background: "radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
          }}
        />

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0d0d1a]/80">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-8 h-8 text-indigo-400" />
            </motion.div>
            <p className="text-gray-400 mt-4">Loading Discord...</p>
          </div>
        )}

        <iframe
          src={embedUrl}
          width="100%"
          height="600"
          allowTransparency={true}
          frameBorder="0"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          className="relative z-5"
          onLoad={() => setIsLoading(false)}
        />
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
