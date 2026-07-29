"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2, Lock, ArrowRight, Sparkles, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCareerAuth } from "@/lib/career-auth";
import { useI18n } from "@/lib/career-i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type AssessRow = {
  type: "bigfive" | "riasec";
  status: "in_progress" | "completed";
  current_index: number;
  answers: Record<string, number>;
};

type SeedReportAnalysis = {
  summary: string;
  personalityProfile: {
    openness: string;
    conscientiousness: string;
    extraversion: string;
    agreeableness: string;
    emotionalStability: string;
  };
  behavioralPatterns: string[];
  strengths: string[];
  growthAreas: string[];
  workStyle: string;
  teamAndSocial: string;
  stressAndResilience: string;
  careerGuidance: string;
  recommendedPaths: string[];
  disclaimer: string;
};

export default function DashboardPage() {
  const { user, loading } = useCareerAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [rows, setRows] = useState<AssessRow[]>([]);
  const [displayName, setDisplayName] = useState<string>("");
  const [seedReport, setSeedReport] = useState<SeedReportAnalysis | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/career/auth");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: aRows }, { data: prof }, { data: analysisRow }] = await Promise.all([
        supabase.from("assessments").select("type,status,current_index,answers").eq("user_id", user.id),
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase
          .from("assessment_analyses")
          .select("analysis,status")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .maybeSingle(),
      ]);
      setRows((aRows as AssessRow[]) ?? []);
      setDisplayName((prof?.display_name as string) ?? user.email?.split("@")[0] ?? "");
      if (analysisRow?.analysis && typeof analysisRow.analysis === "object") {
        setSeedReport(analysisRow.analysis as unknown as SeedReportAnalysis);
      } else {
        setSeedReport(null);
      }
      setFetching(false);
    })();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const bf = rows.find((r) => r.type === "bigfive");
  const ri = rows.find((r) => r.type === "riasec");
  const bothDone = bf?.status === "completed" && ri?.status === "completed";

  const bfTotal = 25;
  const riTotal = 30;
  const bfPct = bf
    ? Math.min(100, Math.round(((bf.status === "completed" ? bfTotal : bf.current_index) / bfTotal) * 100))
    : 0;
  const riPct = ri
    ? Math.min(100, Math.round(((ri.status === "completed" ? riTotal : ri.current_index) / riTotal) * 100))
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{t("dash.welcome")}</p>
        <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
      </div>

      {fetching ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("assess.saving")}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <AssessmentTile
              title={t("dash.bigfive")}
              status={bf?.status}
              pct={bfPct}
              onStart={() => router.push("/career/assessment/bigfive")}
              statusLabel={t}
            />
            <AssessmentTile
              title={t("dash.riasec")}
              status={ri?.status}
              pct={riPct}
              onStart={() => router.push("/career/assessment/riasec")}
              statusLabel={t}
            />
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {bothDone ? (
                    <Sparkles className="h-4 w-4 text-primary" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  {t("dash.match")}
                </CardTitle>
                <CardDescription>
                  {bothDone ? t("match.subtitle") : t("dash.match.locked")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled={!bothDone} asChild={bothDone}>
                  {bothDone ? (
                    <Link href="/career/match">
                      {t("dash.match.unlock")} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  ) : (
                    <span>{t("dash.match.locked")}</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-foreground/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {seedReport ? (
                  <FileText className="h-4 w-4 text-primary" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                {t("dash.seedReport")}
              </CardTitle>
              <CardDescription>
                {seedReport ? t("dash.seedReport.open") : t("dash.seedReport.locked")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!seedReport ? (
                <p className="text-sm text-muted-foreground">{t("dash.seedReport.locked")}</p>
              ) : (
                <>
                  <Button
                    className="w-full"
                    variant={reportOpen ? "outline" : "primary"}
                    onClick={() => setReportOpen((o) => !o)}
                  >
                    {reportOpen ? t("dash.seedReport.hide") : t("dash.seedReport.open")}
                  </Button>
                  {reportOpen && <SeedReportBody analysis={seedReport} t={t} />}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function SeedReportBody({
  analysis,
  t,
}: {
  analysis: SeedReportAnalysis;
  t: (k: string) => string;
}) {
  return (
    <div className="space-y-5 border-t border-foreground/10 pt-4 text-sm">
      <section>
        <h3 className="mb-1 font-semibold">{t("dash.seedReport.summary")}</h3>
        <p className="whitespace-pre-wrap text-muted-foreground">{analysis.summary}</p>
      </section>
      <section>
        <h3 className="mb-1 font-semibold">{t("dash.seedReport.personality")}</h3>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>
            <strong>Openness:</strong> {analysis.personalityProfile.openness}
          </li>
          <li>
            <strong>Conscientiousness:</strong> {analysis.personalityProfile.conscientiousness}
          </li>
          <li>
            <strong>Extraversion:</strong> {analysis.personalityProfile.extraversion}
          </li>
          <li>
            <strong>Agreeableness:</strong> {analysis.personalityProfile.agreeableness}
          </li>
          <li>
            <strong>Emotional stability:</strong> {analysis.personalityProfile.emotionalStability}
          </li>
        </ul>
      </section>
      {analysis.behavioralPatterns?.length > 0 && (
        <section>
          <h3 className="mb-1 font-semibold">{t("dash.seedReport.behavioral")}</h3>
          <ul className="list-inside list-disc text-muted-foreground">
            {analysis.behavioralPatterns.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}
      {analysis.strengths?.length > 0 && (
        <section>
          <h3 className="mb-1 font-semibold">{t("dash.seedReport.strengths")}</h3>
          <ul className="list-inside list-disc text-muted-foreground">
            {analysis.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}
      {analysis.growthAreas?.length > 0 && (
        <section>
          <h3 className="mb-1 font-semibold">{t("dash.seedReport.growth")}</h3>
          <ul className="list-inside list-disc text-muted-foreground">
            {analysis.growthAreas.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}
      {analysis.workStyle && (
        <section>
          <h3 className="mb-1 font-semibold">{t("dash.seedReport.workStyle")}</h3>
          <p className="whitespace-pre-wrap text-muted-foreground">{analysis.workStyle}</p>
        </section>
      )}
      {analysis.teamAndSocial && (
        <section>
          <h3 className="mb-1 font-semibold">{t("dash.seedReport.team")}</h3>
          <p className="whitespace-pre-wrap text-muted-foreground">{analysis.teamAndSocial}</p>
        </section>
      )}
      {analysis.stressAndResilience && (
        <section>
          <h3 className="mb-1 font-semibold">{t("dash.seedReport.stress")}</h3>
          <p className="whitespace-pre-wrap text-muted-foreground">{analysis.stressAndResilience}</p>
        </section>
      )}
      {analysis.careerGuidance && (
        <section>
          <h3 className="mb-1 font-semibold">{t("dash.seedReport.guidance")}</h3>
          <p className="whitespace-pre-wrap text-muted-foreground">{analysis.careerGuidance}</p>
        </section>
      )}
      {analysis.recommendedPaths?.length > 0 && (
        <section>
          <h3 className="mb-1 font-semibold">{t("dash.seedReport.paths")}</h3>
          <ul className="list-inside list-disc text-muted-foreground">
            {analysis.recommendedPaths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}
      {analysis.disclaimer && (
        <p className="text-xs text-muted-foreground">{analysis.disclaimer}</p>
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
  const label =
    status === "completed"
      ? statusLabel("dash.status.completed")
      : status === "in_progress"
        ? statusLabel("dash.status.inprogress")
        : statusLabel("dash.status.notstarted");
  const ctaKey =
    status === "completed" ? "dash.review" : status === "in_progress" ? "dash.resume" : "dash.start";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {status === "completed" ? (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
          {title}
        </CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={pct} />
        <Button
          onClick={onStart}
          className="w-full"
          variant={status === "completed" ? "outline" : "primary"}
        >
          {statusLabel(ctaKey)}
        </Button>
      </CardContent>
    </Card>
  );
}
