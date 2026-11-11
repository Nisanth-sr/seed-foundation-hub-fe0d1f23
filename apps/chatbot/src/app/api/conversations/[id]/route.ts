import { getCurrentUser } from "@/lib/auth";
import { isUuid } from "@/lib/http";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: "Conversation not found" }, { status: 404 });

  const admin = getSupabaseAdminClient();
  const { data: conversation, error: conversationError } = await admin
    .from("chatbot_conversations")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (conversationError) return Response.json({ error: "Could not load conversation" }, { status: 500 });
  if (!conversation) return Response.json({ error: "Conversation not found" }, { status: 404 });

  const messages: { id: string; role: string; content: string; created_at: string }[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await admin.from("chatbot_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .range(offset, offset + 999);
    if (error) return Response.json({ error: "Could not load messages" }, { status: 500 });
    messages.push(...data);
    if (data.length < 1000) break;
  }
  return Response.json({ messages });
}
