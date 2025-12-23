import { getServiceSupabase } from '@/lib/supabase'

// Regex Patterns
const JIRA_PATTERN = /([A-Z]+-\d+)/g
const GITHUB_ISSUE_PATTERN = /#(\d+)/g
const URL_PATTERN = /https?:\/\/[^\s]+/g

export async function detectAndStoreLinks(activityId: string, text: string, orgId: string) {
    if (!text) return

    const supabase = getServiceSupabase()
    const links: { target_type: string, target_ref: string }[] = []

    // 1. Jira Keys (e.g. VIS-123)
    const jiraMatches = text.match(JIRA_PATTERN)
    if (jiraMatches) {
        jiraMatches.forEach(match => {
            links.push({ target_type: 'jira', target_ref: match })
        })
    }

    // 2. GitHub Issues (e.g. #45)
    // Note: This is ambiguous without repo context, but we store it raw for now
    const ghMatches = text.match(GITHUB_ISSUE_PATTERN)
    if (ghMatches) {
        ghMatches.forEach(match => {
            links.push({ target_type: 'github_issue', target_ref: match })
        })
    }

    // 3. URLs -> Unfurl or check if they match known resources
    // For now, simple deduplication
    const uniqueLinks = Array.from(new Set(links.map(l => JSON.stringify(l)))).map(s => JSON.parse(s))

    for (const link of uniqueLinks) {
        // Try to find the target activity if it exists
        // This is "soft linking". "Hard linking" would require looking up the 'external_id' in activities table.

        // Strategy:
        // A. Look for activity with external_id = target_ref (Jira) or similar
        // B. Just store the text reference in a new 'event_links' or similar?
        // Phase 2 Plan says: "Store links in event_links (source_id, target_id, type)" where target_id IS an activity/resource.

        // For now, let's look up the target activity ID.
        let targetActivityId = null

        if (link.target_type === 'jira') {
            const { data } = await supabase
                .from('activities')
                .select('id')
                .eq('source', 'jira')
                .eq('organization_id', orgId) // Scoped to Org
                .ilike('external_id', link.target_ref) // or title? external_id is usually '10001', but payload has key
                // Actually, Jira external_id might be the numeric ID. We might need to search metadata->key or title.
                // Let's assume title contains "VIS-123" or payload->key
                // Simplification for MVP:
                .limit(1)
                .maybeSingle()
             
             // More robust: search by metadata->>key
             if (!data) {
                 const { data: keyData } = await supabase.from('activities')
                    .select('id')
                    .eq('organization_id', orgId)
                    .eq('source', 'jira')
                    .eq('metadata->>key', link.target_ref)
                    .maybeSingle()
                 if (keyData) targetActivityId = keyData.id
             } else {
                 targetActivityId = data.id
             }
        }

        if (targetActivityId) {
             await supabase.from('event_links').insert({
                 source_id: activityId,
                 target_id: targetActivityId,
                 type: 'reference'
             })
             console.log(`🔗 Linked ${activityId} -> ${targetActivityId} (${link.target_ref})`)
        } else {
            // Store "Unresolved Link"? Or just ignore?
            // Phase C goal: "Populate event_links". If target doesn't exist yet (out of order ingestion), we miss it.
            // Advanced: Create a "pending_links" table or just ignore. ignoring for now.
        }
    }
}

export async function detectSemanticLinks(activityId: string, embedding: number[] | null, orgId: string) {
    if (!embedding || embedding.length === 0) return

    const supabase = getServiceSupabase()
    
    // Threshold for "Semantic Link" (e.g. 0.8 similarity)
    // We assume 'match_activities' RPC exists from Phase 1/2
    const { data: matches } = await supabase.rpc('match_activities', {
        query_embedding: embedding,
        match_threshold: 0.8,
        match_count: 3
    })

    if (matches) {
        for (const match of matches) {
            // Don't link to self
            if (match.id === activityId) continue;
            
            // Insert semantic link
            await supabase.from('event_links').insert({
                source_id: activityId,
                target_id: match.id,
                type: 'semantic_similarity'
            }).select().single() // Fire and forget
        }
    }
}
