-- V1 personal profile fields for career counseling

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS age_range text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS education_level text,
  ADD COLUMN IF NOT EXISTS current_status text,
  ADD COLUMN IF NOT EXISTS school_or_college text,
  ADD COLUMN IF NOT EXISTS languages_spoken text[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_age_range_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_age_range_check
      CHECK (
        age_range IS NULL OR age_range IN (
          'under_15', '15_17', '18_21', '22_25', '26_30', '31_40', '41_plus'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_education_level_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_education_level_check
      CHECK (
        education_level IS NULL OR education_level IN (
          'below_10', '10th', '12th', 'diploma', 'undergraduate', 'postgraduate', 'other'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_current_status_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_current_status_check
      CHECK (
        current_status IS NULL OR current_status IN (
          'student', 'working', 'seeking', 'other'
        )
      );
  END IF;
END $$;
