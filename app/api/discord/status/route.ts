import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const webhookUrl = cookieStore.get("discord_webhook")?.value

  return Response.json({
    connected: !!webhookUrl,
    webhookUrl: webhookUrl ? webhookUrl.substring(0, 50) + "..." : null,
  })
}
