# OpsCord - Complete API Keys & Setup Guide

This guide covers **all required API keys** and how to set them up to make OpsCord fully independent of Replit.

---

## 📋 Summary Table

| Service | Key Name | Required | Purpose | Cost |
|---------|----------|----------|---------|------|
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL` | ✅ YES | Database URL | Free tier available |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ YES | Public API key | Free tier available |
| **Supabase** | `SUPABASE_SERVICE_ROLE_KEY` | ✅ YES | Server-side admin key | Free tier available |
| **GitHub** | `GITHUB_CLIENT_ID` | ✅ YES | OAuth app ID | Free |
| **GitHub** | `GITHUB_CLIENT_SECRET` | ✅ YES | OAuth app secret | Free |
| **GitHub** | `GITHUB_WEBHOOK_SECRET` | ✅ YES | Webhook verification | Free |
| **Google Gemini** | `GEMINI_API_KEY` | ⭐ RECOMMENDED | AI PR summaries | Paid ($0.075/1M input tokens) |
| **Discord** | `DISCORD_CLIENT_ID` | 🔵 OPTIONAL | Bot application ID | Free |
| **Discord** | `DISCORD_TOKEN` | 🔵 OPTIONAL | Bot token | Free |
| **Discord** | `DISCORD_PUBLIC_KEY` | 🔵 OPTIONAL | Slash command verification | Free |
| **Upstash Redis** | `UPSTASH_REDIS_URL` | 📌 FUTURE (v2.0) | Job queue | Free tier + paid |
| **Upstash Redis** | `UPSTASH_REDIS_TOKEN` | 📌 FUTURE (v2.0) | Queue authentication | Free tier + paid |

---

## 🔑 Step-by-Step Setup

### 1️⃣ SUPABASE (Database) - REQUIRED ✅

**What it is**: Managed PostgreSQL database with real-time capabilities.

**Setup Steps**:
```
1. Go to https://supabase.com
2. Click "Start your project" → Sign up (GitHub recommended)
3. Create new project
   - Name: "opscord" (or your choice)
   - Database password: Generate strong password
   - Region: Choose closest to your users
   - Click "Create new project"
4. Wait 2-3 minutes for project creation
5. Go to Settings > API
6. Copy these three keys:
```

**Keys to Copy**:
```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Initialize Database**:
```
1. In Supabase, go to SQL Editor
2. Create new query
3. Paste entire contents of supabase-schema.sql
4. Click "Run"
5. Wait for completion
```

**Cost**: Free tier includes:
- 500MB database
- 2GB bandwidth
- Unlimited API calls
- Upgrade to Pro ($25/month) for larger databases

---

### 2️⃣ GITHUB OAUTH (Authentication) - REQUIRED ✅

**What it is**: Allows users to log in with GitHub.

**Setup Steps**:
```
1. Go to https://github.com/settings/developers
2. Click "Personal access tokens" → "Tokens (classic)"
3. Click "New personal access token"
   - Note: "OpsCord"
   - Expiration: 90 days
   - Scopes: repo, user, gist
   - Click "Generate token"
   - COPY IT IMMEDIATELY (you won't see it again)
4. Now create OAuth App:
   - Click "New OAuth App"
   - Application name: OpsCord
   - Homepage URL: https://yourdomain.com
   - Authorization callback URL: https://yourdomain.com/api/auth/callback
   - Click "Create OAuth application"
5. You'll see Client ID and Client Secret
```

**Keys to Copy**:
```
GITHUB_CLIENT_ID=Iv1.abc123xyz...
GITHUB_CLIENT_SECRET=def456uvw...
```

**Generate Webhook Secret**:
```bash
# Run this to generate a random secret
openssl rand -hex 32
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

GITHUB_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Cost**: Free

---

### 3️⃣ GOOGLE GEMINI (AI) - RECOMMENDED ⭐

**What it is**: AI model for intelligent PR summarization.

**Setup Steps**:
```
1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Sign in with Google account
4. Click "Create API Key"
5. Select project or create new
6. Copy the API key shown
```

**Key to Copy**:
```
GEMINI_API_KEY=AIzaSyD...
```

**Cost**: 
- Free tier: 60 requests per minute
- Paid: $0.075 per 1M input tokens, $0.30 per 1M output tokens
- Average PR summary: ~5-10 tokens cost (~$0.0004-0.0008)

**Enable in Production**:
Go to Google Cloud Console:
```
1. Go to https://console.cloud.google.com
2. Select your project
3. Go to APIs & Services > Enable APIs and Services
4. Search for "Generative Language API"
5. Click "Enable"
6. Set billing (Free trial or credit card)
```

---

### 4️⃣ DISCORD BOT (Optional) 🔵

**What it is**: Enables slash commands and notifications in Discord.

**Setup Steps**:
```
1. Go to https://discord.com/developers/applications
2. Click "New Application"
   - Name: OpsCord
   - Click "Create"
3. Go to "Bot" section
4. Click "Add Bot"
5. Under TOKEN, click "Copy"
```

**Keys to Copy**:
```
DISCORD_CLIENT_ID=[shown in "General Information"]
DISCORD_TOKEN=[copied from Bot section]
```

**Get Public Key**:
```
1. Go to "General Information" tab
2. Copy the "Public Key"
```

**Key to Copy**:
```
DISCORD_PUBLIC_KEY=abc123xyz...
```

**Add Bot to Your Server**:
```
1. Go to OAuth2 > URL Generator
2. Select scopes: bot, applications.commands
3. Select permissions:
   - Read Messages/View Channels
   - Send Messages
   - Embed Links
   - Read Message History
   - Use Slash Commands
4. Copy generated URL
5. Open URL and authorize
6. Bot joins your server
```

**Set Webhook**:
```
1. Get your Replit/server URL: https://yourdomain.com/api/discord/webhook
2. In Discord Developer Portal:
   - Go to Interactions Endpoint URL
   - Paste: https://yourdomain.com/api/discord/webhook
   - Click Save
```

**Cost**: Free (part of Discord)

---

### 5️⃣ UPSTASH REDIS (Future - Phase 2.0) 📌

**What it is**: High-performance Redis for background job queue.

**Setup Steps** (for Phase 2.0):
```
1. Go to https://upstash.com
2. Sign up (GitHub recommended)
3. Go to Console
4. Click "Create database"
   - Name: opscord-queue
   - Region: Select your region
   - Type: Redis
   - Click "Create"
5. Go to Details
6. Copy Redis URL and Token
```

**Keys to Copy**:
```
UPSTASH_REDIS_URL=redis://default:password@host:port
UPSTASH_REDIS_TOKEN=abc123...
```

**Cost**:
- Free tier: 10,000 commands/day
- Paid: $0.20 per 100K commands/month

---

## 🌐 Complete Environment File

Create `.env.local` (for local development) or set in your hosting platform:

```bash
# ============= REQUIRED KEYS =============

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.abcdef123456
GITHUB_CLIENT_SECRET=abc123def456ghi789jkl012mno345pqr678stu
GITHUB_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# App URL (change based on deployment)
NEXT_PUBLIC_APP_URL=https://opscord.yourdomain.com
NODE_ENV=production

# ============= RECOMMENDED =============

# Google Gemini AI
GEMINI_API_KEY=AIzaSyD1234567890abcdefghijk_lmnopqrst

# ============= OPTIONAL =============

# Discord Bot (for slash commands)
DISCORD_CLIENT_ID=123456789012345678
DISCORD_TOKEN=MTk4NjIyNDgzNTcxNzMwNTc2.Clwa7A.l7rSkUIETEUTUR
DISCORD_PUBLIC_KEY=abc123xyz789def456

# ============= FUTURE (Phase 2.0) =============

# Upstash Redis (for background jobs)
UPSTASH_REDIS_URL=redis://default:abc123@us1-abc123.upstash.io:36379
UPSTASH_REDIS_TOKEN=abc123token
```

---

## 🚀 Deploying Independently

### Option 1: Vercel (Recommended)

```
1. Push code to GitHub
2. Go to vercel.com
3. Click "Import Project"
4. Select your GitHub repo
5. In Environment Variables:
   - Add all keys from above
   - Set NODE_ENV=production
6. Click "Deploy"
7. Configure GitHub webhook:
   - Settings > Webhooks > Add webhook
   - Payload URL: https://your-vercel-url.vercel.app/api/github/webhook
   - Content type: application/json
   - Events: All
8. Configure Discord webhook:
   - Discord Developer Portal > Interactions Endpoint URL
   - Set to: https://your-vercel-url.vercel.app/api/discord/webhook
```

**Costs**:
- Vercel Pro: $20/month (or free hobby tier)
- Other services: As listed above

### Option 2: AWS (Lambda + RDS)

See detailed guide in `DEPLOYMENT.md`

### Option 3: Docker + Any Cloud

See detailed guide in `DEPLOYMENT.md`

---

## ✅ Verification Checklist

After setting up all keys, verify each integration works:

```bash
# 1. Test Supabase connection
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  https://$SUPABASE_PROJECT.supabase.co/rest/v1/users?limit=1

# 2. Test GitHub OAuth by logging in (UI test)

# 3. Test Gemini API
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "hello"}]
    }]
  }'

# 4. Test Discord (by using slash command in your server)

# 5. Test webhook by triggering GitHub event
```

---

## 🔒 Security Best Practices

✅ **DO**:
- Use strong, random webhook secrets (32+ characters)
- Rotate API keys quarterly
- Store keys in environment variables, never in code
- Use service role key only on backend
- Monitor API usage for unusual activity
- Enable 2FA on GitHub, Google, Discord accounts

❌ **DON'T**:
- Commit `.env` files to git
- Share API keys in messages/emails
- Use same key across multiple environments
- Log or display API keys
- Use webhook secrets in frontend code

---

## 💾 Backup & Recovery

Keep a secure record:
```
1. Save all API keys in password manager (1Password, LastPass)
2. Document which service each key belongs to
3. Record creation date and rotation schedule
4. Keep GitHub backup codes saved
5. Note your Supabase project ID
```

---

## 🆘 Troubleshooting

### "Invalid API Key" Error
- Check key is copied completely (no extra spaces)
- Verify key hasn't expired (rotate annually)
- Confirm key is for correct environment (prod vs dev)

### "Webhook failed"
- Verify webhook URL is correct
- Check webhook secret matches
- Ensure service is running and accessible

### "Database connection error"
- Verify Supabase project is not paused
- Check connection string is correct
- Confirm service role key has permissions
- Check network policies allow your IP

### "GitHub OAuth loop"
- Verify callback URL matches exactly
- Check client ID and secret are correct
- Clear browser cookies and retry

---

## 📞 Support

If keys are compromised:
1. **GitHub**: Go to settings and regenerate secret immediately
2. **Supabase**: Rotate API keys in Settings
3. **Gemini**: Disable and recreate API key
4. **Discord**: Regenerate bot token
5. **Upstash**: Create new database

Each service can be updated without affecting others.

---

## 🎯 Minimum Setup for Launch

To get OpsCord running independently, you **must** have:

1. ✅ **Supabase** keys (database)
2. ✅ **GitHub** keys (authentication)
3. ✅ **App URL** (your domain)

Everything else is optional or can be added later.

```bash
# Minimal .env.local to start
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_WEBHOOK_SECRET=...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Then add:
- **Gemini** when ready for AI features
- **Discord** when ready for bot commands
- **Upstash** in Phase 2.0 for background jobs
