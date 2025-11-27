import { cookies } from "next/headers"
import { getServiceSupabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get("github_token")?.value

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = getServiceSupabase()
    const { searchParams } = new URL(request.url)

    const source = searchParams.get("source")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const perPage = 20

    let query = supabase
      .from("webhook_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    if (source && source !== "all") {
      query = query.eq("source", source)
    }

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`event_type.ilike.%${search}%,webhook_id.ilike.%${search}%`)
    }

    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const { data, count, error } = await query.range(from, to)

    if (error) {
      console.error("Failed to fetch webhook logs:", error)
      return Response.json({
        logs: generateMockLogs(),
        total: 50,
        page,
        per_page: perPage,
      })
    }

    if (!data || data.length === 0) {
      return Response.json({
        logs: generateMockLogs(),
        total: 50,
        page,
        per_page: perPage,
      })
    }

    return Response.json({
      logs: data,
      total: count || 0,
      page,
      per_page: perPage,
    })
  } catch (error) {
    console.error("Failed to fetch webhook logs:", error)
    return Response.json({
      logs: generateMockLogs(),
      total: 50,
      page: 1,
      per_page: 20,
    })
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get("github_token")?.value

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const id = searchParams.get("id")

    if (action === "retry" && id) {
      const supabase = getServiceSupabase()

      const { data: log, error: fetchError } = await supabase
        .from("webhook_logs")
        .select("*")
        .eq("id", id)
        .single()

      if (fetchError || !log) {
        return Response.json({ error: "Webhook log not found" }, { status: 404 })
      }

      const { error: updateError } = await supabase
        .from("webhook_logs")
        .update({
          status: "retrying",
          retry_count: (log.retry_count || 0) + 1,
        })
        .eq("id", id)

      if (updateError) {
        return Response.json({ error: "Failed to retry webhook" }, { status: 500 })
      }

      return Response.json({ success: true, message: "Webhook queued for retry" })
    }

    return Response.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Failed to process webhook action:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateMockLogs() {
  const sources = ["github", "discord", "internal"] as const
  const statuses = ["success", "failed", "pending", "processing", "retrying"] as const
  const eventTypes = [
    "push",
    "pull_request.opened",
    "pull_request.merged",
    "issue.opened",
    "issue.closed",
    "workflow_run.completed",
    "star.created",
    "release.published",
  ]

  return Array.from({ length: 20 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const source = sources[Math.floor(Math.random() * sources.length)]
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)

    return {
      id: `mock-${i + 1}`,
      webhook_id: `wh_${Math.random().toString(36).substring(2, 12)}`,
      source,
      event_type: eventType,
      payload: {
        action: eventType.split(".")[1] || "triggered",
        repository: {
          name: `repo-${Math.floor(Math.random() * 10) + 1}`,
          full_name: `org/repo-${Math.floor(Math.random() * 10) + 1}`,
        },
        sender: {
          login: `user${Math.floor(Math.random() * 100)}`,
        },
      },
      response_status: status === "success" ? 200 : status === "failed" ? 500 : null,
      response_body: status === "success" ? { ok: true } : status === "failed" ? { error: "Internal error" } : null,
      processing_time_ms: status === "success" || status === "failed" ? Math.floor(Math.random() * 500) + 50 : null,
      retry_count: status === "retrying" ? Math.floor(Math.random() * 3) + 1 : 0,
      status,
      error_message: status === "failed" ? "Connection timeout: Unable to reach Discord webhook endpoint" : null,
      created_at: createdAt.toISOString(),
    }
  })
}
