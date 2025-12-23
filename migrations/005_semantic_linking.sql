-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Add checking for the column before adding it to avoid errors on re-runs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'embedding') THEN
        ALTER TABLE public.activities ADD COLUMN embedding vector(768); -- 768 dimensions for Gemini 1.5/Embedding-001
    END IF;
END $$;

-- Create an index for faster similarity search (IVFFlat is good for starters)
-- Note: You need some data rows for the index to build effectively, but we can define it safely.
CREATE INDEX IF NOT EXISTS activities_embedding_idx ON public.activities USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to match similar activities
-- Used for the "Context-Aware War Room" feature
CREATE OR REPLACE FUNCTION match_activities (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  source TEXT,
  activity_type TEXT,
  created_at TIMESTAMPTZ,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    activities.id,
    activities.title,
    activities.description,
    activities.source,
    activities.activity_type,
    activities.created_at,
    1 - (activities.embedding <=> query_embedding) as similarity
  FROM activities
  WHERE 1 - (activities.embedding <=> query_embedding) > match_threshold
  ORDER BY activities.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
