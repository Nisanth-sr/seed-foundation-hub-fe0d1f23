import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";

const PAGE_SIZE = 30;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const requestedOffset = Number(new URL(request.url).searchParams.get("offset") ?? 0);
  if (!Number.isSafeInteger(requestedOffset) || requestedOffset < 0) {
    return Response.json({ error: "Invalid conversation offset" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.from("chatbot_conversations")
    .select("id, title, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .range(requestedOffset, requestedOffset + PAGE_SIZE);
  if (error) return Response.json({ error: "Could not load conversations" }, { status: 500 });
  return Response.json({
    conversations: data.slice(0, PAGE_SIZE),
    hasMore: data.length > PAGE_SIZE,
  });
}
