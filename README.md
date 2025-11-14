
# OpsCord 🤖✨

**AI-Powered DevOps Collaboration Platform**

OpsCord is an intelligent DevOps automation platform that brings AI-powered pull request summarization, real-time Discord notifications, and beautiful analytics to your development workflow.

---

## ✨ Core Features

### 1. 🤖 AI PR Summarizer
- **Google Gemini Integration** - Intelligent analysis of pull requests
- **Automatic Summaries** - Generated on PR open/update
- **Code Insights** - Key changes, risks, and recommendations
- **Multi-language Support** - Works with any programming language

### 2. 💬 Discord Integration
- **Webhook-Based** - Serverless-friendly, no gateway connection required
- **Rich Embeds** - Beautiful PR notifications with summaries
- **Slash Commands**:
  - `/summary #PR` - Get AI summary of any PR
  - `/stats @user` - View contribution statistics
  - `/create-issue` - Create GitHub issues from Discord
  - `/ping` - Check bot status

### 3. 📊 Interactive Dashboard
- **PR Timeline** - Real-time activity feed
- **Team Analytics** - Contribution stats and leaderboards
- **Gamification** - XP system with badges and rankings
- **Beautiful UI** - Glassmorphism design with dark/light modes

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account
- Google Gemini API key
- GitHub OAuth app
- Discord bot application

### Installation

1. **Clone and Install**
```bash
pnpm install
```

2. **Configure Environment Variables**
Create `.env.local` with:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Discord
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_TOKEN=your_discord_bot_token
DISCORD_PUBLIC_KEY=your_discord_public_key

# GitHub
GITHUB_OAUTH_ID=your_github_oauth_id
GITHUB_OAUTH_SECRET=your_github_oauth_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:5000
NEXTAUTH_SECRET=your_random_secret
```

3. **Setup Database**
```bash
# Run Prisma migrations
npx prisma db push
```

4. **Register Discord Commands**
```bash
curl -X POST http://localhost:5000/api/discord/register-commands
```

5. **Start Development Server**
```bash
pnpm run dev
```

Visit `http://localhost:5000` to see OpsCord in action!

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **AI**: Google Gemini 1.5 Flash
- **Auth**: NextAuth.js with GitHub/Discord OAuth
- **APIs**: GitHub REST API, Discord REST API

### Key Workflows

**PR Summarization Flow:**
1. GitHub webhook triggers on PR open/update
2. Webhook stored in database
3. Background job queues AI summarization
4. Gemini analyzes PR and generates summary
5. Summary sent to Discord channel
6. Dashboard updated in real-time

**Discord Command Flow:**
1. User runs slash command in Discord
2. Discord sends interaction to `/api/discord/interactions`
3. Signature verified and command processed
4. Response sent back to Discord

---

## 📁 Project Structure

```
opscord/
├── app/
│   ├── api/              # API routes
│   │   ├── discord/      # Discord interactions
│   │   ├── github/       # GitHub webhooks
│   │   └── gamification/ # User stats
│   ├── demo/             # Demo pages
│   └── dashboard/        # Main dashboard
├── components/
│   ├── dashboard/        # Dashboard components
│   └── ui/              # Reusable UI components
├── lib/
│   ├── ai.ts            # Google Gemini integration
│   ├── discord.ts       # Discord API helpers
│   └── github.ts        # GitHub API helpers
└── prisma/
    └── schema.prisma    # Database schema
```

---

## 🎨 UI Features

- **Glassmorphism Design** - Modern frosted glass effects
- **Smooth Animations** - Fade-in, slide-in transitions
- **Dark/Light Mode** - Full theme support
- **Responsive Layout** - Mobile-first design
- **Interactive Charts** - Real-time data visualization

---

## 🔐 Security

- ✅ Webhook signature verification (GitHub & Discord)
- ✅ OAuth 2.0 authentication
- ✅ JWT session management
- ✅ Environment variable protection
- ✅ API route protection with middleware

---

## 📝 Environment Setup

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed configuration instructions.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **Next.js** for the amazing framework
- **Supabase** for database and auth
- **Discord** for the bot platform
- **GitHub** for the API

---

**Built with ❤️ by the OpsCord team**
