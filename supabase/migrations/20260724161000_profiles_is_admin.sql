-- 1) Column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2) Backfill from existing user_roles admins (only if that table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) THEN
    UPDATE public.profiles p
    SET is_admin = true
    FROM public.user_roles r
    WHERE r.user_id = p.id AND r.role = 'admin';
  END IF;
END $$;

-- 3) Prevent client JWTs from changing is_admin (SQL Editor / service_role still allowed)
CREATE OR REPLACE FUNCTION public.protect_profiles_is_admin()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.is_admin IS DISTINCT FROM OLD.is_admin
     AND coalesce(auth.role(), '') IN ('authenticated', 'anon') THEN
    RAISE EXCEPTION 'is_admin can only be changed by service role or SQL editor';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_is_admin ON public.profiles;
CREATE TRIGGER profiles_protect_is_admin
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profiles_is_admin();

-- 4) Point has_role('admin') at profiles.is_admin when the RPC already exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'has_role'
  ) AND EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'app_role'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'user_roles'
    ) THEN
      EXECUTE $fn$
        CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
        RETURNS boolean
        LANGUAGE sql
        STABLE
        SECURITY DEFINER
        SET search_path = public
        AS $body$
          SELECT CASE
            WHEN _role = 'admin' THEN
              EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = _user_id AND is_admin = true
              )
            ELSE
              EXISTS (
                SELECT 1 FROM public.user_roles
                WHERE user_id = _user_id AND role = _role
              )
          END;
        $body$;
      $fn$;
    ELSE
      EXECUTE $fn$
        CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
        RETURNS boolean
        LANGUAGE sql
        STABLE
        SECURITY DEFINER
        SET search_path = public
        AS $body$
          SELECT CASE
            WHEN _role = 'admin' THEN
              EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = _user_id AND is_admin = true
              )
            ELSE
              false
          END;
        $body$;
      $fn$;
    END IF;
  END IF;
END $$;

-- 5) Remove hardcoded nisanth@seedfound.org auto-grant (no-op if missing)
DROP TRIGGER IF EXISTS on_auth_user_created_grant_seed_admin ON auth.users;
DROP FUNCTION IF EXISTS public.grant_admin_for_seed_email();
