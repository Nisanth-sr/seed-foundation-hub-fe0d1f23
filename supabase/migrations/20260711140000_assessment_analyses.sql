
CREATE TABLE public.assessment_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  model TEXT NOT NULL,
  prompt_version TEXT NOT NULL DEFAULT 'v1',
  analysis JSONB NOT NULL,
  scores_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_analyses ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.assessment_analyses TO service_role;

CREATE TRIGGER assessment_analyses_touch BEFORE UPDATE ON public.assessment_analyses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
