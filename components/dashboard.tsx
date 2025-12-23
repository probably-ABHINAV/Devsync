"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import ActivityFeed from "./activity-feed"
import RepoCard from "./repo-card"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { OrgSwitcher } from "@/components/org/org-switcher"

// Types
interface User {
  login: string
  avatar_url: string
  name: string
}

interface DashboardProps {
  user: User
}

interface Repo {
  id: number
  name: string
  description: string | null
  url: string
  stars: number
  language: string | null
  openIssues: number
  openPRs: number
  updated_at?: string
}

const REPOS: Repo[] = [
    { id: 1, name: "backend-api", description: "Main API service", url: "#", stars: 12, language: "TypeScript", openIssues: 4, openPRs: 2, updated_at: new Date().toISOString() },
    { id: 2, name: "frontend-web", description: "Next.js dashboard", url: "#", stars: 8, language: "TypeScript", openIssues: 1, openPRs: 0, updated_at: new Date().toISOString() },
    { id: 3, name: "data-pipeline", description: "Analytics processing", url: "#", stars: 5, language: "Python", openIssues: 2, openPRs: 1, updated_at: new Date().toISOString() },
]

export default function Dashboard({ user }: DashboardProps) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetch
    const timer = setTimeout(() => {
        setRepos(REPOS)
        setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#030308] text-white font-sans selection:bg-cyan-500/30">
        <AnimatePresence>
            {showOnboarding && <OnboardingWizard onComplete={() => setShowOnboarding(false)} />}
        </AnimatePresence>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Background effects */}
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#030308]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-[200px] hidden md:block">
                 <OrgSwitcher />
              </div>
           </div>
           
           <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                   {user?.avatar_url && (
                       <img src={user.avatar_url} alt={user.login} className="w-8 h-8 rounded-full border border-white/10" />
                   )}
                   <span className="text-sm text-gray-400 font-medium">
                       {user?.login || 'User'}
                   </span>
               </div>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Tabs defaultValue="overview" className="space-y-8">
              <div className="flex items-center justify-between">
                <TabsList className="bg-white/5 border border-white/10 p-1">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowOnboarding(true)}>
                        Restart Onboarding
                    </Button>
                </div>
              </div>

              <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {loading ? (
                          <div className="col-span-full py-12 flex justify-center"><Spinner className="w-8 h-8 text-cyan-500" /></div>
                      ) : (
                          repos.map(repo => (
                              <RepoCard key={repo.id} repo={repo} />
                          ))
                      )}
                  </div>
              </TabsContent>

              <TabsContent value="activity" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ActivityFeed />
              </TabsContent>

              <TabsContent value="settings" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 border border-white/10 rounded-xl bg-white/5 text-center">
                      <h3 className="text-lg font-medium text-white mb-2">Organization Settings</h3>
                      <p className="text-gray-400">Manage your team and integrations here.</p>
                      <Button className="mt-4" variant="secondary" asChild>
                          <a href="/org/settings">Go to Settings Page</a>
                      </Button>
                  </div>
              </TabsContent>
          </Tabs>
      </main>
    </div>
  )
}
