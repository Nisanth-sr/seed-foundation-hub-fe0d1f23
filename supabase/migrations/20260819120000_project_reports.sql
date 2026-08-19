-- Project reports CMS (admin-managed, public when published)

CREATE TABLE public.project_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  focus_area TEXT NOT NULL CHECK (focus_area IN ('health', 'education', 'environment', 'disaster-relief')),
  category TEXT NOT NULL,
  event_date DATE,
  venue TEXT,
  cover_image_path TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  sort_order INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX project_reports_status_idx ON public.project_reports (status, event_date DESC NULLS LAST, created_at DESC);
CREATE INDEX project_reports_focus_area_idx ON public.project_reports (focus_area);

CREATE TABLE public.project_report_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.project_reports ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('image', 'video', 'video_embed')),
  storage_path TEXT,
  embed_url TEXT,
  alt_text TEXT,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT project_report_media_source_check CHECK (
    (kind IN ('image', 'video') AND storage_path IS NOT NULL)
    OR (kind = 'video_embed' AND embed_url IS NOT NULL)
  )
);

CREATE INDEX project_report_media_report_id_idx ON public.project_report_media (report_id, sort_order);

ALTER TABLE public.project_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_report_media ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.project_reports TO anon, authenticated;
GRANT SELECT ON public.project_report_media TO anon, authenticated;
GRANT ALL ON public.project_reports TO service_role;
GRANT ALL ON public.project_report_media TO service_role;

CREATE POLICY "Anyone can view published project reports"
  ON public.project_reports
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Anyone can view media of published project reports"
  ON public.project_report_media
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.project_reports r
      WHERE r.id = report_id AND r.status = 'published'
    )
  );

CREATE TRIGGER project_reports_touch BEFORE UPDATE ON public.project_reports
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-reports',
  'project-reports',
  true,
  52428800,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read project report files" ON storage.objects;
CREATE POLICY "Public read project report files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'project-reports');
