# OpsCord Lite - Setup Guide

A lightweight, production-ready AI-powered DevOps platform connecting GitHub and Discord with minimal dependencies.

## What's Lightweight About This Version?

- **Minimal Dependencies**: Reduced from 60+ UI components to essential only
- **Streamlined Architecture**: Removed Prisma ORM, Bull queues, and complex workers
- **Focus on Real-Time**: GitHub webhooks + Discord API + Google Gemini AI
- **Easy to Deploy**: Deploy to Vercel with environment variables only

## Quick Start

### 1. Clone & Setup

\`\`\`bash
git clone <your-repo>
cd opscord-lite
npm install
\`\`\`

### 2. Environment Variables

Create `.env.local`:

\`\`\`env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>

# GitHub OAuth
GITHUB_OAUTH_ID=<from GitHub OAuth App>
GITHUB_OAUTH_SECRET=<from GitHub OAuth App>
GITHUB_TOKEN=<GitHub personal access token>

# Discord OAuth & Bot
DISCORD_OAUTH_ID=<from Discord Developer Portal>
DISCORD_OAUTH_SECRET=<from Discord Developer Portal>
DISCORD_TOKEN=<Discord bot token>
DISCORD_PUBLIC_KEY=<from Discord Developer Portal>

# Google Gemini AI
GEMINI_API_KEY=<from Google AI Studio>

# Database
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/opscord_lite

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 3. Database Setup

\`\`\`bash
npx prisma migrate deploy
npx prisma db seed
\`\`\`

### 4. GitHub OAuth App Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret

### 5. Discord Bot Setup

1. Go to Discord Developer Portal
2. Create new application
3. Create bot user
4. In OAuth2 → URL Generator, select scopes: `bot` and permissions: `Send Messages`, `Embed Links`
5. Copy bot token and public key

### 6. Google Gemini Setup

1. Visit [Google AI Studio](https://aistudio.google.com)
2. Get free API key
3. Add to environment variables

### 7. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Architecture Overview

### Database Schema (Lightweight)

\`\`\`
User
├── Repositories (owned by user)
│   ├── PullRequests
│   └── Issues
├── Integrations (GitHub/Discord connections)
└── Notifications
\`\`\`

### API Routes

**Core APIs:**
- `GET/POST /api/repositories` - Manage repos
- `GET/POST /api/pull-requests` - PR tracking
- `GET /api/issues` - Issue tracking
- `GET /api/integrations` - Connected services
- `POST /api/integrations/connect` - Add integrations

**Webhooks:**
- `POST /api/webhooks/github` - GitHub events
- `POST /api/discord/interactions` - Discord slash commands

**AI Features:**
- `POST /api/ai/summarize-pr` - Generate PR summary
- `POST /api/ai/categorize-issue` - Categorize issues
- `POST /api/ai/generate-review` - Code review insights

### Key Features

1. **GitHub Integration**
   - Webhook support for PR/Issue events
   - Automatic event tracking
   - OAuth authentication

2. **Discord Integration**
   - Real-time notifications
   - Bot slash commands
   - Message embeds with PR/Issue summaries

3. **AI Features**
   - PR summarization with Gemini
   - Issue categorization
   - Code review insights

4. **Dashboard**
   - Repository overview
   - PR and Issue tracking
   - Integration management
   - Analytics dashboard
   - Settings panel

## Deployment to Vercel

### 1. Push to GitHub

\`\`\`bash
git push origin main
\`\`\`

### 2. Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "Add New" → "Project"
3. Select your repository
4. Add environment variables
5. Deploy

### 3. Set Webhook URLs

**GitHub Webhook:**
- Settings → Webhooks → Add webhook
- Payload URL: `https://your-domain.vercel.app/api/webhooks/github`
- Events: Pull requests, Issues, Pushes
- Secret: Use same as `GITHUB_WEBHOOK_SECRET`

**Discord Interactions URL:**
- Developer Portal → General Information
- Interactions Endpoint URL: `https://your-domain.vercel.app/api/discord/interactions`

## File Structure

\`\`\`
opscord-lite/
├── app/
│   ├── api/
│   │   ├── webhooks/github/      # GitHub webhook handler
│   │   ├── ai/                   # AI summarization endpoints
│   │   ├── integrations/         # Integration management
│   │   ├── repositories/         # Repository APIs
│   │   ├── pull-requests/        # PR APIs
│   │   └── issues/               # Issue APIs
│   ├── auth/                     # NextAuth pages
│   ├── dashboard/                # Protected dashboard pages
│   └── layout.tsx
├── components/
│   ├── dashboard/               # Dashboard components
│   └── ui/                       # Basic UI components (shadcn)
├── lib/
│   ├── ai-client.ts             # Gemini integration
│   ├── github-client.ts         # GitHub API utilities
│   ├── discord-client.ts        # Discord API utilities
│   ├── config.ts                # Configuration
│   └── prisma.ts                # Database client
├── prisma/
│   └── schema.prisma            # Database schema
└── auth.ts                      # NextAuth config
\`\`\`

## Common Tasks

### Add a New GitHub Repository

1. Go to Dashboard
2. Click "Integrations"
3. Connect GitHub (if not already)
4. Select repository
5. Enable webhooks

### Set Up Discord Notifications

1. Create Discord server (or use existing)
2. Go to Integrations page
3. Click "Connect Discord"
4. Authorize bot for your server
5. Select notification channel

### Enable AI Summaries

1. Go to Pull Requests page
2. View open PRs
3. Click "Generate Summary" button
4. AI will create and save summary

## Troubleshooting

### Webhook Not Working

- Check GitHub webhook delivery in Settings → Webhooks
- Verify webhook secret matches in both GitHub and `.env.local`
- Check Vercel function logs

### AI Summaries Not Generating

- Verify `GEMINI_API_KEY` is set
- Check that API key has quota remaining
- View API logs in [Google AI Studio](https://aistudio.google.com)

### Discord Notifications Not Sending

- Verify bot has `Send Messages` permission in channel
- Check that `DISCORD_TOKEN` is correct
- Verify channel ID is saved in integrations

## Performance Tips

- Use database indexes on frequently queried fields
- Cache repository data on dashboard
- Implement request deduplication for webhooks
- Use Discord message threading for related notifications

## Next Steps

- Add GitHub status checks
- Implement issue labeling automation
- Create Discord interactive buttons
- Build team leaderboards with gamification
- Add Slack integration
- Create mobile app with React Native

## Support

For issues or questions:
1. Check logs in Vercel dashboard
2. Review API response status codes
3. Test with curl or Postman
4. Check integration configurations
