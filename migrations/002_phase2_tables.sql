-- OpsCord Phase 2 Database Schema Migration
-- Robust version that handles incomplete tables

-- ===============================================
-- STEP 0: DROP AND RECREATE IF NEEDED
-- ===============================================

DROP TABLE IF EXISTS public.ci_failure_analysis CASCADE;
DROP TABLE IF EXISTS public.ci_runs CASCADE;
DROP TABLE IF EXISTS public.webhook_logs CASCADE;
DROP TABLE IF EXISTS public.job_queue CASCADE;
DROP TABLE IF EXISTS public.issue_classifications CASCADE;
DROP TABLE IF EXISTS public.release_notes CASCADE;
DROP TABLE IF EXISTS public.pr_metrics CASCADE;
DROP TABLE IF EXISTS public.team_metrics CASCADE;
DROP TABLE IF EXISTS public.reviewer_metrics CASCADE;
DROP TABLE IF EXISTS public.analytics_reports CASCADE;
DROP TABLE IF EXISTS public.discord_notification_channels CASCADE;
DROP TABLE IF EXISTS public.system_health CASCADE;

-- ===============================================
-- STEP 1: CREATE ALL TABLES
-- ===============================================

CREATE TABLE public.job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT UNIQUE NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  payload JSONB NOT NULL,
  result JSONB,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id TEXT NOT NULL,
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body JSONB,
  processing_time_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.issue_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_number INTEGER NOT NULL,
  repo_name TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  severity_score INTEGER,
  suggested_labels TEXT[] DEFAULT '{}',
  suggested_assignees TEXT[] DEFAULT '{}',
  is_duplicate BOOLEAN DEFAULT FALSE,
  duplicate_of_issue INTEGER,
  ai_confidence NUMERIC(3,2),
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_name, issue_number)
);

CREATE TABLE public.release_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_name TEXT NOT NULL,
  version TEXT NOT NULL,
  release_date TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  bug_fixes TEXT[] DEFAULT '{}',
  breaking_changes TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  contributors TEXT[] DEFAULT '{}',
  pr_numbers INTEGER[] DEFAULT '{}',
  generated_by TEXT DEFAULT 'ai',
  is_published BOOLEAN DEFAULT FALSE,
  discord_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_name, version)
);

CREATE TABLE public.ci_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT UNIQUE NOT NULL,
  repo_name TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  branch TEXT,
  commit_sha TEXT,
  status TEXT NOT NULL,
  conclusion TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  logs_url TEXT,
  html_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ci_failure_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ci_run_id UUID REFERENCES public.ci_runs(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  root_cause TEXT NOT NULL,
  affected_files TEXT[] DEFAULT '{}',
  suggested_fixes TEXT[] DEFAULT '{}',
  related_prs INTEGER[] DEFAULT '{}',
  ai_confidence NUMERIC(3,2),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.pr_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_number INTEGER NOT NULL,
  repo_name TEXT NOT NULL,
  author TEXT NOT NULL,
  title TEXT,
  lines_added INTEGER DEFAULT 0,
  lines_removed INTEGER DEFAULT 0,
  files_changed INTEGER DEFAULT 0,
  commits_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  review_comments_count INTEGER DEFAULT 0,
  reviewers TEXT[] DEFAULT '{}',
  time_to_first_review_hours NUMERIC(10,2),
  time_to_merge_hours NUMERIC(10,2),
  review_cycles INTEGER DEFAULT 0,
  complexity_score TEXT,
  risk_score INTEGER,
  status TEXT NOT NULL,
  opened_at TIMESTAMPTZ,
  merged_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_name, pr_number)
);

CREATE TABLE public.team_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_name TEXT NOT NULL,
  period_type TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_prs INTEGER DEFAULT 0,
  merged_prs INTEGER DEFAULT 0,
  avg_time_to_merge_hours NUMERIC(10,2),
  avg_review_time_hours NUMERIC(10,2),
  total_reviews INTEGER DEFAULT 0,
  total_issues_opened INTEGER DEFAULT 0,
  total_issues_closed INTEGER DEFAULT 0,
  total_commits INTEGER DEFAULT 0,
  active_contributors INTEGER DEFAULT 0,
  top_contributors JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_name, period_type, period_start)
);

CREATE TABLE public.reviewer_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  period_type TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  reviews_completed INTEGER DEFAULT 0,
  avg_review_time_hours NUMERIC(10,2),
  comments_given INTEGER DEFAULT 0,
  approvals INTEGER DEFAULT 0,
  rejections INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(username, repo_name, period_type, period_start)
);

CREATE TABLE public.analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  repo_name TEXT,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  generated_for TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  discord_sent BOOLEAN DEFAULT FALSE,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.discord_notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  channel_name TEXT,
  webhook_url TEXT NOT NULL,
  notification_types TEXT[] DEFAULT ARRAY['pr_opened', 'pr_merged', 'issue_created', 'ci_failure', 'release_notes'],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

CREATE TABLE public.system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(10,4) NOT NULL,
  unit TEXT,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- STEP 2: CREATE ALL INDEXES
-- ===============================================

CREATE INDEX idx_job_queue_status ON public.job_queue(status);
CREATE INDEX idx_job_queue_type ON public.job_queue(job_type);
CREATE INDEX idx_job_queue_created ON public.job_queue(created_at DESC);
CREATE INDEX idx_webhook_logs_source ON public.webhook_logs(source);
CREATE INDEX idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX idx_webhook_logs_created ON public.webhook_logs(created_at DESC);
CREATE INDEX idx_issue_classifications_repo ON public.issue_classifications(repo_name);
CREATE INDEX idx_issue_classifications_type ON public.issue_classifications(issue_type);
CREATE INDEX idx_issue_classifications_severity ON public.issue_classifications(severity);
CREATE INDEX idx_release_notes_repo ON public.release_notes(repo_name);
CREATE INDEX idx_release_notes_date ON public.release_notes(release_date DESC);
CREATE INDEX idx_ci_runs_repo ON public.ci_runs(repo_name);
CREATE INDEX idx_ci_runs_status ON public.ci_runs(status);
CREATE INDEX idx_ci_runs_created ON public.ci_runs(created_at DESC);
CREATE INDEX idx_ci_failure_analysis_run ON public.ci_failure_analysis(ci_run_id);
CREATE INDEX idx_pr_metrics_repo ON public.pr_metrics(repo_name);
CREATE INDEX idx_pr_metrics_author ON public.pr_metrics(author);
CREATE INDEX idx_pr_metrics_status ON public.pr_metrics(status);
CREATE INDEX idx_pr_metrics_opened ON public.pr_metrics(opened_at DESC);
CREATE INDEX idx_team_metrics_repo ON public.team_metrics(repo_name);
CREATE INDEX idx_team_metrics_period ON public.team_metrics(period_type, period_start);
CREATE INDEX idx_reviewer_metrics_username ON public.reviewer_metrics(username);
CREATE INDEX idx_reviewer_metrics_repo ON public.reviewer_metrics(repo_name);
CREATE INDEX idx_analytics_reports_type ON public.analytics_reports(report_type);
CREATE INDEX idx_analytics_reports_repo ON public.analytics_reports(repo_name);
CREATE INDEX idx_analytics_reports_created ON public.analytics_reports(created_at DESC);
CREATE INDEX idx_discord_channels_user ON public.discord_notification_channels(user_id);
CREATE INDEX idx_discord_channels_active ON public.discord_notification_channels(is_active);
CREATE INDEX idx_system_health_type ON public.system_health(metric_type);
CREATE INDEX idx_system_health_recorded ON public.system_health(recorded_at DESC);

-- ===============================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- ===============================================

ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ci_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ci_failure_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pr_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewer_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- STEP 4: CREATE ROW LEVEL SECURITY POLICIES
-- ===============================================

CREATE POLICY "allow_all" ON public.job_queue FOR ALL USING (true);
CREATE POLICY "allow_all" ON public.webhook_logs FOR ALL USING (true);
CREATE POLICY "allow_select" ON public.issue_classifications FOR SELECT USING (true);
CREATE POLICY "allow_insert_update" ON public.issue_classifications FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select" ON public.release_notes FOR SELECT USING (true);
CREATE POLICY "allow_insert_update" ON public.release_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select" ON public.ci_runs FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON public.ci_runs FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select" ON public.ci_failure_analysis FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON public.ci_failure_analysis FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select" ON public.pr_metrics FOR SELECT USING (true);
CREATE POLICY "allow_insert_update" ON public.pr_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select" ON public.team_metrics FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON public.team_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select" ON public.reviewer_metrics FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON public.reviewer_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select" ON public.analytics_reports FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON public.analytics_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_all" ON public.discord_notification_channels FOR ALL USING (true);
CREATE POLICY "allow_all" ON public.system_health FOR ALL USING (true);

-- ===============================================
-- STEP 5: CREATE UPDATE TRIGGERS
-- ===============================================

CREATE TRIGGER job_queue_update_trigger BEFORE UPDATE ON public.job_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER issue_classifications_update_trigger BEFORE UPDATE ON public.issue_classifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER release_notes_update_trigger BEFORE UPDATE ON public.release_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER pr_metrics_update_trigger BEFORE UPDATE ON public.pr_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER discord_channels_update_trigger BEFORE UPDATE ON public.discord_notification_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
