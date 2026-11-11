import { requireAdmin } from "@/lib/auth";
import { createChatbotAdminClient, csvCell, parseDateBounds } from "@/lib/chatbot-admin";
import { isUuid } from "@/lib/chatbot-http";

export async function GET(request: Request) {
  await requireAdmin();
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? "";
  const format = url.searchParams.get("format") ?? "json";
  if (!isUuid(userId)) return Response.json({ error: "A valid user is required" }, { status: 400 });
  if (format !== "json" && format !== "csv") return Response.json({ error: "Format must be json or csv" }, { status: 400 });

  let bounds: ReturnType<typeof parseDateBounds>;
  try {
    bounds = parseDateBounds(url.searchParams.get("from"), url.searchParams.get("to"));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid date range" }, { status: 400 });
  }

  const supabase = createChatbotAdminClient();
  const conversations: { id: string; user_id: string; title: string; created_at: string; updated_at: string }[] = [];
  for (let offset = 0; ; offset += 1000) {
    let conversationQuery = supabase.from("chatbot_conversations")
      .select("id, user_id, title, created_at, updated_at")
      .eq("user_id", userId).order("created_at", { ascending: true });
    if (bounds.from) conversationQuery = conversationQuery.gte("created_at", bounds.from);
    if (bounds.toExclusive) conversationQuery = conversationQuery.lt("created_at", bounds.toExclusive);
    const { data, error } = await conversationQuery.range(offset, offset + 999);
    if (error) return Response.json({ error: "Could not export conversations" }, { status: 500 });
    conversations.push(...data);
    if (data.length < 1000) break;
  }

  const ids = conversations.map((conversation) => conversation.id);
  const messages: Array<{ id: string; conversation_id: string; user_id: string; role: string; content: string; created_at: string }> = [];
  for (let idOffset = 0; idOffset < ids.length; idOffset += 100) {
    const conversationIds = ids.slice(idOffset, idOffset + 100);
    for (let offset = 0; ; offset += 1000) {
      let messageQuery = supabase.from("chatbot_messages")
        .select("id, conversation_id, user_id, role, content, created_at")
        .eq("user_id", userId).in("conversation_id", conversationIds).order("created_at", { ascending: true });
      if (bounds.from) messageQuery = messageQuery.gte("created_at", bounds.from);
      if (bounds.toExclusive) messageQuery = messageQuery.lt("created_at", bounds.toExclusive);
      const { data, error } = await messageQuery.range(offset, offset + 999);
      if (error) return Response.json({ error: "Could not export messages" }, { status: 500 });
      messages.push(...data);
      if (data.length < 1000) break;
    }
  }
  messages.sort((left, right) => left.created_at.localeCompare(right.created_at));

  if (format === "json") {
    const content = JSON.stringify({
      userId,
      dateRange: { from: url.searchParams.get("from"), to: url.searchParams.get("to") },
      conversations: conversations.map((conversation) => ({
        ...conversation,
        messages: messages.filter((message) => message.conversation_id === conversation.id),
      })),
    }, null, 2);
    return new Response(content, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="chatbot-${userId}.json"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const conversationById = new Map(conversations.map((conversation) => [conversation.id, conversation]));
  const rows = [
    ["user_id", "conversation_id", "conversation_title", "conversation_created_at", "message_id", "role", "content", "message_created_at"],
    ...messages.map((message) => {
      const conversation = conversationById.get(message.conversation_id);
      return [
        message.user_id, message.conversation_id, conversation?.title, conversation?.created_at,
        message.id, message.role, message.content, message.created_at,
      ];
    }),
  ];
  return new Response(rows.map((row) => row.map(csvCell).join(",")).join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="chatbot-${userId}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
