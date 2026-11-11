import { AdminChatbotPanel } from "@/components/admin-chatbot-panel";
import { requireAdmin } from "@/lib/auth";
import { createChatbotAdminClient } from "@/lib/chatbot-admin";
import { AdminShell } from "@/components/admin-shell";
import type { User } from "@supabase/supabase-js";

export default async function ChatbotAdminPage() {
  const { displayName } = await requireAdmin();
  const supabase = createChatbotAdminClient();
  const allUsers: User[] = [];
  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error("Could not load chatbot users");
    allUsers.push(...data.users);
    if (data.users.length < 1000) break;
    if (page === 100) throw new Error("The admin user list exceeded the supported page limit");
  }
  const users = allUsers.map((user) => ({
    id: user.id,
    email: user.email ?? user.id,
    displayName: typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : user.email ?? user.id,
  }));

  return (
    <AdminShell displayName={displayName}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Chatbot management</h1>
        <p className="text-sm text-muted-foreground">Manage private assistant context and review user conversations.</p>
      </div>
      <AdminChatbotPanel users={users} />
    </AdminShell>
  );
}
