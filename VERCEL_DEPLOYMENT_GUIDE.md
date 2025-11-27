# OpsCord - Complete Vercel Deployment & Verification Guide

## 🚀 Production Deployment to Vercel

### Prerequisites
- ✅ GitHub account and repo linked
- ✅ Vercel account created
- ✅ All environment variables configured
- ✅ All 12 Discord commands registered

---

## Phase 1: Pre-Deployment Checks (Local)

### 1️⃣ Verify All Commands Are Registered

```bash
# Test locally first
npm run dev

# In another terminal, check if commands are callable
curl -X POST http://localhost:5000/api/discord/register-commands
```

**Expected Response:**
```json
{
  "success": true,
  "commands": [
    {"name": "ping"},
    {"name": "stats"},
    {"name": "summary"},
    {"name": "create-issue"},
    {"name": "assign"},
    {"name": "repo-status"},
    {"name": "setup-notifications"},
    {"name": "ai-review"},
    {"name": "team-stats"},
    {"name": "health-check"},
    {"name": "alert-config"},
    {"name": "recent-activity"},
    {"name": "pr-insights"}
  ]
}
```

### 2️⃣ Test OAuth Flow Locally

```bash
# Visit in browser
http://localhost:5000

# Click "Get Started Free"
# Should redirect to GitHub login
# After approval, should show dashboard
```

**Checklist:**
- [ ] GitHub login works
- [ ] User data loads
- [ ] Repositories display
- [ ] Dashboard renders

### 3️⃣ Test Discord Commands Locally

```bash
# Invite bot to local test server
# Run each command:

/ping
/stats
/summary pr:1
/health-check
/recent-activity limit:5
/pr-insights period:30d
```

**Checklist:**
- [ ] All commands respond within 1 second
- [ ] Error handling works (invalid inputs)
- [ ] Embeds format correctly

### 4️⃣ Test Webhook Locally

```bash
# Set up ngrok to expose local webhook
ngrok http 5000

# In GitHub webhook settings, use ngrok URL:
# https://abc123.ngrok.io/api/github/webhook

# Make a commit or create PR
# Check if Discord receives notification
```

**Checklist:**
- [ ] Webhook receives events
- [ ] Discord messages send
- [ ] Activity logs in database

### 5️⃣ Build & Optimize

```bash
# Build Next.js for production
npm run build

# Check bundle size
npm run analyze
# Should be < 2MB for optimal Vercel performance

# Test production build locally
npm run start
```

---

## Phase 2: Environment Setup on Vercel

### 1️⃣ Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select "Import Git Repository"
4. Select your GitHub repository
5. Configure project settings:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2️⃣ Add Environment Variables

**In Vercel Dashboard**: Settings → Environment Variables

Add ALL variables in SHARED environment:

```
# Public Variables
NEXT_PUBLIC_SUPABASE_URL=https://tkmdacntpkuamgxwmeml.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://opscord.vercel.app
NODE_ENV=production

# Secrets (use Vercel's secret management)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GITHUB_CLIENT_ID=Iv23li7p84d3VWeK8p8N
GITHUB_CLIENT_SECRET=49f0875622de5e1fa846e0f7bda7d296b121ffb8
GITHUB_TOKEN=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
GITHUB_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
DISCORD_CLIENT_ID=1438479622697254963
DISCORD_TOKEN=MTQzODQ3OTYyMjY5NzI1NDk2Mw...
DISCORD_PUBLIC_KEY=6d5ad3a920a576613a054f8ffa5b2f9311b1618765248861c5df5844924caf27
DISCORD_CLIENT_SECRET=yXbnjH_ZYIRELwW68P_uDprqcbbXPHKd
GEMINI_API_KEY=AIzaSyBeWw6ngZLNESIzajBiMxAmG1SZR5rjcsw
```

### 3️⃣ Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. See deployment status

**Monitor deployment:**
```bash
# In Vercel dashboard, check:
- Build logs (should be green)
- Function logs (check for errors)
- Recent deployments
```

---

## Phase 3: Post-Deployment Verification

### ✅ Check 1: Website Loads

```bash
# Test main page
curl -I https://opscord.vercel.app

# Should return 200 OK

# Test in browser
https://opscord.vercel.app
# Should show landing page
```

### ✅ Check 2: GitHub OAuth Works on Vercel

```bash
# Visit landing page
https://opscord.vercel.app

# Click "Get Started Free"
# Should redirect to GitHub
# After approval, should show dashboard

# Check user data was saved
SELECT * FROM users WHERE username = 'your_username';
```

### ✅ Check 3: Discord Commands Work on Vercel

```
# In your Discord server, test each command:

/ping
Expected: 🏓 Pong! message

/stats
Expected: Leaderboard display

/health-check
Expected: System health status

/recent-activity limit:10
Expected: Last 10 activities

/pr-insights period:30d
Expected: PR metrics
```

### ✅ Check 4: GitHub Webhooks Reach Vercel

Update GitHub webhook settings:

**Old URL:**
```
https://[your-replit-url]/api/github/webhook
```

**New URL:**
```
https://opscord.vercel.app/api/github/webhook
```

Test webhook:

1. Go to GitHub repo → Settings → Webhooks
2. Click your webhook
3. Check "Recent Deliveries"
4. Should see successful deliveries (200 status)

Make a commit/PR to test:
```bash
git push
# Check Discord for notification
# Should appear within 5 seconds
```

### ✅ Check 5: Database Connection

```bash
# Test API endpoint
curl https://opscord.vercel.app/api/admin/system-health

# Should return JSON with metrics
```

### ✅ Check 6: Response Times

```bash
# Measure endpoint latency
time curl https://opscord.vercel.app/api/repos

# Should be < 500ms
```

### ✅ Check 7: Error Logging

Monitor logs in real-time:

```bash
vercel logs opscord

# Or in Vercel Dashboard:
# Settings → Real-time Logs
```

### ✅ Check 8: System Status

In Discord, run:
```
/health-check
```

Should show:
- ✅ API Status: Operational
- ✅ Database: Connected
- ✅ Workers: 3/3 Active
- ✅ Uptime: 99.9%

---

## Phase 4: Mitigation & Troubleshooting

### Issue: "OAuth callback URL mismatch"

**Solution:**
1. Go to GitHub OAuth App settings
2. Verify callback URL is: `https://opscord.vercel.app/api/auth/callback`
3. No trailing slash!
4. Wait 5 minutes for GitHub to sync
5. Test again

### Issue: "Discord commands not responding"

**Solution:**
```bash
# Re-register commands
curl -X POST https://opscord.vercel.app/api/discord/register-commands

# Force refresh Discord cache
1. Remove bot from server
2. Re-invite bot
3. Try command again
```

### Issue: "Webhook not reaching Discord"

**Solution:**
```bash
# Check webhook URL in GitHub
https://opscord.vercel.app/api/github/webhook ✅

# Check Discord webhook is valid
curl https://discord.com/api/webhooks/YOUR_WEBHOOK_ID

# Should return webhook info, not 404
```

### Issue: "Database queries timing out"

**Solution:**
1. Check Supabase status: https://status.supabase.com
2. Verify SUPABASE_SERVICE_ROLE_KEY is correct
3. Check query performance in Supabase dashboard
4. Consider adding database indexes

### Issue: "High error rate in functions"

**Solution:**
```bash
# Check Vercel function logs
vercel logs opscord --follow

# Look for stack traces
# Common issues:
- Missing environment variable
- Database connection error
- Invalid API response

# Fix and redeploy:
git push
```

### Issue: "Build fails on Vercel"

**Solution:**
```bash
# Check build logs in Vercel dashboard
# Common causes:
1. Missing dependency
   → npm install locally, commit package-lock.json

2. TypeScript error
   → Run `npm run build` locally to debug
   → Fix errors
   → Push again

3. Env var issues
   → Check all NEXT_PUBLIC_* vars are set
```

---

## Phase 5: Performance Optimization

### 1️⃣ Enable Caching

In vercel.json:
```json
{
  "headers": [
    {
      "source": "/api/admin/system-health",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=30, stale-while-revalidate=60"
        }
      ]
    }
  ]
}
```

### 2️⃣ Monitor Performance

```bash
# Check Core Web Vitals in Vercel Analytics
https://vercel.com/analytics

# Target metrics:
- Largest Contentful Paint: < 2.5s
- First Input Delay: < 100ms
- Cumulative Layout Shift: < 0.1
```

### 3️⃣ Database Query Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_pr_metrics_repo ON pr_metrics(repo_name);
```

---

## Phase 6: Monitoring & Alerting

### Set Up Error Alerts

**Option 1: Vercel Alerts**
1. Go to Vercel Dashboard
2. Integrations → Slack
3. Set threshold for error alerts

**Option 2: Custom Monitoring**

```bash
# Monitor endpoint health
while true; do
  curl -s https://opscord.vercel.app/api/admin/system-health | grep -q "Operational" && echo "✅" || echo "❌ Error at $(date)"
  sleep 60
done
```

### Track Metrics

**API Response Times:**
```bash
# Log response times to database
vercel logs opscord | grep "duration"

# Target: < 500ms average
```

**Error Rates:**
```bash
# Monitor in Vercel dashboard
# Settings → Real-time Logs
# Filter for errors

# Target: < 1% error rate
```

---

## Phase 7: Production Checklist

- [ ] Website loads at https://opscord.vercel.app
- [ ] GitHub OAuth login works
- [ ] All 12 Discord commands respond
- [ ] GitHub webhooks send notifications
- [ ] Database queries work (< 500ms)
- [ ] Error rate < 1%
- [ ] Uptime > 99%
- [ ] HTTPS is enforced
- [ ] All env vars are set
- [ ] Logs are monitoring (Vercel dashboard)
- [ ] Team can access dashboard
- [ ] Discord is connected
- [ ] Backups are configured

---

## Phase 8: Scaling for Growth

### When traffic increases:

**Automatic (Vercel handles):**
- ✅ Function auto-scaling
- ✅ Edge caching
- ✅ Load balancing

**Manual optimization:**
1. Add database connection pooling
2. Implement Redis caching
3. Optimize queries with indexes
4. Consider database replicas

---

## Rollback Plan

If deployment breaks production:

### Quick Rollback:
```bash
# Go to Vercel Dashboard
# Deployments tab
# Find last known good deployment
# Click "Promote to Production"
```

### Database Issues:
```bash
# In Supabase Dashboard
# Backups tab
# Restore to point before issue
```

---

## Support & Escalation

| Issue | Check | Resolution |
|-------|-------|-----------|
| OAuth not working | GitHub App settings | Update callback URL |
| Discord commands fail | Command registration | Re-register commands |
| Webhooks not arriving | GitHub webhook logs | Verify secret, URL, signature |
| Database slow | Supabase metrics | Add indexes, optimize query |
| High error rate | Vercel logs | Check env vars, fix code |
| Downtime | Status page | Check Supabase, Vercel status |

---

**Status**: ✅ Ready for Production
**Deployment URL**: https://opscord.vercel.app
**Support**: See troubleshooting above
**Last Updated**: 2024-11-27
