import { Octokit } from 'octokit'

// Initialize Octokit with a personal access token or installation token
// In a real app, you'd fetch the installation token for the specific Org/Repo
const getOctokit = (token?: string) => {
    return new Octokit({ 
        auth: token || process.env.GITHUB_ACCESS_TOKEN 
    })
}

export interface PRDetails {
    title: string
    body: string
    additions: number
    deletions: number
    changed_files: number
    merged: boolean
    state: string
    reviewers: string[]
}

export async function fetchPRDetails(owner: string, repo: string, pull_number: number): Promise<PRDetails | null> {
    try {
        const octokit = getOctokit()
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
            owner,
            repo,
            pull_number,
        })

        return {
            title: data.title,
            body: data.body || '',
            additions: data.additions,
            deletions: data.deletions,
            changed_files: data.changed_files,
            merged: data.merged,
            state: data.state,
            reviewers: data.requested_reviewers?.map((u: any) => u.login) || []
        }
    } catch (error) {
        console.error(`Error fetching PR details for ${owner}/${repo}#${pull_number}:`, error)
        return null
    }
}

export async function fetchIssueComments(owner: string, repo: string, issue_number: number) {
    try {
        const octokit = getOctokit()
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
            owner,
            repo,
            issue_number,
            per_page: 5, // fetch last 5
            sort: 'created',
            direction: 'desc'
        })
        return data.map(comment => ({
            user: comment.user?.login,
            body: comment.body,
            created_at: comment.created_at
        }))
    } catch (error) {
        console.error(`Error fetching comments for ${owner}/${repo}#${issue_number}:`, error)
        return []
    }
}

export async function fetchCommitDiff(owner: string, repo: string, ref: string) {
    // Fetches the commit and its patches
     try {
        const octokit = getOctokit()
        const { data } = await octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', {
            owner,
            repo,
            ref,
        })
        
        return {
            message: data.commit.message,
            author: data.commit.author?.name,
            files: data.files?.map(f => ({
                filename: f.filename,
                status: f.status,
                patch: f.patch // The diff content
            }))
        }
    } catch (error) {
        console.error(`Error fetching diff for ${owner}/${repo}@${ref}:`, error)
        return null
    }
}

// -- Legacy/Auth Functions (Restored) --

export function getGitHubAuthUrl() {
    const clientId = process.env.GITHUB_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`
}

export async function exchangeCodeForToken(code: string) {
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code
        })
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error_description)
    return data.access_token
}

export async function getUserData(token: string) {
    const octokit = getOctokit(token)
    const { data } = await octokit.request('GET /user')
    return data
}

export async function getUserRepos(token: string) {
    const octokit = getOctokit(token)
    const { data } = await octokit.request('GET /user/repos', {
        sort: 'updated',
        per_page: 100
    })
    return data
}
