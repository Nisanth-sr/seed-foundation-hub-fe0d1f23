-- Homepage promotion is independent of website visibility

ALTER TABLE public.project_reports
  ADD COLUMN IF NOT EXISTS featured_on_homepage boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS project_reports_featured_idx
  ON public.project_reports (featured_on_homepage)
  WHERE status = 'published' AND featured_on_homepage = true;

-- Keep the original homepage trio featured after this ships
UPDATE public.project_reports
SET featured_on_homepage = true
WHERE slug IN (
  'helping-communities-understand-cancer',
  'encouraging-conversations-around-mental-health',
  'protecting-our-coastline'
)
AND status = 'published';
