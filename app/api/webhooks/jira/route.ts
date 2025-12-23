import { NextResponse } from 'next/server'
import { ingestEvent } from '@/lib/ingest'

export async function POST(req: Request) {
  try {
    const payload = await req.json()

    const issue = payload.issue
    if (!issue || !issue.key || !issue.fields) {
      return NextResponse.json({ error: 'Invalid Jira payload' }, { status: 400 })
    }

    const eventType =
      payload.webhookEvent ??
      (payload.changelog ? 'jira:issue_updated' : 'jira:issue_created')

    const externalId = issue.key
    const repoName = issue.fields.project?.key ?? 'JIRA'
    const issueNumber = Number(issue.key.split('-')[1]) || 0

    let activityType = 'jira_unknown'
    let title = `Jira Event ${externalId}`
    let description = ''

    if (eventType === 'jira:issue_created') {
      activityType = 'issue_created'
      title = `Created Jira issue ${externalId}: ${issue.fields.summary}`
    }

    if (eventType === 'jira:issue_updated') {
      activityType = 'issue_updated'
      title = `Updated Jira issue ${externalId}: ${issue.fields.summary}`
      description = 'Issue updated'
    }

    await ingestEvent({
      source: 'jira',
      eventType,
      externalId,
      activityType,
      title,
      description,
      repoName,
      issueNumber,
      metadata: payload
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Jira ingestion failed' }, { status: 500 })
  }
}
