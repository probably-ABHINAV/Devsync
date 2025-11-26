# START VERCEL MIGRATION HERE

Your code is ready to move from Replit to Vercel. Follow this guide in order.

---

## Step 1: Commit Your Code (2 minutes)

First, commit the migration preparation changes:

```bash
git add .
git commit -m "Prepare for Vercel migration - update config"
git push origin main
```

Verify it worked:
```bash
git status
```
Should show: `"nothing to commit, working tree clean"`

---

## Step 2: Follow the Migration Guide (30 minutes)

Open and follow: **VERCEL_MIGRATION.md**

Go through sections in order:
1. **SECTION 1:** Code preparation (already done ✓)
2. **SECTION 2:** Create Vercel project
3. **SECTION 3:** Add environment variables (14 total)
4. **SECTION 4:** Deploy to Vercel
5. **SECTION 5:** Update Discord bot settings
6. **SECTION 6:** Update GitHub webhooks
7. **SECTION 7:** Update GitHub OAuth
8. **SECTION 8:** Verify everything works

---

## Step 3: Use the Checklist (During migration)

Use: **MIGRATION_CHECKLIST.md**

Check off each item as you complete it. This ensures nothing is missed.

---

## What Changed in Your Code

Only 1 file was modified for production readiness:

**next.config.mjs:**
- Added `*.vercel.app` to allowedOrigins
- This allows Vercel to host your app properly
- Replit still works too

---

## Summary: What You'll Do

1. **Push code** (1 min) ← You're here
2. **Create Vercel project** - Import from GitHub (5 min)
3. **Add environment variables** - Copy-paste from Replit (5 min)
4. **Deploy** - Wait 3-5 minutes (automatic)
5. **Update Discord URL** - One endpoint URL change (2 min)
6. **Update GitHub webhooks** - One URL per repo (5 min)
7. **Update GitHub OAuth** - One redirect URI (2 min)
8. **Test** - Verify everything works (5 min)

**Total time: ~30 minutes**

---

## What You'll Get

After migration:
- ✅ App runs 24/7 on Vercel (no Replit needed)
- ✅ Bot responds instantly to Discord commands
- ✅ GitHub webhooks trigger automatically
- ✅ Production-ready infrastructure
- ✅ Auto-scaling as your team grows

---

## Key URLs You'll Need

**Vercel Login:**
https://vercel.com

**Discord Developer Portal:**
https://discord.com/developers/applications

**Your GitHub Repo:**
(wherever you have your code)

---

## Important Notes

1. **Don't delete Replit** - You can keep it running or stop the workflow
2. **GitHub is your source** - Always push code to GitHub first
3. **Vercel auto-deploys** - Changes push to GitHub = auto-deploy to Vercel
4. **Keep backups** - Supabase database stays the same (no changes needed)

---

## Ready? Let's Go!

1. Run the git commands above
2. Open **VERCEL_MIGRATION.md**
3. Follow each section carefully
4. Use **MIGRATION_CHECKLIST.md** to verify
5. Test each step

---

## If You Get Stuck

1. Check **MIGRATION_CHECKLIST.md** - Section 13: Common Issues & Fixes
2. Check Vercel logs: https://vercel.com → Deployments → Logs
3. Verify all 14 environment variables are set in Vercel
4. Restart if needed - deploy again in Vercel dashboard

---

**Let's migrate! Your bot will be 24/7 online in 30 minutes.** 🚀
