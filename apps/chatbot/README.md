# SEED Chatbot

This is a standalone Next.js application that shares the main SEED Supabase Auth project. Users sign in with their existing email and password; each chatbot session is verified server-side with Supabase Auth. The app keeps conversations and messages private to their owner. Per-user assistant instructions and source text are available to the server and admins only.

## Requirements

- Node.js 22.x and npm
- Access to the SEED Supabase project
- An OpenRouter API key and a model available to that key

## Environment

Create `apps/chatbot/.env.local` from `.env.example`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL` | Yes | Shared Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PUBLISHABLE_KEY`, or `SUPABASE_ANON_KEY` | Yes | Public Supabase key used for sign-in and session cookies |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only database access; never use a `NEXT_PUBLIC_` prefix |
| `OPENROUTER_API_KEY` | Yes | Server-only OpenRouter credential |
| `OPENROUTER_MODEL` | Yes | OpenRouter model identifier |
| `NEXT_PUBLIC_CHATBOT_URL` | No | App URL sent as the OpenRouter request referrer; defaults to `http://localhost:3002` |

Set the same Supabase URL and publishable key used by the main site. Set `SUPABASE_SERVICE_ROLE_KEY` only in server environments. The OpenRouter key, model, service-role key, user's instruction, source text, and assembled system prompt are not sent to the browser.

If your hosting dashboard does not accept `NEXT_PUBLIC_` environment variable names, set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` instead (or use `SUPABASE_ANON_KEY` for the legacy anon key). The app exposes only the Supabase URL and publishable/anon key through a public config endpoint for browser sign-in; these values are intended to be public. Never expose `SUPABASE_SERVICE_ROLE_KEY`.

The existing admin app also needs its normal Supabase environment variables, including `SUPABASE_SERVICE_ROLE_KEY`, to serve chatbot management APIs.

## Database migration

Apply only the chatbot migrations, in filename order, to the existing Supabase project before starting the app:

1. `apps/chatbot/supabase/migrations/20261112000100_chatbot.sql` creates the chatbot settings, source files, conversations, messages, activity-log tables, indexes, grants, and ownership policies.
2. `apps/chatbot/supabase/migrations/20261112000200_chatbot_daily_token_limits.sql` adds the per-user daily token limit, private usage ledger, and atomic token reservation/settlement functions.

For a manual rollout, open the Supabase project's SQL Editor and run each file in order against the intended project. Do not run the main application's migration directory as part of chatbot setup. These migrations do not alter existing application tables; the app does not run migrations automatically.

## Run locally

From the repository root, install the repository dependencies if needed, then run:

```powershell
npm run dev --workspace @seed/chatbot
```

Open `http://localhost:3002`. The admin interface is available at `/chatbot` in the existing admin app (normally `http://localhost:3001/chatbot`) for an admin account.

## Deployment

Deploy this Next.js app as its own project with `apps/chatbot` as the Vercel project root, Node.js 22.x, and the environment variables above. `next.config.ts` enables standalone output; `vercel.json` configures the Next.js build and output and disables workspace discovery during the app-root install. ESLint and its Next.js configuration are declared by the chatbot app so `next build` can run lint and type checks. When deploying from the monorepo root instead, install from the repository root and use `npm run build --workspace @seed/chatbot` as the build command. Configure the chatbot's public URL in `NEXT_PUBLIC_CHATBOT_URL`.

The admin app remains a separate deployment and must have the same Supabase URL, publishable key, and service-role key. Its existing authenticated middleware protects the `/chatbot` page; each new admin API route independently calls `requireAdmin()` before reading or writing chatbot records.

## Upload limits and privacy

Only UTF-8 `.txt`, `.md`, `.csv`, and `.json` files are accepted, with a 128 KiB per-file maximum, 20-file limit, and 256 KiB combined limit per user. Uploaded text is stored in the chatbot source table and added to that user's server-built system prompt. The chat UI has no instruction or source-file controls. Every user conversation query includes the authenticated owner's ID, and database policies also scope conversation and message access to `auth.uid()`.

Admins can set an optional per-user daily token limit in the chatbot management page. A blank limit is unlimited; zero blocks chat requests. Usage counts OpenRouter prompt and completion tokens by UTC calendar day. Requests atomically reserve an estimated prompt budget and available completion allowance so concurrent calls account for outstanding reservations. Final provider-reported usage is recorded when the stream completes; an estimate is recorded if the provider omits usage data. Conversation lists load 30 items at a time and conversation messages load 50 at a time, with controls to fetch older items.
