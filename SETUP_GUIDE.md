# OpsCord Setup Guide for Replit

## Quick Start

Your OpsCord app is now running! However, to unlock all features, you'll need to configure several integrations.

## 🗄️ Step 1: Set Up Supabase Database

### Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Choose an organization and enter:
   - **Name**: OpsCord
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your location
4. Wait for your project to be provisioned (~2 minutes)

### Get Supabase Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them in Step 2):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **API Keys**:
     - `anon` `public` key
     - `service_role` key (keep this secret!)

### Set Up Database Schema
1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Open the `supabase-schema.sql` file in this Replit
4. Copy the entire SQL content
5. Paste it into the Supabase SQL Editor
6. Click **Run** to create all tables and policies

Your database is now ready! ✅

## 🔐 Step 2: Configure Environment Variables

Go to the **Secrets** tab in Replit (🔒 icon in the left sidebar) and add:

### Required for Database
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Required for GitHub Integration
```
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
GITHUB_WEBHOOK_SECRET=your-random-secret-string
```

### Optional (for AI Features)
```
GEMINI_API_KEY=your-google-ai-api-key
```

### Optional (for Discord Bot)
```
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_TOKEN=your-discord-bot-token
DISCORD_PUBLIC_KEY=your-discord-public-key
```

## 🐙 Step 3: Set Up GitHub OAuth

1. Go to [https://github.com/settings/developers](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: OpsCord
   - **Homepage URL**: `https://your-repl-url.repl.co`
   - **Authorization callback URL**: `https://your-repl-url.repl.co/api/auth/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it
7. Add both to Replit Secrets (see Step 2)

## 🤖 Step 4: Set Up Google Gemini AI (Optional)

This enables AI-powered PR summarization.

1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the API key
5. Add it to Replit Secrets as `GEMINI_API_KEY`

## 💬 Step 5: Set Up Discord Integration (Optional)

### For Webhook-Based Notifications (Simpler)
1. Open your Discord server
2. Go to **Server Settings** → **Integrations** → **Webhooks**
3. Click **New Webhook**
4. Give it a name (e.g., "OpsCord")
5. Choose a channel for notifications
6. Copy the webhook URL
7. You can configure this in the OpsCord dashboard after logging in

### For Discord Bot (Advanced Features)
1. Go to [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application**
3. Name it "OpsCord" and accept terms
4. Go to **Bot** tab and click **Add Bot**
5. Copy the **Bot Token**
6. Go to **General Information** and copy:
   - **Application ID** (Client ID)
   - **Public Key**
7. Add these to Replit Secrets

## 🚀 Step 6: Restart and Test

1. After adding secrets, restart your app (click the Run button)
2. Visit your Replit URL
3. Click **Get Started Free**
4. Log in with your GitHub account
5. Start using OpsCord!

## 📊 Features Overview

Once configured, you can:
- ✅ **View Repositories**: See all your GitHub repos in a beautiful dashboard
- ✅ **Discord Notifications**: Get real-time notifications for PRs and issues
- ✅ **AI Summaries**: Get intelligent PR summaries powered by Google Gemini
- ✅ **Analytics**: Track team contributions and activity
- ✅ **Webhooks**: Receive GitHub events in Discord channels

## 🛠️ Troubleshooting

### "Supabase credentials not configured"
- Make sure you've added all three Supabase environment variables
- Double-check that the URLs and keys are correct
- Restart the app after adding secrets

### GitHub login not working
- Verify the callback URL in your GitHub OAuth app matches your Replit URL
- Make sure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
- Check that you've added them as secrets (not environment variables)

### Database errors
- Make sure you ran the `supabase-schema.sql` in your Supabase SQL editor
- Check that the service role key has the correct permissions
- Verify your database is in a healthy state in Supabase dashboard

## 📝 Development Notes

- The app runs on port 5000 (required for Replit)
- Uses cookie-based sessions (can be enhanced with Supabase Auth)
- All secrets are securely managed through Replit Secrets
- Database schema uses Row Level Security (RLS) for data protection

## 🎯 Next Steps

1. Set up Supabase (most important for data persistence)
2. Configure GitHub OAuth (required for login)
3. Add optional integrations as needed
4. Customize the UI in the `components/` directory
5. Deploy your app by clicking the **Deploy** button!

Need help? Check the `replit.md` file for more technical details.
