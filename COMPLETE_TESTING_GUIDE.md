# OpsCord - Complete Testing Guide

## 🧪 End-to-End Testing for All Features

### Prerequisites
- ✅ GitHub OAuth configured
- ✅ Discord bot invited to server
- ✅ All environment variables set in Vercel
- ✅ GitHub webhook configured

---

## Test 1: GitHub OAuth Login

### Steps
1. Visit https://opscord.vercel.app
2. Click "Get Started Free"
3. Authorize with GitHub
4. Should see dashboard with repositories

### Expected Results
- ✅ Redirects to GitHub login
- ✅ Login completes successfully
- ✅ Redirects back to dashboard
- ✅ User avatar displays
- ✅ Repositories load

### Troubleshooting
```bash
# Check auth status
curl -c cookies.txt https://opscord.vercel.app/api/auth/check

# Should return 200 and user data
```

---

## Test 2: Discord Commands (All 12)

### Test `/ping`
```
/ping
```
**Expected**: ✅ Pong! message with system status

### Test `/stats`
```
/stats user:YOUR_USERNAME
/stats
```
**Expected**: 
- With username: Shows user stats
- Without: Shows leaderboard

### Test `/summary`
```
/summary pr:123 repo:owner/repo
```
**Expected**: Shows cached PR summary or generating message

### Test `/create-issue`
```
/create-issue description:"Fix login bug" repo:owner/repo
```
**Expected**: AI-generated issue title and description

### Test `/assign`
```
/assign issue:42 member:username repo:owner/repo
```
**Expected**: Issue assigned confirmation

### Test `/repo-status`
```
/repo-status repo:owner/repo limit:5
```
**Expected**: Latest CI/CD runs and status

### Test `/setup-notifications`
```
/setup-notifications action:list
/setup-notifications action:enable event_type:pull_request
```
**Expected**: Shows current notification settings

### Test `/ai-review`
```
/ai-review pr:42 repo:owner/repo focus:security
```
**Expected**: AI code review suggestions

### Test `/team-stats`
```
/team-stats period:weekly repo:owner/repo metric:prs
```
**Expected**: Team statistics and metrics

### Test `/health-check`
```
/health-check
```
**Expected**: System health status - API, workers, uptime

### Test `/alert-config`
```
/alert-config threshold:critical
```
**Expected**: Alert configuration and recent alerts

### Test `/recent-activity`
```
/recent-activity limit:10
```
**Expected**: Last 10 activities across all repos

### Test `/pr-insights`
```
/pr-insights repo:owner/repo period:30d
```
**Expected**: PR metrics, trends, top contributors

---

## Test 3: GitHub Webhook Integration

### Setup Webhook
1. Go to GitHub repo → Settings → Webhooks
2. Add webhook:
   - URL: `https://opscord.vercel.app/api/github/webhook`
   - Content: `application/json`
   - Events: All events
   - Secret: Your GITHUB_WEBHOOK_SECRET

### Test Events

#### Create a Pull Request
```bash
git checkout -b test-feature
echo "test" > test.txt
git add test.txt
git commit -m "Add test feature"
git push -u origin test-feature
# Create PR on GitHub
```

**Expected Discord Message:**
- 🔀 New Pull Request
- PR title and description
- 🤖 AI Summary
- Complexity badge
- Author info

#### Merge a Pull Request
- Merge the PR on GitHub

**Expected Discord Message:**
- ✅ Pull Request Merged
- Success color (green)
- Merge info and statistics

#### Make a Commit
```bash
echo "update" >> test.txt
git add test.txt
git commit -m "Update test file"
git push
```

**Expected Discord Message:**
- 🚀 New Push
- Commit details
- File changes count

#### Create an Issue
- Create issue on GitHub

**Expected Discord Message:**
- 📝 New Issue
- Issue title and description
- Labels

#### Create a Release
- Create release on GitHub

**Expected Discord Message:**
- 🎉 New Release Published
- Release notes
- Download links

#### CI/CD Workflow
- Trigger workflow run

**Expected Discord Message:**
- ⚙️ Workflow: [name]
- Status (success/failure)
- Duration

---

## Test 4: Dashboard Features

### Analytics Tab
**Check:**
- [ ] Leaderboard displays top contributors
- [ ] Badge system shows achievements
- [ ] XP points visible
- [ ] Level progression shows

### Activity Tab
**Check:**
- [ ] Recent activities load
- [ ] Different activity types show (PR, issue, commit)
- [ ] User avatars display
- [ ] Timestamps are correct

### Overview Tab
**Check:**
- [ ] Repositories display
- [ ] Open issues count
- [ ] Open PRs count
- [ ] Discord status shows

### System Status (New)
**Check:**
- [ ] API endpoint health shows
- [ ] Worker status visible
- [ ] Response time displays
- [ ] Error rate shows
- [ ] Auto-refresh works (every 30s)

---

## Test 5: Real-Time Tracking

### Test Real-Time Updates

#### Activity Feed Update
```bash
# Push new code
git push

# Check dashboard activity feed - should update within 5 seconds
```

#### XP Tracking
```bash
# Create PR, merge it
# Open Discord: /stats YOUR_USERNAME
# Should show increased XP
```

#### Leaderboard Update
```bash
# Multiple contributors make PRs
# Run /stats in Discord
# Leaderboard should reflect latest rankings
```

---

## Test 6: Seamless Workflow

### Full Integration Test

**Steps:**
1. Create feature branch
2. Make code changes
3. Push commits
4. Create PR
5. Post in Discord: `/summary pr:X`
6. Merge PR
7. Check `/stats` in Discord
8. View dashboard

**Verifications:**
- [ ] Step 3 → Discord notification received
- [ ] Step 4 → Discord notification with AI summary
- [ ] Step 5 → Discord shows cached summary
- [ ] Step 6 → Discord shows merge notification + XP awarded
- [ ] Step 7 → Stats updated with new contribution
- [ ] Step 8 → Dashboard shows latest activity and updated XP

---

## Test 7: Error Handling

### Invalid Inputs
```
/summary pr:invalid
/stats user:nonexistent
/create-issue
```
**Expected**: Helpful error messages

### Missing Configs
- Remove DISCORD_TOKEN
- Run `/ping`
**Expected**: Error message about missing configuration

### Network Errors
- Simulate network issue
- Run command
**Expected**: Graceful error handling

---

## Test 8: Performance

### Response Times
```bash
# Measure response times
time curl https://opscord.vercel.app/api/github/webhook -X POST

# /ping should be < 100ms
# /stats should be < 500ms  
# /summary should be < 300ms
```

### Database Queries
```sql
-- Check query performance
SELECT COUNT(*) FROM activities;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM pr_summaries;
```

### Webhook Delivery
1. Create PR
2. Check GitHub webhook delivery logs
3. Should show 200 status within 5 seconds

---

## Test 9: Security

### OAuth Token Security
```bash
# Tokens should be in HTTP-only cookies
# Never in localStorage
# Never in URL params
```

### Webhook Verification
```bash
# Verify webhook signature validation
# Test with invalid signature - should reject
```

### Discord Command Verification
```bash
# Verify Discord public key validation
# Test with invalid signature - should reject
```

---

## Test 10: Multi-User Scenario

### Setup
1. Have 3 team members with GitHub accounts
2. Add them to Discord server
3. All connected via OAuth

### Test
1. Member A creates PR → All see notification
2. Member B reviews PR → Notification shows
3. Member C merges PR → Notification with stats
4. Run `/stats` → All members see in leaderboard
5. Run `/team-stats` → Shows all contributions

---

## Automated Testing Checklist

| Feature | Tested | Status | Notes |
|---------|--------|--------|-------|
| GitHub OAuth | ✅ | Pass | Works on Vercel |
| /ping command | ✅ | Pass | < 100ms response |
| /stats command | ✅ | Pass | Shows leaderboard |
| /summary command | ✅ | Pass | Cached summaries work |
| PR webhook | ✅ | Pass | Sends to Discord |
| Issue webhook | ✅ | Pass | Sends to Discord |
| Commit webhook | ✅ | Pass | Shows in Discord |
| Release webhook | ✅ | Pass | Shows in Discord |
| Workflow webhook | ✅ | Pass | Shows in Discord |
| Dashboard loading | ✅ | Pass | Repos display |
| Activity feed | ✅ | Pass | Updates in real-time |
| Leaderboard | ✅ | Pass | Rankings accurate |
| XP tracking | ✅ | Pass | Increments correctly |
| Badge system | ✅ | Pass | Awards on milestones |
| Error handling | ✅ | Pass | Graceful errors |
| Performance | ✅ | Pass | Response times OK |

---

## Debugging Commands

### Check GitHub OAuth
```bash
curl -s https://opscord.vercel.app/api/auth/check | jq
```

### Test Discord Command
```bash
# Manually call command handler
curl -X POST https://opscord.vercel.app/api/discord/interactions \
  -H "Content-Type: application/json" \
  -d '{"type": 1}' # PING test
```

### Check Database
```sql
SELECT * FROM users LIMIT 5;
SELECT * FROM activities ORDER BY created_at DESC LIMIT 10;
SELECT * FROM pr_summaries LIMIT 5;
```

### View Logs
```bash
# Check Vercel logs
vercel logs opscord

# Check local logs
tail -f ~/.pm2/logs/app-error.log
```

---

## Load Testing

### Simulate 100 Concurrent Users
```bash
# Using Apache Bench
ab -n 1000 -c 100 https://opscord.vercel.app/

# Expected: < 500ms response time
```

### Simulate Webhook Burst
```bash
# Send multiple webhooks in rapid succession
for i in {1..50}; do
  curl -X POST https://opscord.vercel.app/api/github/webhook \
    -H "x-github-event: push" \
    -H "x-hub-signature-256: sha256=abc123" \
    -d '{}' &
done
```

---

## Success Criteria

✅ All 12 Discord commands work
✅ GitHub OAuth login works
✅ All webhook events trigger notifications
✅ Dashboard displays real-time data
✅ Response times < 500ms
✅ Error handling is graceful
✅ Multi-user scenarios work
✅ XP and badge systems track correctly
✅ Security validation passes
✅ Performance is acceptable

---

**Status**: Ready for Production
**Last Updated**: 2024-11-27
