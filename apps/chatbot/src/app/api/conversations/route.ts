import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const conversations: { id: string; title: string; updated_at: string }[] = [];
  const admin = getSupabaseAdminClient();
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await admin.from("chatbot_conversations")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(offset, offset + 999);
    if (error) return Response.json({ error: "Could not load conversations" }, { status: 500 });
    conversations.push(...data);
    if (data.length < 1000) break;
  }
  return Response.json({ conversations });
}
