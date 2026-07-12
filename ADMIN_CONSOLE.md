# Admin Console Setup

The assessment admin console is a hidden route for viewing completed user assessments and generating AI personality analyses.

## Access URL

```
/internal/{ADMIN_CONSOLE_PATH}
```

Example (with default dev path): `http://localhost:5173/internal/x7k9-seed-admin`

Wrong slug returns 404. No links to this page exist in the public site.

## Required environment variables

| Variable | Description |
|----------|-------------|
| `ADMIN_CONSOLE_PATH` | Secret URL slug (server-side) |
| `VITE_ADMIN_CONSOLE_PATH` | Same slug (client-side route guard) |
| `ADMIN_PASSWORD` | Console login password |
| `ADMIN_SESSION_SECRET` | Random 32+ char string for signing session cookies |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS for admin reads) |
| `OPENROUTER_API_KEY` | API key from [openrouter.ai](https://openrouter.ai) |
| `OPENROUTER_MODEL` | Model ID (default: `meta-llama/llama-3.2-3b-instruct:free`) |
| `APP_ORIGIN` | Your app origin for OpenRouter referer header |

## Database migration

Apply the new migration before using AI analysis caching:

```bash
supabase db push
```

Or run `supabase/migrations/20260711140000_assessment_analyses.sql` in the Supabase SQL editor.

## Features

- Password-protected admin session (24h HTTP-only cookie)
- Lists users who completed **both** Big Five and RIASEC assessments
- User detail: scores, charts, raw answers, career matches, saved careers
- AI analysis via OpenRouter (Generate / Regenerate, cached in `assessment_analyses`)

## Security notes

- Never commit real passwords or API keys
- `SUPABASE_SERVICE_ROLE_KEY` and `OPENROUTER_API_KEY` are server-only
- All admin data flows through server functions with session validation
