-- 0. Cleanup (Safe for dev, creating clean state)
drop table if exists audit_logs cascade;

-- 1. Create Audit Logs table
create table audit_logs (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade not null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null, -- e.g. 'org.update', 'member.invite', 'ai.verify'
  target_resource text not null, -- e.g. 'decision:123', 'org:acme'
  details jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table audit_logs enable row level security;

-- 3. Policies
-- Only Org Admins/Owners can view audit logs
create policy "Admins can view audit logs" on audit_logs
  for select using (
    exists (
      select 1 from org_members
      join roles on org_members.role_id = roles.id
      where org_members.org_id = audit_logs.organization_id
      and org_members.user_id = auth.uid()
      and roles.name in ('Owner', 'Admin')
    )
  );

-- All authenticated users can insert logs (via backend service role or trigger, but here exposing to authenticated for simplicity in MVP)
create policy "Users can create audit logs" on audit_logs
  for insert with check (
    auth.uid() = actor_id
  );
