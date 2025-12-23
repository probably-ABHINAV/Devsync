import { getServiceSupabase } from '@/lib/supabase'
import { generateEmbedding } from '@/lib/ai-embedding'
import { calculateAttentionScore } from '@/lib/attention'
import { detectAndStoreLinks, detectSemanticLinks } from '@/lib/linking'

export type IngestEventInput = {
  organizationId?: string
  source: string
  eventType: string
  externalId: string
  activityType: string
  title: string
  description?: string
  repoName?: string
  prNumber?: number
  issueNumber?: number
  userId?: string
  metadata?: any
}

export async function ingestEvent(input: IngestEventInput) {
  const {
    organizationId,
    source,
    eventType,
    externalId,
    activityType,
    title,
    description,
    repoName,
    prNumber,
    issueNumber,
    userId,
    metadata
  } = input

  const supabase = getServiceSupabase()

  console.log(`📥 INGEST: [${source}] ${activityType} - ${title}`)

  /* ===============================
     1️⃣ RAW WEBHOOK STORAGE (Audit)
     =============================== */
  // We store the raw payload first for debugging/audit trails
  await supabase.from('webhooks').insert({
    source,
    event_type: eventType,
    payload: metadata
  })

  /* ===============================
     2️⃣ IDEMPOTENCY CHECK
     =============================== */
  // Check if we already have this activity
  const { data: existing } = await supabase
    .from('activities')
    .select('id')
    .eq('source', source)
    .eq('external_id', externalId)
    .single()

  if (existing) {
    console.log(`Skipping duplicate activity: ${source}/${externalId}`)
    return { success: true, skipped: true, activityId: existing.id }
  }

  /* ===============================
     3️⃣ GENERATE EMBEDDING (Innovation Layer)
     =============================== */
  // Create a rich context string for the AI to understand the event
  const contextString = `${source} ${activityType}: ${title}. ${description || ''}`
  let embedding = null
  try {
     embedding = await generateEmbedding(contextString)
  } catch (e) {
     console.error("Embedding generation failed, continuing without vector", e)
  }

  /* ===============================
     4️⃣ ATTENTION SCORING (Noise Reduction)
     =============================== */
  const attentionScore = calculateAttentionScore({
      source,
      title,
      description,
      metadata
  })

  /* ===============================
     5️⃣ NORMALIZED ACTIVITY
     =============================== */
  const { data: activity, error } = await supabase.from('activities').insert({
    organization_id: organizationId,
    source,
    event_type: eventType,
    activity_type: activityType,
    title,
    description,
    repo_name: repoName,
    issue_number: issueNumber,
    external_id: externalId,
    user_id: userId ?? null,
    metadata,
    embedding,
    attention_score: attentionScore
  }).select('id').single()

  if (error) {
    throw new Error(`Activity insert failed: ${error.message}`)
  }

  /* ===============================
     6️⃣ CROSS-TOOL LINKING (Phase C)
     =============================== */
  if (activity && organizationId) {
      // Async linking (don't block return)
      Promise.all([
        detectAndStoreLinks(activity.id, `${title} ${description || ''}`, organizationId),
        detectSemanticLinks(activity.id, embedding, organizationId)
      ]).catch(err => console.error("Linking failed", err))
  }

  return { success: true, activityId: activity.id }
}
