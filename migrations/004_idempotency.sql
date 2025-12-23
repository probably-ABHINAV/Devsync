-- Add external_id column if it doesn't exist
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Create unique index for idempotency
-- This guarantees no duplicate events for the same source + external ID
CREATE UNIQUE INDEX IF NOT EXISTS uniq_activity_source_external
ON public.activities (source, external_id);
