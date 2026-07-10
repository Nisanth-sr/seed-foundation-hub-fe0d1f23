import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, ArrowLeft, RotateCcw } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useCareerAuth } from "@/lib/career-auth";
import { useI18n } from "@/lib/career-i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { hollandCode, level, type BigFiveScores, type RiasecScores } from "@/lib/career-scoring";
import type { BigFiveTrait, RiasecType } from "@/lib/career-questions";

const searchSchema = z.object({ type: z.enum(["bigfive", "riasec"]).optional() });

export const Route = createFileRoute("/career/results")({
  validateSearch: (s) => searchSchema.parse(s),
  component: ResultsPage,
});

function ResultsPage() {
  const { type } = Route.useSearch();
  const { user, loading } = useCareerAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Array<{ type: string; scores: Record<string, number> | null; status: string }>>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/career/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("assessments").select("type,scores,status").eq("user_id", user.id);
      const mapped = (data ?? []).map((r) => ({ type: r.type as string, status: r.status as string, scores: (r.scores as unknown as Record<string, number> | null) ?? null }));
      setRows(mapped);
      setFetching(false);
    })();
  }, [user]);

  if (loading || !user || fetching) {
    return <div className="flex min-h-[50dvh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const bf = rows.find((r) => r.type === "bigfive");
  const ri = rows.find((r) => r.type === "riasec");
  const activeType = type ?? (bf?.status === "completed" ? "bigfive" : ri?.status === "completed" ? "riasec" : "bigfive");

  const bfScores = (bf?.scores as unknown as BigFiveScores | null) ?? null;
  const riScores = (ri?.scores as unknown as RiasecScores | null) ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/career/dashboard"><ArrowLeft className="mr-1 h-4 w-4" /> {t("results.back")}</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant={activeType === "bigfive" ? "default" : "outline"} size="sm" onClick={() => navigate({ to: "/career/results", search: { type: "bigfive" } })}>
            {t("dash.bigfive")}
          </Button>
          <Button variant={activeType === "riasec" ? "default" : "outline"} size="sm" onClick={() => navigate({ to: "/career/results", search: { type: "riasec" } })}>
            {t("dash.riasec")}
          </Button>
        </div>
      </div>

      {activeType === "bigfive" ? (
        <BigFiveResults scores={bfScores} onRetake={() => navigate({ to: "/career/assessment/bigfive" })} />
      ) : (
        <RiasecResults scores={riScores} onRetake={() => navigate({ to: "/career/assessment/riasec" })} />
      )}
    </div>
  );
}

function BigFiveResults({ scores, onRetake }: { scores: BigFiveScores | null; onRetake: () => void }) {
  const { t } = useI18n();
  if (!scores) return <EmptyState label={t("dash.bigfive")} onRetake={onRetake} />;
  const traits: BigFiveTrait[] = ["O", "C", "E", "A", "N"];
  const data = traits.map((tr) => ({ trait: t(`results.trait.${tr}`), score: scores[tr] }));
  const strengths = traits.filter((tr) => scores[tr] >= 65).map((tr) => t(`results.trait.${tr}`));
  const growth = traits.filter((tr) => scores[tr] < 45).map((tr) => t(`results.trait.${tr}`));

  return (
    <>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">{t("results.bigfive.title")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t("landing.privacy")}</p>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="trait" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {traits.map((tr) => (
          <Card key={tr}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{t(`results.trait.${tr}`)}</span>
                <span className="text-primary">{scores[tr]}</span>
              </CardTitle>
              <CardDescription>{t(`level.${level(scores[tr])}`)}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("results.strengths")}</CardTitle></CardHeader>
          <CardContent>{strengths.length ? <ul className="list-disc pl-5 text-sm">{strengths.map((s) => <li key={s}>{s}</li>)}</ul> : <p className="text-sm text-muted-foreground">—</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{t("results.growth")}</CardTitle></CardHeader>
          <CardContent>{growth.length ? <ul className="list-disc pl-5 text-sm">{growth.map((s) => <li key={s}>{s}</li>)}</ul> : <p className="text-sm text-muted-foreground">—</p>}</CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" size="sm" onClick={onRetake}><RotateCcw className="mr-1 h-3 w-3" /> {t("results.retake")}</Button>
      </div>
    </>
  );
}

function RiasecResults({ scores, onRetake }: { scores: RiasecScores | null; onRetake: () => void }) {
  const { t } = useI18n();
  if (!scores) return <EmptyState label={t("dash.riasec")} onRetake={onRetake} />;
  const types: RiasecType[] = ["R", "I", "A", "S", "E", "C"];
  const data = types.map((ty) => ({ type: t(`results.riasec.${ty}`), score: scores[ty], key: ty }));
  const code = hollandCode(scores);

  return (
    <>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">{t("results.riasec.title")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t("landing.privacy")}</p>

      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">{t("results.hollandcode")}</p>
          <p className="mt-2 font-mono text-5xl font-bold tracking-widest text-primary">{code}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {data.map((d, i) => (
                    <Cell key={i} fill={code.includes(d.key) ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.5)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" size="sm" onClick={onRetake}><RotateCcw className="mr-1 h-3 w-3" /> {t("results.retake")}</Button>
      </div>
    </>
  );
}

function EmptyState({ label, onRetake }: { label: string; onRetake: () => void }) {
  const { t } = useI18n();
  return (
    <Card>
      <CardContent className="p-10 text-center">
        <p className="text-muted-foreground">{label} — {t("dash.status.notstarted")}</p>
        <Button className="mt-4" onClick={onRetake}>{t("dash.start")}</Button>
      </CardContent>
    </Card>
  );
}
