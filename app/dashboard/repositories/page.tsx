import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RepositoriesList } from "@/components/dashboard/repositories-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function RepositoriesPage() {
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
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Repositories</h1>
              <p className="text-sm text-muted-foreground">Manage your connected GitHub repositories</p>
            </div>
            <Link href="/dashboard/repositories/connect">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Connect Repository
              </Button>
            </Link>
          </div>
        </header>
        <main className="p-6 md:p-8 lg:p-10">
          <RepositoriesList userId={userData.user.id} />
        </main>
      </div>
    </div>
  )
}
