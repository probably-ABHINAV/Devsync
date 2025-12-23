import { NextRequest, NextResponse } from 'next/server'
import { ingestEvent } from '@/lib/ingest'

export async function POST(req: NextRequest) {
  const payload = await req.json()

  // ✅ SLACK URL VERIFICATION (CRITICAL)
  if (payload.type === 'url_verification') {
    return new Response(
      JSON.stringify({ challenge: payload.challenge }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Slack retries aggressively — always ACK fast
    if (!payload.event) {
      return NextResponse.json({ ok: true })
    }

    const event = payload.event

    // Ignore joins, edits, bot messages, etc.
    if (
      event.type !== 'message' ||
      event.subtype ||
      !event.text
    ) {
      return NextResponse.json({ ok: true })
    }

    await ingestEvent({
      source: 'slack',
      eventType: 'slack:message',
      externalId: `${payload.team_id}:${event.ts}`,
      activityType: 'message',
      title: `Slack message`,
      description: event.text,
      repoName: event.channel, // channel acts like repo
      metadata: {
        teamId: payload.team_id,
        channel: event.channel,
        user: event.user,
        ts: event.ts
      }
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Slack webhook error:', err)
    return NextResponse.json({ ok: true }) // IMPORTANT: never 500 Slack
  }
}
