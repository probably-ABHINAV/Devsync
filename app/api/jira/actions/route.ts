
import { NextResponse } from 'next/server'
import { createJiraIssue, getJiraProjects } from '@/lib/jira'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, ...params } = body

    if (action === 'create_issue') {
        const result = await createJiraIssue({
            projectKey: params.projectKey,
            summary: params.summary,
            description: params.description,
            issueType: params.issueType
        })
        return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Jira Action Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
    try {
        // Simple endpoint to get projects for the dropdown
        const projects = await getJiraProjects()
        return NextResponse.json({ projects })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
