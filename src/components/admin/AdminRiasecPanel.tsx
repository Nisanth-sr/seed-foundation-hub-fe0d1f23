import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserDetail } from "@/lib/admin.server";

const RIASEC_LABELS: Record<string, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

type Props = {
  riasec: UserDetail["riasec"];
};

export function AdminRiasecPanel({ riasec }: Props) {
  const code = riasec.hollandCode;
  const chartData = riasec.types.map((t) => ({
    type: RIASEC_LABELS[t.key] ?? t.key,
    score: t.score,
    key: t.key,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Holland Code</p>
          <p className="mt-2 font-mono text-5xl font-bold tracking-widest text-primary">{code}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RIASEC Interests</CardTitle>
          <CardDescription>Completed {riasec.completedAt ? new Date(riasec.completedAt).toLocaleString() : "—"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="type" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={code.includes(d.key) ? "var(--primary)" : "color-mix(in oklab, var(--muted-foreground) 50%, transparent)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
