# OpsCord Vercel Configuration Guide

Your app is deployed at: **https://opscord.vercel.app**

## ⚡ Quick Setup Checklist

### 1️⃣ GitHub OAuth Configuration (REQUIRED)
Update your GitHub OAuth App with Vercel URLs:

1. Go to: https://github.com/settings/developers → OAuth Apps
2. Select your OpsCord OAuth App
3. Update **Authorization callback URL**:
   ```
   https://opscord.vercel.app/api/auth/callback
   ```
4. Update **Homepage URL**:
   ```
   https://opscord.vercel.app
   ```
5. Save changes

### 2️⃣ GitHub Webhook Configuration (REQUIRED)
Set up GitHub webhook to send events to Discord:

1. Go to your GitHub repository
2. Settings → Webhooks → Add webhook
3. **Payload URL**: 
   ```
   https://opscord.vercel.app/api/github/webhook
   ```
4. **Content type**: application/json
5. **Secret**: (Use your GITHUB_WEBHOOK_SECRET)
6. **Events**: Select "All events" or customize:
   - Pull requests
   - Issues
   - Pushes
   - Releases
7. ✅ Active: Check the box
8. Add webhook

### 3️⃣ Discord Bot Configuration (OPTIONAL but RECOMMENDED)
Enable Discord slash commands and notifications:

1. Go to: https://discord.com/developers/applications
2. Select your OpsCord bot application
3. Go to "General Information" tab
4. Copy: **Application ID** → Set as `DISCORD_CLIENT_ID`
5. Go to "Bot" tab
6. Copy: **Token** → Set as `DISCORD_TOKEN`
7. Go to "General Information" again
8. Copy: **Public Key** → Set as `DISCORD_PUBLIC_KEY`
9. Go to "OAuth2 → Integrations Endpoint URL"
10. Set to: `https://opscord.vercel.app/api/discord/interactions`
11. Save changes

### 4️⃣ Register Discord Commands
Once bot is configured, register commands:

```bash
# Option A: Via browser
curl -X POST https://opscord.vercel.app/api/discord/register-commands

# Option B: Using curl with auth
curl -X POST https://opscord.vercel.app/api/discord/register-commands \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5️⃣ Vercel Environment Variables
Ensure these are set in Vercel dashboard (Settings → Environment Variables):

**PUBLIC VARS** (visible):
```
NEXT_PUBLIC_SUPABASE_URL=https://tkmdacntpkuamgxwmeml.supabase.co/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_APP_URL=https://opscord.vercel.app
NODE_ENV=production
```

**SECRET VARS** (hidden):
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
GITHUB_CLIENT_ID=Iv23li7p84d3VWeK8p8N
GITHUB_CLIENT_SECRET=49f0875622de5e1fa846e0f7bda7d296b121ffb8
GITHUB_TOKEN=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
GITHUB_WEBHOOK_SECRET=e1295bdf08cbc28064ded791355d924af5c8bd50b26f294fff58e32e7e2006d9
DISCORD_CLIENT_ID=1438479622697254963
DISCORD_TOKEN=MTQzODQ3OTYyMjY5NzI1NDk2Mw...
DISCORD_PUBLIC_KEY=6d5ad3a920a576613a054f8ffa5b2f9311b1618765248861c5df5844924caf27
DISCORD_CLIENT_SECRET=yXbnjH_ZYIRELwW68P_uDprqcbbXPHKd
GEMINI_API_KEY=AIzaSyBeWw6ngZLNESIzajBiMxAmG1SZR5rjcsw
```

## 🧪 Testing Checklist

### Test 1: GitHub OAuth Login
- [ ] Visit https://opscord.vercel.app
- [ ] Click "Get Started Free"
- [ ] Authenticate with GitHub
- [ ] Should redirect to dashboard
- [ ] See your repositories

### Test 2: GitHub Webhook
- [ ] Make a commit to your repository
- [ ] Push to GitHub
- [ ] Check Discord - should see notification
- [ ] Create a Pull Request
- [ ] Should see PR details in Discord with AI summary

### Test 3: Discord Commands
- [ ] In Discord server, type: `/ping`
- [ ] Should respond with "Pong! OpsCord bot is online"
- [ ] Try: `/stats` - Shows leaderboard
- [ ] Try: `/summary` - Get PR summaries

### Test 4: Dashboard Features
- [ ] Overview tab: See your repos
- [ ] Activity tab: See recent events
- [ ] Analytics tab: See leaderboard and badges
- [ ] Settings tab: Configure Discord webhook

## 📋 Features Implemented (v1.0)

### ✅ GitHub Integration
- OAuth 2.0 authentication
- Repository listing
- Webhook event processing
- Activity tracking

### ✅ Discord Integration
- Webhook notifications for:
  - Pull requests (opened/merged)
  - Issues (opened/closed)
  - Code reviews
  - Commits/Pushes
- 9 Slash Commands:
  - `/ping` - Bot status
  - `/summary [pr]` - AI PR summary
  - `/stats [user]` - User stats & leaderboard
  - `/create-issue` - Create GitHub issues from Discord
  - `/assign` - Auto-assign issues
  - `/repo-status` - CI/CD status
  - `/setup-notifications` - Configure notifications
  - `/ai-review` - AI code review
  - `/team-stats` - Team leaderboard

### ✅ Gamification
- XP rewards for:
  - Opening PRs (+10 XP)
  - Merging PRs (+20 XP)
  - Code reviews (+15 XP)
  - Creating issues (+8 XP)
  - Closing issues (+5 XP)
  - Daily streaks (+10 bonus)
- 7 Achievement badges:
  - 🎯 First PR
  - ⚔️ Code Warrior
  - 🤝 Team Player
  - 🐛 Bug Hunter
  - 📊 Analytics Master
  - 🔥 Streak Master
  - ⭐ Super Contributor

### ✅ AI Features
- PR summarization with Gemini 1.5
- Complexity assessment (Low/Medium/High)
- Risk identification
- Recommendations

### ✅ Dashboard
- Real-time activity feed
- Team leaderboards
- User stats & badges
- Repository overview
- Settings & integrations

## 🔧 Troubleshooting

### Problem: GitHub OAuth returns "Invalid callback URL"
**Solution**: 
1. Check GitHub OAuth App settings
2. Verify callback URL exactly matches: `https://opscord.vercel.app/api/auth/callback`
3. No trailing slash

### Problem: Discord webhook not receiving events
**Solution**:
1. Verify webhook URL is correct in GitHub settings
2. Check webhook secret matches `GITHUB_WEBHOOK_SECRET`
3. View webhook delivery logs in GitHub
4. Ensure Discord webhook URL is still valid

### Problem: Discord commands not working
**Solution**:
1. Ensure DISCORD_TOKEN and DISCORD_PUBLIC_KEY are set
2. Register commands: `curl -X POST https://opscord.vercel.app/api/discord/register-commands`
3. Check bot has permissions: "Use Slash Commands"
4. Bot needs scopes: `bot` and `applications.commands`

### Problem: AI features not working
**Solution**:
1. Check `GEMINI_API_KEY` is set in Vercel
2. Verify API key has Generative Language API enabled
3. Test with: `curl -X GET https://opscord.vercel.app/api/ai/test`

### Problem: "401 Unauthorized" on dashboard
**Solution**:
1. This is normal if not logged in
2. Log in via GitHub OAuth
3. Check browser cookies are not blocked

## 🚀 Next Steps

1. **Complete all 5 configuration steps above**
2. **Run the testing checklist**
3. **Add bot to your Discord server**
4. **Invite team members and start tracking contributions**

## 📊 Monitoring

Check your app health:
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Logs**: https://app.supabase.com/project/tkmdacntpkuamgxwmeml/logs
- **Discord Bot Status**: Type `/ping` in Discord

## 💡 Pro Tips

1. **Multiple repos**: Add webhook to each repo for tracking
2. **Multiple servers**: Add bot to multiple Discord servers
3. **Customize notifications**: Use `/setup-notifications` command
4. **Team leaderboard**: More activity = higher scores

## 📞 Support Resources

- [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Discord Bot Docs](https://discord.com/developers/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/)

---

**Status**: ✅ Ready for Production
**Version**: v1.0 (MVP)
**Last Updated**: 2024-11-27
