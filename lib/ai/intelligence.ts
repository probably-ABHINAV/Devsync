import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServiceSupabase } from '@/lib/supabase'

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

export async function generateDailyDigest(orgId: string) {
    const supabase = getServiceSupabase()
    
    // 1. Fetch activities from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: activities } = await supabase
        .from('activities')
        .select('source, event_type, title, description, created_at')
        .eq('organization_id', orgId)
        .gte('created_at', yesterday)
        .order('created_at', { ascending: true })
        .limit(50) // Limit context window
        
    if (!activities || activities.length === 0) {
        return null;
    }
    
    // 2. Format for LLM
    const activityLog = activities.map(a => 
        `[${a.source.toUpperCase()}] ${a.event_type}: ${a.title} (${a.description?.substring(0, 100)}...)`
    ).join('\n')
    
    // 3. Call LLM
    const genAI = getGenAI()
    if (!genAI) throw new Error("Missing Gemini Key")
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `You are an engineering manager assistant. Summarize the following DevOps activities from the last 24 hours into a "Daily Digest" for the team.
    
    Highlight:
    - Key blockers or failures (red)
    - Major shipments/merges (green)
    - Active discussions
    
    Activities:
    ${activityLog}
    
    Format as Markdown. Be concise.`
    
    try {
        const result = await model.generateContent(prompt)
        const summary = result.response.text()
        
        // 4. Store Insight
        await supabase.from('ai_insights').insert({
            organization_id: orgId,
            type: 'daily_digest',
            title: `Daily Digest - ${new Date().toLocaleDateString()}`,
            content: summary,
            confidence_score: 1.0
        })
        
        return summary
    } catch (e) {
        console.error("Digest generation failed", e)
        throw e
    }
}
