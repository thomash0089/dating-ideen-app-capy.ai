-- Create inspirations table (required for later ALTERs)
CREATE TABLE IF NOT EXISTS public.datingideen_inspirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  url TEXT,
  category TEXT,
  difficulty_level TEXT,
  estimated_cost TEXT,
  duration TEXT,
  season TEXT,
  general_location_info TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.datingideen_inspirations ENABLE ROW LEVEL SECURITY;

-- Allow read to all authenticated users by default (adjust if needed)
DO $$ BEGIN
  CREATE POLICY datingideen_inspirations_read ON public.datingideen_inspirations
  FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Update timestamp trigger function (reuse if exists)
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.datingideen_update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;$$ LANGUAGE plpgsql;
END $$;

-- Attach trigger
DROP TRIGGER IF EXISTS datingideen_inspirations_updated_at ON public.datingideen_inspirations;
CREATE TRIGGER datingideen_inspirations_updated_at
  BEFORE UPDATE ON public.datingideen_inspirations
  FOR EACH ROW EXECUTE FUNCTION public.datingideen_update_updated_at_column();