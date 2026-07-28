# SEED Foundation Hub

Next.js 15 (App Router) website for SEED Foundation — marketing site + career assessment app.

## Stack

- Next.js 15, React 19, TypeScript, Tailwind CSS 4
- Supabase (auth + career assessments)
- Deploy: Vercel

## Color palette

Only three colors: seed green `#8ddd30`, black `#000000`, white `#ffffff`.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example`. Key public vars:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `NEXT_PUBLIC_ADMIN_CONSOLE_PATH` | Secret slug for `/internal/[slug]` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (SEO) |

Server-only:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Admin API |
| `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` | Password admin console |
| `OPENROUTER_API_KEY` | AI career analysis |
| `APP_ORIGIN` | OpenRouter HTTP-Referer |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm start` — serve production build

## Notes

- Donation / newsletter / GA4 are UI-ready stubs until API keys are provided.
- Images: place assets under `public/images/` (logo and hero placeholders included).
- Migrating from Lovable/TanStack Start disconnects Lovable editor sync; use GitHub + Vercel.
