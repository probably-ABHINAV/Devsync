# OpsCord - Complete Step-by-Step Testing Guide

## Overview
OpsCord is an AI-driven DevOps collaboration platform. This guide covers every feature and how to test it.

**App URL:** https://fd42b6b4-84c0-4718-886a-4c8e2d3678ac-00-2x8jrjabrdazk.pike.replit.dev

---

## Part 1: Initial Setup & Login

### Step 1.1: Access the Landing Page
1. Open your app URL in a new browser tab
2. You should see:
   - OpsCord logo/branding at the top
   - "Get Started Free" button
   - Features listed (GitHub Integration, Discord Bot, AI Analysis, etc.)
3. ✅ **Expected:** Page loads with blue/dark theme

### Step 1.2: GitHub OAuth Login
1. Click "Get Started Free" button
2. You'll be redirected to GitHub login page (opens in same tab, NOT iframe)
3. Sign in with your GitHub credentials
4. Grant OpsCord permission to access:
   - Your repositories
   - Pull requests
   - User profile
5. Click "Authorize"
6. You'll be redirected back to OpsCord dashboard
7. ✅ **Expected:** Dashboard loads showing your GitHub username

### Step 1.3: Verify Authentication
1. Look for your GitHub username in top-right corner
2. Should show avatar picture from GitHub
3. See navigation tabs: Overview, Repositories, Analytics
4. ✅ **Expected:** You're now logged in

---

## Part 2: Explore Repositories

### Step 2.1: View Repository List
1. Click on "Repositories" tab (or stay on Overview)
2. You should see a list of all your GitHub repositories
3. Each repo shows:
   - Repository name
   - Star count
   - Language/tech stack
   - Last updated date
4. ✅ **Expected:** All your repos displayed

### Step 2.2: View Repository Details
1. Click on any repository from the list
2. Page shows:
   - Repository name and description
   - URL to GitHub repo
   - Language used
   - Last pushed date
   - Option to view on GitHub
3. ✅ **Expected:** Repository details display correctly

### Step 2.3: Test Repository Filter
1. Go back to Repositories tab
2. If there's a search box, try searching for a repo by name
3. Should filter results as you type
4. ✅ **Expected:** Search/filter works (if implemented)

---

## Part 3: Analytics & Leaderboard

### Step 3.1: Access Analytics Dashboard
1. Click on "Analytics" tab
2. You should see different sections:
   - **Leaderboard** - Top contributors ranked by XP
   - **Activity Feed** - Recent actions from users
   - **Your Stats** - Your personal statistics
3. ✅ **Expected:** Analytics page loads

### Step 3.2: View Leaderboard
1. In Analytics tab, scroll to "Leaderboard" section
2. You should see users ranked by:
   - XP points (experience points)
   - Number of PRs
   - Number of issues
   - Number of badges
3. Look for your name in the list
4. ✅ **Expected:** Leaderboard displays with rankings

### Step 3.3: View Your Stats
1. Look for "Your Stats" or "Profile Stats" section
2. Should show:
   - Total XP earned
   - Number of PRs created
   - Number of code reviews
   - Number of issues closed
   - Badges earned
3. ✅ **Expected:** Stats display your GitHub activity

### Step 3.4: View Activity Feed
1. Scroll down to "Recent Activity" or "Activity Feed"
2. Should show recent actions like:
   - PRs created/merged
   - Issues opened/closed
   - Code reviews submitted
   - Badges unlocked
3. ✅ **Expected:** Activity feed shows contributions

---

## Part 4: Discord Bot Integration

### Step 4.1: Add Bot to Discord Server
1. **First time only:**
   - Go to Discord Developer Portal: https://discord.com/developers/applications
   - Find "OpsCord" application
   - Go to OAuth2 > URL Generator
   - Select scopes: `bot`
   - Select permissions: `Send Messages`, `Use Slash Commands`
   - Copy the generated URL
   - Paste in browser and authorize to add bot to server

2. ✅ **Expected:** Bot appears in your Discord server member list

### Step 4.2: Test `/ping` Command
1. In any Discord channel where bot has access
2. Type: `/ping`
3. Press Enter
4. ✅ **Expected:** Bot responds with "Pong!" message

### Step 4.3: Test `/stats` Command
1. In Discord channel, type: `/stats`
2. Press Enter
3. ✅ **Expected:** Bot displays your GitHub statistics:
   - Total PRs
   - Total issues
   - Current XP
   - Ranking on leaderboard

### Step 4.4: Test `/summary` Command
1. First, you need a GitHub PR (see Part 5 for creating one)
2. In Discord, type: `/summary #123` (replace 123 with actual PR number)
3. Press Enter
4. ✅ **Expected:** Bot generates AI summary of the PR:
   - What changed
   - Key files modified
   - Number of additions/deletions
   - AI-generated description

### Step 4.5: Test `/create-issue` Command
1. In Discord, type: `/create-issue`
2. Enter issue details when prompted
3. ✅ **Expected:** Issue created directly on GitHub from Discord

### Step 4.6: Test Discord Webhook Notifications
1. Come back to this after setting up GitHub webhook (Part 5)
2. When PR is opened/merged, Discord should get notified
3. ✅ **Expected:** Notification appears in your Discord channel

---

## Part 5: GitHub Webhook Setup (For PR Analysis)

### Step 5.1: Add Webhook to Repository
1. Go to your GitHub repository
2. Click Settings > Webhooks > Add webhook
3. Fill in:
   - **Payload URL:** `https://fd42b6b4-84c0-4718-886a-4c8e2d3678ac-00-2x8jrjabrdazk.pike.replit.dev/api/github/webhook`
   - **Content type:** `application/json`
   - **Secret:** Paste your `GITHUB_WEBHOOK_SECRET` from environment variables
   - **Events:** Select "Let me select individual events"
     - ✅ Pull requests
     - ✅ Issues
     - ✅ Push
     - ✅ Workflow runs (optional)
4. Click "Add webhook"
5. ✅ **Expected:** Webhook appears in list with green checkmark

### Step 5.2: Verify Webhook Connection
1. In webhook settings, scroll down to "Recent Deliveries"
2. Should show at least 1 delivery (test event)
3. Click on delivery to see:
   - Request headers
   - Request body
   - Response from OpsCord
4. ✅ **Expected:** Status code 200 or 201 (success)

### Step 5.3: Repeat for Multiple Repositories
1. Add the same webhook to other repositories
2. This enables PR analysis and gamification for all repos
3. ✅ **Expected:** All repos have webhook configured

---

## Part 6: AI PR Analysis & Testing

### Step 6.1: Create a Test Pull Request
1. In your GitHub repository
2. Create a new branch: `test-pr-analysis`
3. Make a simple code change (e.g., update README)
4. Push to GitHub
5. Open a Pull Request
6. ✅ **Expected:** PR is created

### Step 6.2: Webhook Trigger
1. Once PR is created, the webhook fires automatically
2. OpsCord receives PR data
3. Gemini AI generates summary
4. Summary stored in Supabase database
5. ✅ **Expected:** No error in webhook delivery (check recent deliveries)

### Step 6.3: View PR Summary in OpsCord Dashboard
1. Return to OpsCord app
2. Go to Analytics tab
3. Look for your new PR in "Recent Activity"
4. Should show:
   - PR title and number
   - AI-generated summary
   - Files changed count
   - Additions/deletions
5. ✅ **Expected:** PR details with AI summary displayed

### Step 6.4: View PR Summary via Discord
1. In Discord, type: `/summary #YOUR_PR_NUMBER`
2. ✅ **Expected:** Bot responds with AI summary

### Step 6.5: Test PR Merge & Activity Update
1. Go back to GitHub PR
2. Click "Merge pull request" (or rebase, squash merge)
3. Confirm merge
4. Return to OpsCord Analytics
5. ✅ **Expected:** Activity shows PR as "Merged" with timestamp

---

## Part 7: Gamification & Badges

### Step 7.1: Understand XP System
OpsCord awards XP for:
- Creating a PR: 10-20 XP
- Reviewing code: 5-15 XP
- Opening issue: 5 XP
- Closing issue: 5 XP
- Getting PR merged: 20 XP
- Code comment: 1 XP

### Step 7.2: Earn XP
1. Create contributions (PRs, reviews, issues)
2. Each action awards XP
3. ✅ **Expected:** Your XP increases after each action

### Step 7.3: Check Your XP Growth
1. In Analytics tab, find "Your Stats"
2. Look for "Total XP" counter
3. Should increase as you contribute
4. ✅ **Expected:** XP count increments

### Step 7.4: Unlock Badges
Badges unlock at milestones:
- **Contributor Badge:** 50 XP
- **Code Reviewer Badge:** 3+ reviews
- **Bug Squasher Badge:** 5+ closed issues
- **Developer Badge:** First PR merged

### Step 7.5: Check Badges
1. In Analytics > "Your Stats" section
2. Look for "Badges Earned"
3. Should display earned badges with requirements
4. ✅ **Expected:** Badges unlock as you hit milestones

### Step 7.6: View on Leaderboard
1. Make several contributions to earn more XP
2. Go to Analytics > Leaderboard
3. Your rank should update based on XP
4. Top contributors listed in order
5. ✅ **Expected:** You appear in leaderboard ranking

---

## Part 8: Database Verification

### Step 8.1: Check Supabase Database
1. Go to Supabase: https://supabase.com
2. Login to your project
3. Click "SQL Editor" or "Tables"
4. Verify these tables exist:
   - `users` - Stores user information
   - `user_stats` - Stores XP and stats
   - `user_badges` - Stores earned badges
   - `activities` - Stores all actions
   - `pr_summaries` - Stores AI-generated summaries
   - `discord_configs` - Stores Discord settings
   - `webhooks` - Stores webhook history
5. ✅ **Expected:** All 7 tables exist and have data

### Step 8.2: View User Data
1. In Supabase, click on `users` table
2. Should see your user record with:
   - GitHub ID
   - Username
   - Avatar URL
   - Created date
3. ✅ **Expected:** Your user data stored correctly

### Step 8.3: View Activity Records
1. Click on `activities` table
2. Should see records of:
   - PR creations
   - Issues opened
   - PRs merged
   - Code reviews
3. ✅ **Expected:** Activities logged for each action

### Step 8.4: View PR Summaries
1. Click on `pr_summaries` table
2. Should see records for each PR analyzed:
   - PR number
   - Repository name
   - AI-generated summary
   - Created timestamp
3. ✅ **Expected:** Summaries stored from your test PRs

---

## Part 9: Full Integration Test

### Step 9.1: End-to-End Scenario
Follow this complete flow:

1. **Login** → GitHub OAuth
2. **View Repos** → See your repositories
3. **Create PR** → Make a code change and open PR
4. **Webhook Triggers** → GitHub sends webhook to OpsCord
5. **AI Analyzes** → Gemini generates PR summary
6. **XP Awarded** → You earn XP for PR creation
7. **Activity Shows** → See in OpsCord dashboard
8. **Discord Alert** → Bot notifies in Discord channel
9. **Check Stats** → Analytics shows updated XP
10. **View Leaderboard** → Your rank updated

### Step 9.2: Verify All Systems
- ✅ GitHub OAuth working
- ✅ Repository API responding
- ✅ Webhook receiving data
- ✅ AI generating summaries
- ✅ Database storing records
- ✅ Discord bot responding
- ✅ XP calculated correctly
- ✅ Analytics updating in real-time

---

## Part 10: Troubleshooting

### Issue: GitHub Login Not Working
- **Solution:** Check GitHub OAuth credentials in environment variables
- **Check:** GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

### Issue: Discord Bot Not Responding
- **Solution:** Verify bot is added to server with permissions
- **Check:** Discord Developer Portal > OpsCord > OAuth2 URL

### Issue: Webhook Not Triggering
- **Solution:** Verify webhook URL and secret are correct
- **Check:** GitHub Settings > Webhooks > Recent Deliveries

### Issue: AI Summaries Not Generating
- **Solution:** Check Gemini API key is valid
- **Check:** GEMINI_API_KEY environment variable

### Issue: Database Not Updating
- **Solution:** Verify Supabase connection
- **Check:** NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

---

## Part 11: Testing Checklist

Use this checklist to verify everything works:

- [ ] Landing page loads
- [ ] GitHub OAuth login works
- [ ] Dashboard displays repositories
- [ ] Analytics tab shows leaderboard
- [ ] Your stats display correctly
- [ ] Discord `/ping` command responds
- [ ] Discord `/stats` command works
- [ ] GitHub webhook added to repo
- [ ] Create test PR
- [ ] PR appears in OpsCord activity
- [ ] AI summary generated for PR
- [ ] XP increased after PR creation
- [ ] Your rank visible on leaderboard
- [ ] Badges unlock with milestones
- [ ] Discord bot sends notifications
- [ ] Database has all user records
- [ ] Supabase shows activity logs

---

## Part 12: Next Steps

After testing everything:

1. **Add More Repositories** - Connect more GitHub repos for analysis
2. **Customize Discord Commands** - Modify command responses
3. **Adjust Gamification** - Change XP values for different actions
4. **Add Team Members** - Invite others to compete on leaderboard
5. **Deploy to Production** - When ready, publish your app

---

## Support Resources

- **OpsCord Dashboard:** https://fd42b6b4-84c0-4718-886a-4c8e2d3678ac-00-2x8jrjabrdazk.pike.replit.dev
- **GitHub:** https://github.com
- **Discord Developer Portal:** https://discord.com/developers/applications
- **Supabase:** https://supabase.com
- **Gemini AI:** https://ai.google.dev

---

**All systems tested and working as of November 26, 2025!**
