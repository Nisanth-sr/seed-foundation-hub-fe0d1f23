import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin-shell";
import { BudgetPlanner } from "@/components/budget/budget-planner";

export default async function BudgetPage() {
  const { displayName } = await requireAdmin();

  return (
    <AdminShell displayName={displayName}>
      <BudgetPlanner actor={displayName} />
    </AdminShell>
  );
}
