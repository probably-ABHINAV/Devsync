-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

create table if not exists decisions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text check (status in ('proposed', 'accepted', 'rejected', 'implemented')) default 'proposed',
  tags text[] default '{}',
  activity_id uuid references activities(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table decisions enable row level security;

-- Policy: Allow all access for now (dev mode)
create policy "Allow all access" on decisions for all using (true) with check (true);
