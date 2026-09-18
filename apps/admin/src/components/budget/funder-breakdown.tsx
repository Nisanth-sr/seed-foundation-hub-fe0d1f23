import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr, formatPct } from "@/lib/budget/calc";
import { FUNDER_RULES } from "@/lib/budget/compliance";
import { DEED_OBJECT_DETAILS } from "@/lib/budget/seed-foundation";
import { FUNDER_TYPE_LABELS, type BudgetProject, type ComputedBudget } from "@/lib/budget/types";

export function FunderBreakdown({
  project,
  computed,
}: {
  project: BudgetProject;
  computed: ComputedBudget;
}) {
  const rule = FUNDER_RULES[project.funderType];
  const overCap = computed.adminPct > rule.adminCapPct;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{FUNDER_TYPE_LABELS[project.funderType]} breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{rule.label}</p>
        <dl className="space-y-2 text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-muted-foreground">Admin cap</dt>
            <dd className="font-medium">{rule.adminCapPct}%</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-muted-foreground">Actual admin</dt>
            <dd className="font-medium">
              {formatPct(computed.adminPct)} {overCap ? "(over cap)" : "(within cap)"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-muted-foreground">Program</dt>
            <dd className="font-medium">
              {formatInr(computed.programCost)} ({formatPct(computed.programPct)})
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-muted-foreground">Reserve</dt>
            <dd className="font-medium">
              {formatInr(computed.reserveCost)} ({formatPct(computed.reservePct)})
            </dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">{rule.adminCapCitation}</p>

        {project.funderType === "csr" && project.deedObjects.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Schedule VII mapping</p>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {project.deedObjects.map((id) => (
                <li key={id}>{DEED_OBJECT_DETAILS[id].scheduleVii}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">Funder checklist</p>
          <ul className="space-y-2">
            {rule.checklist.map((item) => (
              <li key={item.id} className="rounded border border-foreground/20 p-2">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
