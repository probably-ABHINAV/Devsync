# OpsCord Deployment Guide

## Production Deployment Options

OpsCord can be deployed on various platforms. This guide covers the recommended setup.

---

## 🚀 Recommended Architecture (Vercel + Supabase)

### Why This Stack?
- **Vercel**: Optimized for Next.js, automatic deployments, edge functions
- **Supabase**: Managed PostgreSQL, real-time capabilities, built-in auth
- **GitHub**: Seamless integration with Vercel
- **Discord/GitHub**: Native API support

### Cost Estimate
- **Vercel**: $20-100/month (Pro plan + serverless functions)
- **Supabase**: $25-200/month (Pro plan + database overages)
- **Total**: $45-300/month depending on usage

---

## 📋 Pre-Deployment Checklist

### Environment Variables
Ensure all required environment variables are set:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# GitHub
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
GITHUB_WEBHOOK_SECRET=your_secret

# AI (optional but recommended)
GEMINI_API_KEY=your_key

# Discord (optional)
DISCORD_CLIENT_ID=your_id
DISCORD_TOKEN=your_token
DISCORD_PUBLIC_KEY=your_key

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Database Setup
1. Create Supabase project
2. Run `supabase-schema.sql` in SQL editor
3. Verify all tables created successfully
4. Enable Row Level Security (RLS) on sensitive tables

### GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Create new OAuth App
3. Set Authorization callback URL to `https://yourdomain.com/api/auth/callback`
4. Copy Client ID and Secret

### Discord Bot (Optional)
1. Create bot on Discord Developer Portal
2. Add bot to test server
3. Copy token and public key

---

## 🔧 Deployment Steps

### Option 1: Vercel (Recommended)

#### Step 1: Connect to Vercel
```bash
1. Go to vercel.com
2. Click "New Project"
3. Import from Git (connect GitHub repo)
4. Configure project settings
```

#### Step 2: Set Environment Variables
In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add all required variables (see checklist above)
3. Apply to Production environment

#### Step 3: Configure Build Settings
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Install Command**: `npm install --legacy-peer-deps`

#### Step 4: Deploy
```bash
1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment logs
4. Test application
```

### Option 2: AWS (Lambda + RDS)

#### Step 1: Setup RDS Database
```bash
aws rds create-db-instance \
  --db-instance-identifier opscord-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --allocated-storage 20
```

#### Step 2: Setup Lambda Functions
```bash
1. Create Lambda execution role
2. Deploy Next.js with Serverless Framework
3. Configure API Gateway
4. Setup CloudFront distribution
```

#### Step 3: Configure Environment Variables
Use AWS Systems Manager Parameter Store for secure storage

### Option 3: Docker + Cloud Run / ECS

#### Create Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

#### Deploy to Cloud Run
```bash
gcloud run deploy opscord \
  --source . \
  --platform managed \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=..."
```

---

## 🔒 Security Configuration

### HTTPS & SSL
- **Vercel**: Automatic with every deployment
- **AWS**: Use ACM certificates
- **Self-hosted**: Use Let's Encrypt

### CORS Configuration
```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_APP_URL,
          },
        ],
      },
    ];
  },
};
```

### Rate Limiting
```typescript
// lib/rate-limit.ts
import Ratelimit from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function checkRateLimit(key: string) {
  const { success } = await ratelimit.limit(key);
  return success;
}
```

### API Keys & Secrets
- **Never commit secrets** - use environment variables
- **Rotate keys regularly** - quarterly minimum
- **Use strong keys** - 32+ character random strings
- **Monitor usage** - track API key usage patterns

### Database Security
- Enable Supabase RLS (Row Level Security)
- Use service role key server-side only
- Anon key has restricted permissions
- Audit all database changes

---

## 📊 Monitoring & Logging

### Vercel Analytics
```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking with Sentry
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Database Monitoring
- Supabase Dashboard for queries
- Monitor connection count
- Check query performance
- Set up slow query alerts

### API Monitoring
- Track response times
- Monitor error rates
- Alert on threshold breaches
- Log all webhook events

---

## 🚨 Backup & Disaster Recovery

### Database Backups
```bash
# Supabase automatic backups
- Daily backups (7 days retention)
- Weekly backups (4 weeks retention)
- Manual backups on demand

# Download backup
pg_dump postgresql://user:password@host/db > backup.sql
```

### Application Backups
- GitHub is the source of truth
- All changes tracked in git
- Automatic Vercel backups

### Recovery Procedure
```bash
1. Identify issue
2. Restore from latest backup
3. Re-run migrations if needed
4. Verify data integrity
5. Notify users if needed
```

---

## 📈 Scaling Strategy

### Database Scaling
```
Small (< 100 teams):  Supabase Pro ($25/month)
Medium (100-1k teams): Custom plan ($100+/month)
Large (1k+ teams):    Enterprise plan (custom)
```

### API Scaling
```
Option 1: Vercel Pro - Auto-scaling
Option 2: Lambda - Pay per invocation
Option 3: K8s - Manual scaling
```

### Background Jobs
When implementing job queue (Phase 2.2):
```bash
# Upstash Redis pricing
- Starter: $0.10/GB (1GB free)
- Pro: $0.10/GB + per-request pricing
```

### Caching Strategy
```typescript
// Implement Redis caching
const cache = new Redis({
  url: process.env.REDIS_URL,
});

export async function getCachedData(key: string) {
  const cached = await cache.get(key);
  if (cached) return cached;
  
  // Fetch and cache
  const data = await fetchData();
  await cache.setex(key, 3600, JSON.stringify(data));
  return data;
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install --legacy-peer-deps
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        run: vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 🧪 Testing Before Deployment

### Pre-Deployment Tests
```bash
# Lint
npm run lint

# Build
npm run build

# Type check
npx tsc --noEmit

# Test critical features
- GitHub OAuth flow
- Discord webhook
- AI summarization
- Database queries
```

### Staging Deployment
```
1. Deploy to Vercel staging environment
2. Test with real GitHub webhooks
3. Verify Discord integration
4. Load test with staging load
5. Security audit
```

---

## 📱 Mobile & Accessibility

### Responsive Design
```css
/* Vercel recommends */
@media (max-width: 768px) {
  /* Mobile optimizations */
}
```

### Accessibility
```tsx
// ARIA labels
<button aria-label="Submit form">Submit</button>

// Semantic HTML
<main>
  <section aria-label="Dashboard">
    {/* Content */}
  </section>
</main>
```

---

## 🎯 Post-Deployment

### Day 1
- Monitor error logs
- Check API response times
- Verify all integrations
- Test user flows

### Week 1
- Monitor for performance issues
- Gather user feedback
- Check database queries
- Analyze traffic patterns

### Month 1
- Review analytics
- Optimize slow queries
- Plan improvements
- Update documentation

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Failed**
```
1. Check SUPABASE_SERVICE_ROLE_KEY
2. Verify database is not paused
3. Check network policies
4. Review Supabase logs
```

**GitHub OAuth Error**
```
1. Verify GITHUB_CLIENT_ID and SECRET
2. Check callback URL matches GitHub app
3. Verify scopes are correct
4. Check token expiration
```

**AI Summaries Not Working**
```
1. Verify GEMINI_API_KEY is set
2. Check API quota usage
3. Review error logs
4. Test with curl
```

---

## 🚀 Performance Optimization

### Image Optimization
```typescript
import Image from "next/image";

<Image
  src="/dashboard.jpg"
  width={1200}
  height={600}
  priority
  quality={75}
/>
```

### Code Splitting
```typescript
import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("@/components/dashboard"), {
  loading: () => <LoadingSpinner />,
});
```

### Database Query Optimization
```typescript
// Use select to limit columns
const { data } = await supabase
  .from("users")
  .select("id, username, avatar_url")
  .limit(10);
```

---

## 📞 Contact & Support

- **Documentation**: See `replit.md` and `PRODUCT_ROADMAP.md`
- **Issues**: GitHub Issues for bug reports
- **Feature Requests**: GitHub Discussions
- **Email**: support@opscord.dev (future)
