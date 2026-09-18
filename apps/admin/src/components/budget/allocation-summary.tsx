import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr, formatPct } from "@/lib/budget/calc";
import type { ComputedBudget } from "@/lib/budget/types";

function Bar({ label, pct, amount, className }: { label: string; pct: number; amount: number; className: string }) {
  const width = Math.min(100, Math.max(0, pct));
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span>{label}</span>
        <span className="font-medium">
          {formatPct(pct)} · {formatInr(amount)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-muted">
        <div className={`h-full ${className}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function AllocationSummary({ computed }: { computed: ComputedBudget }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Money allocation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Program work vs admin vs reserve, as a share of total budget.</p>
        <Bar label="Program work" pct={computed.programPct} amount={computed.programCost} className="bg-primary" />
        <Bar label="Admin" pct={computed.adminPct} amount={computed.adminCost} className="bg-foreground" />
        <Bar label="Reserve" pct={computed.reservePct} amount={computed.reserveCost} className="bg-muted-foreground" />
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Allocated</dt>
            <dd className="font-medium">{formatInr(computed.allocated)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{computed.overAllocated ? "Over by" : "Unallocated"}</dt>
            <dd className="font-medium">{formatInr(Math.abs(computed.unallocated))}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
