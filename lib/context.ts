import { getServiceSupabase } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/ai-embedding'

export interface RelatedActivity {
  id: string
  title: string
  description: string
  source: string
  activity_type: string
  created_at: string
  similarity: number
}

export async function findRelatedContext(queryText: string, threshold = 0.7, limit = 5): Promise<RelatedActivity[]> {
  const embedding = await generateEmbedding(queryText)
  
  if (!embedding) {
    console.warn("⚠️ Could not generate embedding for query:", queryText)
    return []
  }

  const supabase = getServiceSupabase()

  // Call the Postgres function we created in migration 005
  const { data, error } = await supabase.rpc('match_activities', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit
  })

  if (error) {
    console.error("❌ Error finding related context:", error)
    return []
  }

  return data as RelatedActivity[]
}
