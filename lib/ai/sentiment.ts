export type Sentiment = 'positive' | 'neutral' | 'negative'

export function analyzeSentiment(text: string): { score: number, label: Sentiment } {
    const lower = text.toLowerCase()
    
    // Heuristic analysis (Mock)
    // In production, call OpenAI or specialized NLP model
    
    const positives = ['success', 'merged', 'fixed', 'resolved', 'deployed', 'shipped', 'great', 'approved']
    const negatives = ['failed', 'error', 'broken', 'rejected', 'bug', 'issue', 'down', 'crash']

    let score = 0
    
    positives.forEach(w => { if(lower.includes(w)) score += 0.5 })
    negatives.forEach(w => { if(lower.includes(w)) score -= 0.5 })

    // Clamp -1 to 1
    score = Math.max(-1, Math.min(1, score))

    let label: Sentiment = 'neutral'
    if (score > 0.2) label = 'positive'
    if (score < -0.2) label = 'negative'

    return { score, label }
}
