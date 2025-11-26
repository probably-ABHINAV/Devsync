# OpsCord Discord Bot - Complete A-Z Setup Guide

**Your Discord bot is offline because Discord doesn't have the credentials yet. Follow this guide step-by-step.**

---

## SECTION 1: CREATE DISCORD BOT IN DEVELOPER PORTAL

### Step 1.1: Go to Discord Developer Portal
1. Visit: https://discord.com/developers/applications
2. If not logged in, click "Log In" and use your Discord account
3. Click blue **"New Application"** button (top right)

### Step 1.2: Name Your Bot
1. In the popup, type name: **OpsCord**
2. Accept the ToS checkbox
3. Click **"Create"**
4. **IMPORTANT:** You're now in your application settings

### Step 1.3: Get Your Application ID & Public Key (SAVE THESE)
1. You should see a page with your app details
2. Look for these on the "General Information" tab:
   - **Application ID** (also called Client ID) - Copy this
   - **Public Key** - Copy this
3. Save both to a text file - you'll need them in 5 minutes

**Example:**
```
Application ID: 1234567890123456789
Public Key: abcd1234efgh5678ijkl9999aaabbbccc
```

### Step 1.4: Create the Bot User
1. Left sidebar → Click **"Bot"**
2. Click blue **"Add Bot"** button
3. You'll see "A bot has been added to your app"
4. Under the bot section, you'll see a TOKEN field

### Step 1.5: Get Your Bot Token (SAVE THIS - NEVER SHARE)
1. Under "TOKEN" section, click **"Reset Token"**
2. Confirm you want to reset
3. **Copy the new token immediately** - it won't be shown again
4. Save to your text file

**Example:**
```
Token: OTk4OTkzNDI1MjMyMjY3Nzc2.GaGG9K.x-_you_cannot_see_the_real_token_here
```

### Step 1.6: Enable Intents (CRITICAL FOR BOT TO WORK)
1. Still in "Bot" section
2. Scroll down to **"Gateway Intents"**
3. Enable these toggles (turn them ON/Blue):
   - ✅ **Message Content Intent** (required to read messages)
   - ✅ **Server Members Intent** (to see members)
   - ✅ **Guild Messages** (enabled by default)
4. Click **"Save Changes"** (button at bottom)

**Important:** Without these intents, the bot won't respond!

### Step 1.7: Get Your Client Secret (FOR LATER)
1. Go back to **"General Information"** tab
2. Scroll down to **"Client Secret"**
3. Click **"Reset Secret"**
4. Copy the new secret
5. Save to your text file

---

## SECTION 2: SET UP BOT PERMISSIONS IN DISCORD

### Step 2.1: Generate OAuth2 URL
1. In Discord Developer Portal, go to **"OAuth2"** (left sidebar)
2. Click **"URL Generator"**
3. Under "SCOPES", select:
   - ✅ `bot`
   - ✅ `applications.commands`
4. Under "PERMISSIONS", select:
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Use Slash Commands
   - ✅ Manage Messages (optional, for deleting)
5. At bottom, copy the generated URL

**Example URL looks like:**
```
https://discord.com/api/oauth2/authorize?client_id=1234567890&scope=bot%20applications.commands&permissions=274877934592
```

### Step 2.2: Add Bot to Your Discord Server
1. Paste the URL from Step 2.1 into your browser
2. You'll see Discord authorization page
3. **Select your server** from dropdown
4. Click **"Authorize"**
5. Complete CAPTCHA if prompted
6. You should see "Success! Your bot has been added to [server]"

### Step 2.3: Verify Bot is in Your Server
1. Go to your Discord server
2. Look at member list (right side)
3. Find **OpsCord** bot in the list
4. It should show as "Offline" (that's normal for now)

---

## SECTION 3: CONFIGURE ENVIRONMENT VARIABLES IN REPLIT

### Step 3.1: Access Replit Secrets
1. Go to your Replit project
2. Look at left sidebar
3. Click the lock icon 🔒 **(Secrets)**
4. You'll see empty list of secrets

### Step 3.2: Add Discord Secrets
Click **"Add Secret"** and add these one by one:

**Secret 1:**
- Name: `DISCORD_TOKEN`
- Value: (paste your bot token from Step 1.5)
- Click "Add Secret"

**Secret 2:**
- Name: `DISCORD_PUBLIC_KEY`
- Value: (paste your public key from Step 1.3)
- Click "Add Secret"

**Secret 3:**
- Name: `DISCORD_CLIENT_ID`
- Value: (paste your application ID from Step 1.3)
- Click "Add Secret"

**Secret 4:**
- Name: `DISCORD_CLIENT_SECRET`
- Value: (paste your client secret from Step 1.7)
- Click "Add Secret"

### Step 3.3: Verify Secrets Added
1. All 4 should appear in your secrets list
2. They're now encrypted and available to your app
3. You should see:
   - DISCORD_TOKEN
   - DISCORD_PUBLIC_KEY
   - DISCORD_CLIENT_ID
   - DISCORD_CLIENT_SECRET

---

## SECTION 4: REGISTER DISCORD COMMANDS

### Step 4.1: Trigger Command Registration
1. Make sure your Replit app is running (see workflow)
2. Open a new tab and visit:
   ```
   http://localhost:5000/api/discord/register-commands
   ```
3. You should see a response like:
   ```json
   {
     "success": true,
     "message": "Discord commands registered successfully",
     "commands": [...]
   }
   ```

**If you get an error:**
- Check that all 4 secrets are added correctly
- Restart the workflow (see "Restart App" section)
- Try again

### Step 4.2: Verify Commands Registered
1. Go back to Discord Developer Portal
2. Go to your app → **"OAuth2"** → **"URL Generator"**
3. In browser console (F12), paste:
   ```javascript
   fetch('https://discord.com/api/v10/applications/YOUR_APPLICATION_ID/commands', {
     headers: { 'Authorization': 'Bot YOUR_BOT_TOKEN' }
   }).then(r => r.json()).then(d => console.log(d))
   ```
4. Replace YOUR_APPLICATION_ID and YOUR_BOT_TOKEN
5. You should see your 4 commands listed

**Or simpler way:**
1. Go to your Discord server
2. Type `/` in any channel
3. You should see:
   - `/ping` - Check if bot is online
   - `/stats` - View contribution stats
   - `/summary` - Get PR summary
   - `/create-issue` - Create GitHub issue

---

## SECTION 5: TEST YOUR BOT IN DISCORD

### Step 5.1: Test `/ping` Command
1. Go to your Discord server
2. In any channel, type: `/ping`
3. Press Enter
4. Bot should respond: "Pong! ✅ Bot is online"

**If bot doesn't respond:**
- Go to Step 5.3 (Troubleshooting)

### Step 5.2: Test `/stats` Command
1. Type: `/stats`
2. Optional: add `@username` to see another user's stats
3. Bot should respond with GitHub stats

### Step 5.3: Troubleshooting - Bot Not Responding

**Issue 1: "This interaction failed"**
- **Fix:** Wait 30 seconds, try `/ping` again
- Secrets might not be loaded yet

**Issue 2: Commands don't appear**
- **Fix:** 
  1. Go to Replit and restart workflow
  2. Wait 10 seconds
  3. Refresh Discord (Ctrl+R)
  4. Try typing `/` again

**Issue 3: "Application did not respond"**
- **Fix:**
  1. Check Replit workflow is running (green checkmark)
  2. Open browser console (F12)
  3. Check for errors
  4. Restart workflow

**Issue 4: "The application was not found"**
- **Fix:**
  1. Verify DISCORD_CLIENT_ID is correct (copy again from Developer Portal)
  2. Verify DISCORD_TOKEN is correct
  3. Re-add secrets in Replit
  4. Restart workflow

---

## SECTION 6: DEPLOY TO VERCEL FOR 24/7

### Step 6.1: What is Vercel?
- Serverless hosting platform
- Your bot runs 24/7 (always online)
- No server to manage
- Free tier available
- Instant deployment

### Step 6.2: Push Code to GitHub
1. Open terminal in Replit
2. Run:
   ```bash
   git add .
   git commit -m "Discord bot setup complete"
   git push origin main
   ```
3. Code is now on GitHub

### Step 6.3: Go to Vercel
1. Visit: https://vercel.com
2. Click **"Sign Up"**
3. Click **"Continue with GitHub"**
4. Authorize Vercel to access GitHub
5. You'll be in Vercel dashboard

### Step 6.4: Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Find your **OpsCord** repository
3. Click **"Import"**
4. Leave settings as default (Next.js auto-detected)
5. **DON'T click Deploy yet!** (need to add secrets first)

### Step 6.5: Add Environment Variables to Vercel
1. Before deployment, scroll down to "Environment Variables"
2. Click **"Add New"** and add each variable:

**Discord Variables:**
```
DISCORD_TOKEN = (your bot token)
DISCORD_PUBLIC_KEY = (your public key)
DISCORD_CLIENT_ID = (your application ID)
DISCORD_CLIENT_SECRET = (your client secret)
```

**GitHub Variables:**
```
GITHUB_CLIENT_ID = (your GitHub OAuth ID)
GITHUB_CLIENT_SECRET = (your GitHub OAuth secret)
GITHUB_TOKEN = (your personal token)
GITHUB_WEBHOOK_SECRET = (your webhook secret)
GITHUB_PRIVATE_KEY = (your private key)
```

**Supabase Variables:**
```
NEXT_PUBLIC_SUPABASE_URL = (your URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (your anon key)
SUPABASE_SERVICE_ROLE_KEY = (your service key)
```

**Other Variables:**
```
GEMINI_API_KEY = (your Gemini key)
NEXT_PUBLIC_APP_URL = https://yourapp.vercel.app
```

### Step 6.6: Deploy
1. Click **"Deploy"** button
2. Wait 2-5 minutes for deployment
3. You'll see "✓ Deployment complete"
4. You'll get a URL like: `https://opscord-abc123.vercel.app`
5. Copy this URL (you'll need it next)

### Step 6.7: Configure Discord Interactions Endpoint
1. Go back to Discord Developer Portal
2. Go to your app → **"General Information"**
3. Scroll down to **"Interactions Endpoint URL"**
4. Enter: `https://yourapp.vercel.app/api/discord/interactions`
   - Replace "yourapp" with your actual Vercel domain
5. Click **"Save Changes"**
6. Discord will test the endpoint (should pass)

**Example:**
```
https://opscord-abc123.vercel.app/api/discord/interactions
```

### Step 6.8: Register Commands on Vercel
1. Visit: `https://yourapp.vercel.app/api/discord/register-commands`
2. Should see success message
3. Commands now registered on Vercel

### Step 6.9: Test Bot on Vercel
1. Go to Discord server
2. Type: `/ping`
3. Bot should respond (now running on Vercel!)
4. Try `/stats` too

---

## SECTION 7: CONFIGURE GITHUB WEBHOOK

### Step 7.1: Get Your Vercel URL
From Section 6, you have a URL like:
```
https://opscord-abc123.vercel.app
```

### Step 7.2: Add Webhook to GitHub Repo
1. Go to your GitHub repository
2. **Settings** → **Webhooks** → **Add webhook**
3. Fill in:
   - **Payload URL:** `https://yourapp.vercel.app/api/github/webhook`
   - **Content type:** `application/json`
   - **Secret:** Your `GITHUB_WEBHOOK_SECRET`
   - **Events:** Select "Let me select individual events"
     - ✅ Pull requests
     - ✅ Issues
     - ✅ Push
4. Click **"Add webhook"**

### Step 7.3: Verify Webhook
1. Scroll to "Recent Deliveries"
2. Should show one delivery (test from Discord)
3. Click it to see response
4. Status should be 200 OK

---

## SECTION 8: TEST EVERYTHING END-TO-END

### Step 8.1: Test Bot Command
1. Discord server → type `/ping`
2. Should respond within 1 second
3. ✅ Bot is working

### Step 8.2: Test PR Analysis
1. Create a new branch in GitHub
2. Make a small code change
3. Create a Pull Request
4. GitHub sends webhook to Vercel
5. Dashboard should show PR in activity
6. Type `/summary #1` in Discord
7. Bot shows PR summary
8. ✅ PR analysis working

### Step 8.3: Test Leaderboard
1. Open OpsCord dashboard
2. Go to Analytics tab
3. Should see leaderboard with users
4. ✅ Gamification working

### Step 8.4: Test All Features
- [ ] `/ping` works in Discord
- [ ] `/stats` shows your stats
- [ ] `/summary #1` shows PR info
- [ ] Dashboard loads with repos
- [ ] Analytics shows activity
- [ ] Webhook triggers on PR

---

## SECTION 9: TROUBLESHOOTING

### Bot Still Offline?

**Check 1: Secrets in Replit**
1. Go to Replit → Secrets 🔒
2. Verify all 4 Discord secrets are there
3. If missing, add them again
4. Restart workflow

**Check 2: Restart Workflow**
1. In Replit, find "Start application" workflow
2. Click the ⏹️ (stop) button
3. Wait 5 seconds
4. Click ▶️ (play) to restart
5. Wait for "Ready in XXXms"

**Check 3: Test Endpoint Directly**
1. Open browser and visit:
   ```
   http://localhost:5000/api/discord/status
   ```
2. Should show: `{"connected":true}`
3. If false, secrets are wrong

**Check 4: Commands Not Showing**
1. Wait 60 seconds (Discord caches)
2. In Discord, press Ctrl+R (refresh)
3. Type `/` again
4. Commands should appear

**Check 5: Vercel Deployment**
1. Check Vercel shows "✓ Deployment complete"
2. Visit your Vercel URL to confirm it loads
3. Check logs for errors:
   - Vercel → Deployments → Select latest → Logs
4. Look for "error" or "failed" messages

**Check 6: Bot Token Expired**
1. Go to Discord Developer Portal
2. "Bot" section → Click "Reset Token"
3. Update DISCORD_TOKEN in both:
   - Replit secrets
   - Vercel environment variables
4. Restart/redeploy

---

## SECTION 10: QUICK REFERENCE

### All Commands
```
/ping - Check bot status
/stats - View GitHub stats
/summary #123 - Get PR summary
/create-issue - Create issue from Discord
```

### Important URLs
```
Replit: http://localhost:5000
Vercel: https://yourapp.vercel.app
Discord: https://discord.com/developers/applications
GitHub: https://github.com/your-repo
```

### Important Files
```
Bot Commands: lib/discord-commands.ts
Bot Handlers: lib/discord-handlers.ts
Interactions: app/api/discord/interactions/route.ts
```

### Debug Commands
```
# Check bot status
curl http://localhost:5000/api/discord/status

# Register commands
curl http://localhost:5000/api/discord/register-commands

# Check environment
env | grep DISCORD
```

---

## SECTION 11: NEXT STEPS

After everything works:
1. ✅ Add webhook to all your repos
2. ✅ Create test PR to verify AI analysis
3. ✅ Invite team members to Discord
4. ✅ Set custom Discord nickname for bot
5. ✅ Monitor Vercel logs for issues

---

## YOU'RE DONE! 🎉

Your Discord bot is now:
- ✅ Online 24/7 on Vercel
- ✅ Responding to slash commands
- ✅ Analyzing PRs with AI
- ✅ Tracking gamification stats
- ✅ Integrated with GitHub

**Bot is live and ready to use!**

---

## Need Help?

1. Check Vercel logs: https://vercel.com → Deployments → Logs
2. Check Discord Developer Portal for errors
3. Make sure all secrets are correct
4. Restart workflow if anything changes
5. Wait 1-2 minutes for Discord to sync

**Most common fix: Restart the workflow and wait 30 seconds!**
