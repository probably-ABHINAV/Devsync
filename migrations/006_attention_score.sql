-- Add attention_score to activities table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'attention_score') THEN
        ALTER TABLE public.activities ADD COLUMN attention_score INTEGER DEFAULT 0;
    END IF;
END $$;

-- Index for sorting feeds by importance
CREATE INDEX IF NOT EXISTS idx_activities_attention_score ON public.activities(attention_score DESC);
