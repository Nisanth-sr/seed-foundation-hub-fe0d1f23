"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import type { ReportListRow } from "@/lib/project-report-shared";
import { actionSetReportFeatured, actionSetReportStatus } from "@/app/actions/reports";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ReportsTable({ reports }: { reports: ReportListRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggleVisible(id: string, next: "draft" | "published") {
    startTransition(async () => {
      const result = await actionSetReportStatus(id, next);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success(next === "published" ? "Visible on Our Stories" : "Hidden from website");
        router.refresh();
      }
    });
  }

  function toggleHomepage(id: string, featured: boolean) {
    startTransition(async () => {
      const result = await actionSetReportFeatured(id, featured);
      if (!result.ok) toast.error(result.error);
      else {
        toast.success(featured ? "Promoted to homepage" : "Removed from homepage");
        router.refresh();
      }
    });
  }

  return (
    <div className="overflow-x-auto rounded border border-foreground">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead className="border-b border-foreground bg-muted">
          <tr>
            <th className="px-3 py-2 font-semibold">Report</th>
            <th className="px-3 py-2 font-semibold">Area</th>
            <th className="px-3 py-2 font-semibold">Date</th>
            <th className="px-3 py-2 font-semibold">Our Stories</th>
            <th className="px-3 py-2 font-semibold">Homepage</th>
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
              <td className="px-3 py-2">
                {report.featuredOnHomepage && report.status === "published" ? (
                  <Badge variant="success">Promoted</Badge>
                ) : (
                  <Badge variant="muted">Off</Badge>
                )}
              </td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => toggleVisible(report.id, report.status === "published" ? "draft" : "published")}
                  >
                    {report.status === "published" ? "Hide" : "Show on site"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => toggleHomepage(report.id, !report.featuredOnHomepage)}
                  >
                    {report.featuredOnHomepage ? "Remove from homepage" : "Promote to homepage"}
                  </Button>
                </div>
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
