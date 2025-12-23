// Basic Jira Client using REST API V3
// Auth relies on Email + API Token (Basic Auth) for Cloud

const getJiraConfig = () => ({
    domain: process.env.JIRA_DOMAIN, // e.g. 'your-domain.atlassian.net'
    email: process.env.JIRA_EMAIL,
    token: process.env.JIRA_API_TOKEN
})

const getHeaders = () => {
    const { email, token } = getJiraConfig()
    const auth = Buffer.from(`${email}:${token}`).toString('base64')
    return {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
}

export async function fetchIssue(issueKey: string) {
    const { domain } = getJiraConfig()
    if (!domain) return null

    const url = `https://${domain}/rest/api/3/issue/${issueKey}`

    try {
        const res = await fetch(url, { headers: getHeaders() })
        if (!res.ok) throw new Error(`Jira API error: ${res.statusText}`)
        
        const data = await res.json()
        const fields = data.fields
        return {
            key: data.key,
            summary: fields.summary,
            description: fields.description, // Note: This is usually Atlassian Document Format (ADF)
            status: fields.status?.name,
            assignee: fields.assignee?.displayName,
            priority: fields.priority?.name,
            created: fields.created
        }
    } catch (error) {
         console.error(`Failed to fetch Jira Issue ${issueKey}`, error)
         return null
    }
}

export async function searchIssues(jql: string) {
    const { domain } = getJiraConfig()
    if (!domain) return []

    const url = `https://${domain}/rest/api/3/search`

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                jql,
                maxResults: 10,
                fields: ['summary', 'status', 'assignee', 'priority']
            })
        })
        if (!res.ok) throw new Error(`Jira API error: ${res.statusText}`)
        const data = await res.json()
        return data.issues.map((i: any) => ({
            key: i.key,
            summary: i.fields.summary,
            status: i.fields.status?.name
        }))
    } catch (error) {
        console.error(`Failed to search Jira issues with JQL: ${jql}`, error)
        return []
    }
}

// -- Legacy/Action Functions (Restored) --

export async function createJiraIssue(issueData: any) {
    const { domain } = getJiraConfig()
    if (!domain) throw new Error("Jira domain not configured")
    
    // Default URL for creating issue
    const url = `https://${domain}/rest/api/3/issue`
    
    // Assume issueData is formatted correctly for Jira API
    // e.g. { fields: { project: { key: 'PROJ' }, summary: '...', issuetype: { name: 'Task' } } }
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(issueData)
        })
        
        if (!res.ok) {
            const err = await res.text()
            throw new Error(`Jira API Error: ${err}`)
        }
        
        return await res.json()
    } catch (error) {
        console.error("Failed to create Jira issue", error)
        throw error
    }
}

export async function getJiraProjects() {
    const { domain } = getJiraConfig()
    if (!domain) return []
    
    const url = `https://${domain}/rest/api/3/project/search`
    
    try {
        const res = await fetch(url, { headers: getHeaders() })
        if (!res.ok) throw new Error(res.statusText)
        const data = await res.json()
        return data.values || [] // 'values' is typical for paginated Jira responses
    } catch (error) {
        console.error("Failed to fetch Jira projects", error)
        return []
    }
}
