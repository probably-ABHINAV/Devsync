# GitHub OAuth Setup Guide for OpsCord

## Overview
OpsCord integrates with GitHub to provide real-time repository updates and AI insights through Discord.

## Prerequisites
- GitHub Account with repository access
- OpsCord application deployed or running locally

## GitHub App Configuration

### Step 1: Create GitHub App

1. Go to https://github.com/settings/developers/apps
2. Click **New GitHub App**
3. Fill in the following details:

**Basic Settings:**
- **GitHub App name**: `OpsCord`
- **Homepage URL**: `https://opscord.vercel.app` (or your local dev URL)
- **User authorization callback URL**: `https://opscord.vercel.app/api/auth/callback/github`
- **Description**: `OpsCord connects GitHub repositories with Discord for real-time updates and AI insights.`

**Webhook Settings:**
- **Active**: Checked ✓
- **Webhook URL**: `https://opscord.vercel.app/api/github/webhook`
- **Webhook secret**: Generate a strong random string (save this as `GITHUB_WEBHOOK_SECRET`)
- **SSL verification**: Enabled ✓

### Step 2: Configure Permissions

**Repository Permissions:**
- Contents: `Read & write` (for reading/writing files)
- Issues: `Read & write` (for managing issues)
- Pull requests: `Read & write` (for managing PRs)
- Workflows: `Read & write` (for CI/CD)
- Commit statuses: `Read & write`

**Organization Permissions:**
- Members: `Read-only` (for team info)

**Account Permissions:**
- Email addresses: `Read-only`

### Step 3: Subscribe to Events

Select the following events to subscribe to:
- Push
- Pull request
- Issues
- Workflow run
- Release
- Repository

### Step 4: Installation Target

Choose **"Any account"** to allow installation by any user or organization.

### Step 5: Get Credentials

After creating the app:

1. Copy **App ID** → `GITHUB_OAUTH_ID`
2. Generate a **Client Secret** → `GITHUB_OAUTH_SECRET`
3. Generate a **Private Key** → `GITHUB_PRIVATE_KEY` (PEM format)

## Environment Variables

Add these to your `.env.local` or Vercel project settings:

\`\`\`env
# GitHub OAuth
GITHUB_OAUTH_ID=your_github_app_id
GITHUB_OAUTH_SECRET=your_github_app_secret
GITHUB_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# GitHub Token (for API access)
GITHUB_TOKEN=your_personal_access_token

# GitHub App Webhook URL
GITHUB_WEBHOOK_URL=https://opscord.vercel.app/api/github/webhook
\`\`\`

## Installation for Users

Users can install OpsCord on their repositories by:

1. Visiting the GitHub App installation page
2. Selecting which repositories to grant access
3. Authorizing the app

## Troubleshooting

### Webhook Delivery Issues
- Check the webhook secret matches in Settings
- Verify the webhook URL is accessible
- Check firewall/network settings

### OAuth Flow Issues
- Ensure callback URL matches exactly
- Clear browser cookies and try again
- Verify Client Secret is correct

### Missing Permissions
- Reinstall the app
- Update required permissions
- Reauthorize repositories

## Support

For issues with GitHub integration, visit:
- GitHub App Settings: https://github.com/settings/developers/apps
- OpsCord Documentation: Your documentation site
