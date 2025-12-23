-- 1. Create Organizations table
create table if not exists organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  owner_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Roles & Permissions
create table if not exists roles (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- 'Owner', 'Admin', 'Developer', 'Viewer'
  description text,
  is_system boolean default false, -- System roles cannot be deleted
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists permissions (
  id uuid default gen_random_uuid() primary key,
  code text not null unique, -- 'timeline.read', 'decision.create'
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists role_permissions (
  role_id uuid references roles(id) on delete cascade not null,
  permission_id uuid references permissions(id) on delete cascade not null,
  primary key (role_id, permission_id)
);

-- 3. Org Members
create table if not exists org_members (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role_id uuid references roles(id) on delete set null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(org_id, user_id)
);

-- 4. Invites
create table if not exists org_invites (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references organizations(id) on delete cascade not null,
  email text not null,
  role_id uuid references roles(id) not null,
  token text not null unique,
  inviter_id uuid references auth.users(id),
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  accepted_at timestamp with time zone
);

-- 5. Add organization_id to existing tables (Nullable for now to support migration)
alter table activities add column if not exists organization_id uuid references organizations(id);
alter table decisions add column if not exists organization_id uuid references organizations(id);
alter table ai_insights add column if not exists organization_id uuid references organizations(id);

-- 6. Enable RLS
alter table organizations enable row level security;
alter table org_members enable row level security;
alter table org_invites enable row level security;

-- Policies (Simple for now: Members can read their own orgs)
create policy "Members can view their own orgs" on organizations
  for select using (
    exists (
      select 1 from org_members
      where org_members.org_id = organizations.id
      and org_members.user_id = auth.uid()
    )
  );

create policy "Users can view their memberships" on org_members
  for select using (auth.uid() = user_id);

-- 7. Seed Default Roles & Permissions
insert into roles (name, description, is_system) values
  ('Owner', 'Full access to organization', true),
  ('Admin', 'Manage members and settings', true),
  ('Developer', 'Can create content and view timeline', true),
  ('Viewer', 'Read-only access', true)
on conflict do nothing;

-- Seed Permissions
insert into permissions (code, description) values
  ('org.manage', 'Manage organization settings'),
  ('org.delete', 'Delete organization'),
  ('member.manage', 'Invite and remove members'),
  ('billing.manage', 'Manage billing'),
  ('timeline.read', 'View activity timeline'),
  ('decision.create', 'Create architectural decisions'),
  ('decision.read', 'View decisions'),
  ('ai.verify', 'Verify AI insights'),
  ('integration.manage', 'Connect and disconnect tools')
on conflict do nothing;

-- Map Permissions to Roles (Simplified)
-- Owner gets everything (handled via code check usually, but let's map it)
with r as (select id from roles where name = 'Owner'), p as (select id from permissions)
insert into role_permissions (role_id, permission_id) select r.id, p.id from r, p on conflict do nothing;

-- Admin
with r as (select id from roles where name = 'Admin'), p as (select id from permissions where code in ('org.manage', 'member.manage', 'timeline.read', 'decision.create', 'decision.read', 'ai.verify', 'integration.manage'))
insert into role_permissions (role_id, permission_id) select r.id, p.id from r, p on conflict do nothing;

-- Developer
with r as (select id from roles where name = 'Developer'), p as (select id from permissions where code in ('timeline.read', 'decision.create', 'decision.read'))
insert into role_permissions (role_id, permission_id) select r.id, p.id from r, p on conflict do nothing;

-- Viewer
with r as (select id from roles where name = 'Viewer'), p as (select id from permissions where code in ('timeline.read', 'decision.read'))
insert into role_permissions (role_id, permission_id) select r.id, p.id from r, p on conflict do nothing;
