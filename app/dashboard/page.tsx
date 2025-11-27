import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Dashboard from "@/components/dashboard"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("github_token")?.value

  if (!token) {
    redirect("/")
  }

  try {
    // Fetch user data to verify token is valid
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (!userResponse.ok) {
      redirect("/")
    }

    const user = await userResponse.json()

    return <Dashboard user={user} />
  } catch (error) {
    console.error("Dashboard error:", error)
    redirect("/")
  }
}
