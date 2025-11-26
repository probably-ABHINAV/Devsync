# OpsCord Bot Still Offline? - INSTANT FIX

**Good news: Your bot code is ready and working!**

The bot is offline because Discord doesn't know where to send interactions. It's a 2-minute fix.

---

## Why Bot is Offline

Discord is trying to send slash commands to your bot, but doesn't have the URL. You need to tell Discord where your bot lives.

---

## INSTANT FIX (2 Minutes)

### Step 1: Get Your Replit URL
Your bot is running at:
```
http://localhost:5000/api/discord/interactions
```

### Step 2: Set Discord Interactions Endpoint
1. **Go:** https://discord.com/developers/applications
2. **Find:** Your OpsCord application
3. **Click:** "General Information" tab (left sidebar)
4. **Scroll down** to "Interactions Endpoint URL" field
5. **Paste:** `http://localhost:5000/api/discord/interactions`
6. **Click:** "Save Changes"
7. **Wait:** Discord verifies (should pass)

### Step 3: Test Bot
1. Go to your Discord server
2. Type: `/ping`
3. Bot responds: "Pong! ✅ Bot is online"

✅ **Bot is now ONLINE!**

---

## If Discord Says "Endpoint Verification Failed"

**Issue:** Discord can't reach your Replit endpoint (Replit is sleeping)

**Fix:**
1. Make sure Replit workflow shows "Ready in XXXms"
2. Visit: `http://localhost:5000` in new tab
3. Confirm page loads
4. Try Discord verification again

---

## For 24/7 Bot (Vercel)

If you want bot 24/7 online:

### Step 1: Deploy to Vercel
Follow **DEPLOYMENT_GUIDE.md** sections 1-6

### Step 2: Get Vercel URL
You'll get: `https://yourapp-abc123.vercel.app`

### Step 3: Update Discord
Same as above, but use:
```
https://yourapp-abc123.vercel.app/api/discord/interactions
```

### Step 4: Bot is 24/7 Online!
Now bot runs forever on Vercel serverless

---

## Quick Checklist

- [ ] Workflow is running (Replit shows "Ready")
- [ ] Went to Discord Developer Portal
- [ ] Set Interactions Endpoint URL to Replit endpoint
- [ ] Discord verified the endpoint (no error)
- [ ] Tried `/ping` in Discord
- [ ] Bot responded

---

## Still Not Working?

**Try this:**

1. **Restart Replit Workflow**
   - Click ⏹️ (stop) button
   - Wait 5 seconds
   - Click ▶️ (play) button
   - Wait for "Ready in XXXms"

2. **Refresh Discord**
   - Press Ctrl+R in Discord
   - Wait 5 seconds
   - Type `/` again

3. **Check Bot is in Server**
   - Go to your Discord server
   - Look at member list (right side)
   - Find "OpsCord" bot
   - Should be there (might show offline, but commands work)

---

## Bot is Online! 🎉

Once you see bot responding to `/ping`, you're ready to:
1. Test `/stats` command
2. Add GitHub webhooks to repos
3. Deploy to Vercel for 24/7 uptime
4. Invite team members

**See TESTING.md for next steps!**
