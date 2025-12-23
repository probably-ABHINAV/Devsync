"use client"

import { Activity } from "@/components/activity-feed"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Code, GitCommit, GitPullRequest, MessageCircle, AlertCircle, Calendar, Hash, ExternalLink } from "lucide-react"

interface TimelineDrawerProps {
  activity: Activity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TimelineDrawer({ activity, open, onOpenChange }: TimelineDrawerProps) {
  if (!activity) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[540px] bg-[#0d0d1a] border-white/10 text-white p-0">
        <ScrollArea className="h-full">
            <div className="p-6">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                         <Badge variant="outline" className="capitalize text-cyan-400 border-cyan-500/30">
                            {activity.source}
                         </Badge>
                         <span className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleString()}
                         </span>
                    </div>
                    <SheetTitle className="text-xl font-bold text-white leading-snug">
                        {activity.title}
                    </SheetTitle>
                    <SheetDescription className="text-gray-400">
                        {activity.repo_name}
                    </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="w-full bg-white/5 border border-white/10">
                        <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                        <TabsTrigger value="related" className="flex-1">Related (Graph)</TabsTrigger>
                        <TabsTrigger value="json" className="flex-1">Raw JSON</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="mt-6 space-y-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" /> Description
                            </h4>
                            <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                                {activity.description || "No description provided."}
                            </p>
                        </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h4 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Type</h4>
                                <p className="text-sm font-medium text-white capitalize">{activity.activity_type}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h4 className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Author</h4>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px]">
                                        {activity.actor_username ? activity.actor_username[0].toUpperCase() : '?'}
                                    </div>
                                    <p className="text-sm font-medium text-white">{activity.actor_username || "Unknown"}</p>
                                </div>
                            </div>
                        </div>

                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-white">Metadata</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {Object.entries(activity.metadata).map(([key, value]) => {
                                        if (typeof value === 'object') return null
                                        return (
                                            <div key={key} className="flex justify-between items-center py-2 px-3 rounded-lg bg-white/5 border border-white/5">
                                                <span className="text-xs text-gray-400 font-mono">{key}</span>
                                                <span className="text-xs text-white truncate max-w-[200px]">{String(value)}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                         
                        <div className="pt-4">
                            <a 
                                href="#" // TODO: Add link to source if available
                                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm text-gray-300 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" /> Open in {activity.source}
                            </a>
                        </div>
                    </TabsContent>

import { RelatedActivity } from "./related-activity"
// ...
                    <TabsContent value="related" className="mt-6">
                        <RelatedActivity activityId={activity.id} />
                    </TabsContent>

                    <TabsContent value="json" className="mt-6">
                        <div className="relative">
                            <pre className="p-4 rounded-xl bg-black/50 border border-white/10 overflow-x-auto text-xs font-mono text-cyan-400 leading-normal">
                                {JSON.stringify(activity, null, 2)}
                            </pre>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
