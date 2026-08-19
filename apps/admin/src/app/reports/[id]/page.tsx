import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getReport } from "@/lib/project-reports";
import { AdminShell } from "@/components/admin-shell";
import { ReportEditor } from "@/components/report-editor";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export default async function ReportPage({ params }: Props) {
  const { displayName } = await requireAdmin();
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();

  return (
    <AdminShell displayName={displayName}>
      <p className="mb-4 text-sm">
        <Link href="/reports" className="text-muted-foreground hover:underline">
          ← All reports
        </Link>
      </p>
      <ReportEditor key={report.id} report={report} />
    </AdminShell>
  );
}
