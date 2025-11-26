# Replit → Vercel Migration - Step-by-Step Checklist

Follow this checklist to ensure nothing is missed during migration.

---

## Phase 1: Code Preparation ✓

- [x] package.json has correct build/start scripts
- [x] .gitignore includes .env and .vercel
- [ ] All code committed to GitHub (`git push origin main`)
- [ ] No uncommitted changes (`git status` shows clean)

**Command to verify:**
```bash
git status
# Should show: "On branch main, nothing to commit, working tree clean"
```

---

## Phase 2: Vercel Project Setup

- [ ] Created account on https://vercel.com
- [ ] Logged in with GitHub account
- [ ] Imported OpsCord repository
- [ ] Build settings auto-detected (Next.js)
- [ ] **DID NOT click Deploy yet** (waiting for environment variables)

---

## Phase 3: Environment Variables in Vercel

Add these 14 variables. For each, set Environment to: `Production, Preview, Development`

**Discord Variables:**
- [ ] DISCORD_TOKEN
- [ ] DISCORD_PUBLIC_KEY
- [ ] DISCORD_CLIENT_ID
- [ ] DISCORD_CLIENT_SECRET

**GitHub Variables:**
- [ ] GITHUB_CLIENT_ID
- [ ] GITHUB_CLIENT_SECRET
- [ ] GITHUB_TOKEN
- [ ] GITHUB_WEBHOOK_SECRET
- [ ] GITHUB_PRIVATE_KEY

**Supabase Variables:**
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY

**Other Variables:**
- [ ] GEMINI_API_KEY
- [ ] NEXT_PUBLIC_APP_URL (set to `https://yourapp.vercel.app` or your domain)

**Verification:**
```
Total variables: 14
All marked for Production environment: ✓
```

---

## Phase 4: Deploy to Vercel

- [ ] All 14 environment variables added
- [ ] Clicked "Deploy" button
- [ ] Deployment in progress (watching logs)
- [ ] Deployment complete - shows "✓ Deployment complete"
- [ ] Got Vercel URL (example: https://opscord-abc123.vercel.app)

**Save your Vercel URL:** 
```
https://_______________________.vercel.app
```

---

## Phase 5: Update Discord Bot

- [ ] Went to Discord Developer Portal
- [ ] Found OpsCord application
- [ ] Updated "Interactions Endpoint URL"
  - FROM: `http://localhost:5000/api/discord/interactions`
  - TO: `https://yourapp.vercel.app/api/discord/interactions`
- [ ] Saved changes in Discord
- [ ] Discord verified endpoint (should pass)
- [ ] Tested `/ping` command in Discord - worked! ✓

---

## Phase 6: Update GitHub Webhooks

For EACH repository with a webhook:

- [ ] Went to repo Settings → Webhooks
- [ ] Clicked Edit on webhook
- [ ] Updated Payload URL
  - FROM: `http://localhost:5000/api/github/webhook`
  - TO: `https://yourapp.vercel.app/api/github/webhook`
- [ ] Verified Secret is correct
- [ ] Clicked "Update webhook"
- [ ] Checked "Recent Deliveries" - status 200 OK ✓

---

## Phase 7: Update GitHub OAuth

- [ ] Went to GitHub Settings → Developer settings → OAuth Apps
- [ ] Found OpsCord OAuth app
- [ ] Updated Authorization callback URL
  - FROM: `http://localhost:5000/api/auth/callback`
  - TO: `https://yourapp.vercel.app/api/auth/callback`
- [ ] Saved changes

---

## Phase 8: Complete Testing

**Frontend:**
- [ ] Homepage loads at Vercel URL
- [ ] "Get Started Free" button works
- [ ] GitHub login completes
- [ ] Dashboard shows repositories
- [ ] Analytics page loads
- [ ] No console errors

**Discord Bot:**
- [ ] `/ping` responds within 1 second
- [ ] `/stats` shows GitHub stats
- [ ] `/summary #1` works for PR numbers
- [ ] `/create-issue` works

**GitHub Integration:**
- [ ] Create test PR on GitHub
- [ ] Webhook triggers (check Vercel logs)
- [ ] PR appears in OpsCord activity
- [ ] AI summary generated

**Database:**
- [ ] Login to app (new user record created in Supabase)
- [ ] Check Supabase - user data present
- [ ] Activity logs recorded

---

## Phase 9: Verification Commands

Run these to verify everything:

**Check Vercel deployment:**
```bash
# Visit in browser and check it loads
https://yourapp.vercel.app
```

**Check Vercel logs for errors:**
```
Vercel Dashboard → Deployments → Select latest → Logs
```

**Test Discord bot:**
```
In Discord: /ping
Expected: "Pong! OpsCord bot is online and ready!"
```

**Test GitHub webhook:**
```
GitHub repo → Settings → Webhooks → Recent Deliveries
Should show status: 200 OK (recently)
```

---

## Phase 10: Cleanup (Optional)

- [ ] Stopped Replit workflow (or left running for backup)
- [ ] Kept GitHub as source of truth
- [ ] Deleted any local branches that aren't needed
- [ ] Updated team documentation with new Vercel URL

---

## DONE Checklist ✅

- [ ] Code deployed to Vercel ✓
- [ ] Discord bot responding from Vercel ✓
- [ ] GitHub webhooks updated ✓
- [ ] GitHub OAuth updated ✓
- [ ] All 14 environment variables set ✓
- [ ] Frontend loads from Vercel ✓
- [ ] All tests pass ✓
- [ ] Everything working end-to-end ✓

---

## Your Vercel URL

```
https://_________________________________.vercel.app
```

## Your Vercel Domain (after setting custom domain)

```
https://________________________________
```

---

## Next Steps

1. Monitor Vercel logs for 24 hours
2. Add more GitHub repos with webhooks
3. Invite team members
4. Set up custom domain (optional)
5. Configure auto-scaling (Vercel handles automatically)

---

## Support

If anything fails:
1. Check Vercel logs: https://vercel.com → Deployments → Logs
2. Check Discord Developer Portal settings
3. Check GitHub webhook "Recent Deliveries"
4. Review VERCEL_MIGRATION.md for detailed steps

**Migration complete! Your bot is now 24/7 online on Vercel! 🎉**
