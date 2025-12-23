"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"

export function JiraFeed() {
  const [events, setEvents] = useState<any[]>([])
  const [supabase] = useState(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  useEffect(() => {
    // Initial Fetch
    const fetchJiraEvents = async () => {
      const { data } = await supabase
        .from('activities')
        .select('*')
        .eq('source', 'jira')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (data) setEvents(data)
    }

    fetchJiraEvents()

    // Realtime Subscription
    const channel = supabase
      .channel('jira-feed')
      .on('postgres_changes', { 
         event: 'INSERT', 
         schema: 'public', 
         table: 'activities',
         filter: 'source=eq.jira' 
      }, (payload: any) => {
         setEvents((prev) => [payload.new, ...prev])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Jira Activity Log</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full pr-4">
           <div className="space-y-4">
             {events.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No recent Jira activity</p>
             )}
             {events.map((event) => (
               <div key={event.id} className="flex flex-col gap-1 border-b pb-2 last:border-0 hover:bg-muted/50 p-2 rounded transition-colors">
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-semibold">{event.title}</span>
                     <span className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleTimeString()}
                     </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                  <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] h-5">
                          {event.activity_type}
                      </Badge>
                      {event.metadata?.status && (
                          <Badge variant="secondary" className="text-[10px] h-5">
                             {event.metadata.status}
                          </Badge>
                      )}
                  </div>
               </div>
             ))}
           </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
