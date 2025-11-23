import { getUserRepos } from "@/lib/github"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("github_token")?.value

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const reposData = await getUserRepos(token)

    const repos = reposData.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      openIssues: repo.open_issues_count,
      openPRs: 0, // GitHub doesn't separate this easily, would need separate query
    }))

    return Response.json({ repos })
  } catch (error) {
    console.error("Failed to fetch repos:", error)
    return Response.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}
