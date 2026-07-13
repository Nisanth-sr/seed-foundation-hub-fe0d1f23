import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserDetail } from "@/lib/admin.server";

type Props = {
  bigFive: UserDetail["bigFive"];
};

export function AdminBigFivePanel({ bigFive }: Props) {
  const chartData = bigFive.traits.map((t) => ({ trait: t.label, score: t.score }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Big Five Personality</CardTitle>
          <CardDescription>Completed {bigFive.completedAt ? new Date(bigFive.completedAt).toLocaleString() : "—"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="trait" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {bigFive.traits.map((t) => (
          <Card key={t.key}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{t.label}</span>
                <span className="text-primary">{t.score}</span>
              </CardTitle>
              <CardDescription className="capitalize">{t.level}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
