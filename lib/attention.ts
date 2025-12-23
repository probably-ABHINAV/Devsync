export type AttentionContext = {
    source: string
    title: string
    description?: string
    metadata?: any
}

export function calculateAttentionScore(event: AttentionContext): number {
    let score = 0;

    // 1. Base Score by Source
    switch(event.source) {
        case 'jira': score = 50; break;     // Work items are generally important
        case 'github': score = 30; break;   // High volume, lower average importance
        case 'discord': score = 40; break;  // Communication can be urgent
        default: score = 20;
    }

    const content = (event.title + ' ' + (event.description || '')).toLowerCase();

    // 2. Keyword Multipliers
    if (content.match(/urgent|critical|blocker|outage|down|fail|error|exception/)) score += 40;
    if (content.match(/fix|patch|resolve/)) score += 10;
    if (content.match(/chore|refactor|docs|style|test/)) score -= 10;
    
    // 3. User/Bot Context
    // Check if it's a bot (common bot names)
    if (content.match(/dependabot|renovate|snyk|bot/)) score -= 20;

    // 4. State Context
    if (event.metadata) {
        if (event.metadata.status === 'closed' || event.metadata.merged === true) score -= 10;
        if (event.metadata.priority === 'High' || event.metadata.priority === 'Highest') score += 30;
    }

    // 5. Clamping
    return Math.max(0, Math.min(100, score));
}
