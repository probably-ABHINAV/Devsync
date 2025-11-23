# OpsCord - Complete API Keys Summary

## 📊 All Keys at a Glance

### ✅ REQUIRED (7 Keys)
Must have to launch OpsCord:

| # | Key Name | Where to Get | Format | Skip? |
|---|----------|--------------|--------|-------|
| 1 | `NEXT_PUBLIC_SUPABASE_URL` | supabase.com/settings | `https://project.supabase.co` | NO |
| 2 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com/settings | JWT token (long) | NO |
| 3 | `SUPABASE_SERVICE_ROLE_KEY` | supabase.com/settings | JWT token (long) | NO |
| 4 | `GITHUB_CLIENT_ID` | github.com/settings/developers | `Iv1.abc123...` | NO |
| 5 | `GITHUB_CLIENT_SECRET` | github.com/settings/developers | Long alphanumeric | NO |
| 6 | `GITHUB_WEBHOOK_SECRET` | `openssl rand -hex 32` | 64 hex chars | NO |
| 7 | `NEXT_PUBLIC_APP_URL` | Your domain | `https://yourdomain.com` | NO |

### ⭐ RECOMMENDED (1 Key)
Enhanced features:

| # | Key Name | Where to Get | Purpose | Skip? |
|---|----------|--------------|---------|-------|
| 8 | `GEMINI_API_KEY` | ai.google.dev | AI PR summaries | YES* |

*Can be added later

### 🔵 OPTIONAL (3 Keys)
Discord bot integration:

| # | Key Name | Where to Get | Purpose | Skip? |
|---|----------|--------------|---------|-------|
| 9 | `DISCORD_CLIENT_ID` | discord.com/developers | Bot ID | YES |
| 10 | `DISCORD_TOKEN` | discord.com/developers | Bot token | YES |
| 11 | `DISCORD_PUBLIC_KEY` | discord.com/developers | Slash commands | YES |

### 📌 FUTURE (2 Keys)
Phase 2.0 - Background jobs:

| # | Key Name | Where to Get | Purpose | Timeline |
|---|----------|--------------|---------|----------|
| 12 | `UPSTASH_REDIS_URL` | upstash.com | Job queue | Q1 2026 |
| 13 | `UPSTASH_REDIS_TOKEN` | upstash.com | Queue auth | Q1 2026 |

---

## 🚀 Minimum Setup (15 minutes)

### What you need:
1. Supabase account (free)
2. GitHub account
3. Your domain (or use Vercel)

### Keys you get:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_WEBHOOK_SECRET=...  # Generate with: openssl rand -hex 32
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

**Ready to launch!** 🎉

---

## 📈 Enhanced Setup (25 minutes)

Add AI PR summaries:
```bash
GEMINI_API_KEY=...
```

**Get AI summaries!** 🤖

---

## 🎪 Full Setup (35 minutes)

Add Discord bot:
```bash
DISCORD_CLIENT_ID=...
DISCORD_TOKEN=...
DISCORD_PUBLIC_KEY=...
```

**Get all features!** ✨

---

## 🌍 Deploy Independently

### Option 1: Vercel (Recommended)
- **Time**: 5-10 minutes
- **Cost**: Free or $20/month
- **Easy**: Copy-paste env vars in dashboard
- **URL**: `opscord-xyz.vercel.app`

### Option 2: AWS
- **Time**: 20-30 minutes
- **Cost**: $10-50/month
- **Control**: Full control over infrastructure
- **URL**: Your domain

### Option 3: Docker
- **Time**: 30-45 minutes
- **Cost**: Your hosting costs
- **Flexibility**: Deploy anywhere
- **URL**: Your domain

---

## 📝 Complete .env Template

Copy this to `.env.local` (development) or set in deployment platform:

```bash
# ════════════════════════════════════════════════════════════
# REQUIRED (Must have)
# ════════════════════════════════════════════════════════════

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

GITHUB_CLIENT_ID=Iv1.abc123xyz
GITHUB_CLIENT_SECRET=ghp_abc123def456ghi789
GITHUB_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

NEXT_PUBLIC_APP_URL=https://opscord.yourdomain.com
NODE_ENV=production

# ════════════════════════════════════════════════════════════
# RECOMMENDED (For AI features)
# ════════════════════════════════════════════════════════════

GEMINI_API_KEY=AIzaSyD1234567890abcdefghijk_lmnopqrst

# ════════════════════════════════════════════════════════════
# OPTIONAL (For Discord)
# ════════════════════════════════════════════════════════════

DISCORD_CLIENT_ID=123456789012345678
DISCORD_TOKEN=MTk4NjIyNDgzNTcxNzMwNTc2.Clwa7A.l7rSkUIETEUTUR
DISCORD_PUBLIC_KEY=abc123xyz789def456

# ════════════════════════════════════════════════════════════
# FUTURE (Phase 2.0)
# ════════════════════════════════════════════════════════════

# UPSTASH_REDIS_URL=redis://default:password@host:port
# UPSTASH_REDIS_TOKEN=abc123token
```

---

## 💾 Setup Checklist

### Step 1: Get Keys (20 minutes)

- [ ] **Supabase**
  - [ ] Go to https://supabase.com
  - [ ] Create project
  - [ ] Copy Project URL
  - [ ] Copy Anon Key
  - [ ] Copy Service Role Key

- [ ] **GitHub**
  - [ ] Go to https://github.com/settings/developers
  - [ ] Create OAuth App
  - [ ] Copy Client ID
  - [ ] Copy Client Secret
  - [ ] Generate webhook secret: `openssl rand -hex 32`

- [ ] **Gemini** (Optional)
  - [ ] Go to https://ai.google.dev
  - [ ] Get API Key

- [ ] **Discord** (Optional)
  - [ ] Go to https://discord.com/developers
  - [ ] Create Bot
  - [ ] Copy Token
  - [ ] Copy Client ID
  - [ ] Copy Public Key

### Step 2: Setup Database (5 minutes)

- [ ] In Supabase SQL Editor
- [ ] Run `supabase-schema.sql`
- [ ] Verify all tables created

### Step 3: Deploy (10 minutes)

Choose one:
- [ ] **Vercel**: Import GitHub repo → Add env vars → Deploy
- [ ] **AWS**: Lambda + RDS setup (see DEPLOYMENT.md)
- [ ] **Docker**: Build & deploy to your host

### Step 4: Configure Webhooks (5 minutes)

- [ ] **GitHub**: 
  - [ ] Settings > Webhooks
  - [ ] URL: `https://yourdomain.com/api/github/webhook`
  - [ ] Events: All
  
- [ ] **Discord** (if using):
  - [ ] Interactions Endpoint URL: `https://yourdomain.com/api/discord/webhook`

### Step 5: Test (5 minutes)

- [ ] Visit `https://yourdomain.com`
- [ ] Login with GitHub
- [ ] Check Supabase for webhook data
- [ ] Try Discord commands (if configured)

---

## 🔐 Security Best Practices

✅ **DO**:
- Use strong, random webhook secret
- Store keys in environment variables only
- Rotate keys every 90 days
- Keep keys in password manager
- Use different keys for dev/prod
- Enable 2FA on all accounts

❌ **DON'T**:
- Commit `.env` files to git
- Share keys via email/chat
- Use same key everywhere
- Log or display keys
- Hardcode keys in source code

---

## 💰 Cost Breakdown (Monthly)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Supabase | 500MB DB, Unlimited API | $25+ |
| GitHub | Unlimited | N/A |
| Vercel | 100GB bandwidth/month | $20+ |
| Google Gemini | 60 req/min free | ~$0.0004 per PR |
| Discord | Free | N/A |
| Upstash Redis | 10K cmd/day | $0.20 per 100K cmd |

**Minimum Cost**: $0 (free tier only)  
**Recommended**: $25-45/month  
**Enterprise**: $100+/month

---

## 📚 Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| **QUICK_START.md** | 30-min setup guide | 10 min |
| **API_KEYS_SETUP.md** | Detailed key setup | 20 min |
| **API_KEYS_REFERENCE.txt** | Quick reference card | 5 min |
| **DEPLOYMENT.md** | Deployment options | 15 min |
| **PRODUCT_ROADMAP.md** | Future features | 10 min |
| **README.md** | Product overview | 10 min |

**Start with**: QUICK_START.md (fastest path to launch)

---

## 🎯 Summary

**What you need to launch OpsCord independently from Replit:**

1. **7 Required API Keys** (15-25 minutes to get)
2. **Supabase Database** (free tier sufficient)
3. **GitHub OAuth App** (free)
4. **Your Domain** (Vercel free or custom domain)

**Total time to launch**: 30-45 minutes  
**Total cost**: Free-$50/month  
**Result**: Fully independent production app ✨

---

See **QUICK_START.md** for step-by-step instructions.
