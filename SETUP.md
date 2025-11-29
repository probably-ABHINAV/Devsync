# OpsCord Setup Guide

## 1. Database Setup (Supabase)

### Step 1: Copy the migration SQL
The database schema is in `/migrations/supabase-schema.sql`. You need to run this in your Supabase dashboard.

**How to do it:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (the one with the URL from `NEXT_PUBLIC_SUPABASE_URL`)
3. Go to **SQL Editor** → **New Query**
4. Open the file `/migrations/supabase-schema.sql` locally
5. Copy all the SQL and paste it into the Supabase SQL editor
6. Click **Run**

This creates all required tables:
- `users` - Stores GitHub authenticated users
- `activities` - Stores user activities (PRs, issues, commits)
- `discord_configs` - Stores Discord webhook URLs
- `user_stats` - Stores XP and gamification data
- `badges` - Achievement badges
- `user_badges` - User's earned badges
- `webhooks` - GitHub webhook event logs

---

## 2. GitHub Authentication

### Step 1: Log in to the app
1. Go to the landing page
2. Click **"Get Started Free"** button
3. You'll be redirected to GitHub OAuth
4. Authorize the app to access your GitHub account
5. You'll be logged in and cookies will be set

**This creates:**
- `github_token` cookie (your GitHub auth token)
- User record in the `users` table

---

## 3. Activity Timeline Setup

Once you're authenticated:
1. Go to **Dashboard** page
2. The activity timeline will fetch your recent GitHub activities automatically
3. Activities appear from:
   - PRs you've opened/merged
   - Issues you've created/closed
   - Code reviews
   - Commits

**If you don't see activities:**
- Make sure you're logged in with GitHub (check browser cookies)
- Make sure Supabase schema is fully set up
- The app automatically syncs activities from GitHub

---

## 4. Discord Integration Setup

### Step 1: Create a Discord Webhook URL

1. Go to your Discord server
2. Right-click on a channel where you want notifications
3. Click **Edit Channel**
4. Go to **Integrations** → **Webhooks**
5. Click **New Webhook**
6. Name it "Opscord" (or whatever you prefer)
7. Click **Copy Webhook URL** - save this for next step

### Step 2: Configure Discord in OpsCord

1. Go to your OpsCord Dashboard
2. Look for **Discord Configuration** section (usually on the right side)
3. Paste your Discord Webhook URL
4. Select which events you want notifications for:
   - Push events
   - Pull requests
   - Issues
   - Releases
   - PR reviews
   - CI/CD status
5. Click **Save** or **Connect**

**You should see a test message in your Discord channel** confirming the connection works.

### Step 3: GitHub Webhook (for real-time updates)

For Discord to receive notifications in real-time when you push code:

1. Go to your GitHub repository
2. Settings → **Webhooks** → **Add webhook**
3. Payload URL: `https://your-opscord-url/api/github/webhook`
4. Content type: `application/json`
5. Secret: Use your `GITHUB_WEBHOOK_SECRET` environment variable
6. Select events: "Send me everything" or specifically:
   - Pull requests
   - Issues
   - Push
   - Releases
7. Click **Add webhook**

---

## 5. Test Everything

### Test Activity Timeline:
1. Make sure you're on the Dashboard page
2. Check if your recent GitHub activities appear
3. If not, check browser console for errors

### Test Discord Notifications:
1. Create a test PR in your GitHub repo
2. Check if it appears in your Discord channel
3. The message should include:
   - PR title and description
   - AI-generated summary (powered by Google Gemini)
   - Complexity assessment
   - Key changes
   - Any identified risks

---

## Troubleshooting

### "Activity Timeline shows 'No recent activity'"
**Solution:**
- ✅ Make sure you're logged in (check Dashboard page redirects you)
- ✅ Make sure Supabase schema is set up (all tables created)
- ✅ Make sure you have GitHub activities (try pushing a commit or opening a PR)

### "Discord messages aren't appearing"
**Solution:**
- ✅ Check the webhook URL is correct
- ✅ Make sure the Discord channel has the webhook
- ✅ Check Discord permissions allow webhooks
- ✅ Look at browser console for errors when configuring
- ✅ Try the test webhook from step 2 above

### "403 Forbidden error when accessing Dashboard"
**Solution:**
- Make sure you've logged in with GitHub first
- The app sets a `github_token` cookie - if it's missing, you're not authenticated
- Go back to home page and click "Get Started Free"

### "Database error or 500 errors"
**Solution:**
- Make sure you ran the full migration SQL from `supabase-schema.sql`
- Check Supabase SQL editor for any errors
- Verify environment variables are set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

---

## Environment Variables Required

Make sure these are set in your `.env.local` (development) or Replit secrets:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GITHUB_CLIENT_ID=your-github-oauth-id
GITHUB_CLIENT_SECRET=your-github-oauth-secret
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GEMINI_API_KEY=your-gemini-api-key
```

All of these should already be in your Replit secrets.

---

## Next Steps After Setup

Once everything is working:

1. **Gamification** - Earn XP and badges for contributions
2. **Team Analytics** - View team statistics and leaderboards
3. **AI PR Summaries** - Get automatic AI analysis of pull requests
4. **Real-time Notifications** - Get instant Discord notifications for team activities

---

## Questions?

Check the logs in your browser console (F12) for any errors that might indicate what's missing.
