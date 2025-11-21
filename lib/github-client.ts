import axios from "axios"
import crypto from "crypto"

const GITHUB_API = "https://api.github.com"

export async function verifyWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(payload)
  const digest = `sha256=${hmac.digest("hex")}`
  return signature === digest
}

export async function createGitHubIssue(
  owner: string,
  repo: string,
  title: string,
  body: string,
  token: string,
  labels: string[] = [],
) {
  try {
    const response = await axios.post(
      `${GITHUB_API}/repos/${owner}/${repo}/issues`,
      { title, body, labels },
      { headers: { Authorization: `token ${token}` } },
    )
    return response.data
  } catch (error) {
    console.error("[GitHub] Error creating issue:", error)
    throw error
  }
}

export async function addPullRequestComment(
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
  token: string,
) {
  try {
    const response = await axios.post(
      `${GITHUB_API}/repos/${owner}/${repo}/issues/${prNumber}/comments`,
      { body },
      { headers: { Authorization: `token ${token}` } },
    )
    return response.data
  } catch (error) {
    console.error("[GitHub] Error adding comment:", error)
    throw error
  }
}

export async function getPullRequestDetails(owner: string, repo: string, prNumber: number, token: string) {
  try {
    const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}`, {
      headers: { Authorization: `token ${token}` },
    })
    return response.data
  } catch (error) {
    console.error("[GitHub] Error fetching PR details:", error)
    throw error
  }
}

export async function getRepositories(owner: string, token: string) {
  try {
    const response = await axios.get(`${GITHUB_API}/users/${owner}/repos`, {
      headers: { Authorization: `token ${token}` },
      params: { per_page: 100 },
    })
    return response.data
  } catch (error) {
    console.error("[GitHub] Error fetching repositories:", error)
    return []
  }
}

export interface GitHubWebhookPayload {
  action: string
  pull_request?: {
    number: number
    title: string
    body: string
    user: { login: string }
    html_url: string
    state: string
    changed_files?: number
  }
  issue?: {
    number: number
    title: string
    body: string
    user: { login: string }
    html_url: string
    state: string
    labels?: Array<{ name: string }>
  }
  repository: {
    id: number
    full_name: string
    name: string
    owner: { login: string }
  }
}

export function parseGitHubWebhookPayload(payload: GitHubWebhookPayload) {
  if (payload.pull_request) {
    const { number, title, body, user, html_url, state, changed_files } = payload.pull_request
    return {
      type: "pull_request",
      action: payload.action,
      number,
      title,
      body,
      author: user.login,
      url: html_url,
      state,
      changes: changed_files || 0,
      repo: payload.repository.full_name,
    }
  }

  if (payload.issue) {
    const { number, title, body, user, html_url, state, labels } = payload.issue
    return {
      type: "issue",
      action: payload.action,
      number,
      title,
      body,
      author: user.login,
      url: html_url,
      state,
      labels: labels?.map((l) => l.name) || [],
      repo: payload.repository.full_name,
    }
  }

  return null
}
