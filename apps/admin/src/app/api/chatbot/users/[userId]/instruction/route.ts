import { requireAdmin } from "@/lib/auth";
import { createChatbotAdminClient } from "@/lib/chatbot-admin";
import { isUuid } from "@/lib/chatbot-http";

export async function PUT(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  await requireAdmin();
  const { userId } = await params;
  if (!isUuid(userId)) return Response.json({ error: "User not found" }, { status: 404 });

  let body: { instruction?: unknown; dailyTokenLimit?: unknown; chatbotAccessEnabled?: unknown };
  try {
    body = await request.json() as { instruction?: unknown; dailyTokenLimit?: unknown; chatbotAccessEnabled?: unknown };
  } catch {
    return Response.json({ error: "Valid user settings are required" }, { status: 400 });
  }
  if (typeof body.instruction !== "string" || new TextEncoder().encode(body.instruction).byteLength > 20000) {
    return Response.json({ error: "Instructions must be text no larger than 20 KB" }, { status: 400 });
  }
  if (body.chatbotAccessEnabled !== undefined && typeof body.chatbotAccessEnabled !== "boolean") {
    return Response.json({ error: "Chat access must be enabled or disabled" }, { status: 400 });
  }
  const dailyTokenLimit = body.dailyTokenLimit ?? null;
  if (dailyTokenLimit !== null && (
    typeof dailyTokenLimit !== "number" ||
    !Number.isSafeInteger(dailyTokenLimit) ||
    dailyTokenLimit < 0 ||
    dailyTokenLimit > 10_000_000
  )) {
    return Response.json({ error: "Daily token limit must be a whole number from 0 to 10,000,000 or blank" }, { status: 400 });
  }

  const { error } = await createChatbotAdminClient().from("chatbot_user_settings").upsert({
    user_id: userId,
    instruction: body.instruction,
    daily_token_limit: dailyTokenLimit,
    ...(body.chatbotAccessEnabled !== undefined ? { chatbot_access_enabled: body.chatbotAccessEnabled } : {}),
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (error) return Response.json({ error: "Could not save user settings" }, { status: 500 });
  return Response.json({ ok: true });
}
