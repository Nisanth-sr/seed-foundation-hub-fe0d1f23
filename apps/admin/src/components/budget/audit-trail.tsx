import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditEntry } from "@/lib/budget/types";

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditTrail({ entries }: { entries: AuditEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit trail</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Changes you make are logged here with your admin name and time.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="border-b border-foreground/20 py-2 pr-3 font-medium">When</th>
                  <th className="border-b border-foreground/20 py-2 pr-3 font-medium">Who</th>
                  <th className="border-b border-foreground/20 py-2 pr-3 font-medium">Project</th>
                  <th className="border-b border-foreground/20 py-2 pr-3 font-medium">Action</th>
                  <th className="border-b border-foreground/20 py-2 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="border-b border-foreground/10 py-2 pr-3 whitespace-nowrap">{formatWhen(entry.at)}</td>
                    <td className="border-b border-foreground/10 py-2 pr-3">{entry.actor}</td>
                    <td className="border-b border-foreground/10 py-2 pr-3">{entry.projectName}</td>
                    <td className="border-b border-foreground/10 py-2 pr-3 capitalize">{entry.action}</td>
                    <td className="border-b border-foreground/10 py-2">
                      {entry.field ? (
                        <span>
                          {entry.field}
                          {entry.from || entry.to ? `: ${entry.from ?? "—"} → ${entry.to ?? "—"}` : ""}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
