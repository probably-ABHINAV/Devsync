import { getGitHubAuthUrl } from "@/lib/github"

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"}/api/auth/callback`

  if (!clientId) {
    return Response.json({ error: "GitHub Client ID not configured" }, { status: 500 })
  }

  const authUrl = await getGitHubAuthUrl(clientId, redirectUri)
  return Response.redirect(authUrl)
}
