const GITHUB_API = "https://api.github.com"

interface GitHubActivity {
  id: string
  activity_type: string
  repo_name: string
  pr_number?: number
  issue_number?: number
  title: string
  description: string
  metadata: any
  created_at: string
}

export async function fetchUserActivities(token: string, username: string): Promise<GitHubActivity[]> {
  try {
    const activities: GitHubActivity[] = []

    // Fetch user events (public activities)
    const eventsResponse = await fetch(`${GITHUB_API}/users/${username}/events/public?per_page=50`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (eventsResponse.ok) {
      const events = await eventsResponse.json()
      const transformedEvents = transformGitHubEvents(events)
      activities.push(...transformedEvents)
    }

    // Fetch user's PRs
    const prsResponse = await fetch(`${GITHUB_API}/search/issues?q=type:pr author:${username}&sort=created&order=desc&per_page=30`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (prsResponse.ok) {
      const data = await prsResponse.json()
      const prs = data.items || []
      const transformedPRs = prs.map((pr: any): GitHubActivity => ({
        id: `pr-${pr.id}`,
        activity_type: "pr_opened",
        repo_name: pr.repository_url.split("/").slice(-1)[0],
        pr_number: pr.number,
        title: pr.title,
        description: pr.body || "No description",
        metadata: { url: pr.html_url, state: pr.state },
        created_at: pr.created_at,
      }))
      activities.push(...transformedPRs)
    }

    // Fetch user's issues
    const issuesResponse = await fetch(`${GITHUB_API}/search/issues?q=type:issue author:${username}&sort=created&order=desc&per_page=30`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })

    if (issuesResponse.ok) {
      const data = await issuesResponse.json()
      const issues = data.items || []
      const transformedIssues = issues.map((issue: any): GitHubActivity => ({
        id: `issue-${issue.id}`,
        activity_type: issue.state === "closed" ? "issue_closed" : "issue_opened",
        repo_name: issue.repository_url.split("/").slice(-1)[0],
        issue_number: issue.number,
        title: issue.title,
        description: issue.body || "No description",
        metadata: { url: issue.html_url, state: issue.state },
        created_at: issue.created_at,
      }))
      activities.push(...transformedIssues)
    }

    // Sort by date, most recent first
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return activities.slice(0, 50) // Return top 50
  } catch (error) {
    console.error("Error fetching GitHub activities:", error)
    return []
  }
}

function transformGitHubEvents(events: any[]): GitHubActivity[] {
  return events
    .filter((event) => ["PushEvent", "PullRequestEvent", "IssuesEvent", "CreateEvent"].includes(event.type))
    .map((event): GitHubActivity | null => {
      const repoName = event.repo.name.split("/")[1]

      if (event.type === "PushEvent") {
        return {
          id: event.id,
          activity_type: "commit",
          repo_name: repoName,
          title: `Pushed ${event.payload.size} commit(s)`,
          description: event.payload.commits?.[0]?.message || "Code update",
          metadata: { commits: event.payload.size, branch: event.payload.ref },
          created_at: event.created_at,
        }
      } else if (event.type === "PullRequestEvent") {
        return {
          id: event.id,
          activity_type: event.payload.action === "opened" ? "pr_opened" : "pr_merged",
          repo_name: repoName,
          pr_number: event.payload.pull_request.number,
          title: event.payload.pull_request.title,
          description: event.payload.pull_request.body || "No description",
          metadata: { action: event.payload.action, url: event.payload.pull_request.html_url },
          created_at: event.created_at,
        }
      } else if (event.type === "IssuesEvent") {
        return {
          id: event.id,
          activity_type: event.payload.action === "opened" ? "issue_opened" : "issue_closed",
          repo_name: repoName,
          issue_number: event.payload.issue.number,
          title: event.payload.issue.title,
          description: event.payload.issue.body || "No description",
          metadata: { action: event.payload.action, url: event.payload.issue.html_url },
          created_at: event.created_at,
        }
      } else if (event.type === "CreateEvent") {
        return {
          id: event.id,
          activity_type: "repo_created",
          repo_name: repoName,
          title: `Created ${event.payload.ref_type}`,
          description: event.payload.ref || "New repository",
          metadata: { ref_type: event.payload.ref_type },
          created_at: event.created_at,
        }
      }

      return null
    })
    .filter((item) => item !== null) as GitHubActivity[]
}
