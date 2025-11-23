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

---

## 📅 Roadmap (Future Releases)

### 🔜 Phase 2 (v2.0 - Q1 2026)
- **Advanced AI Engine**: Issue classification, release notes generation, CI failure analysis
- **Background Jobs**: Upstash Redis + BullMQ for async processing
- **Admin Dashboard**: System health, webhook logs, repository monitoring
- **Extended Analytics**: PR metrics, team trends, performance reports
- **Enhanced Discord**: More commands, better integration

### 🚀 Phase 3 (v3.0 - Q2 2026)
- **Automated Code Review**: AI-powered PR approval/denial
- **Predictive Analytics**: ML-based failure prediction
- **Conversational Agent**: ChatGPT-based DevOps assistant
- **Extended Integrations**: GitLab, Bitbucket, Slack support

### 🌟 Phase 4 (v4.0 - Q4 2026)
- **SaaS Infrastructure**: Multi-tenant, subscription plans
- **Multi-Cloud**: AWS, GCP, Azure support
- **Kubernetes Integration**: Deployment automation
- **Plugin Marketplace**: Community extensions

See `PRODUCT_ROADMAP.md` for detailed breakdown.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS 4.x, Framer Motion |
| Backend | Node.js, Next.js API routes |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini 1.5 |
| Auth | GitHub OAuth 2.0 |
| Integrations | Discord API, GitHub API |

---

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- GitHub account (for OAuth)
- Supabase account (free tier works)
- Discord account (optional, for notifications)
- Google API key (optional, for AI)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/opscord.git
cd opscord

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Set up Supabase
# - Create project at supabase.com
# - Run supabase-schema.sql in SQL editor
# - Copy API keys to .env.local

# 4. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 5. Start development server
npm run dev
```

**Visit**: http://localhost:5000

### Environment Variables Required

```env
# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# GitHub OAuth
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
GITHUB_WEBHOOK_SECRET=your_secret

# Google Gemini (for AI)
GEMINI_API_KEY=your_key

# Discord (optional)
DISCORD_CLIENT_ID=your_id
DISCORD_TOKEN=your_token
DISCORD_PUBLIC_KEY=your_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:5000
```

---

## 🎯 Core Features Explained

### 1. AI PR Summarization
Powered by Google Gemini, automatically:
- Summarize code changes
- Assess complexity (Low/Medium/High)
- Identify risks
- Suggest reviewers
- Recommend test coverage

### 2. Discord Integration
Team commands:
- `/ping` - Check bot status
- `/summary <pr>` - Get AI PR summary
- `/stats` - Personal contribution stats
- `/create-issue` - Create GitHub issues from Discord

### 3. Gamification System
Earn XP for:
- Opening PRs (+10 XP)
- Merging PRs (+20 XP)
- Reviewing code (+15 XP)
- Fixing bugs (+25 XP)
- Closing issues (+8 XP)
- Daily streaks (+10 bonus)

Badges:
- 🎯 First PR
- ⚔️ Code Warrior
- 🤝 Team Player
- 🐛 Bug Hunter
- 📊 Analytics Master
- 🔥 Streak Master
- ⭐ Super Contributor

### 4. Team Analytics
Real-time dashboards show:
- Top contributors by XP
- PR statistics
- Review metrics
- Activity timelines
- Team progress

---

## 📚 Documentation

- **[replit.md](./replit.md)** - Complete setup guide
- **[PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)** - Detailed feature roadmap
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[supabase-schema.sql](./supabase-schema.sql)** - Database schema

---

## 🔐 Security

✅ **Enterprise-Grade Security**
- GitHub OAuth 2.0 for authentication
- Webhook signature verification
- Service role key for admin operations
- Row-level security (RLS) ready
- HTTPS in production
- Rate limiting on APIs
- Secure token storage

---

## 🚀 Deployment

### Recommended: Vercel + Supabase
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
# - Import repo at vercel.com
# - Add environment variables
# - Deploy!

# 3. Set GitHub Webhook
# - Settings > Webhooks > Add webhook
# - Payload URL: https://yourvercelapp.com/api/github/webhook
# - Content type: application/json
# - Events: All
```

See `DEPLOYMENT.md` for AWS, Docker, and other options.

---

## 🎓 Academic & Professional Value

### Resume Bullet
> "Built OpsCord, an enterprise AI-driven DevOps platform integrating GitHub, Discord, and Google Gemini with real-time analytics, automated PR analysis, and gamified team engagement using Next.js 15, React 19, Supabase, and TypeScript."

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

This is a personal project, but contributions are welcome:
1. Fork the repo
2. Create a feature branch
3. Submit a pull request

---

## 📞 Support

- **Issues**: Report bugs on GitHub
- **Discussions**: Feature requests and ideas
- **Email**: Connect with me for partnership/investment inquiries

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

---

## 🎯 Mission

**Empower engineering teams to collaborate smarter, code better, and ship faster.**

OpsCord is building the future of DevOps automation where AI, humans, and tools work together seamlessly.

---

**Built with ❤️ for engineering teams everywhere**

*Start using OpsCord today. Deploy to production in minutes. Scale to enterprise in weeks.*
