import { requireAdmin } from "@/lib/auth";
import { createChatbotAdminClient } from "@/lib/chatbot-admin";

const PAGE_SIZE = 1000;
const CONVERSATION_BATCH_SIZE = 100;

type ExportConversation = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type ExportMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string;
  content: string;
  created_at: string;
};

export async function GET() {
  await requireAdmin();
  const supabase = createChatbotAdminClient();
  const conversations: ExportConversation[] = [];
  const seenConversationIds = new Set<string>();

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase.from("chatbot_conversations")
      .select("id, user_id, title, created_at, updated_at")
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) return Response.json({ error: "Could not export conversations" }, { status: 500 });
    if (data.some((conversation) => seenConversationIds.has(conversation.id))) {
      return Response.json({ error: "Conversation pagination returned duplicate records" }, { status: 500 });
    }
    data.forEach((conversation) => seenConversationIds.add(conversation.id));
    conversations.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  const messagesByConversation = new Map<string, ExportMessage[]>();
  const conversationIds = conversations.map((conversation) => conversation.id);
  for (let idOffset = 0; idOffset < conversationIds.length; idOffset += CONVERSATION_BATCH_SIZE) {
    const batch = conversationIds.slice(idOffset, idOffset + CONVERSATION_BATCH_SIZE);
    const seenMessageIds = new Set<string>();
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await supabase.from("chatbot_messages")
        .select("id, conversation_id, user_id, role, content, created_at")
        .in("conversation_id", batch)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);
      if (error) return Response.json({ error: "Could not export messages" }, { status: 500 });
      if (data.some((message) => seenMessageIds.has(message.id))) {
        return Response.json({ error: "Message pagination returned duplicate records" }, { status: 500 });
      }
      data.forEach((message) => {
        seenMessageIds.add(message.id);
        const messages = messagesByConversation.get(message.conversation_id) ?? [];
        messages.push(message);
        messagesByConversation.set(message.conversation_id, messages);
      });
      if (data.length < PAGE_SIZE) break;
    }
  }

  const content = JSON.stringify({
    exportedAt: new Date().toISOString(),
    conversations: conversations.map((conversation) => ({
      ...conversation,
      messages: messagesByConversation.get(conversation.id) ?? [],
    })),
  }, null, 2);

  return new Response(content, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="chatbot-all-conversations.json"',
      "Cache-Control": "no-store",
    },
  });
}
