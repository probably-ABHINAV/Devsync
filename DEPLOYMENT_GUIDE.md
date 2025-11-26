# OpsCord - Deployment to Vercel (24/7 Bot & App)

## What You're Deploying

- **Frontend:** Next.js dashboard (React)
- **Backend:** API routes for Discord, GitHub, Analytics
- **Discord Bot:** 24/7 slash commands (webhook-based)
- **Database:** Connected to Supabase (external)

All runs on Vercel serverless infrastructure with 24/7 availability.

---

## Pre-Deployment Checklist

- [ ] All code committed to GitHub
- [ ] `.env.local` is NOT committed (add to .gitignore)
- [ ] All environment variables ready
- [ ] Discord bot created in Developer Portal
- [ ] GitHub OAuth app configured
- [ ] Supabase project set up
- [ ] Gemini API key obtained

---

## Step 1: Prepare for Vercel

### 1.1: Ensure .gitignore is Correct
Check your `.gitignore` includes:
```
.env.local
.env*.local
.next/
node_modules/
*.log
```

### 1.2: Verify package.json has build command
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### 1.3: Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## Step 2: Create Vercel Account & Project

### 2.1: Sign Up / Log In
1. Go to: https://vercel.com
2. Sign in with GitHub
3. Authorize Vercel to access your GitHub

### 2.2: Create New Project
1. Click "Add New..." → "Project"
2. Find your OpsCord repository
3. Click "Import"

### 2.3: Configure Project
1. **Framework:** Next.js (auto-detected)
2. **Root Directory:** . (root)
3. **Build Command:** `npm run build` (auto-detected)
4. **Start Command:** `npm start` (auto-detected)
5. **Environment Variables:** Leave blank for now (set in next step)

---

## Step 3: Add Environment Variables

### 3.1: Set Variables in Vercel
1. In Vercel project → Settings → Environment Variables
2. Add each variable with its value:

**Discord Bot Variables:**
```
DISCORD_TOKEN = (your bot token)
DISCORD_PUBLIC_KEY = (your public key)
DISCORD_CLIENT_ID = (your application ID)
DISCORD_CLIENT_SECRET = (your client secret)
```

**GitHub Variables:**
```
GITHUB_CLIENT_ID = (your OAuth app ID)
GITHUB_CLIENT_SECRET = (your OAuth app secret)
GITHUB_TOKEN = (your personal access token)
GITHUB_WEBHOOK_SECRET = (your webhook secret)
GITHUB_PRIVATE_KEY = (your GitHub app private key)
```

**Supabase Variables:**
```
NEXT_PUBLIC_SUPABASE_URL = (your supabase URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (your anon key)
SUPABASE_SERVICE_ROLE_KEY = (your service role key)
```

**AI Variables:**
```
GEMINI_API_KEY = (your Gemini API key)
```

**App Variables:**
```
NEXT_PUBLIC_APP_URL = https://yourapp.vercel.app
NEXT_PUBLIC_REPLIT_URL = (leave empty if not needed)
```

### 3.2: Save Variables
1. Click "Save" after adding each variable
2. All variables should show in the list

---

## Step 4: Deploy

### 4.1: Start Deployment
1. In Vercel project dashboard
2. Click "Deploy" button
3. Vercel will:
   - Clone your GitHub repo
   - Install dependencies
   - Run `npm run build`
   - Deploy to Vercel serverless

### 4.2: Monitor Deployment
1. Watch the build logs
2. Should complete in 2-5 minutes
3. Shows "✓ Deployment complete" when done
4. Your app is now live!

### 4.3: Get Your URL
After deployment:
- Primary URL: `https://opscord.vercel.app` (if you set custom domain)
- Auto URL: `https://yourapp-username.vercel.app`

---

## Step 5: Configure Discord Bot for Vercel

### 5.1: Update Interactions Endpoint
1. Discord Developer Portal
2. Go to your OpsCord application
3. General Information → "Interactions Endpoint URL"
4. Enter: `https://yourapp-domain.vercel.app/api/discord/interactions`
5. Click "Save Changes"
6. Discord will verify the endpoint (must respond within 3 seconds)

### 5.2: Register Commands
1. Visit: `https://yourapp-domain.vercel.app/api/discord/register-commands`
2. Should return success with list of commands
3. Check Discord server - commands should be registered

---

## Step 6: Verify Everything Works

### 6.1: Test Discord Bot
1. In Discord server, type: `/ping`
2. Bot should respond: "Pong!"
3. Try: `/stats` - should show GitHub stats

### 6.2: Test Web App
1. Visit your Vercel URL
2. Click "Get Started Free"
3. Authorize with GitHub
4. Dashboard should load with your repos

### 6.3: Test GitHub Webhook
1. Add webhook to GitHub repo (if not already done)
2. URL: `https://yourapp-domain.vercel.app/api/github/webhook`
3. Create test PR
4. Webhook should trigger (check Recent Deliveries)

### 6.4: Monitor Vercel Logs
1. Vercel dashboard → Functions
2. Click on function to see logs
3. Should see Discord command requests
4. No errors in logs

---

## Step 7: Set Custom Domain (Optional)

### 7.1: Configure Domain
1. Vercel project → Settings → Domains
2. Add your custom domain
3. Follow DNS setup instructions
4. Wait for DNS to propagate

### 7.2: Update Discord Settings
1. Update Interactions Endpoint URL to use custom domain
2. Example: `https://opscord.dev/api/discord/interactions`

---

## Step 8: Monitor 24/7 Bot

### 8.1: Check Bot Status
- Bot responds to commands 24/7
- No restart needed
- Automatic scaling

### 8.2: View Logs
1. Vercel dashboard → Recent Deployments → Logs
2. See real-time request logs
3. Search for errors if needed

### 8.3: Set Up Alerts (Optional)
1. Vercel → Settings → Alerts
2. Enable deployment alerts
3. Get notified on errors

---

## Troubleshooting

### Bot Not Responding
1. Check Interactions Endpoint URL is correct
2. Verify environment variables are set
3. Check Vercel logs for errors

### Deployment Failed
1. Check build logs for errors
2. Verify all environment variables are set
3. Check `package.json` has correct scripts

### Discord Commands Not Showing
1. Visit `/api/discord/register-commands`
2. Check response for errors
3. Verify Discord intents are enabled
4. Try: `/` in Discord to refresh

### GitHub Webhook Not Triggering
1. Verify webhook URL is correct (Vercel domain)
2. Check Recent Deliveries for errors
3. Verify GITHUB_WEBHOOK_SECRET matches

---

## Post-Deployment

### Next Steps:
1. ✅ Set custom domain for professionalism
2. ✅ Configure GitHub webhooks on all repos
3. ✅ Add OpsCord bot to all Discord channels
4. ✅ Customize bot responses (optional)
5. ✅ Set up monitoring/alerts

### Maintenance:
- Monitor Vercel logs regularly
- Check Discord command responses
- Update environment variables if needed
- Keep GitHub webhooks updated

---

## Cost Considerations

**Vercel (Hobby Plan - Free):**
- 100 GB bandwidth/month
- 24/7 uptime
- Serverless functions
- Perfect for small-medium teams

**Optional Paid Features:**
- Pro plan: $20/month (higher limits)
- Custom analytics
- Priority support

**Supabase (Free Tier):**
- 500 MB database
- Sufficient for small teams
- Growth as needed

---

## You're Live!

Your OpsCord bot is now:
- ✅ Running 24/7 on Vercel
- ✅ Responding to Discord commands instantly
- ✅ Processing GitHub events in real-time
- ✅ Scaling automatically with demand
- ✅ Backed by Supabase database

**Monitor:** https://vercel.com (your dashboard)  
**Discord:** Use `/ping` to verify bot is online  
**Logs:** Vercel → Functions → Real-time logs

---

Questions? Check DISCORD_BOT_SETUP.md for Discord-specific help!
