# Complete Replit → Vercel Migration Guide

**This guide covers EVERYTHING you need to change to move from Replit to Vercel.**

---

## SECTION 1: PREPARE CODE FOR VERCEL

### Step 1.1: Check package.json Scripts
Your scripts are already correct:
```json
{
  "scripts": {
    "build": "next build",
    "dev": "next dev -H 0.0.0.0 -p 5000",
    "start": "next start -H 0.0.0.0 -p 5000"
  }
}
```

✅ No changes needed - Vercel uses "build" and "start"

### Step 1.2: Check .gitignore
Your .gitignore already includes:
```
.env
.env*.local
.vercel
node_modules
```

✅ No changes needed

### Step 1.3: Verify All Code is Committed
In Replit terminal:
```bash
git status
```

If there are changes:
```bash
git add .
git commit -m "Prepare for Vercel migration"
git push origin main
```

---

## SECTION 2: CREATE VERCEL PROJECT

### Step 2.1: Go to Vercel
1. Visit: https://vercel.com
2. Sign in with GitHub
3. You'll see your GitHub repos

### Step 2.2: Import Your Project
1. Click: **"Add New..."** → **"Project"**
2. Find: **OpsCord** repository
3. Click: **"Import"**

### Step 2.3: Configure Build Settings
Vercel auto-detects Next.js. Confirm:
- **Framework:** Next.js (auto-detected)
- **Root Directory:** . (root)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** .next (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Step 2.4: Don't Deploy Yet!
**STOP HERE** - Don't click "Deploy" until you add secrets (next section)

---

## SECTION 3: ADD ENVIRONMENT VARIABLES TO VERCEL

### Step 3.1: Access Environment Variables
In your Vercel project settings:
1. Click: **"Settings"** (top navigation)
2. Click: **"Environment Variables"** (left sidebar)

### Step 3.2: Add All Discord Secrets
Click **"Add New"** for each variable:

**Variable 1:**
```
Name: DISCORD_TOKEN
Value: (copy from Replit secrets)
Environment: Production, Preview, Development
```

**Variable 2:**
```
Name: DISCORD_PUBLIC_KEY
Value: (copy from Replit secrets)
Environment: Production, Preview, Development
```

**Variable 3:**
```
Name: DISCORD_CLIENT_ID
Value: (copy from Replit secrets)
Environment: Production, Preview, Development
```

**Variable 4:**
```
Name: DISCORD_CLIENT_SECRET
Value: (copy from Replit secrets)
Environment: Production, Preview, Development
```

### Step 3.3: Add All GitHub Secrets
**Variable 5:**
```
Name: GITHUB_CLIENT_ID
Value: (your GitHub OAuth ID)
```

**Variable 6:**
```
Name: GITHUB_CLIENT_SECRET
Value: (your GitHub OAuth secret)
```

**Variable 7:**
```
Name: GITHUB_TOKEN
Value: (your GitHub personal token)
```

**Variable 8:**
```
Name: GITHUB_WEBHOOK_SECRET
Value: (your webhook secret)
```

**Variable 9:**
```
Name: GITHUB_PRIVATE_KEY
Value: (your GitHub app private key - keep as-is)
```

### Step 3.4: Add Supabase Secrets
**Variable 10:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: (your Supabase URL)
Environment: All
```

**Variable 11:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: (your Supabase anon key)
Environment: All
```

**Variable 12:**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: (your Supabase service role key)
Environment: All
```

### Step 3.5: Add AI & App Secrets
**Variable 13:**
```
Name: GEMINI_API_KEY
Value: (your Gemini API key)
```

**Variable 14:**
```
Name: NEXT_PUBLIC_APP_URL
Value: https://yourapp.vercel.app
Environment: All
```

Replace "yourapp" with your actual Vercel domain (you'll see it after deployment).

### Step 3.6: Verify All Variables
You should see 14 variables in the list:
- 4 Discord
- 5 GitHub
- 3 Supabase
- 1 Gemini
- 1 App URL

---

## SECTION 4: DEPLOY TO VERCEL

### Step 4.1: Start Deployment
1. Go to: **Deployments** tab (top)
2. Click: **"Redeploy"** button (or go back to Project → Click Deploy)
3. Wait 3-5 minutes for deployment

### Step 4.2: Monitor Deployment
1. Watch build logs
2. Should show "✓ Deployment complete"
3. You'll get a URL like: `https://opscord-abc123.vercel.app`

### Step 4.3: Get Your Vercel URL
Copy your deployment URL (looks like):
```
https://opscord-abc123.vercel.app
```

Save this URL - you'll need it multiple times.

---

## SECTION 5: UPDATE DISCORD BOT SETTINGS

### Step 5.1: Update Interactions Endpoint
1. Go: https://discord.com/developers/applications
2. Select: **OpsCord** application
3. Go: **General Information**
4. Find: **Interactions Endpoint URL**
5. Change FROM: `http://localhost:5000/api/discord/interactions`
6. Change TO: `https://yourapp.vercel.app/api/discord/interactions`
7. Click: **Save Changes**
8. Discord will verify (should pass within 3 seconds)

### Step 5.2: Verify Bot Status
1. Go to Discord server
2. Type: `/ping`
3. Bot should respond within 1 second
4. ✅ Bot is now online on Vercel!

### Step 5.3: Verify All Commands
Test each command:
- `/ping` - Should respond "Pong!"
- `/stats` - Should show GitHub stats
- `/summary #1` - Should work for any PR
- `/create-issue` - Should create issues

---

## SECTION 6: UPDATE GITHUB WEBHOOKS

### Step 6.1: Update GitHub Webhook URL
For each GitHub repo with webhook:

1. Go: **Settings** → **Webhooks**
2. Click: **Edit** (on your webhook)
3. Change **Payload URL** FROM: `http://localhost:5000/api/github/webhook`
4. Change TO: `https://yourapp.vercel.app/api/github/webhook`
5. Verify **Secret** matches `GITHUB_WEBHOOK_SECRET`
6. Click: **Update webhook**

### Step 6.2: Verify Webhook
1. Scroll to "Recent Deliveries"
2. Should show new delivery after update
3. Status should be 200 OK

### Step 6.3: Test Webhook
1. Create a test PR on GitHub
2. Should trigger webhook
3. Check Vercel logs to confirm

---

## SECTION 7: UPDATE GITHUB OAUTH

### Step 7.1: Update OAuth Redirect URI
If you set a custom domain or if GitHub OAuth URL changed:

1. Go: GitHub Settings → Developer settings → OAuth Apps
2. Find: Your OpsCord OAuth app
3. Edit: **Authorization callback URL**
4. Change FROM: `http://localhost:5000/api/auth/callback`
5. Change TO: `https://yourapp.vercel.app/api/auth/callback`
6. Click: **Update application**

### Step 7.2: Test OAuth Login
1. Visit: `https://yourapp.vercel.app`
2. Click: **"Get Started Free"**
3. Authorize with GitHub
4. Should redirect back and show dashboard

---

## SECTION 8: VERIFY ALL SYSTEMS

### Step 8.1: Test Frontend
- [ ] Homepage loads
- [ ] GitHub login works
- [ ] Dashboard shows repos
- [ ] Analytics page works
- [ ] No errors in console

### Step 8.2: Test Discord Bot
- [ ] `/ping` responds
- [ ] `/stats` shows stats
- [ ] `/summary` works
- [ ] `/create-issue` works

### Step 8.3: Test GitHub Integration
- [ ] Create test PR
- [ ] Webhook triggers (check Vercel logs)
- [ ] PR shows in activity
- [ ] AI summary generates

### Step 8.4: Test Database
- [ ] Login and check Supabase
- [ ] New user record created
- [ ] Activity logs recorded

---

## SECTION 9: SET UP CUSTOM DOMAIN (Optional)

### Step 9.1: Add Domain to Vercel
1. Vercel dashboard → **Settings** → **Domains**
2. Click: **"Add"**
3. Enter: your domain (e.g., `opscord.dev`)
4. Follow DNS setup instructions
5. Wait for DNS propagation (5-30 minutes)

### Step 9.2: Update Discord Interactions Endpoint
If you set custom domain:
1. Discord Developer Portal → **General Information**
2. Update: **Interactions Endpoint URL** to use custom domain
3. Example: `https://opscord.dev/api/discord/interactions`

---

## SECTION 10: MONITOR VERCEL

### Step 10.1: Check Deployment Status
1. Vercel dashboard → **Deployments**
2. Latest deployment should show "✓"
3. No errors

### Step 10.2: View Real-time Logs
1. **Deployments** → Select latest
2. Click: **"Logs"** tab
3. See real-time requests coming in

### Step 10.3: Check Error Rate
1. **Analytics** tab (if available)
2. Monitor for errors
3. Check response times

---

## SECTION 11: DECOMMISSION REPLIT (Optional)

### Step 11.1: Stop Replit Workflow
1. In Replit, click: ⏹️ (stop button)
2. Or leave running for backup

### Step 11.2: Keep GitHub as Source of Truth
- Keep code on GitHub (never delete)
- Replit can be left as-is (won't hurt)
- Focus on Vercel for production

---

## SECTION 12: QUICK CHECKLIST

Use this to verify everything is migrated:

**Code & Deployment:**
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Deployment shows "✓ Complete"
- [ ] Vercel URL is live and loads

**Environment Variables:**
- [ ] All 14 variables added to Vercel
- [ ] No missing keys
- [ ] All marked for Production environment

**Discord Bot:**
- [ ] Interactions Endpoint URL updated to Vercel URL
- [ ] Discord verification passed
- [ ] `/ping` command works from Discord
- [ ] All 4 commands respond

**GitHub Integration:**
- [ ] Webhook URL updated to Vercel
- [ ] Webhook test successful (200 OK)
- [ ] OAuth redirect URI updated
- [ ] GitHub login works on Vercel app

**Full End-to-End:**
- [ ] Login via GitHub on Vercel
- [ ] Dashboard shows repos
- [ ] Create test PR
- [ ] Discord bot notified
- [ ] PR appears in activity
- [ ] All systems operational

---

## SECTION 13: COMMON ISSUES & FIXES

### Issue: Deployment Failed
**Fix:**
1. Check build logs for errors
2. Verify all environment variables are set
3. Look for missing dependencies

### Issue: Discord Bot Not Responding
**Fix:**
1. Check Interactions Endpoint URL is correct
2. Verify environment variables in Vercel
3. Check Discord Developer Portal settings
4. Try: `/ping` again (30-second delay normal)

### Issue: GitHub OAuth Not Working
**Fix:**
1. Verify callback URL in GitHub OAuth settings
2. Make sure URL includes `/api/auth/callback`
3. Check environment variables (CLIENT_ID, SECRET)

### Issue: Webhooks Not Triggering
**Fix:**
1. Update webhook URL in GitHub repo settings
2. Check "Recent Deliveries" for errors
3. Verify secret matches

### Issue: Database Queries Failing
**Fix:**
1. Verify Supabase URLs and keys
2. Check Supabase project is still running
3. Verify RLS policies allow queries

---

## SECTION 14: AFTER MIGRATION

### Next Steps:
1. ✅ Monitor Vercel for 24 hours
2. ✅ Add more repos with webhooks
3. ✅ Invite team members to Discord
4. ✅ Set up custom domain
5. ✅ Configure CI/CD (optional)

### Maintenance:
- Monitor Vercel logs regularly
- Check Discord command responses
- Verify webhook deliveries
- Backup Supabase regularly

---

## DONE! 🎉

Your OpsCord app is now:
- ✅ Hosted on Vercel (production-ready)
- ✅ 24/7 online with auto-scaling
- ✅ Discord bot working from Vercel
- ✅ GitHub webhooks connected
- ✅ Database connected

**Your app is live and ready for your team!**

---

## Support

- **Vercel Logs:** https://vercel.com → Deployments → Logs
- **Discord Developer Portal:** https://discord.com/developers/applications
- **GitHub Webhooks:** Your repo → Settings → Webhooks → Recent Deliveries
- **Supabase:** https://supabase.com

Questions? Check the troubleshooting section or re-read the relevant section above.
