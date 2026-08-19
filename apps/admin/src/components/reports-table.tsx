"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import type { ReportListRow } from "@/lib/project-report-shared";
import { actionSetReportStatus } from "@/app/actions/reports";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ReportsTable({ reports }: { reports: ReportListRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle(id: string, next: "draft" | "published") {
    startTransition(async () => {
      const result = await actionSetReportStatus(id, next);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success(next === "published" ? "Visible on website" : "Hidden from website");
        router.refresh();
      }
    });
  }

  return (
    <div className="overflow-x-auto rounded border border-foreground">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-foreground bg-muted">
          <tr>
            <th className="px-3 py-2 font-semibold">Report</th>
            <th className="px-3 py-2 font-semibold">Area</th>
            <th className="px-3 py-2 font-semibold">Date</th>
            <th className="px-3 py-2 font-semibold">Website</th>
            <th className="px-3 py-2 font-semibold">Updated</th>
            <th className="px-3 py-2 font-semibold"> </th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} className="border-b border-foreground/15 hover:bg-muted/60">
              <td className="px-3 py-2">
                <Link href={`/reports/${report.id}`} className="font-medium underline-offset-2 hover:underline">
                  {report.title}
                </Link>
                <p className="text-xs text-muted-foreground">/{report.slug}</p>
              </td>
              <td className="px-3 py-2">{report.category}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {report.eventDate ? new Date(`${report.eventDate}T00:00:00`).toLocaleDateString() : "—"}
              </td>
              <td className="px-3 py-2">
                {report.status === "published" ? (
                  <Badge variant="success">Visible</Badge>
                ) : (
                  <Badge variant="muted">Hidden</Badge>
                )}
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {new Date(report.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-3 py-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => toggle(report.id, report.status === "published" ? "draft" : "published")}
                >
                  {report.status === "published" ? "Hide" : "Show on site"}
                </Button>
              </td>
            </tr>
          ))}
          {reports.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                No reports yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
