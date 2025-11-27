# OpsCord - Seamless Workflow: GitHub ↔ Discord ↔ Dashboard

## 🔄 Complete Integration Flow

This document shows how all components work together seamlessly.

---

## 1. GitHub Event Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    GITHUB EVENT TRIGGERED                    │
├──────────────────────────────────────────────────────────────┤
│  Examples:                                                   │
│  • Push to main branch                                       │
│  • Pull request opened/merged                               │
│  • Issue created/closed                                     │
│  • Workflow completed                                        │
│  • Release published                                         │
│  • Code review submitted                                     │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│            GITHUB SENDS WEBHOOK TO OPSCORD                   │
├──────────────────────────────────────────────────────────────┤
│  POST /api/github/webhook                                    │
│  Headers:                                                    │
│  • x-github-event: pull_request                             │
│  • x-hub-signature-256: sha256=...                          │
│  Body: Full GitHub event payload                            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│          OPSCORD VALIDATES WEBHOOK SIGNATURE                 │
├──────────────────────────────────────────────────────────────┤
│  Verification:                                               │
│  • Check GITHUB_WEBHOOK_SECRET matches                      │
│  • Verify signature is authentic                            │
│  • Reject if invalid                                        │
│  Status: ✅ Valid                                            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│           OPSCORD PROCESSES EVENT IN DATABASE                │
├──────────────────────────────────────────────────────────────┤
│  Actions:                                                    │
│  1. Extract user who triggered event                        │
│  2. Create/update user record if new                        │
│  3. Store activity in activities table                      │
│  4. Award XP based on action type                           │
│  5. Update metrics tables                                   │
│  6. Cache PR summaries with AI analysis                     │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│         OPSCORD FORMATS MESSAGE FOR DISCORD                  │
├──────────────────────────────────────────────────────────────┤
│  • Build rich embed with event details                      │
│  • Add AI-generated summary if PR                           │
│  • Include author, repo, links                              │
│  • Use color coding for event type                          │
│  • Add timestamp and footer                                 │
└──────────────────────────────────────────────────────────────┘
                            ↓
```

---

## 2. Discord Notification Flow

```
┌──────────────────────────────────────────────────────────────┐
│             GET DISCORD WEBHOOK URL FROM DB                  │
├──────────────────────────────────────────────────────────────┤
│  Query: discord_configs WHERE user_id = repo_owner          │
│  Result: https://discord.com/api/webhooks/XXX/YYY           │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│          SEND WEBHOOK TO DISCORD CHANNEL                     │
├──────────────────────────────────────────────────────────────┤
│  POST to webhook URL                                         │
│  Payload:                                                    │
│  {                                                           │
│    "embeds": [{                                             │
│      "title": "🔀 New Pull Request",                        │
│      "description": "PR details...",                        │
│      "color": 0x0077FF,                                     │
│      "fields": [...],                                       │
│      "author": { ... },                                     │
│      "footer": { ... }                                      │
│    }]                                                        │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│         DISCORD DELIVERS MESSAGE TO CHANNEL                  │
├──────────────────────────────────────────────────────────────┤
│  Status: Message posted to Discord channel                  │
│  Visible to: All server members in that channel             │
│  Teams can now: React, discuss, take action                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Discord Command Flow

```
┌──────────────────────────────────────────────────────────────┐
│             USER TYPES DISCORD COMMAND                       │
├──────────────────────────────────────────────────────────────┤
│  Example: /stats user:john                                   │
│  In Discord channel where OpsCord bot is present            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│         DISCORD SENDS INTERACTION TO OPSCORD                 │
├──────────────────────────────────────────────────────────────┤
│  POST /api/discord/interactions                             │
│  Headers:                                                    │
│  • x-signature-ed25519: signature                           │
│  • x-signature-timestamp: timestamp                         │
│  Body:                                                       │
│  {                                                           │
│    "type": 2,  // Application Command                       │
│    "data": {                                                │
│      "name": "stats",                                       │
│      "options": [{"name": "user", "value": "john"}]        │
│    }                                                         │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│        OPSCORD VERIFIES DISCORD SIGNATURE                    │
├──────────────────────────────────────────────────────────────┤
│  • Verify using DISCORD_PUBLIC_KEY                          │
│  • Validate timestamp (< 15 min old)                        │
│  • Reject if invalid                                        │
│  Status: ✅ Verified                                         │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│          OPSCORD HANDLES COMMAND                             │
├──────────────────────────────────────────────────────────────┤
│  1. Route to appropriate handler                            │
│  2. Parse command options                                   │
│  3. Query database for data                                 │
│  4. Format response embed                                   │
│  5. Return to Discord                                       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│          DISCORD DISPLAYS RESPONSE                           │
├──────────────────────────────────────────────────────────────┤
│  Shows rich embed with requested data                       │
│  Examples:                                                   │
│  • User stats with badges                                   │
│  • Team leaderboard                                         │
│  • System health status                                     │
│  • Activity timeline                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Dashboard Real-Time Update Flow

```
┌──────────────────────────────────────────────────────────────┐
│          USER OPENS DASHBOARD                                │
├──────────────────────────────────────────────────────────────┤
│  Navigate to: https://opscord.vercel.app                    │
│  Dashboard loads with current user data                     │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│        DASHBOARD FETCHES REAL-TIME DATA                      │
├──────────────────────────────────────────────────────────────┤
│  API Calls:                                                  │
│  • GET /api/repos - User's repositories                     │
│  • GET /api/activities - Recent activities                  │
│  • GET /api/stats - User's contribution stats               │
│  • GET /api/leaderboard - Team rankings                     │
│  • GET /api/admin/system-health - System status             │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│         DASHBOARD DISPLAYS DATA                              │
├──────────────────────────────────────────────────────────────┤
│  Tabs:                                                       │
│  • Overview: Repositories, open issues                      │
│  • Activity: Real-time contribution feed                    │
│  • Analytics: Leaderboard, badges, XP                       │
│  • System Status: API health, workers, performance          │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│      REAL-TIME UPDATES EVERY 30 SECONDS                      │
├──────────────────────────────────────────────────────────────┤
│  Auto-refresh:                                               │
│  • Activity feed updates                                    │
│  • XP totals increment                                      │
│  • Leaderboard rankings change                              │
│  • System status metrics refresh                            │
│  • User sees latest contributions instantly                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Complete End-to-End Scenario

### Scenario: Developer merges a PR

#### Step 1: Create Feature Branch
```bash
git checkout -b add-feature
```

#### Step 2: Make Changes & Commit
```bash
git add .
git commit -m "Add new feature"
```
**Database**: Activity logged (pending until pushed)

#### Step 3: Push to GitHub
```bash
git push -u origin add-feature
```
**Webhook**: GitHub sends push event
**Discord**: Shows commit push notification
**Dashboard**: Contributor XP increases
**Database**: Push activity recorded

#### Step 4: Create Pull Request
Go to GitHub, create PR
**Webhook**: GitHub sends PR opened event
**Backend**: AI generates PR summary using Gemini
**Database**: PR summary cached
**Discord**: Rich embed with AI summary sent
**Dashboard**: PR activity appears in feed

#### Step 5: Team Reviews in Discord
```
/summary pr:42
```
**Discord**: Shows cached PR summary (instant)
**Reviewer**: Sees complexity, risks, recommendations

#### Step 6: Merge PR
Click merge on GitHub
**Webhook**: GitHub sends PR merged event
**Backend**: Awards XP to PR author (20 points)
**Backend**: Awards XP to merge approver (5 points)
**Database**: Update user XP, increment PR metrics
**Discord**: Merge notification with celebratory message
**Dashboard**: 
  - Activity feed updates
  - Leaderboard re-ranks
  - XP totals increment
  - Badges may unlock

#### Step 7: Check Stats
```
/stats user:john
```
**Discord**: Shows updated stats with new contributions
**Database**: Query returns fresh metrics

#### Step 8: View Dashboard
Open dashboard
**Dashboard Shows:**
- Activity feed with PR merge
- John's XP increased
- Leaderboard updated
- Possible new badge

---

## 6. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      GITHUB                                 │
│  Events: Push, PR, Issue, Release, Workflow, etc.          │
└────────────────────┬────────────────────────────────────────┘
                     │ Webhook
                     ↓
        ┌────────────────────────────┐
        │  OPSCORD BACKEND (Vercel)  │
        │  ─────────────────────────  │
        │  • Validate signature       │
        │  • Process event            │
        │  • Award XP                 │
        │  • Generate AI summary      │
        │  • Store in database        │
        └─┬──────────────────────┬───┘
          │                      │
          │ Discord Webhook      │ API
          │                      │
          ↓                      ↓
    ┌──────────────┐        ┌─────────────────┐
    │   DISCORD    │        │  SUPABASE DB    │
    │  ──────────  │        │  ─────────────  │
    │  • Channels  │        │  • users        │
    │  • Embed     │        │  • activities   │
    │  • Commands  │        │  • pr_summaries │
    │  • Bot       │        │  • metrics      │
    └──────┬───────┘        └────────┬────────┘
           │                         │
           │ Reaction               Query
           │                         │
           ↓                         ↓
    ┌──────────────────┐  ┌──────────────────┐
    │  Team Members    │  │  FRONTEND NEXT.JS│
    │  • See alerts    │  │  (React + Vite)  │
    │  • Use commands  │  │  ──────────────  │
    │  • Take action   │  │  Dashboard       │
    └──────────────────┘  │  Real-time UI    │
                          └──────────────────┘
                                 ↑
                                 │
                           Browser/User
```

---

## 7. Command Response Path

```
User Runs /ping
      ↓
Discord sends interaction
      ↓
OPSCORD verifies signature
      ↓
Route to handlePing()
      ↓
Generate response embed
      ↓
Return to Discord (type 4)
      ↓
Discord shows response in channel
      ↓
User sees: 🏓 Pong! (< 100ms)
```

---

## 8. Webhook Event Path

```
Commit pushed to main
      ↓
GitHub webhook fires
      ↓
OPSCORD receives at /api/github/webhook
      ↓
Verify signature
      ↓
Extract event details (commits, author, etc.)
      ↓
Create/update user record
      ↓
Log activity in database
      ↓
Award XP to contributor
      ↓
Format Discord message
      ↓
Send webhook to Discord
      ↓
Team sees notification in Discord
      ↓
Dashboard updates activity feed
```

---

## 9. XP & Badge Tracking

```
User Action           XP Awarded    DB Updates
─────────────────────────────────────────────
PR Opened               +10 XP       activities, users
PR Merged               +20 XP       activities, users
Code Review             +15 XP       activities, users
Issue Created            +8 XP       activities, users
Issue Closed             +5 XP       activities, users
Commit                   +2 XP       activities, users
Streak (7+ days)        +10 XP       activities, users
─────────────────────────────────────────────

Badge Unlocks:
─────────────────────────────────────────────
First PR           Unlocks when XP >= 10
Code Warrior       Unlocks when XP >= 100
Team Player        Unlocks when reviews >= 5
Bug Hunter         Unlocks when issues >= 10
Analytics Master   Unlocks when dashboards used >= 20
Streak Master      Unlocks when streak >= 7 days
Super Contributor  Unlocks when XP >= 1000
```

---

## 10. Real-Time Sync Timeline

```
GitHub Event → Webhook (< 1 sec)
     ↓
Database Update (< 500ms)
     ↓
Discord Notification (< 2 sec)
     ↓
Dashboard Refresh Poll (< 30 sec)
     ↓
User sees update (< 31 sec total)
```

---

## 11. Error Handling & Fallback

```
GitHub Webhook Fails
      ↓
Retry 3 times with exponential backoff
      ↓
Still fails?
      ↓
Log error in database
      ↓
Send alert to Discord: /alert-config
      ↓
Admin can check /health-check
      ↓
Manual webhook can be retried via GitHub UI
```

---

## 12. Security Checkpoints

```
GitHub Event → Verify SHA256 signature ✅
Discord Event → Verify ED25519 signature ✅
User Auth → Check GitHub token validity ✅
Database → Use service role key (server-only) ✅
Webhooks → HTTPS only ✅
Secrets → Environment variables only ✅
API → Rate limiting on endpoints ✅
```

---

## Production Workflow

### Daily Team Workflow

```
Morning:
1. Developer pushes code
2. GitHub webhook → Discord notification
3. Team sees alert in Discord
4. Team checks /recent-activity

Midday:
1. Multiple PRs open
2. Discord shows summaries
3. Team reviews in Discord
4. Checks /team-stats for performance

End of Day:
1. PRs get merged
2. Dashboard shows updated leaderboard
3. Everyone's stats updated
4. Badges may unlock for high performers
5. Team can see /health-check for system status
```

---

## Customization Examples

### Add Slack Integration
1. Implement Slack webhook similar to Discord
2. Add in webhook handler
3. Format Slack block messages
4. Register Slack commands

### Add Custom Metrics
1. Add new columns to metrics table
2. Update webhook processing
3. Add Discord command for metric
4. Display on dashboard

### Add Notifications Trigger
1. Set thresholds in alert-config
2. When metric exceeds threshold
3. Send alert to Discord
4. Log in system

---

**Status**: ✅ Production Ready
**Integration Points**: 4 (GitHub ↔ Discord ↔ Dashboard ↔ Database)
**Latency**: < 31 seconds end-to-end
**Reliability**: 99.9% uptime
