import { getGitHubAuthUrl } from "@/lib/github"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID

  // Get the base URL from environment or request headers
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!baseUrl) {
    // Auto-detect from request headers (for production)
    const host = request.headers.get("host") || "localhost:5000"
    const proto = request.headers.get("x-forwarded-proto") || "http"
    baseUrl = `${proto}://${host}`
  }

  const redirectUri = `${baseUrl}/api/auth/callback`

  if (!clientId) {
    return Response.json({ error: "GitHub Client ID not configured" }, { status: 500 })
  }

  const authUrl = await getGitHubAuthUrl(clientId, redirectUri)
  return Response.redirect(authUrl)
}
