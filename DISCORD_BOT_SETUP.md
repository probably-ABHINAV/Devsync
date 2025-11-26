# OpsCord Discord Bot - 24/7 Vercel Setup Guide

## Overview
This guide sets up a production-ready Discord bot that runs 24/7 on Vercel using webhook-based interactions (no persistent connection needed).

---

## Step 1: Discord Developer Portal Setup

### 1.1: Go to Discord Developer Portal
1. Visit: https://discord.com/developers/applications
2. Click "New Application"
3. Name it: "OpsCord"
4. Click "Create"

### 1.2: Get Your Bot Token
1. Left sidebar → "Bot" 
2. Click "Add Bot"
3. Under TOKEN, click "Reset Token"
4. Copy the token (save as `DISCORD_TOKEN` in Vercel)
5. **NEVER share this token**

### 1.3: Enable Gateway Intents (Important for 24/7)
1. Still in Bot section
2. Scroll down to "Gateway Intents"
3. Enable these:
   - ✅ **Message Content Intent** (to read messages)
   - ✅ **Server Members Intent** (to see members)
   - ✅ **Presence Intent** (optional)

### 1.4: Get Public Key
1. Left sidebar → "General Information"
2. Copy "Public Key" (save as `DISCORD_PUBLIC_KEY` in Vercel)
3. Copy "Application ID" (needed for webhook setup)

### 1.5: Set Interactions Endpoint
1. Left sidebar → "General Information"
2. Scroll to "Interactions Endpoint URL"
3. Enter: `https://yourapp.vercel.app/api/discord/interactions`
   - Replace `yourapp` with your actual Vercel domain
4. Discord will verify this endpoint
5. Click "Save Changes"

### 1.6: OAuth2 Setup
1. Left sidebar → "OAuth2" → "URL Generator"
2. Select Scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select Permissions:
   - ✅ Send Messages
   - ✅ Manage Messages
   - ✅ Use Slash Commands
   - ✅ Embed Links
   - ✅ Attach Files
4. Copy generated URL
5. Open in browser and authorize to add bot to your server

---

## Step 2: Vercel Deployment Setup

### 2.1: Install Vercel CLI (Optional but Recommended)
```bash
npm install -g vercel
```

### 2.2: Deploy to Vercel
1. Push your code to GitHub
2. Go to: https://vercel.com
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Click "Import"

### 2.3: Set Environment Variables in Vercel
1. In Vercel project settings → "Environment Variables"
2. Add these variables:
   ```
   DISCORD_TOKEN=your_bot_token
   DISCORD_PUBLIC_KEY=your_public_key
   DISCORD_CLIENT_ID=your_application_id
   DISCORD_CLIENT_SECRET=your_client_secret
   
   GITHUB_CLIENT_ID=your_github_id
   GITHUB_CLIENT_SECRET=your_github_secret
   GITHUB_TOKEN=your_github_token
   GITHUB_WEBHOOK_SECRET=your_webhook_secret
   GITHUB_PRIVATE_KEY=your_private_key
   
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   GEMINI_API_KEY=your_gemini_key
   NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
   ```

3. Click "Deploy"

### 2.4: Get Your Vercel URL
1. After deployment, you'll see: `https://yourapp.vercel.app`
2. Copy this URL

### 2.5: Update Discord Interactions Endpoint
1. Go back to Discord Developer Portal
2. General Information → "Interactions Endpoint URL"
3. Update to: `https://yourapp.vercel.app/api/discord/interactions`
4. Click "Save Changes"
5. Discord will verify the endpoint

---

## Step 3: Register Discord Commands

### 3.1: Trigger Command Registration
1. Visit: `https://yourapp.vercel.app/api/discord/register-commands`
2. Should return success message with list of commands

### 3.2: Verify Commands in Discord
1. In your Discord server, type: `/`
2. You should see:
   - `/ping` - Check if bot is alive
   - `/stats` - View GitHub stats
   - `/summary` - Get PR summary
   - `/create-issue` - Create GitHub issue

---

## Step 4: Set Up GitHub Webhook

### 4.1: Add Webhook to Your Repository
1. GitHub repo → Settings → Webhooks → Add webhook
2. Fill in:
   - **Payload URL:** `https://yourapp.vercel.app/api/github/webhook`
   - **Content type:** `application/json`
   - **Secret:** Your `GITHUB_WEBHOOK_SECRET`
   - **Events:** Let me select individual events
     - ✅ Pull requests
     - ✅ Issues
     - ✅ Push
     - ✅ Pull request reviews

3. Click "Add webhook"

### 4.2: Verify Webhook
1. Scroll to "Recent Deliveries"
2. Should show successful delivery (status 200/201)

---

## Step 5: Test 24/7 Bot

### 5.1: Test in Discord
1. In Discord server, type: `/ping`
2. Bot responds immediately with "Pong!"
3. Type: `/stats`
4. Bot shows your GitHub statistics

### 5.2: Test with Pull Request
1. Create a PR on GitHub
2. Webhook triggers automatically
3. Bot sends notification to Discord channel (if webhook URL configured)
4. Dashboard shows new PR

### 5.3: Monitor Bot Uptime
- Bot responds within seconds (Vercel serverless)
- No persistent connection needed
- Scales automatically
- 24/7 available

---

## Step 6: Customize Bot Responses

### 6.1: Edit Command Handlers
Edit: `lib/discord-commands.ts`

Example customizing `/stats` response:
```typescript
// Add custom messages
// Change XP formulas
// Modify leaderboard output
```

### 6.2: Add New Commands
1. Add command definition in `lib/discord-commands.ts`
2. Register with Discord API
3. Handle in `/api/discord/interactions`

---

## Step 7: Troubleshooting

### Issue: "Interaction token invalid"
- **Fix:** Verify `DISCORD_PUBLIC_KEY` is correct
- Verify endpoint responds to Discord verification within 3 seconds

### Issue: Bot doesn't respond to commands
- **Fix:** Check Discord intents are enabled (Step 1.3)
- Verify bot has permissions in Discord server
- Check Vercel logs for errors

### Issue: Webhook not triggering
- **Fix:** Verify webhook URL in GitHub settings
- Check "Recent Deliveries" for errors
- Verify secret matches `GITHUB_WEBHOOK_SECRET`

### Issue: "Interactions Endpoint URL failed verification"
- **Fix:** Ensure endpoint returns 200 OK to Discord ping
- Endpoint must respond within 3 seconds
- Check Vercel deployment status

---

## Bot Architecture (Vercel)

```
Discord User
    ↓ (types `/command`)
Discord API
    ↓ (sends webhook)
Vercel Function
    ↓ (handles interaction)
/api/discord/interactions
    ↓ (verifies signature)
Discord Command Handler
    ↓ (processes command)
Discord API / GitHub API / Supabase
    ↓ (responds)
Discord User
```

**Advantages:**
- ✅ Serverless (no server to maintain)
- ✅ Scales automatically
- ✅ 24/7 available
- ✅ No persistent connection needed
- ✅ Faster response times
- ✅ Cost-effective

---

## Production Checklist

- [ ] Discord bot token in environment variables
- [ ] Public key in environment variables
- [ ] Vercel deployment completed
- [ ] Environment variables set in Vercel
- [ ] Discord interactions endpoint URL updated
- [ ] Discord intents enabled
- [ ] Commands registered successfully
- [ ] GitHub webhook configured
- [ ] Test `/ping` command works
- [ ] Test `/stats` command works
- [ ] Test PR trigger works
- [ ] Bot responds within 3 seconds
- [ ] All 4 commands appear in Discord slash menu

---

## Next: Deploy!

You're ready to deploy. Follow these final steps:

1. **Push to GitHub** - All changes committed
2. **Deploy to Vercel** - Connected GitHub repo
3. **Set environment variables** - In Vercel dashboard
4. **Register commands** - Visit `/api/discord/register-commands`
5. **Update Discord settings** - Add interactions endpoint URL
6. **Test** - Try `/ping` in Discord
7. **Add webhooks** - To your GitHub repos
8. **Monitor** - Check Vercel logs for issues

---

## Support

- **Discord Status:** Try `/ping` command in Discord
- **Vercel Logs:** https://vercel.com → Project → Deployments → Logs
- **GitHub Webhooks:** Repo Settings → Webhooks → Recent Deliveries
- **Supabase:** Check database for activity records

---

**Your bot is now production-ready for 24/7 uptime on Vercel!**
