import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getUserDetail } from "@/lib/users";
import { AdminShell } from "@/components/admin-shell";
import { UserDetailView } from "@/components/user-detail-view";

type Props = { params: Promise<{ id: string }> };

export default async function UserPage({ params }: Props) {
  const { displayName } = await requireAdmin();
  const { id } = await params;
  const detail = await getUserDetail(id);
  if (!detail) notFound();

  return (
    <AdminShell displayName={displayName}>
      <UserDetailView detail={detail} />
    </AdminShell>
  );
}
