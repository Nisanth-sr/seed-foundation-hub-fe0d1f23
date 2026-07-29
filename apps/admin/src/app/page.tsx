import { requireAdmin } from "@/lib/auth";
import { listUsers } from "@/lib/users";
import { AdminShell } from "@/components/admin-shell";
import { UserTable } from "@/components/user-table";

export default async function HomePage() {
  const { displayName } = await requireAdmin();
  const users = await listUsers();

  return (
    <AdminShell displayName={displayName}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          View and manage career assessment accounts
        </p>
      </div>
      <UserTable users={users} />
    </AdminShell>
  );
}
