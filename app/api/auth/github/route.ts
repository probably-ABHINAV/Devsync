import { getGitHubAuthUrl } from "@/lib/github"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID

  // Get the base URL specifically for the callback
  // We prioritize the request origin/host to ensure localhost callbacks work even if NEXT_PUBLIC_APP_URL is set to prod
  const host = request.headers.get("host") || "localhost:5000"
  const proto = request.headers.get("x-forwarded-proto") || "http"
  const baseUrl = `${proto}://${host}`

  const redirectUri = `${baseUrl}/api/auth/callback`

  if (!clientId) {
    return Response.json({ error: "GitHub Client ID not configured" }, { status: 500 })
  }

  const authUrl = await getGitHubAuthUrl(clientId, redirectUri)
  return Response.redirect(authUrl)
}
