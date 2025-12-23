import { NextRequest, NextResponse } from 'next/server'
import { ingestEvent } from '@/lib/ingest'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const gitlabEvent = req.headers.get('x-gitlab-event') || 'Unknown'

    let activityType = 'gitlab_unknown'
    let title = 'GitLab Event'
    let description = ''
    let externalId = ''
    let repoName = payload.project?.path_with_namespace
    let issueNumber: number | undefined

    // 🔹 ISSUE EVENTS
    if (gitlabEvent === 'Issue Hook') {
      const action = payload.object_attributes.action

      activityType = action === 'open' ? 'issue_created' : 'issue_updated'
      externalId = payload.object_attributes.id.toString()
      issueNumber = payload.object_attributes.iid

      title = `${action === 'open' ? 'Created' : 'Updated'} GitLab issue: ${payload.object_attributes.title}`
      description = payload.object_attributes.description || ''
    }

    // 🔹 MERGE REQUEST EVENTS
    if (gitlabEvent === 'Merge Request Hook') {
      activityType = 'merge_request'
      externalId = payload.object_attributes.id.toString()

      title = `Merge Request: ${payload.object_attributes.title}`
      description = payload.object_attributes.description || ''
    }

    // 🔹 PUSH EVENTS
    if (gitlabEvent === 'Push Hook') {
      activityType = 'push'
      externalId = payload.after

      title = `Push to ${payload.ref}`
      description = `${payload.commits?.length || 0} commits pushed`
    }

    await ingestEvent({
      source: 'gitlab',
      eventType: `gitlab:${gitlabEvent.toLowerCase().replace(/\s/g, '_')}`,
      externalId,
      activityType,
      title,
      description,
      repoName,
      issueNumber,
      metadata: payload
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('GitLab webhook error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
