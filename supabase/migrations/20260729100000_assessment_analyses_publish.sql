-- Publish workflow for Seed Report (user-visible only when approved)

ALTER TABLE public.assessment_analyses
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assessment_analyses_status_check'
  ) THEN
    ALTER TABLE public.assessment_analyses
      ADD CONSTRAINT assessment_analyses_status_check
      CHECK (status IN ('draft', 'approved'));
  END IF;
END $$;

-- Users may read only their own approved report
GRANT SELECT ON public.assessment_analyses TO authenticated;

DROP POLICY IF EXISTS "Users can view own approved analysis" ON public.assessment_analyses;
CREATE POLICY "Users can view own approved analysis"
  ON public.assessment_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND status = 'approved');
