-- OpsCord Master Schema (Phases 1-6)
-- Combines Core, Noise Reduction, AI, Decisions, Metrics, and Privacy

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PHASE 1: UNIFIED EVENT & CONTEXT CORE
-- ==========================================

-- 1. Users & Identity
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  github_id TEXT UNIQUE,
  email TEXT UNIQUE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'developer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist (idempotent alterations)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'developer';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;


-- 2. Webhooks (Raw Ingestion Log)
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT, -- Allow null initially if legacy data exists
  event_type TEXT,
  payload JSONB,
  user_id UUID,
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix constraints and add missing columns for existing table
ALTER TABLE public.webhooks ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS event_type TEXT; -- Might already exist
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.webhooks ADD COLUMN IF NOT EXISTS error_message TEXT;


-- 3. Activities (The Unified Timeline)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  link_url TEXT,
  repo_name TEXT,
  pr_number INTEGER,
  issue_number INTEGER,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_username TEXT,
  actor_avatar_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relax user_id and add missing columns
ALTER TABLE public.activities ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS actor_username TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS actor_avatar_url TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS link_url TEXT;


-- 4. Linked Events (Graph)
CREATE TABLE IF NOT EXISTS public.event_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_event_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
    target_event_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
    link_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_event_id, target_event_id)
);

-- ==========================================
-- PHASE 2: NOISE REDUCTION & PRIORTIES
-- ==========================================

-- 5. User Priorities
CREATE TABLE IF NOT EXISTS public.user_priorities (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    repo_pattern TEXT NOT NULL,
    priority_level INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Attention Items (Inferred "Inbox")
CREATE TABLE IF NOT EXISTS public.attention_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    reason TEXT,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PHASE 3: TRUSTWORTHY AI
-- ==========================================

-- 7. AI Summaries & Insights
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    insight_type TEXT NOT NULL,
    content TEXT NOT NULL,
    confidence_score FLOAT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES public.users(id),
    user_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PHASE 4: DECISION AWARENESS
-- ==========================================

-- 8. Decisions
CREATE TABLE IF NOT EXISTS public.decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    rationale TEXT NOT NULL,
    alternatives_considered TEXT,
    outcome TEXT,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PHASE 5: METRICS & GAMIFICATION
-- ==========================================

-- 9. User Gamification Stats
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    xp_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ
);

-- 10. Badges
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    xp_bonus INTEGER DEFAULT 0
);

-- 11. User Earned Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- ==========================================
-- PHASE 6: PRIVACY & AUDIT
-- ==========================================

-- 12. Privacy Settings
CREATE TABLE IF NOT EXISTS public.privacy_settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    allow_ai_processing BOOLEAN DEFAULT TRUE,
    show_metrics_publicly BOOLEAN DEFAULT TRUE,
    data_retention_days INTEGER DEFAULT 365
);

-- 13. Audit Logs (Sensitive Actions)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    resource_target TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- INDEXES & TRIGGERS
-- ==========================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_modtime ON public.users;
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_insights_modtime ON public.ai_insights;
CREATE TRIGGER update_ai_insights_modtime BEFORE UPDATE ON public.ai_insights FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_decisions_modtime ON public.decisions;
CREATE TRIGGER update_decisions_modtime BEFORE UPDATE ON public.decisions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_activities_repo ON public.activities(repo_name);
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON public.activities(created_at DESC);

-- Ensure processed column exists BEFORE creating index
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON public.webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_attention_user_status ON public.attention_items(user_id, status);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) - PUBLIC/DEV MODE
-- ==========================================
-- Note: User requested "all best". For dev speed, we allow liberal reading but ensure checks.
-- You can tighten these for Production.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

-- Allow reading everything for now (Team Transparency Principle)
CREATE POLICY "Allow Read All" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow Read All" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Allow Read All" ON public.decisions FOR SELECT USING (true);

-- System Service Role bypasses these checks for Ingestion.
-- Users can only edit their own profile
CREATE POLICY "Edit Own Profile" ON public.users FOR UPDATE USING (auth.uid() = id);
