import { requireAdmin } from "@/lib/auth";
import { createChatbotAdminClient } from "@/lib/chatbot-admin";
import { isUuid } from "@/lib/chatbot-http";

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string; conversationId: string }> }) {
  await requireAdmin();
  const { userId, conversationId } = await params;
  if (!isUuid(userId) || !isUuid(conversationId)) return Response.json({ error: "Conversation not found" }, { status: 404 });

  const supabase = createChatbotAdminClient();
  const { data: conversation, error: conversationError } = await supabase.from("chatbot_conversations")
    .select("id, title, created_at, updated_at").eq("id", conversationId).eq("user_id", userId).maybeSingle();
  if (conversationError) return Response.json({ error: "Could not load conversation" }, { status: 500 });
  if (!conversation) return Response.json({ error: "Conversation not found" }, { status: 404 });

  const messages: { id: string; role: string; content: string; created_at: string }[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from("chatbot_messages")
      .select("id, role, content, created_at").eq("conversation_id", conversationId).eq("user_id", userId)
      .order("created_at", { ascending: true }).range(offset, offset + 999);
    if (error) return Response.json({ error: "Could not load messages" }, { status: 500 });
    messages.push(...data);
    if (data.length < 1000) break;
  }
  return Response.json({ conversation, messages });
}
