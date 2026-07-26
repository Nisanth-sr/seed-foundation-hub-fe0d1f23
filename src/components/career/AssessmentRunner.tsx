import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, RotateCcw, Check, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCareerAuth } from "@/lib/career-auth";
import { useI18n, type Locale } from "@/lib/career-i18n";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { scoreBigFive, scoreRiasec } from "@/lib/career-scoring";

export type AssessQuestion = { id: string; en: string; ta: string };

export function AssessmentRunner({
  type,
  title,
  intro,
  questions,
}: {
  type: "bigfive" | "riasec";
  title: string;
  intro: string;
  questions: AssessQuestion[];
}) {
  const { user, loading } = useCareerAuth();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/career/auth");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("assessments")
        .select("answers,current_index,status")
        .eq("user_id", user.id)
        .eq("type", type)
        .maybeSingle();
      if (data) {
        setAnswers((data.answers as Record<string, number>) ?? {});
        setIndex(Math.min((data.current_index as number) ?? 0, questions.length - 1));
      }
      setReady(true);
    })();
  }, [user, type, questions.length]);

  const total = questions.length;
  const answered = Object.keys(answers).length;
  const q = questions[index];
  const val = q ? answers[q.id] : undefined;

  const persist = async (nextAnswers: Record<string, number>, nextIndex: number, complete = false) => {
    if (!user) return;
    setSaving(true);
    const scores = complete ? (type === "bigfive" ? scoreBigFive(nextAnswers) : scoreRiasec(nextAnswers)) : null;
    const { error } = await supabase.from("assessments").upsert({
      user_id: user.id,
      type,
      answers: nextAnswers as unknown as never,
      current_index: nextIndex,
      status: complete ? "completed" : "in_progress",
      completed_at: complete ? new Date().toISOString() : null,
      scores: (scores ?? null) as unknown as never,
    }, { onConflict: "user_id,type" });
    setSaving(false);
    if (error) toast.error(error.message);
    else setSavedAt(Date.now());
  };

  const scheduleSave = (nextAnswers: Record<string, number>, nextIndex: number) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(nextAnswers, nextIndex), 500);
  };

  const onPick = (v: number) => {
    if (!q) return;
    const next = { ...answers, [q.id]: v };
    setAnswers(next);
    scheduleSave(next, index);
  };

  const onNext = async () => {
    if (index < total - 1) {
      const ni = index + 1;
      setIndex(ni);
      scheduleSave(answers, ni);
    } else {
      // finish
      if (answered < total) {
        toast.error(`Please answer all ${total} questions`);
        return;
      }
      await persist(answers, index, true);
      router.push(`/career/results?type=${type}`);
    }
  };

  const onPrev = () => {
    if (index === 0) return;
    const ni = index - 1;
    setIndex(ni);
    scheduleSave(answers, ni);
  };

  const onRestart = async () => {
    if (!confirm(t("assess.restart.confirm"))) return;
    setAnswers({});
    setIndex(0);
    await persist({}, 0, false);
  };

  const progressPct = useMemo(() => Math.round(((index + (val != null ? 1 : 0)) / total) * 100), [index, val, total]);

  if (loading || !user || !ready) {
    return <div className="flex min-h-[50dvh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{intro}</p>
      </div>

      <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("assess.progress", { current: index + 1, total })}</span>
        <span className="flex items-center gap-1">
          {saving ? (
            <><Loader2 className="h-3 w-3 animate-spin" /> {t("assess.saving")}</>
          ) : savedAt ? (
            <><Check className="h-3 w-3" /> {t("assess.saved")}</>
          ) : (
            <><Save className="h-3 w-3" /> Auto-save</>
          )}
        </span>
      </div>
      <Progress value={progressPct} className="mb-8" />

      {q && (
        <Card className="mb-6">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <p className="text-lg font-medium leading-relaxed">{(q as never as Record<Locale, string>)[locale]}</p>
            <div className="grid gap-2 sm:grid-cols-5">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => onPick(v)}
                  className={cn(
                    "rounded-lg border px-3 py-4 text-center text-sm transition-all",
                    val === v
                      ? "border-primary bg-primary text-primary-foreground shadow"
                      : "border-border bg-background hover:border-primary/40 hover:bg-muted",
                  )}
                >
                  <div className="text-lg font-bold">{v}</div>
                  <div className={cn("mt-1 text-xs", val === v ? "opacity-90" : "text-muted-foreground")}>
                    {t(`assess.scale.${v}`)}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" onClick={onPrev} disabled={index === 0}>
          <ArrowLeft className="mr-1 h-4 w-4" /> {t("assess.prev")}
        </Button>
        <Button variant="ghost" size="sm" onClick={onRestart}>
          <RotateCcw className="mr-1 h-3 w-3" /> {t("assess.restart")}
        </Button>
        <Button onClick={onNext} disabled={val == null}>
          {index === total - 1 ? t("assess.finish") : t("assess.next")} <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
