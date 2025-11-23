import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("github_token")?.value
  const user = cookieStore.get("github_user")?.value

  if (!token || !user) {
    return Response.json({ user: null }, { status: 401 })
  }

  try {
    const userData = JSON.parse(user)
    return Response.json({ user: userData })
  } catch {
    return Response.json({ user: null }, { status: 401 })
  }
}
