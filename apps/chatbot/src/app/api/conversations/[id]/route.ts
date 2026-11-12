import { getCurrentUser } from "@/lib/auth";
import { isUuid } from "@/lib/http";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const PAGE_SIZE = 50;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: "Conversation not found" }, { status: 404 });
  const requestedOffset = Number(new URL(request.url).searchParams.get("offset") ?? 0);
  if (!Number.isSafeInteger(requestedOffset) || requestedOffset < 0) {
    return Response.json({ error: "Invalid message offset" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  const { data: conversation, error: conversationError } = await admin
    .from("chatbot_conversations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (conversationError) return Response.json({ error: "Could not load conversation" }, { status: 500 });
  if (!conversation) return Response.json({ error: "Conversation not found" }, { status: 404 });

  const { data, error } = await admin.from("chatbot_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(requestedOffset, requestedOffset + PAGE_SIZE);
  if (error) return Response.json({ error: "Could not load messages" }, { status: 500 });
  return Response.json({
    messages: data.slice(0, PAGE_SIZE).reverse(),
    hasMore: data.length > PAGE_SIZE,
  });
}
