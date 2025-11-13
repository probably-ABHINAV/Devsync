# OpsCord Complete Environment Setup Guide

## Project Information
- **App Name**: OpsCord
- **Version**: 2.0.0
- **AI Provider**: Google Gemini
- **Authentication**: NextAuth.js
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash Redis
- **External Integrations**: GitHub, Discord

## Environment Variables Reference

### Core Application
\`\`\`env
NEXT_PUBLIC_APP_URL=https://opscord.vercel.app
NEXTAUTH_URL=https://opscord.vercel.app
NEXTAUTH_SECRET=generate_with_openssl_rand_-base64_32
\`\`\`

### Database (Supabase PostgreSQL)
\`\`\`env
# Server-side only
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Client-side
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Prisma (if using ORM)
DATABASE_URL=your_connection_string
\`\`\`

### Cache (Upstash Redis)
\`\`\`env
REDIS_URL=your_redis_url
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
\`\`\`

### AI (Google Gemini)
\`\`\`env
GEMINI_API_KEY=your_gemini_api_key
\`\`\`

### GitHub Integration
\`\`\`env
GITHUB_OAUTH_ID=your_github_app_id
GITHUB_OAUTH_SECRET=your_github_app_secret
GITHUB_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_TOKEN=your_personal_access_token
GITHUB_WEBHOOK_URL=https://opscord.vercel.app/api/github/webhook
\`\`\`

### Discord Integration
\`\`\`env
DISCORD_OAUTH_ID=your_discord_app_id
DISCORD_OAUTH_SECRET=your_discord_app_secret
DISCORD_TOKEN=your_discord_bot_token
DISCORD_PUBLIC_KEY=your_discord_public_key
\`\`\`

### Job Queue
\`\`\`env
JOB_QUEUE_SECRET=generate_random_string
\`\`\`

## Getting Your API Keys

### Gemini API Key
1. Visit https://ai.google.dev
2. Click "Get API Key"
3. Create or select a Google Cloud project
4. Copy the API key

### GitHub OAuth
1. Visit https://github.com/settings/developers/apps
2. Create new GitHub App
3. Copy App ID and generate Client Secret
4. Generate Private Key (save as PEM)

### Discord OAuth
1. Visit https://discord.com/developers/applications
2. Create new Application
3. Go to OAuth2 section
4. Copy Client ID and generate Client Secret
5. Go to Bot section, copy Token and Public Key

### Supabase
1. Visit https://supabase.io
2. Create new project
3. Get URL and API keys from project settings

### Upstash Redis
1. Visit https://upstash.com
2. Create Redis database
3. Get connection string and API tokens

## Setting Up in Vercel

1. Go to your Vercel project **Settings** → **Environment Variables**
2. Add all variables from the sections above
3. Select which environments (Production, Preview, Development)
4. Click Save
5. Redeploy your application

## Local Development

Create `.env.local` file in project root:

\`\`\`env
# Copy all environment variables here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
# ... other variables ...
\`\`\`

## Build & Deploy

\`\`\`bash
# Install dependencies
npm install

# Build application
npm run build

# Start development server
npm run dev

# Deploy to Vercel
# (push to git and Vercel auto-deploys)
\`\`\`

## Verification Checklist

- [ ] All environment variables added to Vercel
- [ ] Database migrations completed
- [ ] GitHub OAuth app created and credentials added
- [ ] Discord app created and credentials added
- [ ] Gemini API key verified
- [ ] Redis/Upstash connection tested
- [ ] NEXTAUTH_SECRET generated and added
- [ ] Webhook URLs configured in GitHub/Discord apps
- [ ] SSL/TLS enabled and verified
- [ ] Application deployed and tested

## Support & Troubleshooting

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are correctly set
3. Ensure callback URLs match exactly in OAuth apps
4. Test database connection
5. Check Redis connectivity
6. Verify API keys are active and not expired

## Next Steps

1. Configure GitHub app webhooks
2. Set up Discord bot and add to servers
3. Customize OpsCord settings in dashboard
4. Connect repositories for monitoring
5. Set up Discord notification channels
