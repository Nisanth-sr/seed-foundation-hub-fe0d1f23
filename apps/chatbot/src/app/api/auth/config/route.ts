export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    return Response.json({ error: "Supabase authentication is not configured" }, { status: 500 });
  }

  return Response.json(
    { url, publishableKey },
    { headers: { "Cache-Control": "no-store" } },
  );
}
