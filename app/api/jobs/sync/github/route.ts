import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchPRDetails } from '@/lib/github'

// POST /api/jobs/sync/github
// Body: { orgId, owner, repo }
export async function POST(req: Request) {
    try {
        const { orgId, owner, repo } = await req.json()
        const supabase = await createClient()

        // 1. Check/Create Sync State
        const resourceId = `${owner}/${repo}`
        
        // 2. Fetch recent PRs (Mocking listing logic as lib/github fetched single PR)
        // In real impl, we'd add `fetchRecentPRs` to lib/github
        // For now, let's pretend we fetch ID 1-5
        
        const prsToSync = [1, 2, 3] 

        for (const prNum of prsToSync) {
            const pr = await fetchPRDetails(owner, repo, prNum)
            if (pr) {
                // Upsert into activities
                await supabase.from('activities').insert({
                    organization_id: orgId,
                    source: 'github',
                    event_type: 'pr.opened', // simplified
                    title: pr.title,
                    description: pr.body,
                    link: `https://github.com/${owner}/${repo}/pull/${prNum}`,
                    payload: pr,
                    created_at: new Date().toISOString() // should use PR date
                })
            }
        }

        // 3. Update Sync State
        await supabase.from('integration_sync_state').upsert({
            organization_id: orgId,
            provider: 'github',
            resource_id: resourceId,
            last_synced_at: new Date().toISOString(),
            status: 'idle'
        }, { onConflict: 'organization_id, provider, resource_id' })

        return NextResponse.json({ success: true, synced: prsToSync.length })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
