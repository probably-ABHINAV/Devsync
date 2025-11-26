# Environment Variables Setup Guide

**Quick reference for setting up your .env file**

---

## Step 1: Copy Template
```bash
cp .env.example .env.local
```

## Step 2: Fill in Your Values

Edit `.env.local` and replace each placeholder:

### Discord Section
```
DISCORD_TOKEN = (from Discord Developer Portal → Bot → TOKEN)
DISCORD_PUBLIC_KEY = (from General Information → Public Key)
DISCORD_CLIENT_ID = (from General Information → Application ID)
DISCORD_CLIENT_SECRET = (from OAuth2 → Client Secret)
```

### GitHub Section
```
GITHUB_CLIENT_ID = (from GitHub OAuth App settings)
GITHUB_CLIENT_SECRET = (from GitHub OAuth App settings)
GITHUB_TOKEN = (your Personal Access Token)
GITHUB_WEBHOOK_SECRET = (you create this - same secret for all webhooks)
GITHUB_PRIVATE_KEY = (from GitHub App settings - multiline, keep as-is)
```

### Supabase Section
```
NEXT_PUBLIC_SUPABASE_URL = (from Supabase project settings)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (from API settings → Anon key)
SUPABASE_SERVICE_ROLE_KEY = (from API settings → Service role key)
```

### Gemini Section
```
GEMINI_API_KEY = (from Google AI Studio)
```

### App Configuration
```
NEXT_PUBLIC_APP_URL = http://localhost:5000 (for Replit)
                   OR
                   https://yourapp.vercel.app (for Vercel)
```

---

## Step 3: Test

Start your app:
```bash
npm run dev
```

Bot should work immediately.

---

## For Vercel Deployment

**DO NOT upload .env file to Vercel!**

Instead:
1. In Vercel dashboard → Settings → Environment Variables
2. Add each variable individually
3. See VERCEL_MIGRATION.md for detailed steps

---

## Security Notes

✅ .env.local is in .gitignore (won't be committed)
✅ .env.example shows structure only (safe to commit)
✅ Never commit files with real secrets
✅ Keep secrets local during development

---

## All 14 Variables Needed

1. DISCORD_TOKEN
2. DISCORD_PUBLIC_KEY
3. DISCORD_CLIENT_ID
4. DISCORD_CLIENT_SECRET
5. GITHUB_CLIENT_ID
6. GITHUB_CLIENT_SECRET
7. GITHUB_TOKEN
8. GITHUB_WEBHOOK_SECRET
9. GITHUB_PRIVATE_KEY
10. NEXT_PUBLIC_SUPABASE_URL
11. NEXT_PUBLIC_SUPABASE_ANON_KEY
12. SUPABASE_SERVICE_ROLE_KEY
13. GEMINI_API_KEY
14. NEXT_PUBLIC_APP_URL
