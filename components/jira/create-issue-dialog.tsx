"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function CreateIssueDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const { toast } = useToast()

  // Form State
  const [projectKey, setProjectKey] = useState("")
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [issueType, setIssueType] = useState("Task")

  // Fetch projects on mount
  useEffect(() => {
    if(open) {
        fetch('/api/jira/actions')
            .then(res => res.json())
            .then(data => {
                if(data.projects && data.projects.values) {
                    setProjects(data.projects.values)
                }
            })
            .catch(err => console.error("Failed to load projects", err))
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/jira/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           action: 'create_issue',
           projectKey: projectKey || (projects[0]?.key || 'TEST'), // Fallback
           summary,
           description,
           issueType
        })
      })

      if (!res.ok) throw new Error(await res.text())

      const data = await res.json()
      
      toast({
        title: "Issue Created",
        description: `Jira Issue ${data.key} created successfully.`,
      })
      setOpen(false)
      setSummary("")
      setDescription("")
    } catch (error: any) {
        toast({
            title: "Error",
            description: "Failed to create issue. Check console/credentials.",
            variant: "destructive"
        })
    } finally {
        setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Jira Issue</DialogTitle>
          <DialogDescription>
            Add a new task to your backlog directly from OpsCord.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project" className="text-right">
                Project
                </Label>
                <div className="col-span-3">
                    <Select value={projectKey} onValueChange={setProjectKey}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                        <SelectContent>
                             {projects.length > 0 ? projects.map((p: any) => (
                                 <SelectItem key={p.key} value={p.key}>{p.name} ({p.key})</SelectItem>
                             )) : <SelectItem value="TEST">Test Project (Default)</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="summary" className="text-right">
                Summary
                </Label>
                <Input
                    id="summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="col-span-3"
                    required
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                Type
                </Label>
                 <div className="col-span-3">
                    <Select value={issueType} onValueChange={setIssueType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Task Type" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="Task">Task</SelectItem>
                             <SelectItem value="Bug">Bug</SelectItem>
                             <SelectItem value="Story">Story</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                Description
                </Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Ticket
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
