# OpsCord - Quick Start Guide (Independent Setup)

Get OpsCord running independently from Replit in 30 minutes.

---

## 📋 What You Need

| Service | Time | Cost | Skip-able |
|---------|------|------|-----------|
| Supabase | 5 min | Free | ❌ NO |
| GitHub OAuth | 5 min | Free | ❌ NO |
| Your Domain | 5 min | Free | ✅ Can use Vercel |
| Google Gemini | 5 min | Free (paid for usage) | ✅ YES |
| Discord Bot | 5 min | Free | ✅ YES |

**Minimum time to launch: 15 minutes**

---

## ⚡ 5-Minute Setup (Must Have)

### Step 1: Create Supabase Project (5 min)
```
1. Go to https://supabase.com → Sign up
2. Create new project
   - Name: opscord
   - Database password: [strong random]
   - Region: [closest to you]
3. Wait 2-3 minutes
4. Settings > API
   Copy:
   ✓ Project URL
   ✓ Anon Key
   ✓ Service Role Key
```

### Step 2: Setup Database (5 min)
```
1. In Supabase, go to SQL Editor
2. Create new query
3. Paste entire supabase-schema.sql file
4. Click Run
5. Done! ✓
```

### Step 3: Create GitHub OAuth App (5 min)
```
1. Go to https://github.com/settings/developers
2. OAuth Apps > New OAuth App
   - Name: OpsCord
   - Homepage: https://yourdomain.com
   - Callback: https://yourdomain.com/api/auth/callback
3. Copy Client ID and Secret
4. Generate webhook secret:
   openssl rand -hex 32
5. Done! ✓
```

---

## 🚀 Deploy to Production (Choose One)

### Option A: Vercel (Easiest - 5 min)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com
# 3. Import your GitHub repo
# 4. Add environment variables:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_WEBHOOK_SECRET=...
NEXT_PUBLIC_APP_URL=https://opscord-xyz.vercel.app
NODE_ENV=production

# 5. Deploy!
# 6. GitHub webhook:
#    Settings > Webhooks > Add webhook
#    URL: https://opscord-xyz.vercel.app/api/github/webhook
#    Events: All
```

**Cost**: Free (or $20/month Pro)

### Option B: AWS (More Control - 10 min)

See `DEPLOYMENT.md` → AWS section

### Option C: Docker (Self-hosted - 15 min)

See `DEPLOYMENT.md` → Docker section

---

## ✅ Verify It Works

```bash
# 1. Test login
Visit: https://yourdomain.com/
Click "Login with GitHub"
You should see your profile

# 2. Test webhook
Push a commit to your repo
Verify in Supabase SQL Editor:
SELECT * FROM webhooks;
(you should see recent entries)

# 3. Test (optional) Discord
Add bot to server and try:
/ping
Should respond with "Pong!"
```

---

## 📚 After Launch

### Next Steps:
1. **Add Gemini Key** (for AI summaries)
   - Go to https://ai.google.dev/
   - Get API key
   - Add to env vars

2. **Add Discord Bot** (for slash commands)
   - Create bot at https://discord.com/developers/applications
   - Copy token
   - Add to env vars

3. **Monitor & Improve**
   - Check Supabase dashboard
   - Review webhook logs
   - Gather user feedback

### Coming Soon (Phase 2.0):
- Advanced AI features
- Background job queue
- Admin dashboard
- Extended analytics

---

## 🆘 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| "Invalid API Key" | Check you copied key completely (no spaces) |
| "Database connection failed" | Verify Supabase project isn't paused |
| "GitHub login doesn't work" | Check callback URL matches exactly |
| "Webhook not received" | Verify URL is accessible, webhook secret matches |
| "AI summaries don't work" | Add GEMINI_API_KEY to environment variables |

---

## 📞 Full Documentation

- **API_KEYS_SETUP.md** - Detailed setup for each service
- **DEPLOYMENT.md** - Full deployment options
- **PRODUCT_ROADMAP.md** - Future features
- **README.md** - Product overview

---

## 🎯 You're Done!

Your OpsCord instance is live and **fully independent from Replit**.

**Next**: Share your domain and invite your team!

```
Share your URL:
https://yourdomain.com

Team can now:
✓ Login with GitHub
✓ Get AI PR summaries
✓ Earn XP and badges
✓ View team analytics
```

Happy DevOps! 🚀
