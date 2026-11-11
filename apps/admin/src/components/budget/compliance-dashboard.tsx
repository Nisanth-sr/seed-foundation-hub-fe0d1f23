import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { overallSeverity } from "@/lib/budget/compliance";
import type { ComplianceResult, Severity } from "@/lib/budget/types";

function severityLabel(severity: Severity): string {
  if (severity === "fail") return "Fail";
  if (severity === "warn") return "Warn";
  return "Pass";
}

function severityBadge(severity: Severity) {
  if (severity === "fail") return "bg-foreground text-background";
  if (severity === "warn") return "border border-foreground bg-muted text-foreground";
  return undefined;
}

export function ComplianceDashboard({ results }: { results: ComplianceResult[] }) {
  const overall = overallSeverity(results);
  const flagged = results.filter((r) => r.severity !== "pass");
  const shown = flagged.length ? flagged : results;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Compliance dashboard</CardTitle>
        <Badge variant={overall === "pass" ? "success" : "outline"} className={severityBadge(overall)}>
          {severityLabel(overall)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {shown.map((item) => (
          <div key={item.id} className="space-y-1 rounded border border-foreground/20 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{item.title}</p>
              <Badge
                variant={item.severity === "pass" ? "success" : "outline"}
                className={severityBadge(item.severity)}
              >
                {severityLabel(item.severity)}
              </Badge>
            </div>
            <p className="text-sm">
              {item.actual} <span className="text-muted-foreground">· threshold: {item.threshold}</span>
            </p>
            <p className="text-xs text-muted-foreground">{item.citation}</p>
            {item.severity !== "pass" && <p className="text-sm">{item.remedy}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
