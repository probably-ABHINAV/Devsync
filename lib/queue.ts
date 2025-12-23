import { getServiceSupabase } from "@/lib/supabase"
import { ingestEvent } from "@/lib/ingest"

export interface QueueItem {
    id: string
    organization_id: string
    source: string
    event_type: string
    payload: any
    status: 'pending' | 'processing' | 'completed' | 'failed'
    attempts: number
    created_at: string
}

export async function pushToQueue(orgId: string, source: string, eventType: string, payload: any) {
    const supabase = getServiceSupabase()
    
    const { error } = await supabase.from('ingestion_queue').insert({
        organization_id: orgId,
        source,
        event_type: eventType,
        payload,
        status: 'pending'
    })

    if (error) {
        console.error("Failed to push to queue:", error)
        throw error
    }
}

export async function processQueueBatch(batchSize = 10) {
    const supabase = getServiceSupabase()

    // 1. Fetch pending items
    const { data: items, error } = await supabase
        .from('ingestion_queue')
        .select('*')
        .in('status', ['pending', 'retry_pending']) // Fetch retries too
        .lt('attempts', 3) // Max 3 retries
        .order('created_at', { ascending: true })
        .limit(batchSize)

    if (!items || items.length === 0) return

    for (const item of items) {
        // Claim
        await supabase.from('ingestion_queue').update({ status: 'processing' }).eq('id', item.id)

        try {
            console.log(`Processing queue item ${item.id}: ${item.event_type}`)
            
            // Call Ingest Logic
            await ingestEvent({
                organizationId: item.organization_id,
                source: item.source,
                eventType: item.event_type,
                externalId: item.payload?.id || item.payload?.key || `queue-${item.id}`,
                activityType: item.event_type, // simplified
                title: item.payload?.title || item.payload?.summary || "Unknown Event",
                description: item.payload?.description || item.payload?.body,
                metadata: item.payload,
                // Best effort mapping
                userId: item.payload?.user?.id
            })

            // Mark complete
            await supabase.from('ingestion_queue').update({ 
                status: 'completed',
                processed_at: new Date().toISOString()
            }).eq('id', item.id)

        } catch (err: any) {
            console.error(`Failed queue item ${item.id}`, err)
            
            const newAttempts = (item.attempts || 0) + 1
            const newStatus = newAttempts >= 3 ? 'failed' : 'retry_pending'
            
            await supabase.from('ingestion_queue').update({ 
                status: newStatus,
                error_message: err.message,
                attempts: newAttempts
            }).eq('id', item.id)
        }
    }
}
