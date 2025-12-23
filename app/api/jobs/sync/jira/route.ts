import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { searchIssues } from '@/lib/jira'

// POST /api/jobs/sync/jira
// Body: { orgId, jql }
export async function POST(req: Request) {
    try {
        const { orgId, jql } = await req.json()
        const supabase = await createClient()
        
        const issues = await searchIssues(jql || 'updated >= -30d')

        for (const issue of issues) {
             await supabase.from('activities').insert({
                organization_id: orgId,
                source: 'jira',
                event_type: 'issue.updated',
                title: `${issue.key}: ${issue.summary}`,
                description: `Status: ${issue.status}`,
                link: `https://${process.env.JIRA_DOMAIN}/browse/${issue.key}`,
                payload: issue,
                created_at: new Date().toISOString()
            })
        }

        // Update global sync state for Jira (resource_id = domain or project)
        await supabase.from('integration_sync_state').upsert({
            organization_id: orgId,
            provider: 'jira',
            resource_id: 'global-search', 
            last_synced_at: new Date().toISOString(),
            status: 'idle'
        }, { onConflict: 'organization_id, provider, resource_id' })

        return NextResponse.json({ success: true, count: issues.length })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
