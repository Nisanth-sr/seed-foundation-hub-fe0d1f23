# SEED Chatbot

This is a standalone Next.js application that shares the main SEED Supabase Auth project. Users sign in with their existing email and password; each chatbot session is verified server-side with Supabase Auth. The app keeps conversations and messages private to their owner. Per-user assistant instructions and source text are available to the server and admins only.

## Requirements

- Node.js 20 or newer and npm
- Access to the SEED Supabase project
- An OpenRouter API key and a model available to that key

## Environment

Create `apps/chatbot/.env.local` from `.env.example`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Shared Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Public Supabase key used for sign-in and session cookies |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only database access; never use a `NEXT_PUBLIC_` prefix |
| `OPENROUTER_API_KEY` | Yes | Server-only OpenRouter credential |
| `OPENROUTER_MODEL` | Yes | OpenRouter model identifier |
| `NEXT_PUBLIC_CHATBOT_URL` | No | App URL sent as the OpenRouter request referrer; defaults to `http://localhost:3002` |

Set the same Supabase URL and publishable key used by the main site. Set `SUPABASE_SERVICE_ROLE_KEY` only in server environments. The OpenRouter key, model, service-role key, user's instruction, source text, and assembled system prompt are not sent to the browser.

The existing admin app also needs its normal Supabase environment variables, including `SUPABASE_SERVICE_ROLE_KEY`, to serve chatbot management APIs.

## Database migration

Apply **only** `apps/chatbot/supabase/migrations/20261112000100_chatbot.sql` to the existing Supabase project before starting the app. It creates the chatbot-specific settings, source files, conversations, messages, and activity-log tables, indexes, grants, and row-level security policies. It does not alter existing application tables.

For a manual, single-migration rollout, open the Supabase project's SQL Editor, paste the contents of that migration, and run it against the intended project. Do not run the main application's migration directory as part of chatbot setup. This project does not run migrations automatically.

## Run locally

From the repository root, install the repository dependencies if needed, then run:

```powershell
npm run dev --workspace @seed/chatbot
```

Open `http://localhost:3002`. The admin interface is available at `/chatbot` in the existing admin app (normally `http://localhost:3001/chatbot`) for an admin account.

## Deployment

Deploy this Next.js app as its own project with `apps/chatbot` as the application root, Node.js 20+, and the environment variables above. `next.config.ts` enables standalone output; `vercel.json` configures the Next.js build and output for Vercel. When deploying from the monorepo root instead, install from the repository root and use `npm run build --workspace @seed/chatbot` as the build command. Configure the chatbot's public URL in `NEXT_PUBLIC_CHATBOT_URL`.

The admin app remains a separate deployment and must have the same Supabase URL, publishable key, and service-role key. Its existing authenticated middleware protects the `/chatbot` page; each new admin API route independently calls `requireAdmin()` before reading or writing chatbot records.

## Upload limits and privacy

Only UTF-8 `.txt`, `.md`, `.csv`, and `.json` files are accepted, with a 128 KiB per-file maximum, 20-file limit, and 256 KiB combined limit per user. Uploaded text is stored in the chatbot source table and added to that user's server-built system prompt. The chat UI has no instruction or source-file controls. Every user conversation query includes the authenticated owner's ID, and database policies also scope conversation and message access to `auth.uid()`.
