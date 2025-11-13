# Opscord - Complete Setup Guide

## Overview
Opscord is an AI-powered GitHub ↔ Discord DevOps bot that automates PR summarization, issue tracking, and team notifications. This guide walks through all required environment variables and configuration steps.

---

## Required Environment Variables

### 1. Supabase Configuration (Database & Auth)
These are **REQUIRED** for the application to function. Get these from your Supabase dashboard.

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
\`\`\`

**Where to find these:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or open existing one
3. Navigate to **Project Settings → API**
4. Copy `Project URL` and `anon public key`
5. Copy `service_role` (keep this secret!)

---

### 2. Application Configuration

\`\`\`
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

**For Production:** Replace with your Vercel deployment URL (e.g., `https://opscord.vercel.app`)

**Used for:**
- GitHub webhook URLs
- OAuth callback redirects
- API endpoint construction

---

### 3. Google Gemini API Configuration (For AI Summarization)

Replaced OpenAI with Google Gemini

\`\`\`
GEMINI_API_KEY=your-gemini-api-key-here
\`\`\`

**Where to get it:**
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create new API key
4. Copy and keep it safe

**Cost:** Free tier includes 15 API calls per minute

---

### 4. GitHub OAuth Configuration

For login and webhook integration.

\`\`\`
GITHUB_OAUTH_ID=your-github-oauth-app-id
GITHUB_OAUTH_SECRET=your-github-oauth-app-secret
GITHUB_APP_WEBHOOK_SECRET=your-webhook-secret
\`\`\`

**How to create GitHub OAuth App:**
1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Navigate to **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name:** Opscord
   - **Homepage URL:** `http://localhost:3000` (or your production URL)
   - **Authorization callback URL:** `http://localhost:3000/auth/callback`
4. Click **Register application**
5. Copy **Client ID** and generate **Client Secret**

**For webhook webhook secret:**
- Any random string (we'll generate one automatically, but you can set a custom one)

---

### 5. Discord OAuth Configuration

\`\`\`
DISCORD_OAUTH_ID=your-discord-app-id
DISCORD_OAUTH_SECRET=your-discord-app-secret
DISCORD_BOT_TOKEN=your-discord-bot-token
\`\`\`

**How to create Discord App:**
1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application**
3. Go to **OAuth2 → General** and copy **Client ID** and **Client Secret**
4. Go to **Bot** → **Add Bot**
5. Copy **Token** (this is your DISCORD_BOT_TOKEN)
6. Under **OAuth2**, add redirect URI: `http://localhost:3000/auth/callback`
7. Give bot permissions:
   - Send Messages
   - Manage Messages
   - Embed Links
   - Read Message History

---

### 6. Job Queue & Redis (Upstash Integration - Already Connected)

These should be auto-populated from your Vercel integration:

\`\`\`
UPSTASH_KV_REST_API_URL=https://your-upstash-endpoint.upstash.io
UPSTASH_KV_REST_API_TOKEN=your-upstash-token
KV_URL=redis://your-upstash-redis-url
KV_REST_API_TOKEN=your-upstash-token
\`\`\`

**If not auto-populated:**
1. Go to [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy connection details
4. Add to Vercel project environment variables

---

### 7. Job Queue Security

\`\`\`
JOB_QUEUE_SECRET=your-secure-random-string
\`\`\`

**Generate a secure secret:**
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

This protects the `/api/jobs/process-queue` endpoint from unauthorized access.

---

## Setup Checklist

### Local Development

- [ ] Create Supabase project
- [ ] Copy Supabase credentials
- [ ] Create Gemini API key
- [ ] Create GitHub OAuth App
- [ ] Create Discord Application & Bot
- [ ] Generate JOB_QUEUE_SECRET
- [ ] Create `.env.local` file with all variables
- [ ] Run database migrations: `npm run setup-db`
- [ ] Start dev server: `npm run dev`

### Production (Vercel)

- [ ] Add all environment variables to Vercel Project Settings → Environment Variables
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Update OAuth redirect URIs for production domain
- [ ] Deploy to Vercel
- [ ] Run database migrations on production database
- [ ] Test OAuth flow

---

## Integration Setup Guide

### 1. GitHub Integration

**Connect your organization:**

1. Log in to Opscord
2. Go to **Dashboard** → **Repositories**
3. Click **Connect Organization**
4. Authorize and select repositories
5. Opscord will generate a webhook URL
6. Add webhook to GitHub (Settings → Webhooks):
   - **Payload URL:** (provided by Opscord)
   - **Events:** Pull Requests, Issues
   - **Secret:** (provided by Opscord)

### 2. Discord Integration

**Connect your Discord server:**

1. Go to **Dashboard** → **Integrations**
2. Click **Add Discord Server**
3. Select server and channel for notifications
4. Choose notification type (PR, Issues, All)
5. Opscord will join your server with bot

### 3. Job Queue Setup

**Automatic processing:**

1. Opscord polls job queue every minute
2. Processes PR summaries in background
3. Sends Discord notifications when complete
4. No manual setup required (uses Upstash Redis)

---

## Environment Variable Summary

\`\`\`env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Application (Required)
NEXT_PUBLIC_APP_URL=

# Google Gemini (Required for AI features)
GEMINI_API_KEY=

# OAuth Providers (Required for login)
GITHUB_OAUTH_ID=
GITHUB_OAUTH_SECRET=
DISCORD_OAUTH_ID=
DISCORD_OAUTH_SECRET=
DISCORD_BOT_TOKEN=

# Job Queue (Required)
UPSTASH_KV_REST_API_URL=
UPSTASH_KV_REST_API_TOKEN=
JOB_QUEUE_SECRET=
\`\`\`

---

## Troubleshooting

### "Unauthorized" on OAuth login
- Check OAuth app redirect URI matches `NEXT_PUBLIC_APP_URL`
- Verify client ID and secret are correct
- Clear browser cookies and try again

### Job queue not processing
- Check `JOB_QUEUE_SECRET` is set
- Verify Upstash Redis is connected
- Check `/api/jobs/process-queue` endpoint is accessible

### Discord notifications not sending
- Verify bot token is correct
- Check bot has permissions in Discord server
- Verify channel ID is correct in database

### PR summaries not generating
- Check Gemini API key is valid
- Verify `GEMINI_API_KEY` is set
- Check job queue is processing

---

## Support

For issues or questions:
1. Check error logs in Vercel dashboard
2. Review database logs in Supabase
3. Test webhook delivery in GitHub settings
4. Check Discord bot permissions

Happy DevOpsing! 🚀
