-- Migration to allow anonymous/unmatched events (Essential for Webhooks)

-- 1. Modify 'webhooks' table to allow null user_id
-- This ensures we log *every* webhook we receive, even if we can't match it to a user.
ALTER TABLE public.webhooks ALTER COLUMN user_id DROP NOT NULL;

-- 2. Modify 'activities' table to allow null user_id
-- This allows us to display events (like Jira tickets created by non-OpsCord users) on the timeline.
ALTER TABLE public.activities ALTER COLUMN user_id DROP NOT NULL;

-- 3. Add 'source' column to webhooks if it helps querying (optional but good practice)
-- (Skipping for now to avoid schema drift if not strictly needed, relying on event_type prefix)

-- 4. Ensure RLS policies don't hide these public/anonymous events if strictly set to "own data"
-- We need to check policies.
-- In supabase-schema.sql:
-- CREATE POLICY "Users can view own webhooks" ON public.webhooks FOR SELECT USING (true); -> "true" means they see EVERYTHING?
-- Wait, Step 36 showed:
-- CREATE POLICY "Users can view own webhooks" ON public.webhooks FOR SELECT USING (true);
-- Actually "true" means *all rows*. "auth.uid() = user_id" would limit it.
-- Let's double check the policies in the file.
-- Step 36, Lines 73-74: CREATE POLICY "Users can view own webhooks" ON public.webhooks FOR SELECT USING (true);
-- This "allow_all" style policy means RLS is effectively disabled for SELECT. So we are good on RLS.

-- 5. Add any missing columns that might be useful
-- (None identified as blocker)
