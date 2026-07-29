# SEED Admin Console

Next.js admin app for Career Intelligence assessments. Deployed separately at **admin.seedfound.org**.

## Features

- Sign in with Supabase email/password (requires `profiles.is_admin = true`)
- List users with assessment + AI report status
- View/edit profile (name, email, locale)
- View/edit Big Five & RIASEC answers; scores recalculate on save
- Manage saved careers; see algorithmic matches
- Generate/regenerate structured AI reports via OpenRouter (cached in `assessment_analyses`)
- Download full assessment PDF

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
| `OPENROUTER_MODEL` | Optional model id |
| `APP_ORIGIN` / `NEXT_PUBLIC_SITE_URL` | `http://localhost:3001` locally; `https://admin.seedfound.org` in prod |

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
