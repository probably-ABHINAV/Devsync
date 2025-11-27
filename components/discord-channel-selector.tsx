"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, Server, Hash, Lock, Volume2, Users, Settings, Folder,
  CheckCircle2, Circle, Loader2, AlertCircle, LogOut 
} from "lucide-react"

export interface DiscordServer {
  id: string
  name: string
  icon: string | null
  owner: boolean
  channels: DiscordChannel[]
}

export interface DiscordChannel {
  id: string
  name: string
  type: number // 0 = text, 2 = voice, etc.
  parent_id: string | null
  topic: string | null
}

interface DiscordChannelSelectorProps {
  onSelect: (serverId: string, channelId: string, channelName: string) => void
  onClose: () => void
  loading?: boolean
}

export default function DiscordChannelSelector({ onSelect, onClose, loading = false }: DiscordChannelSelectorProps) {
  const [servers, setServers] = useState<DiscordServer[]>([])
  const [selectedServer, setSelectedServer] = useState<DiscordServer | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<DiscordChannel | null>(null)
  const [error, setError] = useState("")
  const [loadingServers, setLoadingServers] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchServers()
  }, [])

  const fetchServers = async () => {
    try {
      setLoadingServers(true)
      const response = await fetch("/api/discord/servers")
      if (!response.ok) throw new Error("Failed to fetch servers")
      const data = await response.json()
      setServers(data.servers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch Discord servers")
    } finally {
      setLoadingServers(false)
    }
  }

  const filteredServers = servers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const textChannels = selectedServer?.channels.filter(ch => ch.type === 0) || []
  const isTextChannel = (channel: DiscordChannel) => channel.type === 0

  const handleConfirm = () => {
    if (selectedChannel && selectedServer) {
      onSelect(selectedServer.id, selectedChannel.id, selectedChannel.name)
    }
  }

  const getChannelIcon = (channel: DiscordChannel) => {
    if (channel.type === 0) return <Hash className="w-4 h-4 text-gray-400" />
    if (channel.type === 2) return <Volume2 className="w-4 h-4 text-gray-400" />
    if (channel.type === 4) return <Folder className="w-4 h-4 text-gray-400" />
    return <Circle className="w-3 h-3 text-gray-400" />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            Select Discord Server & Channel
          </h2>
          <p className="text-sm text-gray-400 mt-1">Choose where to receive GitHub notifications</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Servers List */}
          <div className="w-1/3 border-r border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search servers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingServers ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
              ) : filteredServers.length > 0 ? (
                <div className="space-y-1 p-2">
                  {filteredServers.map((server) => (
                    <motion.button
                      key={server.id}
                      onClick={() => {
                        setSelectedServer(server)
                        setSelectedChannel(null)
                      }}
                      whileHover={{ x: 4 }}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedServer?.id === server.id
                          ? "bg-blue-500/20 border border-blue-500/50"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {server.icon ? (
                          <img 
                            src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.webp`}
                            alt={server.name}
                            className="w-6 h-6 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <Server className="w-6 h-6 text-gray-400 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-white truncate">{server.name}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p className="text-sm">No servers found</p>
                </div>
              )}
            </div>
          </div>

          {/* Channels List */}
          <div className="w-2/3 flex flex-col">
            {selectedServer ? (
              <>
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-sm font-semibold text-white">{selectedServer.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{textChannels.length} text channels</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {textChannels.length > 0 ? (
                    <div className="space-y-1 p-2">
                      {textChannels.map((channel) => (
                        <motion.button
                          key={channel.id}
                          onClick={() => setSelectedChannel(channel)}
                          whileHover={{ x: 4 }}
                          className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-2 ${
                            selectedChannel?.id === channel.id
                              ? "bg-blue-500/20 border border-blue-500/50"
                              : "hover:bg-white/5 border border-transparent"
                          }`}
                        >
                          {getChannelIcon(channel)}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{channel.name}</p>
                            {channel.topic && (
                              <p className="text-xs text-gray-500 truncate">{channel.topic}</p>
                            )}
                          </div>
                          {selectedChannel?.id === channel.id && (
                            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                      <Lock className="w-8 h-8 mb-2" />
                      <p className="text-sm">No text channels available</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Users className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Select a server to view channels</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedChannel || loading}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              "Confirm Selection"
            )}
          </Button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
