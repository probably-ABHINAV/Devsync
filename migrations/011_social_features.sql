-- Migration: 011_social_features.sql
-- Description: Adds social context and engagement features.

-- 1. Kudos (Likes/Appreciation)
create table if not exists kudos (
    id uuid primary key default uuid_generate_v4(),
    activity_id uuid references activities(id) on delete cascade not null,
    from_user_id uuid references auth.users(id) on delete cascade not null,
    to_user_id uuid references auth.users(id) on delete cascade, -- Optional: targeting specific user owner of activity
    created_at timestamp with time zone default now(),
    message text, -- e.g. "Great work!"
    unique(activity_id, from_user_id) -- One kudos per user per activity
);

-- 2. Sentiment Analysis (Add columns to activities)
alter table activities add column if not exists sentiment_score float; -- -1.0 to 1.0
alter table activities add column if not exists sentiment_label text; -- 'positive', 'neutral', 'negative'

-- RLS
alter table kudos enable row level security;

create policy "Users can view kudos"
    on kudos for select
    using (true);

create policy "Users can give kudos"
    on kudos for insert
    with check (auth.uid() = from_user_id);

create policy "Users can remove their own kudos"
    on kudos for delete
    using (auth.uid() = from_user_id);
