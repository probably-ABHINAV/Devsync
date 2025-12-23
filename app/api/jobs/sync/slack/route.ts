import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchChannelHistory } from '@/lib/slack'

// POST /api/jobs/sync/slack
// Body: { orgId, channelId }
export async function POST(req: Request) {
    try {
        const { orgId, channelId } = await req.json()
        const supabase = await createClient()

        const messages = await fetchChannelHistory(channelId, 20) // fetch last 20

        for (const msg of messages) {
             await supabase.from('activities').insert({
                organization_id: orgId,
                source: 'slack',
                event_type: 'message',
                // title: use user name?, for now simplified
                title: `Message in ${channelId}`, 
                description: msg.text,
                payload: msg,
                created_at: msg.ts ? new Date(parseFloat(msg.ts) * 1000).toISOString() : new Date().toISOString()
            })
        }

        await supabase.from('integration_sync_state').upsert({
            organization_id: orgId,
            provider: 'slack',
            resource_id: channelId,
            last_synced_at: new Date().toISOString(),
            status: 'idle'
        }, { onConflict: 'organization_id, provider, resource_id' })

        return NextResponse.json({ success: true, count: messages.length })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
