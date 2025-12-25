// GitHub API utilities
const GITHUB_API = "https://api.github.com"

export async function getGitHubAuthUrl(clientId: string, redirectUri: string) {
  const scope = "repo user"
  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`
}

export async function exchangeCodeForToken(code: string, clientId: string, clientSecret: string, redirectUri: string) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  })

  const data = await response.json()
  if (!data.access_token) {
    throw new Error(data.error_description || "Failed to exchange code for token")
  }
  return data.access_token
}

export async function getUserData(token: string) {
  const response = await fetch(`${GITHUB_API}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!response.ok) throw new Error("Failed to get user data")
  return response.json()
}

export async function getUserRepos(token: string) {
  const response = await fetch(`${GITHUB_API}/user/repos?per_page=100&sort=updated`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!response.ok) throw new Error("Failed to get repos")
  return response.json()
}

export async function getRepoDetails(token: string, owner: string, repo: string) {
  const [repoData, issuesData, prsData] = await Promise.all([
    fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }).then((r) => r.json()),
    fetch(`${GITHUB_API}/repos/${owner}/${repo}/issues?state=open&per_page=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }).then((r) => r.json()),
    fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls?state=open&per_page=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }).then((r) => r.json()),
  ])

  return {
    ...repoData,
    openIssues: issuesData.length || 0,
    openPRs: prsData.length || 0,
  }
}
