import { requireAdmin } from "@/lib/auth";
import { createChatbotAdminClient, parseDateBounds } from "@/lib/chatbot-admin";
import { isUuid } from "@/lib/chatbot-http";

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  await requireAdmin();
  const { userId } = await params;
  if (!isUuid(userId)) return Response.json({ error: "User not found" }, { status: 404 });

  let bounds: ReturnType<typeof parseDateBounds>;
  try {
    const url = new URL(request.url);
    bounds = parseDateBounds(url.searchParams.get("from"), url.searchParams.get("to"));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid date range" }, { status: 400 });
  }

  const supabase = createChatbotAdminClient();
  const usageDate = new Date().toISOString().slice(0, 10);
  const [settingsResult, sourcesResult, usageResult] = await Promise.all([
    supabase.from("chatbot_user_settings").select("instruction, daily_token_limit").eq("user_id", userId).maybeSingle(),
    supabase.from("chatbot_source_files").select("id, file_name, mime_type, byte_size, created_at")
      .eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("chatbot_daily_token_usage").select("used_tokens, reserved_tokens")
      .eq("user_id", userId).eq("usage_date", usageDate).maybeSingle(),
  ]);
  if (settingsResult.error || sourcesResult.error || usageResult.error) {
    return Response.json({ error: "Could not load chatbot data" }, { status: 500 });
  }
  const conversations: { id: string; title: string; created_at: string; updated_at: string }[] = [];
  for (let offset = 0; ; offset += 1000) {
    let query = supabase.from("chatbot_conversations").select("id, title, created_at, updated_at")
      .eq("user_id", userId).order("updated_at", { ascending: false });
    if (bounds.from) query = query.gte("created_at", bounds.from);
    if (bounds.toExclusive) query = query.lt("created_at", bounds.toExclusive);
    const { data, error } = await query.range(offset, offset + 999);
    if (error) return Response.json({ error: "Could not load chatbot conversations" }, { status: 500 });
    conversations.push(...data);
    if (data.length < 1000) break;
  }
  return Response.json({
    instruction: settingsResult.data?.instruction ?? "",
    dailyTokenLimit: settingsResult.data?.daily_token_limit ?? null,
    tokenUsage: {
      used: Number(usageResult.data?.used_tokens ?? 0),
      reserved: Number(usageResult.data?.reserved_tokens ?? 0),
      date: usageDate,
    },
    sources: sourcesResult.data,
    conversations,
  });
}
