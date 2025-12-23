"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Sparkles, MessageCircle, Github, Ticket, GitPullRequest } from "lucide-react"

interface Activity {
  id: string
  title: string
  description?: string
  source: string
  activity_type: string
  similarity?: number
  created_at?: string
}

export function ContextWarRoom() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Activity[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setHasSearched(true)
    
    try {
      const res = await fetch('/api/context/related', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query })
      })
      
      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (source: string) => {
    if (source === 'github') return <Github className="w-4 h-4 text-purple-400" />
    if (source === 'jira') return <Ticket className="w-4 h-4 text-blue-400" />
    if (source === 'discord') return <MessageCircle className="w-4 h-4 text-indigo-400" />
    return <Sparkles className="w-4 h-4 text-yellow-400" />
  }

  return (
    <Card className="h-full border-cyan-500/20 bg-cyan-950/10">
      <CardHeader>
        <div className="flex items-center gap-2">
           <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
           <CardTitle className="text-cyan-400">Context War Room</CardTitle>
        </div>
        <CardDescription>
          Find semantic links across your entire stack.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            placeholder="e.g. 'Fix login bug' or paste an error..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-black/20 border-white/10"
          />
          <Button onClick={handleSearch} disabled={loading} variant="secondary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
          </Button>
        </div>

        <ScrollArea className="h-[300px] pr-4">
            {hasSearched && results.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    No semantically related context found.
                </div>
            )}
            
            <div className="space-y-3">
                {results.map(activity => (
                    <div key={activity.id} className="p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                                {getIcon(activity.source)}
                                <span className="text-xs font-mono uppercase text-muted-foreground">{activity.source}</span>
                            </div>
                            {activity.similarity && (
                                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">
                                    {Math.round(activity.similarity * 100)}% Match
                                </span>
                            )}
                        </div>
                        <h4 className="text-sm font-semibold text-white/90 mb-1">{activity.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
                    </div>
                ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
