-- Migration: 013_intelligence.sql
-- Purpose: Store AI-generated insights, summaries, and digests.

create table if not exists ai_insights (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid references organizations(id) on delete cascade not null,
    
    -- Type of insight: 'daily_digest', 'pr_summary', 'thread_summary', 'anomaly'
    type text not null,
    
    -- Optional target link (e.g. Activity ID or Resource ID)
    target_id uuid references activities(id) on delete set null,
    target_resource text, -- e.g. "github/owner/repo/pull/123" if activity missing
    
    title text,
    content text not null, -- The summary itself (Markdown)
    
    confidence_score float default 1.0,
    
    created_at timestamp with time zone default now(),
    
    metadata jsonb default '{}'::jsonb
);

-- RLS
alter table ai_insights enable row level security;

create policy "Users can view insights for their org"
    on ai_insights for select
    using (
        exists (
            select 1 from org_members
            where org_members.org_id = ai_insights.organization_id
            and org_members.user_id = auth.uid()
        )
    );
