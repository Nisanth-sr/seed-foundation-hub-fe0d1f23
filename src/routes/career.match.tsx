import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ArrowLeft, Bookmark, BookmarkCheck, TrendingUp, GraduationCap, DollarSign, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCareerAuth } from "@/lib/career-auth";
import { useI18n } from "@/lib/career-i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { matchCareers, type BigFiveScores, type RiasecScores } from "@/lib/career-scoring";

export const Route = createFileRoute("/career/match")({
  component: MatchPage,
});

function MatchPage() {
  const { user, loading } = useCareerAuth();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [bf, setBf] = useState<BigFiveScores | null>(null);
  const [ri, setRi] = useState<RiasecScores | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/career/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: rows }, { data: bookmarks }] = await Promise.all([
        supabase.from("assessments").select("type,scores,status").eq("user_id", user.id).eq("status", "completed"),
        supabase.from("saved_careers").select("career_key").eq("user_id", user.id),
      ]);
      const b = rows?.find((r) => r.type === "bigfive")?.scores as BigFiveScores | undefined;
      const r = rows?.find((r) => r.type === "riasec")?.scores as RiasecScores | undefined;
      setBf(b ?? null);
      setRi(r ?? null);
      setSaved(new Set((bookmarks ?? []).map((x) => x.career_key as string)));
      setFetching(false);
    })();
  }, [user]);

  const matches = useMemo(() => (bf && ri ? matchCareers(bf, ri, 10) : []), [bf, ri]);
  const overall = useMemo(() => (matches.length ? Math.round(matches.slice(0, 3).reduce((s, m) => s + m.score, 0) / 3) : 0), [matches]);

  if (loading || !user || fetching) {
    return <div className="flex min-h-[50dvh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (!bf || !ri) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold">{t("match.locked.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("match.locked.desc")}</p>
        <Button className="mt-6" asChild><Link to="/career/dashboard">{t("results.back")}</Link></Button>
      </div>
    );
  }

  const toggleSave = async (key: string) => {
    if (!user) return;
    if (saved.has(key)) {
      await supabase.from("saved_careers").delete().eq("user_id", user.id).eq("career_key", key);
      setSaved((s) => { const n = new Set(s); n.delete(key); return n; });
    } else {
      await supabase.from("saved_careers").insert({ user_id: user.id, career_key: key });
      setSaved((s) => new Set(s).add(key));
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/career/dashboard"><ArrowLeft className="mr-1 h-4 w-4" /> {t("results.back")}</Link>
      </Button>
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("match.title")}</h1>
        <p className="text-muted-foreground">{t("match.subtitle")}</p>
      </div>

      <Card className="mb-8 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> {t("match.compat")}
          </div>
          <div className="text-5xl font-bold text-primary">{overall}%</div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {matches.map((m, i) => (
          <Card key={m.career.key}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">#{i + 1}</span>
                    {locale === "ta" ? m.career.title_ta : m.career.title_en}
                  </CardTitle>
                  <CardDescription>{m.career.industry}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">{m.score}% match</Badge>
                  <Button variant="ghost" size="icon" onClick={() => toggleSave(m.career.key)} aria-label="Save">
                    {saved.has(m.career.key) ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={m.score} />

              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">{t("match.reason")}</p>
                <ul className="list-disc pl-5 text-sm">{m.reasons.map((r, idx) => <li key={idx}>{r}</li>)}</ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <InfoRow icon={DollarSign} label={t("match.salary")} value={locale === "ta" ? m.career.salary_ta : m.career.salary_en} />
                <InfoRow icon={TrendingUp} label={t("match.growth")} value={locale === "ta" ? m.career.growth_ta : m.career.growth_en} />
                <InfoRow icon={GraduationCap} label={t("match.education")} value={locale === "ta" ? m.career.education_ta : m.career.education_en} />
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">{t("match.skills")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(locale === "ta" ? m.career.skills_ta : m.career.skills_en).map((s) => (
                    <Badge key={s} variant="outline">{s}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 p-3">
      <Icon className="mt-0.5 h-4 w-4 text-primary" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
