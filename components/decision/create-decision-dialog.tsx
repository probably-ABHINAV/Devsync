"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { PenTool, CheckCircle, Loader2 } from "lucide-react"

export function CreateDecisionDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("proposed")
  const [tags, setTags] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)
      
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          status,
          tags: tagArray
        })
      })

      if (res.ok) {
        setOpen(false)
        setTitle("")
        setDescription("")
        setTags("")
        // Trigger generic refresh if needed (future improvement)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
            <PenTool className="w-4 h-4" />
            Log Decision
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#0d0d1a] border-white/10 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Architectural Decision</DialogTitle>
          <DialogDescription>
            Record a key decision, its status, and reasoning for future reference.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input 
              placeholder="e.g., Use Supabase for Auth" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10 text-white">
                        <SelectItem value="proposed">Proposed</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="implemented">Implemented</SelectItem>
                    </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                 <Label>Tags (comma separated)</Label>
                 <Input 
                    placeholder="frontend, db, urgent"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                 />
             </div>
          </div>

          <div className="space-y-2">
            <Label>Description / Reasoning</Label>
            <Textarea 
              placeholder="Why was this decision made? What were the alternatives?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/10 text-white min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="hover:bg-white/10">
                Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Decision
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
