"use client";

import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

export async function createSupabaseBrowserClient() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    const response = await fetch("/api/auth/config", { cache: "no-store" });
    if (!response.ok) throw new Error("Missing Supabase URL or publishable key");
    const config = (await response.json()) as { url?: unknown; publishableKey?: unknown };
    if (!url && typeof config.url === "string") url = config.url;
    if (!key && typeof config.publishableKey === "string") key = config.publishableKey;
  }

  if (!url || !key) throw new Error("Missing Supabase URL or publishable key");
  if (!client) client = createBrowserClient(url, key);
  return client;
}
