import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { JobsView } from "@/components/dashboard/jobs-view"

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-64 border-r border-border bg-sidebar md:block">
        <div className="p-6">
          <h2 className="text-lg font-bold text-sidebar-foreground">Opscord</h2>
        </div>
      </div>
      <div className="flex-1">
        <header className="border-b border-border bg-card">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-foreground">Job Queue</h1>
            <p className="text-sm text-muted-foreground">Monitor and manage background jobs</p>
          </div>
        </header>
        <main className="p-6 md:p-8 lg:p-10">
          <JobsView userId={userData.user.id} />
        </main>
      </div>
    </div>
  )
}
