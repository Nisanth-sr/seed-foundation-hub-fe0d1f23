import { requireAdmin } from "@/lib/auth";
import { createChatbotAdminClient } from "@/lib/chatbot-admin";
import { isUuid } from "@/lib/chatbot-http";

export async function DELETE(_request: Request, { params }: { params: Promise<{ userId: string; sourceId: string }> }) {
  await requireAdmin();
  const { userId, sourceId } = await params;
  if (!isUuid(userId) || !isUuid(sourceId)) return Response.json({ error: "Source file not found" }, { status: 404 });

  const { data, error } = await createChatbotAdminClient().from("chatbot_source_files")
    .delete().eq("id", sourceId).eq("user_id", userId).select("id").maybeSingle();
  if (error) return Response.json({ error: "Could not remove source file" }, { status: 500 });
  if (!data) return Response.json({ error: "Source file not found" }, { status: 404 });
  return Response.json({ ok: true });
}
