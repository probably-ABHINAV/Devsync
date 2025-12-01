# OpsCord - Enterprise AI-Driven DevOps Collaboration Platform

**An intelligent DevOps assistant that automates engineering workflows, powers team collaboration, and gamifies productivity.**

---

## 🚀 What is OpsCord?

OpsCord is an **enterprise-grade platform** that seamlessly integrates:
- **GitHub**: PR analysis, issue tracking, repository management
- **Discord**: Real-time notifications, team commands, collaboration
- **AI (Gemini)**: Intelligent PR summaries, issue classification, failure analysis
- **Analytics**: Team leaderboards, contribution tracking, performance insights
- **Gamification**: XP rewards, badges, achievement tracking

Perfect for **engineering teams** who want to:
✅ Automate repetitive development tasks  
✅ Get AI-powered code insights instantly  
✅ Streamline team communication  
✅ Track and celebrate team achievements  
✅ Improve code quality and review cycles  

---

## 🎯 Current Features (v1.0)

### ✨ Live & Ready
- **AI PR Summaries**: Automatically analyze PRs with complexity assessment, risks, and recommendations
- **Discord Bot**: 4 slash commands for instant stats, summaries, and issue creation
- **Gamification**: XP rewards, 7 achievement badges, real-time leaderboards
- **Team Analytics**: Contribution tracking, user stats, activity feeds
- **Beautiful Dashboard**: 4-tab interface (Overview, Activity, Analytics, Settings)
- **GitHub Integration**: OAuth login, webhook support, repository management
- **Real-Time Sync**: One-click sync of GitHub activities with XP rewards
- **Activity Timeline**: Beautiful animated feed of real GitHub activities
- **Health Monitoring**: System status checks and monitoring

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4.x, Framer Motion |
| Backend | Node.js, Next.js API routes |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini 1.5 |
| Auth | GitHub OAuth 2.0 |
| Integrations | Discord API, GitHub API |
| Deployment | Vercel |

---

## 📦 Quick Start (15 minutes)

### Prerequisites
- Node.js 18+
- GitHub account (for OAuth)
- Supabase account (free tier works)
- Discord account (optional, for notifications)
- Google API key (optional, for AI)

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/probably-ABHINAV/opscord.git
cd opscord

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Start development server
npm run dev
```

**Visit**: http://localhost:5000

### Environment Variables Required

Create a `.env.local` file with:

```env
# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# GitHub OAuth
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
GITHUB_WEBHOOK_SECRET=your_secret
GITHUB_TOKEN=your_token
GITHUB_PRIVATE_KEY=your_key (if using GitHub App)

# Google Gemini (for AI)
GEMINI_API_KEY=your_key

# Discord (optional)
DISCORD_CLIENT_ID=your_id
DISCORD_CLIENT_SECRET=your_secret
DISCORD_TOKEN=your_token
DISCORD_PUBLIC_KEY=your_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:5000
```

---

## 🔧 Complete Setup Guide

### Step 1: Create Supabase Project (5 min)

1. Go to https://supabase.com → Sign up
2. Create new project
   - Name: opscord
   - Database password: [strong random]
   - Region: [closest to you]
3. Wait 2-3 minutes
4. Settings > API → Copy:
   - Project URL
   - Anon Key
   - Service Role Key

### Step 2: Setup Database (5 min)

1. In Supabase, go to SQL Editor
2. Create new query
3. Paste entire `migrations/supabase-schema.sql` file
4. Click Run
5. Done! ✓

This creates all required tables:
- `users` - Stores GitHub authenticated users
- `activities` - Stores user activities (PRs, issues, commits)
- `discord_configs` - Stores Discord webhook URLs
- `user_stats` - Stores XP and gamification data
- `badges` - Achievement badges
- `user_badges` - User's earned badges
- `webhooks` - GitHub webhook event logs

### Step 3: Create GitHub OAuth App (5 min)

1. Go to https://github.com/settings/developers
2. OAuth Apps > New OAuth App
   - Name: OpsCord
   - Homepage: https://yourdomain.com
   - Callback: https://yourdomain.com/api/auth/callback
3. Copy Client ID and Secret
4. Generate webhook secret:
   ```bash
   openssl rand -hex 32
   ```

### Step 4: Setup Discord Bot (Optional - 5 min)

1. Visit: https://discord.com/developers/applications
2. Click "New Application" → Name it "OpsCord"
3. Go to "Bot" section → Click "Add Bot"
4. Copy the bot token
5. Go to "General Information" → Copy:
   - Public Key
   - Application ID
6. Go to "OAuth2" → "URL Generator"
   - Select Scopes: `bot`, `applications.commands`
   - Select Permissions: Send Messages, Manage Messages, Use Slash Commands, Embed Links
   - Copy generated URL and authorize bot to your server

### Step 5: Add GitHub Webhook (5 min)

1. Go to your GitHub repository
2. Settings > Webhooks > Add webhook
3. Fill in the webhook configuration:
   - **Payload URL**: `https://yourdomain.com/api/github/webhook` (or your production URL)
   - **Content type**: `application/json`
   - **Events**: Select "Let me select individual events" and enable:
     - ✅ Push
     - ✅ Pull requests
     - ✅ Issues
     - ✅ Releases
     - ✅ Pull request review comments
4. **Paste your webhook secret** in the "Secret" field:
   ```bash
   # Use the same secret from Step 3
   GITHUB_WEBHOOK_SECRET=your_secret_from_step_3
   ```
5. Click "Add webhook"
6. You should see a green checkmark confirming the webhook was added

**Test the Webhook:**
```bash
# Make a commit and push to your repo
git commit -m "Test webhook"
git push origin main

# Check Supabase to verify the webhook was received:
# Dashboard → SQL Editor → SELECT * FROM webhooks ORDER BY created_at DESC LIMIT 1;
```

### Step 6: Add Google Gemini API Key (Optional - 2 min)

1. Go to https://ai.google.dev/
2. Click "Get API key"
3. Copy the API key to your environment variables

### Step 7: Configure Discord Integration

1. Go to your Discord server
2. Right-click on a channel where you want notifications
3. Click **Edit Channel**
4. Go to **Integrations** → **Webhooks**
5. Click **New Webhook**
6. Name it "OpsCord" (or whatever you prefer)
7. Click **Copy Webhook URL**
8. Go to your OpsCord Dashboard
9. Look for **Discord Configuration** section
10. Paste your Discord Webhook URL
11. Select which events you want notifications for
12. Click **Save**

You should see a test message in your Discord channel confirming the connection works.

---

## 🚀 Deployment Options

### Option A: Vercel (Recommended - 5 min)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com
# 3. Import your GitHub repo
# 4. Add environment variables (see Step 2 below)
# 5. Deploy!

# 6. Update GitHub Webhook URL
# Settings > Webhooks > Edit
# Payload URL: https://yourvercelapp.com/api/github/webhook
```

**Environment Variables in Vercel:**
Add all variables from the `.env.local` file in your Vercel project settings.

**Cost**: Free (or $20/month Pro)

### Option B: AWS (More Control - 15 min)

1. Create EC2 instance (Ubuntu 22.04)
2. Install Node.js and npm
3. Clone repository
4. Create `.env.local` with all variables
5. Run `npm install --legacy-peer-deps`
6. Setup PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start npm --name "opscord" -- run start
   pm2 startup
   pm2 save
   ```
7. Use nginx as reverse proxy
8. Setup SSL with Let's Encrypt

### Option C: Docker (Self-hosted - 15 min)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]
```

Deploy with:
```bash
docker build -t opscord .
docker run -p 5000:5000 --env-file .env.local opscord
```

---

## 🎯 Core Features Explained

### 1. Real-Time GitHub Activity Sync
- **Sync Button**: One-click sync of GitHub activities
- **Auto-Mapping**: GitHub events → OpsCord activities
  - PRs (opened, merged, reviewed)
  - Issues (created, closed)
  - Commits & pushes
  - Code reviews
- **Real-Time Storage**: All data stored in Supabase
- **Status Feedback**: See sync progress and results

### 2. Activity Timeline
- **Animated Feed**: Beautiful Framer Motion animations
- **Real Data**: Shows actual GitHub activities
- **Live Updates**: Refreshes after sync
- **Event Details**: PR numbers, issue links, descriptions
- **Timestamps**: Relative and absolute time display

### 3. Team Leaderboard
- **XP Ranking**: Team members ranked by contributions
- **Real Data**: Synced from GitHub and Supabase
- **Contribution Metrics**: PRs, issues, commits, reviews
- **Live Rankings**: Updates as activities sync

### 4. AI PR Analysis (Powered by Google Gemini)
- **Automatic Summarization**: AI analysis of pull requests
- **Complexity Assessment**: Low/Medium/High complexity scoring
- **Risk Detection**: Identifies potential issues
- **Recommendations**: Actionable improvement suggestions
- **Cached Results**: AI summaries are stored for future reference

### 5. Discord Integration
- **Webhook Setup**: Configure Discord webhook URL
- **Event Notifications**: Real-time Discord alerts for GitHub events
- **Embed Messages**: Rich, formatted notifications
- **Team Notifications**: Keep team updated on GitHub activity

### 6. Gamification System
Earn XP for:
- Opening PRs (+10 XP)
- Merging PRs (+25 XP)
- Reviewing code (+5 XP)
- Fixing bugs/Creating issues (+5-10 XP)
- Closing issues (+10 XP)

Badges:
- 🌱 First Steps - Open your first PR
- 🚀 Getting Started - Open 5 PRs
- ⭐ Contributor - Earn 100 XP
- 💎 Active Developer - Earn 500 XP
- 👑 Code Master - Earn 1000 XP
- 🤝 Team Player - Review 10 PRs
- 🎯 Issue Hunter - Close 20 issues

### 7. Team Analytics Dashboard
Real-time dashboards show:
- Top contributors by XP
- PR statistics
- Review metrics
- Activity timelines
- Team progress
- Streak tracking
- Personalized recommendations

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid API Key" | Check you copied key completely (no spaces) |
| "Database connection failed" | Verify Supabase project isn't paused |
| "GitHub login doesn't work" | Check callback URL matches exactly (case-sensitive) |
| "Webhook not received" | Verify URL is accessible, webhook secret matches |
| "AI summaries don't work" | Add GEMINI_API_KEY to environment variables |
| "Discord bot offline" | Check bot token and public key in env vars |
| "Port 5000 already in use" | `lsof -i :5000` then `kill -9 <PID>` |
| "Not authenticated error on sync" | Log in with GitHub first, the app requires GitHub token |
| "Synced 0 activities" | Check if you have recent GitHub activity, run database migrations |
| "Activities not showing on timeline" | Verify Supabase schema is set up (run migrations first) |
| "403 Forbidden on Dashboard" | Make sure you've logged in with GitHub first |
| "Database error or 500 errors" | Verify you ran the full migration SQL from `supabase-schema.sql` |

---

## 📊 Project Structure

```
opscord/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # GitHub OAuth
│   │   ├── discord/      # Discord integration
│   │   ├── github/       # GitHub webhooks
│   │   └── analytics/    # Analytics endpoints
│   ├── dashboard/        # Dashboard page
│   ├── admin/            # Admin panel
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # UI components
│   ├── dashboard.tsx     # Dashboard component
│   ├── leaderboard.tsx   # Leaderboard
│   └── landing-page.tsx  # Landing page
├── lib/
│   ├── ai.ts             # AI services (Gemini)
│   ├── discord.ts        # Discord utilities
│   ├── github.ts         # GitHub utilities
│   ├── supabase.ts       # Database client
│   ├── gamification.ts   # XP/Badge logic
│   └── ai-services/      # Advanced AI services
├── migrations/           # Database schema
├── public/               # Static assets
├── next.config.mjs       # Next.js configuration
├── package.json          # Dependencies
├── vercel.json           # Vercel deployment config
└── README.md             # This file
```

---

## 📅 Roadmap (Future Releases)

### 🔜 Phase 2 (v1.1 - December 2025)
- Performance optimization
- Database improvements
- Error handling enhancements
- Security audit

### 🔜 Phase 3 (v2.0 - Q1 2026)
- Issue auto-classification
- Release notes generator
- CI failure analysis
- Admin dashboard
- Extended analytics
- Enhanced Discord commands

### 🚀 Phase 4 (v3.0 - Q2-Q3 2026)
- Automated code review
- Failure prediction models
- Conversational DevOps bot
- GitLab & Slack support

### 🌟 Phase 5 (v4.0 - Q4 2026)
- Multi-tenant SaaS
- Subscription plans
- Kubernetes integration
- Plugin marketplace

---

## 🔐 Security

✅ **Enterprise-Grade Security**
- GitHub OAuth 2.0 for authentication
- Webhook signature verification (HMAC SHA256)
- Service role key for admin operations
- Row-level security (RLS) in database
- HTTPS in production
- Rate limiting on APIs
- Secure token storage in HTTP-only cookies
- Environment variables for all secrets
- No hardcoded credentials

---

## 🎓 Academic & Professional Value

### Resume Bullet
> "Built OpsCord, an enterprise AI-driven DevOps platform integrating GitHub, Discord, and Google Gemini with real-time analytics, automated PR analysis, and gamified team engagement using Next.js 16, React 19, Supabase, and TypeScript."

### Interview Highlights
- Full-stack development (Next.js, React, PostgreSQL)
- AI/ML integration (Gemini API)
- Real-time systems (webhooks, events)
- Database design (schema, RLS, optimization)
- API integration (GitHub, Discord, Google)
- Product development (roadmap, deployment)
- Team collaboration features
- Scalable architecture

---

## 💼 Business Value

### Target Users
- Engineering teams (10-500+ developers)
- DevOps teams
- Development agencies
- Open-source projects

### Problem Solved
- **Repetitive Tasks**: Automated PR analysis, issue classification
- **Communication**: Centralized Discord notifications
- **Team Engagement**: Gamification keeps teams motivated
- **Quality**: AI-powered code insights improve PR quality
- **Insights**: Analytics reveal team patterns and improvements

### Pricing Strategy (Future)
- **Free**: 1 repo, basic features
- **Pro**: $29/month, 5 repos, all features
- **Enterprise**: Custom pricing, unlimited repos, SLA

---

## 🤝 Contributing

This is an open-source project. Contributions are welcome:
1. Fork the repo
2. Create a feature branch
3. Submit a pull request

---

## 📞 Support & Contact

- **Issues**: Report bugs on GitHub
- **Discussions**: Feature requests and ideas
- **Email**: Connect for partnership/investment inquiries

---

## 📄 License

MIT License - Free for personal and commercial use

---

## 🌟 Special Thanks

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Google Gemini](https://ai.google.dev/)
- [Discord.js](https://discord.js.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com/)

---

## 🎯 Mission

**Empower engineering teams to collaborate smarter, code better, and ship faster.**

OpsCord is building the future of DevOps automation where AI, humans, and tools work together seamlessly.

---

**Built with ❤️ for engineering teams everywhere**

*Start using OpsCord today. Deploy to production in minutes. Scale to enterprise in weeks.*
