import { requireAdmin } from "@/lib/auth";
import { listReports } from "@/lib/project-reports";
import { actionCreateReport } from "@/app/actions/reports";
import { AdminShell } from "@/components/admin-shell";
import { ReportsTable } from "@/components/reports-table";
import { Button } from "@/components/ui/button";

export default async function ReportsPage() {
  const { displayName } = await requireAdmin();
  const reports = await listReports();

  return (
    <AdminShell displayName={displayName}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Project reports</h1>
          <p className="text-sm text-muted-foreground">
            Upload reports with images and videos. Visible reports appear on Our Stories. Promote a report to also show it on the homepage.
          </p>
        </div>
        <form action={actionCreateReport}>
          <Button type="submit">New report</Button>
        </form>
      </div>
      <ReportsTable reports={reports} />
    </AdminShell>
  );
}
