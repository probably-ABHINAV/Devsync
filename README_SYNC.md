# Activity Sync System - How It Works

## What Gets Synced

When you click "Sync Activities", OpsCord fetches:

### GitHub Events
- **Push Events** → "Commit" activity
- **Pull Request Opened** → "PR Opened" activity
- **Pull Request Merged** → "PR Merged" activity  
- **Pull Request Review** → "Code Review" activity
- **Issues Created** → "Issue Created" activity
- **Issues Closed** → "Issue Closed" activity

### Data Stored for Each Activity
```javascript
{
  user_id: "your-user-id",
  activity_type: "pr_opened", // or merged, review, etc.
  repo_name: "repository-name",
  title: "Pull Request Title",
  description: "PR description or commit message",
  pr_number: 42,              // if applicable
  issue_number: 15,           // if applicable
  metadata: {
    github_event_id: "...",
    github_event_type: "PushEvent",
    url: "https://github.com/..."
  },
  created_at: "2025-11-29T10:30:00Z"
}
```

## Sync Endpoints

### POST /api/sync-github-activities
Manually sync activities from GitHub to Supabase

**Request:**
```bash
curl -X POST http://localhost:5000/api/sync-github-activities \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "synced": 12,
  "message": "Synced 12 activities from GitHub"
}
```

### GET /api/analytics/activity
Fetch activities for current user (requires authentication)

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "id": "uuid",
      "activity_type": "pr_opened",
      "repo_name": "my-project",
      "title": "Add feature X",
      "description": "...",
      "pr_number": 45,
      "created_at": "2025-11-29T10:30:00Z"
    }
  ],
  "count": 1
}
```

## How to Use

1. **In Dashboard**: Click blue "Sync Activities" button in Activity tab
2. **Via API**: POST to `/api/sync-github-activities`
3. **Automatic**: (Future) Can set up scheduled syncs

## Troubleshooting

**"Not authenticated" error**
- Solution: Log in with GitHub first
- The app requires GitHub token to fetch activities

**"Synced 0 activities"**
- Check if you have recent GitHub activity
- Make sure Supabase schema is set up (run migrations)
- Check browser console for detailed errors

**Activities not showing on timeline**
- Supabase schema not set up - run migrations first
- User not created in database - log in with GitHub
- Check database connection in app logs

## Architecture

```
GitHub API
    ↓
sync-github-activities endpoint
    ↓
Map GitHub events to OpsCord format
    ↓
Store in Supabase (activities table)
    ↓
Activity Timeline queries Supabase
    ↓
Display with animations in Dashboard
```
