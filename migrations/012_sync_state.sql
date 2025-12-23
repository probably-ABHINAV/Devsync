-- Migration: 012_sync_state.sql
-- Purpose: Track the state of backfill/sync jobs for each integration to prevent re-fetching.

create table if not exists integration_sync_state (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid references organizations(id) on delete cascade not null,
    provider text not null, -- 'github', 'jira', 'gitlab', 'slack'
    resource_id text not null, -- e.g., 'owner/repo' or 'PROJECT-KEY' or 'channel-id'
    last_synced_at timestamp with time zone default now(),
    cursor text, -- Pagination cursor or last-fetched ID/Timestamp
    status text default 'idle' check (status in ('idle', 'syncing', 'failed')),
    error_message text,
    unique(organization_id, provider, resource_id)
);

-- RLS
alter table integration_sync_state enable row level security;

create policy "Admins can view sync state"
    on integration_sync_state for select
    using (
        exists (
            select 1 from org_members
            where org_members.org_id = integration_sync_state.organization_id
            and org_members.user_id = auth.uid()
            and org_members.role_id in (select id from roles where name in ('Owner', 'Admin'))
        )
    );
