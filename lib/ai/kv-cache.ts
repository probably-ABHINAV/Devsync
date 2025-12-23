import { createClient } from "@/lib/supabase/client"

export async function getCachedResponse(prompt: string, model: string): Promise<string | null> {
    const supabase = createClient()
    
    // Simple hash key generation (in production, use a proper hashing lib like crypto)
    // For demo/POC, we can just use the prompt string directly if it's short, or a base64 encoding
    // Let's assume prompt is the key for simplicity here, but truncated if too long?
    // A better approach is usually SHA-256 hex string.
    
    // We'll just trust exact match on 'key' column for now.
    // In a real implementation: const key = crypto.createHash('sha256').update(prompt).digest('hex')
    const key = btoa(prompt).slice(0, 50) + prompt.length // pseudo-hash for client-side compat

    const { data, error } = await supabase
        .from('ai_cache')
        .select('response')
        .eq('key', key)
        .eq('model', model)
        .single()

    if (error || !data) return null
    return data.response
}

export async function setCachedResponse(prompt: string, model: string, response: string) {
    const supabase = createClient()
    const key = btoa(prompt).slice(0, 50) + prompt.length 

    await supabase.from('ai_cache').upsert({
        key,
        model,
        response,
        created_at: new Date().toISOString()
    })
}
