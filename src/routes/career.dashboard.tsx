import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2, Lock, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCareerAuth } from "@/lib/career-auth";
import { useI18n } from "@/lib/career-i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/career/dashboard")({
  component: DashboardPage,
});

type AssessRow = { type: "bigfive" | "riasec"; status: "in_progress" | "completed"; current_index: number; answers: Record<string, number> };

function DashboardPage() {
  const { user, loading } = useCareerAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [rows, setRows] = useState<AssessRow[]>([]);
  const [displayName, setDisplayName] = useState<string>("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/career/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: aRows }, { data: prof }] = await Promise.all([
        supabase.from("assessments").select("type,status,current_index,answers").eq("user_id", user.id),
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
      ]);
      setRows((aRows as AssessRow[]) ?? []);
      setDisplayName((prof?.display_name as string) ?? user.email?.split("@")[0] ?? "");
      setFetching(false);
    })();
  }, [user]);

  if (loading || !user) {
    return <div className="flex min-h-[50dvh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const bf = rows.find((r) => r.type === "bigfive");
  const ri = rows.find((r) => r.type === "riasec");
  const bothDone = bf?.status === "completed" && ri?.status === "completed";

  const bfTotal = 25;
  const riTotal = 30;
  const bfPct = bf ? Math.min(100, Math.round(((bf.status === "completed" ? bfTotal : bf.current_index) / bfTotal) * 100)) : 0;
  const riPct = ri ? Math.min(100, Math.round(((ri.status === "completed" ? riTotal : ri.current_index) / riTotal) * 100)) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{t("dash.welcome")}</p>
        <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
      </div>

      {fetching ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> {t("assess.saving")}</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <AssessmentTile
            title={t("dash.bigfive")}
            status={bf?.status}
            pct={bfPct}
            onStart={() => navigate({ to: "/career/assessment/bigfive" })}
            statusLabel={t}
          />
          <AssessmentTile
            title={t("dash.riasec")}
            status={ri?.status}
            pct={riPct}
            onStart={() => navigate({ to: "/career/assessment/riasec" })}
            statusLabel={t}
          />
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {bothDone ? <Sparkles className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                {t("dash.match")}
              </CardTitle>
              <CardDescription>{bothDone ? t("match.subtitle") : t("dash.match.locked")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={!bothDone} asChild={bothDone}>
                {bothDone ? (
                  <Link to="/career/match">{t("dash.match.unlock")} <ArrowRight className="ml-1 h-4 w-4" /></Link>
                ) : (
                  <span>{t("dash.match.locked")}</span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function AssessmentTile({
  title,
  status,
  pct,
  onStart,
  statusLabel,
}: {
  title: string;
  status: "in_progress" | "completed" | undefined;
  pct: number;
  onStart: () => void;
  statusLabel: (k: string) => string;
}) {
  const label = status === "completed" ? statusLabel("dash.status.completed") : status === "in_progress" ? statusLabel("dash.status.inprogress") : statusLabel("dash.status.notstarted");
  const ctaKey = status === "completed" ? "dash.review" : status === "in_progress" ? "dash.resume" : "dash.start";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {status === "completed" ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
          {title}
        </CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={pct} />
        <Button onClick={onStart} className="w-full" variant={status === "completed" ? "outline" : "default"}>
          {statusLabel(ctaKey)}
        </Button>
      </CardContent>
    </Card>
  );
}
