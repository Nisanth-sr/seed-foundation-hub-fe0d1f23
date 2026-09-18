import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInrPrecise } from "@/lib/budget/calc";
import type { ComputedBudget } from "@/lib/budget/types";

export function PerBeneficiaryCard({
  computed,
  beneficiaries,
}: {
  computed: ComputedBudget;
  beneficiaries: number;
}) {
  const rows = [
    ["Total budget", computed.perBeneficiary.total],
    ["Program work", computed.perBeneficiary.program],
    ["Trainers", computed.perBeneficiary.trainer],
    ["Materials", computed.perBeneficiary.material],
    ["Travel", computed.perBeneficiary.travel],
    ["Admin", computed.perBeneficiary.admin],
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Per-beneficiary cost</CardTitle>
      </CardHeader>
      <CardContent>
        {beneficiaries <= 0 ? (
          <p className="text-sm text-muted-foreground">Enter the number of beneficiaries to calculate cost per head.</p>
        ) : (
          <dl className="space-y-2 text-sm">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{formatInrPrecise(value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
