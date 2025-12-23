import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchMRDetails } from '@/lib/gitlab'

// POST /api/jobs/sync/gitlab
// Body: { orgId, projectId, mrIids: number[] }
export async function POST(req: Request) {
    try {
        const { orgId, projectId, mrIids } = await req.json()
        const supabase = await createClient()
        
        // Mock fetching list of recent MRs if not provided
        const targetIids = mrIids || [1, 2, 3]

        for (const iid of targetIids) {
            const mr = await fetchMRDetails(projectId, iid)
            if (mr) {
                 await supabase.from('activities').insert({
                    organization_id: orgId,
                    source: 'gitlab',
                    event_type: 'mr.opened',
                    title: `MR !${iid}: ${mr.title}`,
                    description: mr.description,
                    link: `${process.env.GITLAB_HOST || 'https://gitlab.com'}/${projectId}/merge_requests/${iid}`,
                    payload: mr,
                    created_at: mr.created_at || new Date().toISOString()
                })
            }
        }

        // Update State
        await supabase.from('integration_sync_state').upsert({
            organization_id: orgId,
            provider: 'gitlab',
            resource_id: String(projectId),
            last_synced_at: new Date().toISOString(),
            status: 'idle'
        }, { onConflict: 'organization_id, provider, resource_id' })

        return NextResponse.json({ success: true, count: targetIids.length })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
