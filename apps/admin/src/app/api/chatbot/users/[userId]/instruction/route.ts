import { requireAdmin } from "@/lib/auth";
import { createChatbotAdminClient } from "@/lib/chatbot-admin";
import { isUuid } from "@/lib/chatbot-http";

export async function PUT(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  await requireAdmin();
  const { userId } = await params;
  if (!isUuid(userId)) return Response.json({ error: "User not found" }, { status: 404 });

  let instruction: unknown;
  try {
    ({ instruction } = await request.json() as { instruction?: unknown });
  } catch {
    return Response.json({ error: "A valid instruction is required" }, { status: 400 });
  }
  if (typeof instruction !== "string" || new TextEncoder().encode(instruction).byteLength > 20000) {
    return Response.json({ error: "Instructions must be text no larger than 20 KB" }, { status: 400 });
  }

  const { error } = await createChatbotAdminClient().from("chatbot_user_settings").upsert({
    user_id: userId,
    instruction,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (error) return Response.json({ error: "Could not save instructions" }, { status: 500 });
  return Response.json({ ok: true });
}
