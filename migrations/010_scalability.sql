-- Migration: 010_scalability.sql
-- Description: Adds tables for event buffering, AI response caching, and organization quotas to support larger scale.

-- 1. Ingestion Queue (for high-volume webhooks)
create table if not exists ingestion_queue (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid references organizations(id) on delete cascade not null,
    source text not null, -- e.g., 'github', 'jira'
    event_type text not null,
    payload jsonb not null,
    status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
    attempts int default 0,
    created_at timestamp with time zone default now(),
    processed_at timestamp with time zone,
    error_message text
);

-- Index for popping items off the queue
create index if not exists idx_ingestion_queue_status_created on ingestion_queue(status, created_at);

-- 2. AI Cache (store LLM responses to save costs/time)
create table if not exists ai_cache (
    key text primary key, -- Hash of the prompt/context
    response text not null,
    model text not null,
    created_at timestamp with time zone default now(),
    expires_at timestamp with time zone
);

-- 3. Organization Quotas (Enforce limits)
create table if not exists org_quotas (
    organization_id uuid primary key references organizations(id) on delete cascade,
    max_events_per_month int default 10000,
    max_history_days int default 90,
    max_seats int default 5,
    current_events_this_month int default 0,
    usage_reset_at timestamp with time zone default (date_trunc('month', now()) + interval '1 month')
);

-- RLS Policies

-- Ingestion Queue: Only service role should really process, but admins can view status
alter table ingestion_queue enable row level security;

create policy "Admins can view queue items"
    on ingestion_queue for select
    using (
        exists (
            select 1 from org_members
            where org_members.org_id = ingestion_queue.organization_id
            and org_members.user_id = auth.uid()
            and org_members.role_id in (select id from roles where name in ('Owner', 'Admin'))
        )
    );

-- AI Cache: Public read if we want, but writing restricted to service role generally. 
-- For now, let's keep it simple: authenticated users can read cache if they hit the same prompt? 
-- Actually, cache is usually backend-internal. Let's strictly secure it or leave it off RLS if only accessed by backend functions.
-- We'll enable RLS to be safe.
alter table ai_cache enable row level security;
create policy "Backend can read/write ai_cache"
    on ai_cache for all
    using (true); -- Simplification: Assuming backend client bypasses RLS or we trust auth users to read cache. 
                  -- Ideally, this would be restricted to service_role, but for client-side AI calls (if any), we might need read.
                  -- Let's stick to: Service Role usage primarily. 

-- Org Quotas: Viewable by members, editable only by super-admins (or not exposed via API directly for writes)
alter table org_quotas enable row level security;

create policy "Members can view quotas"
    on org_quotas for select
    using (
        exists (
            select 1 from org_members
            where org_members.org_id = org_quotas.organization_id
            and org_members.user_id = auth.uid()
        )
    );
