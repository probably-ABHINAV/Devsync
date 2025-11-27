-- OpsCord Supabase Schema
-- Run this SQL in your Supabase SQL editor to set up the database

-- Users table (stores GitHub authenticated users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  name TEXT NOT NULL,
  email TEXT,
  github_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discord configurations (webhook URLs per user)
CREATE TABLE IF NOT EXISTS public.discord_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Webhooks log (stores GitHub webhook events)
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  repo_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_github_id ON public.users(github_id);
CREATE INDEX IF NOT EXISTS idx_discord_configs_user_id ON public.discord_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON public.webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_created_at ON public.webhooks(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only read their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (true);

-- Discord configs policies
CREATE POLICY "Users can view own discord config" ON public.discord_configs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own discord config" ON public.discord_configs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own discord config" ON public.discord_configs
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own discord config" ON public.discord_configs
  FOR DELETE USING (true);

-- Webhooks policies
CREATE POLICY "Users can view own webhooks" ON public.webhooks
  FOR SELECT USING (true);

CREATE POLICY "System can insert webhooks" ON public.webhooks
  FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discord_configs_updated_at BEFORE UPDATE ON public.discord_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Gamification: User Stats (XP, level, rankings)
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  prs_opened INTEGER DEFAULT 0,
  prs_merged INTEGER DEFAULT 0,
  prs_reviewed INTEGER DEFAULT 0,
  issues_created INTEGER DEFAULT 0,
  issues_closed INTEGER DEFAULT 0,
  commits_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gamification: Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_requirement INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gamification: User Badges (many-to-many)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- PR Summaries (AI-generated)
CREATE TABLE IF NOT EXISTS public.pr_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_number INTEGER NOT NULL,
  repo_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_changes JSONB NOT NULL,
  risks JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  complexity TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_name, pr_number)
);

-- Activity Feed (PR timeline)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  pr_number INTEGER,
  issue_number INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for gamification and activity
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_xp ON public.user_stats(xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_pr_summaries_repo_pr ON public.pr_summaries(repo_name, pr_number);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- RLS for new tables
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pr_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Policies for gamification tables
CREATE POLICY "Anyone can view user stats" ON public.user_stats FOR SELECT USING (true);
CREATE POLICY "System can update user stats" ON public.user_stats FOR UPDATE USING (true);
CREATE POLICY "System can insert user stats" ON public.user_stats FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "System can manage badges" ON public.badges FOR ALL USING (true);

CREATE POLICY "Anyone can view user badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "System can award badges" ON public.user_badges FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view PR summaries" ON public.pr_summaries FOR SELECT USING (true);
CREATE POLICY "System can create PR summaries" ON public.pr_summaries FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "System can create activities" ON public.activities FOR INSERT WITH CHECK (true);

-- Triggers
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial badges
INSERT INTO public.badges (name, description, icon, xp_requirement) VALUES
  ('First Steps', 'Open your first PR', '🌱', 0),
  ('Getting Started', 'Open 5 PRs', '🚀', 50),
  ('Contributor', 'Earn 100 XP', '⭐', 100),
  ('Active Developer', 'Earn 500 XP', '💎', 500),
  ('Code Master', 'Earn 1000 XP', '👑', 1000),
  ('Team Player', 'Review 10 PRs', '🤝', 100),
  ('Issue Hunter', 'Close 20 issues', '🎯', 200)
ON CONFLICT (name) DO NOTHING;
