# GitHub Sign-In Setup Guide

## Complete GitHub OAuth Configuration for OpsCord

### Prerequisites
- ✅ GitHub account
- ✅ GitHub OAuth App created
- ✅ Vercel or Replit deployment URL

---

## Step-by-Step Setup

### 1️⃣ Create or Update GitHub OAuth App

#### If Creating New OAuth App:
```
Go to: https://github.com/settings/developers
→ Personal access tokens
→ OAuth Apps
→ New OAuth App
```

Fill in:
```
Application name: OpsCord
Homepage URL: https://opscord.vercel.app
Authorization callback URL: https://opscord.vercel.app/api/auth/callback
Application description: Enterprise DevOps Collaboration Platform
```

Click **Create OAuth application**

#### If Updating Existing App:
Go to: https://github.com/settings/developers → Your OAuth Apps → Edit

Update these fields:

| Field | Value |
|-------|-------|
| Homepage URL | `https://opscord.vercel.app` |
| Authorization callback URL | `https://opscord.vercel.app/api/auth/callback` |

⚠️ **IMPORTANT**: Callback URL must be exact - no trailing slash, match the domain exactly

### 2️⃣ Collect OAuth Credentials

After creating/updating, you'll see:

```
Client ID: Iv23li7p84d3VWeK8p8N
Client Secret: 49f0875622de5e1fa846e0f7bda7d296b121ffb8
```

**SAVE THESE**

### 3️⃣ Set Environment Variables in Vercel

Go to: **Vercel Dashboard → Settings → Environment Variables**

Add these:

```
GITHUB_CLIENT_ID = Iv23li7p84d3VWeK8p8N
GITHUB_CLIENT_SECRET = 49f0875622de5e1fa846e0f7bda7d296b121ffb8
```

### 4️⃣ Generate Webhook Secret

```bash
# Generate random secret
openssl rand -hex 32
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# Or use this command
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Add to Vercel environment variables:
```
GITHUB_WEBHOOK_SECRET = a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 5️⃣ Verify Configuration

Test the OAuth flow:

```bash
# Navigate to your app
https://opscord.vercel.app

# Click "Get Started Free"
# Should redirect to GitHub login
# After login, should show dashboard
```

---

## How GitHub OAuth Works in OpsCord

```
┌──────────────────────────────────────────────────────────┐
│                   OAuth Flow Diagram                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1. User clicks "Get Started Free"                       │
│     ↓                                                     │
│  2. Redirects to GitHub login                            │
│     ↓                                                     │
│  3. User authorizes OpsCord                              │
│     ↓                                                     │
│  4. GitHub redirects to:                                 │
│     /api/auth/callback?code=abc123                       │
│     ↓                                                     │
│  5. App exchanges code for access token                  │
│     ↓                                                     │
│  6. App fetches user data from GitHub API                │
│     ↓                                                     │
│  7. App creates/updates user in database                 │
│     ↓                                                     │
│  8. Sets secure session cookie                           │
│     ↓                                                     │
│  9. Redirects to dashboard ✅                            │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Code Implementation

### Route Handler (Backend)

```typescript
// app/api/auth/github/route.ts
import { getGitHubAuthUrl } from "@/lib/github"

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`

  if (!clientId) {
    return Response.json({ error: "GitHub Client ID not configured" }, { status: 500 })
  }

  const authUrl = await getGitHubAuthUrl(clientId, redirectUri)
  return Response.redirect(authUrl)
}
```

### Callback Handler

```typescript
// app/api/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  
  // Exchange code for token
  const token = await exchangeCodeForToken(code, clientId, clientSecret)
  
  // Fetch user data
  const userData = await getUserData(token)
  
  // Save to database with upsert
  const { error } = await supabase.from('users').upsert({
    github_id: userData.id.toString(),
    username: userData.login,
    avatar_url: userData.avatar_url,
    name: userData.name,
    email: userData.email,
    github_token: token,
  }, {
    onConflict: 'github_id'  // Key for upsert
  })
  
  // Set session cookie
  cookieStore.set("github_token", token, { httpOnly: true })
  
  // Redirect to dashboard
  return Response.redirect('/')
}
```

### Frontend Login Button

```typescript
// components/landing-page.tsx
<button 
  onClick={() => window.open("/api/auth/github", "_blank")}
  className="btn-primary"
>
  Get Started Free
</button>
```

---

## Session Management

### Session Storage
```typescript
// Browser: Secure HTTP-only cookie
{
  name: "github_token",
  value: "ghu_xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  httpOnly: true,      // Cannot be accessed by JavaScript
  secure: true,        // HTTPS only
  sameSite: "lax",     // CSRF protection
  maxAge: 2592000      // 30 days
}
```

### Session Validation
```typescript
// app/api/auth/check/route.ts
export async function GET() {
  const token = cookies().get("github_token")?.value
  
  if (!token) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }
  
  // Verify token is still valid with GitHub
  const user = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` }
  })
  
  return Response.json({ user: await user.json() })
}
```

### Logout
```typescript
// app/api/auth/logout/route.ts
export async function POST() {
  const response = new Response(JSON.stringify({ success: true }))
  response.headers.set('Set-Cookie', 'github_token=; Max-Age=0; Path=/')
  return response
}
```

---

## Permissions Requested

When user authorizes, OpsCord requests these GitHub permissions:

```
✅ repo        - Read private repositories, commit statuses
✅ user        - Read user profile information
✅ read:org    - Read organization data (optional)
✅ gist        - Manage code snippets (optional)
```

### What We Store
```
- User ID (github_id)
- Username (login)
- Full name
- Email (if public)
- Avatar URL
- Access token (encrypted)
- Creation/update timestamps
```

### What We DON'T Store
```
❌ Password (OAuth doesn't expose)
❌ Two-factor secrets
❌ API keys
❌ Private emails
❌ Account settings
```

---

## Troubleshooting

### ❌ "Invalid callback URL"
**Problem**: Authorization callback URL in GitHub doesn't match your app
**Solution**: 
1. Check GitHub OAuth App settings
2. Verify URL exactly matches: `https://opscord.vercel.app/api/auth/callback`
3. No trailing slash!

### ❌ "Client not found"
**Problem**: `GITHUB_CLIENT_ID` not set in environment
**Solution**:
1. Get Client ID from GitHub OAuth App
2. Add to Vercel: Settings → Environment Variables
3. Redeploy

### ❌ "Invalid client secret"
**Problem**: Secret in environment doesn't match GitHub
**Solution**:
1. Regenerate secret in GitHub OAuth App
2. Copy new secret
3. Update in Vercel environment
4. Redeploy

### ❌ "Authorization request has been denied"
**Problem**: User denied permission or session expired
**Solution**:
1. User clicked "Cancel" - try again
2. Session expired - log out and log back in
3. User revoked access - re-authorize in GitHub Settings

### ❌ User can login but no repos show
**Problem**: Token doesn't have repo access
**Solution**:
1. Check GitHub OAuth App scope includes "repo"
2. Have user re-authorize
3. Check user has repository access

---

## Testing

### Test OAuth Locally (Replit)
```bash
# Start dev server
npm run dev

# Visit app
http://localhost:5000

# Click "Get Started Free"
# Should redirect to GitHub
# After approval, show dashboard
```

### Test OAuth on Vercel
```bash
# Visit deployment
https://opscord.vercel.app

# Click "Get Started Free"
# Should redirect to GitHub
# After approval, show dashboard
```

### Test Session Persistence
```bash
# Log in
1. Click "Get Started Free"
2. Approve on GitHub
3. See dashboard

# Refresh page
4. Should still see dashboard (cookie persists)

# Close browser tab, reopen app
5. Should still be logged in (30-day expiry)
```

### Verify User Data
```sql
-- Check database
SELECT id, username, github_id, email, created_at 
FROM users 
WHERE username = 'YOUR_USERNAME';

-- Expected output:
-- id: uuid
-- username: your_github_username
-- github_id: numeric_id
-- email: your@email.com
-- created_at: timestamp
```

---

## Security Best Practices

✅ **DO**:
- Use HTTPS in production
- Keep client secret safe (never share)
- Store token in HTTP-only cookie
- Validate token with GitHub periodically
- Use CSRF tokens for state parameter
- Rotate secrets quarterly
- Enable branch protection on repo

❌ **DON'T**:
- Expose client secret in frontend code
- Send token in URL or GET parameters
- Store plaintext tokens in localStorage
- Skip HTTPS in production
- Log or display full tokens
- Reuse secret across environments

---

## Advanced Configuration

### Multiple Environments

**Replit (Development)**:
```
GITHUB_CLIENT_ID = [test_client_id]
NEXT_PUBLIC_APP_URL = https://[your-replit-url]
```

**Vercel (Production)**:
```
GITHUB_CLIENT_ID = [prod_client_id]
NEXT_PUBLIC_APP_URL = https://opscord.vercel.app
```

### GitHub App vs OAuth App

| Feature | GitHub App | OAuth App |
|---------|-----------|-----------|
| **Setup** | Complex | Simple ✅ |
| **Permissions** | Fine-grained | Coarse ✅ |
| **Installation** | Per org | Global ✅ |
| **Best for** | Enterprise | SaaS ✅ |

We use **OAuth App** for simplicity.

---

## Next Steps

1. ✅ Complete GitHub OAuth setup above
2. ✅ Set environment variables in Vercel
3. ✅ Test login flow
4. ✅ Invite team members
5. ✅ Set up webhooks for alerts

---

**Status**: ✅ GitHub OAuth Ready
**Last Updated**: 2024-11-27
