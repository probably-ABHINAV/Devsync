export interface GitLabConfig {
    host: string // e.g., 'https://gitlab.com' or self-hosted URL
    token: string // Private Token or Project Access Token
}

const getConfig = (): GitLabConfig => ({
    host: process.env.GITLAB_HOST || 'https://gitlab.com',
    token: process.env.GITLAB_TOKEN || ''
})

export async function fetchMRDetails(projectId: string | number, mrIid: number) {
    const { host, token } = getConfig()
    const url = `${host}/api/v4/projects/${projectId}/merge_requests/${mrIid}`

    try {
        const res = await fetch(url, {
            headers: { 'PRIVATE-TOKEN': token }
        })
        if (!res.ok) throw new Error(`GitLab API error: ${res.statusText}`)
        
        const data = await res.json()
        return {
            title: data.title,
            description: data.description,
            state: data.state,
            merged_at: data.merged_at,
            author: data.author?.name,
            reviewers: data.reviewers?.map((r: any) => r.name) || [],
            source_branch: data.source_branch,
            target_branch: data.target_branch
        }
    } catch (error) {
        console.error(`Failed to fetch MR ${projectId}!${mrIid}`, error)
        return null
    }
}

export async function fetchPipelineStatus(projectId: string | number, pipelineId: number) {
    const { host, token } = getConfig()
    const url = `${host}/api/v4/projects/${projectId}/pipelines/${pipelineId}`

    try {
        const res = await fetch(url, {
            headers: { 'PRIVATE-TOKEN': token }
        })
        if (!res.ok) throw new Error(`GitLab API error: ${res.statusText}`)
        
        const data = await res.json()
        return {
            status: data.status,
            ref: data.ref,
            duration: data.duration,
            created_at: data.created_at
        }
    } catch (error) {
         console.error(`Failed to fetch Pipeline ${projectId}:${pipelineId}`, error)
         return null
    }
}
