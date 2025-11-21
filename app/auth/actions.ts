"use server"

export async function getGitHubOAuthUrl() {
  const clientId = process.env.GITHUB_OAUTH_ID
  if (!clientId) {
    throw new Error("GitHub OAuth ID not configured")
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/callback/github`
  const scope = "repo,read:user,user:email"

  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`
}

export async function getDiscordOAuthUrl() {
  const clientId = process.env.DISCORD_OAUTH_ID
  if (!clientId) {
    throw new Error("Discord OAuth ID not configured")
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/callback/discord`
  const scope = "identify email"

  return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`
}
