import "server-only";

import { createClient } from "@supabase/supabase-js";

function createSupabaseFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined);
    if (init?.headers) new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    if ((key.startsWith("sb_publishable_") || key.startsWith("sb_secret_")) && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

export function createChatbotAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase URL or service role key");
  return createClient(url, key, {
    global: { fetch: createSupabaseFetch(key) },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function parseDateBounds(from: string | null, to: string | null) {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if ((from && !datePattern.test(from)) || (to && !datePattern.test(to))) {
    throw new Error("Dates must use YYYY-MM-DD format");
  }
  const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : null;
  const toDate = to ? new Date(`${to}T00:00:00.000Z`) : null;
  if ((fromDate && Number.isNaN(fromDate.getTime())) || (toDate && Number.isNaN(toDate.getTime()))) {
    throw new Error("Invalid date range");
  }
  if ((from && fromDate?.toISOString().slice(0, 10) !== from) || (to && toDate?.toISOString().slice(0, 10) !== to)) {
    throw new Error("Invalid date range");
  }
  if (fromDate && toDate && fromDate > toDate) throw new Error("The start date must be on or before the end date");
  const toExclusive = toDate ? new Date(toDate.getTime() + 24 * 60 * 60 * 1000) : null;
  return { from: fromDate?.toISOString() ?? null, toExclusive: toExclusive?.toISOString() ?? null };
}

export function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(text.trimStart())) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
