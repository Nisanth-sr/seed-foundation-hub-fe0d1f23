# SEED Admin Console

Next.js admin app for Career Intelligence assessments. Deployed separately at **admin.seedfound.org**.

## Features

- Sign in with Supabase email/password (requires `profiles.is_admin = true`)
- List users with assessment + AI report status
- View/edit profile (name, email, locale, phone, age range, location, education, status, school, languages)
- View/edit Big Five & RIASEC answers; scores recalculate on save
- Manage saved careers; see algorithmic matches
- Generate/regenerate structured AI reports via OpenRouter (cached in `assessment_analyses`)
- Download full assessment PDF
- Manage project reports (text, images, videos) and choose which are visible on seedfound.org

## Local development

From the **repo root**:

```bash
cp apps/admin/.env.example apps/admin/.env.local
# fill Supabase + OpenRouter values (same Supabase project as the main site)

npm install
npm run dev:admin
```

Open [http://localhost:3001](http://localhost:3001).

Promote an admin (SQL Editor):

```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE lower(email) = lower('you@seedfound.org')
);
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Same Supabase project as seedfound.org |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; list/edit all users |
| `OPENROUTER_API_KEY` | AI reports |
| `OPENROUTER_MODEL` | Optional; defaults to `openrouter/free` (auto free router). Avoid expired `:free` slugs. |
| `APP_ORIGIN` / `NEXT_PUBLIC_SITE_URL` | `http://localhost:3001` locally; `https://admin.seedfound.org` in prod |
| `PUBLIC_SITE_URL` | Public website origin (`http://localhost:3000` / `https://seedfound.org`) |
| `REVALIDATE_SECRET` | Same value as the public site; used to refresh `/our-stories` after publish |

## Supabase Auth redirects

In Supabase Dashboard → Authentication → URL Configuration, add:

- `http://localhost:3001/**`
- `https://admin.seedfound.org/**`

## Vercel deployment (new project)

1. Import the **same GitHub repo** as a **new** Vercel project
2. Set **Root Directory** to `apps/admin`
3. Install Command (from `apps/admin/vercel.json`): `cd ../.. && npm install`
4. Build Command: `npm run build`
5. Add all env vars above (production values)
6. Domains → add `admin.seedfound.org`
7. DNS: CNAME `admin` → `cname.vercel-dns.com` (or follow Vercel’s instructions)
8. Keep the existing marketing/career Vercel project Root Directory as `/`

Do **not** edit `is_admin` from the UI — promote/demote only via SQL or Table Editor (DB trigger blocks client self-promotion).

## Seed Report (Approve & Send)

1. Apply migration `supabase/migrations/20260729100000_assessment_analyses_publish.sql` (`supabase db push` or SQL Editor).
2. In admin → user → **AI Report**: Generate, edit any fields, **Save draft**, then **Approve & Send**.
3. The user sees a **Seed Report** card on `/career/dashboard` only while status is `approved`.
4. **Unpublish** returns the report to draft and hides it from the user.
5. Regenerating AI resets the report to draft (must approve again).

## Profile fields (v1)

Apply migration `supabase/migrations/20260730120000_profiles_v1_personal_fields.sql` before using the new profile form.

Users edit at `/career/profile`. Admins edit the same fields on the user **Profile** tab. AI Generate includes these fields in the counselor prompt when present.

## Project reports (website)

1. Apply `supabase/migrations/20260819120000_project_reports.sql` and `20260819120001_project_reports_seed.sql`.
2. Open **Reports** in the admin nav.
3. Create or edit a report, add a cover image, gallery images/videos, or a YouTube/Vimeo URL.
4. **Show on site** publishes to `/our-stories`. **Hide** keeps the report in admin only.
5. **Promote to homepage** adds it to the homepage Stories of Impact section. Removing it from the homepage does not hide it from Our Stories.
6. Apply `supabase/migrations/20260820120000_project_reports_featured.sql` for the homepage toggle.
7. Set `PUBLIC_SITE_URL` and matching `REVALIDATE_SECRET` so the public site updates immediately after publish.
