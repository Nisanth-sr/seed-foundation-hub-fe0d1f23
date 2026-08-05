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
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (SEO) |

Server-only:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (bypasses RLS; use only on the server) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email for Sheets append |
| `GOOGLE_PRIVATE_KEY` | Service account private key (escape newlines as `\n`) |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Target spreadsheet ID from the sheet URL |
| `GOOGLE_SHEETS_TAB_NAME` | Worksheet name (default `Feedback`) |

### Feedback form → Google Sheets

Public page: `/feedback` (no login). Submissions POST to `/api/feedback` and append a row.

1. In Google Cloud Console, create a project (or use an existing one) and enable **Google Sheets API**.
2. Create a **service account**, download the JSON key, and copy `client_email` + `private_key` into `.env.local` / Vercel env vars.
3. Create a Google Sheet with a tab named `Feedback` (or match `GOOGLE_SHEETS_TAB_NAME`) and this header row in `A1:F1`:

   `Timestamp | Name | Email | Contact | Category | Feedback`

4. Share the sheet with the service account email as **Editor**.
5. Copy the spreadsheet ID from the URL (`https://docs.google.com/spreadsheets/d/<ID>/edit`) into `GOOGLE_SHEETS_SPREADSHEET_ID`.

## Scripts

- `npm run dev` / `npm run dev:web` — marketing + career site (port 3000)
- `npm run dev:admin` — admin console at [apps/admin](apps/admin) (port 3001)
- `npm run build` / `npm run build:admin` — production builds
- `npm start` — serve production build

## Admin console

Separate Next.js app in `apps/admin`, intended for **admin.seedfound.org** (own Vercel project, Root Directory `apps/admin`). See [apps/admin/README.md](apps/admin/README.md).

## Notes

- Donation / newsletter / GA4 are UI-ready stubs until API keys are provided.
- Images: place assets under `public/images/` (logo and hero placeholders included).
- Migrating from Lovable/TanStack Start disconnects Lovable editor sync; use GitHub + Vercel.
