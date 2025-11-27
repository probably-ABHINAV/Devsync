# Discord Slash Commands Registration Guide

## 📋 Available Commands (9 Total - v1.0)

1. **`/ping`** - Check bot status
2. **`/summary [pr] [repo]`** - Get AI-powered PR summary
3. **`/stats [user]`** - View user stats and leaderboard
4. **`/create-issue [description] [repo]`** - Create GitHub issues from Discord
5. **`/assign [issue] [member] [repo]`** - Auto-assign issues to team members
6. **`/repo-status [repo] [limit]`** - Show CI/CD status and recent activity
7. **`/setup-notifications [action] [event_type] [repo]`** - Configure notification channels
8. **`/ai-review [pr] [repo] [focus]`** - Get AI code review suggestions
9. **`/team-stats [period] [repo] [metric]`** - Show team statistics and leaderboard

---

## 🚀 Method 1: Register via Website (Easiest)

### Step 1: Visit the Registration Endpoint
Open this URL in your browser:
```
https://opscord.vercel.app/api/discord/register-commands
```

### Step 2: Wait for Response
You should see JSON response:
```json
{
  "success": true,
  "message": "Discord commands registered successfully",
  "commands": [
    { "id": "...", "name": "ping", "description": "Check if the bot is online" },
    { "id": "...", "name": "summary", "description": "Get AI-powered summary of a pull request" },
    ...
  ]
}
```

### Step 3: Verify in Discord
- Go to your Discord server
- Type: `/` (forward slash)
- You should see all 9 commands listed
- Try: `/ping` → Should respond with "Pong!"

---

## 🔧 Method 2: Register via cURL

### Option A: Simple GET Request
```bash
curl https://opscord.vercel.app/api/discord/register-commands
```

### Option B: POST Request with Auth (if needed)
```bash
curl -X POST https://opscord.vercel.app/api/discord/register-commands \
  -H "Content-Type: application/json"
```

### Option C: With error handling
```bash
curl -s https://opscord.vercel.app/api/discord/register-commands | json_pp
```

---

## 🐍 Method 3: Register via Python

```python
import requests
import json

url = "https://opscord.vercel.app/api/discord/register-commands"

try:
    response = requests.post(url)
    data = response.json()
    
    if data.get('success'):
        print("✅ Commands registered successfully!")
        print(f"Total commands: {len(data.get('commands', []))}")
        for cmd in data.get('commands', []):
            print(f"  - {cmd['name']}: {cmd['description']}")
    else:
        print("❌ Registration failed:", data)
        
except Exception as e:
    print(f"❌ Error: {e}")
```

---

## 🟦 Method 4: Register via Discord API (Manual)

If you want to register commands directly without using our endpoint:

### Prerequisites:
- Discord Bot Token
- Discord Application ID
- All command definitions

### Implementation:
```bash
#!/bin/bash

APP_ID="1438479622697254963"
BOT_TOKEN="YOUR_DISCORD_TOKEN"
GUILD_ID="YOUR_SERVER_ID"  # Optional - for guild-specific commands

# Register global commands
curl -X PUT https://discord.com/api/v10/applications/${APP_ID}/commands \
  -H "Authorization: Bot ${BOT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @commands.json

# OR register guild-specific commands (faster for testing)
curl -X PUT https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands \
  -H "Authorization: Bot ${BOT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @commands.json
```

---

## ✅ Verification Checklist

After registration, verify each command:

```bash
# 1. Test /ping
# Expected: "🏓 Pong! OpsCord bot is online"

# 2. Test /stats
# Expected: Shows leaderboard or user stats

# 3. Test /summary
# Expected: Shows PR summary (if available in cache)

# 4. Test /create-issue
# Expected: Creates issue with AI-generated details

# 5. Test /team-stats
# Expected: Shows team statistics

# 6. Test /repo-status
# Expected: Shows CI/CD status

# 7. Test /ai-review
# Expected: Shows AI code review

# 8. Test /assign
# Expected: Assigns issue to team member

# 9. Test /setup-notifications
# Expected: Lists or configures notification settings
```

---

## 🐛 Troubleshooting

### Problem: "Commands not showing up in Discord"

**Solution 1**: Force refresh Discord
```
1. Disconnect from Discord
2. Wait 5 minutes
3. Reconnect
4. Type "/" again
```

**Solution 2**: Re-register commands
```
curl https://opscord.vercel.app/api/discord/register-commands
```

**Solution 3**: Verify bot has required scopes
1. Go to Discord Developer Portal
2. OAuth2 → URL Generator
3. Scopes: `bot` + `applications.commands`
4. Permissions: `Send Messages`, `Use Slash Commands`
5. Use generated URL to re-invite bot

### Problem: "Commands registered but don't work"

**Check bot permissions in server:**
1. Right-click bot in member list
2. Check permissions include:
   - ✅ Use Slash Commands
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History

**Check token is valid:**
```bash
curl https://discord.com/api/v10/users/@me \
  -H "Authorization: Bot YOUR_TOKEN"
```

Should return bot info (not an error).

### Problem: "Error: Invalid token"

**Solution:**
1. Go to Discord Developer Portal
2. Select your application
3. Go to "Bot" section
4. Click "Reset Token"
5. Copy the new token
6. Update in Vercel: Settings → Environment Variables
7. Redeploy or restart the app
8. Re-register commands

---

## 📊 Command Details

### `/ping`
```
No parameters
Response: Bot status and response time
```

### `/summary`
```
Parameters:
  - pr (required): PR number (e.g., 123 or #123)
  - repo (optional): Repository name
Response: AI summary with complexity, risks, recommendations
```

### `/stats`
```
Parameters:
  - user (optional): GitHub username
Response: User stats or team leaderboard
```

### `/create-issue`
```
Parameters:
  - description (required): Issue description
  - repo (optional): Repository name
Response: Created issue with AI-generated title and body
```

### `/assign`
```
Parameters:
  - issue (required): Issue number
  - member (required): GitHub username
  - repo (optional): Repository name
Response: Confirmation of assignment
```

### `/repo-status`
```
Parameters:
  - repo (optional): Repository name
  - limit (optional): Number of CI runs to show (default: 5)
Response: CI/CD status and recent activity
```

### `/setup-notifications`
```
Parameters:
  - action (required): enable, disable, or list
  - event_type (optional): pull_request, issues, ci_runs, releases, all
  - repo (optional): Repository name
Response: Confirmation or list of settings
```

### `/ai-review`
```
Parameters:
  - pr (required): PR number
  - repo (optional): Repository name
  - focus (optional): security, performance, quality, all
Response: AI-powered code review suggestions
```

### `/team-stats`
```
Parameters:
  - period (optional): daily, weekly, monthly
  - repo (optional): Repository name
  - metric (optional): prs, reviews, issues, all
Response: Team statistics and leaderboard
```

---

## 🔄 Re-Registration (If Commands Change)

Commands are automatically updated when you:
1. Redeploy to Vercel
2. Call the registration endpoint again

To manually update:
```bash
# Delete old commands (optional)
curl -X DELETE https://discord.com/api/v10/applications/{APP_ID}/commands/{COMMAND_ID} \
  -H "Authorization: Bot {BOT_TOKEN}"

# Re-register all
curl https://opscord.vercel.app/api/discord/register-commands
```

---

## 📝 Command Registration Response Example

```json
{
  "success": true,
  "message": "Discord commands registered successfully",
  "commands": [
    {
      "id": "1234567890123456789",
      "name": "ping",
      "description": "Check if the bot is online",
      "type": 1,
      "guild_id": null
    },
    {
      "id": "1234567890123456790",
      "name": "summary",
      "description": "Get AI-powered summary of a pull request",
      "type": 1,
      "options": [
        {
          "name": "pr",
          "description": "PR number (e.g., #123)",
          "type": 3,
          "required": true
        },
        {
          "name": "repo",
          "description": "Repository name (optional, uses default if not specified)",
          "type": 3,
          "required": false
        }
      ]
    },
    ... (7 more commands)
  ]
}
```

---

## 🎯 Quick Start Summary

**Fastest way to get all commands:**

1. Visit: https://opscord.vercel.app/api/discord/register-commands
2. Wait for success message
3. Go to Discord, type `/`
4. See all 9 commands
5. Start using them!

**Verification:**
```bash
curl https://opscord.vercel.app/api/discord/register-commands | grep -o '"name":"[^"]*"'
```

Should show all 9 command names.

---

**Status**: ✅ Commands Ready
**Version**: v1.0 (9 commands)
**Last Updated**: 2024-11-27
