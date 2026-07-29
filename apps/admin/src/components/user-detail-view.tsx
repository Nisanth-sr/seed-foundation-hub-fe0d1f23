"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BIG_FIVE_QUESTIONS,
  RIASEC_QUESTIONS,
  CAREERS,
  level,
  type BigFiveTrait,
  type RiasecType,
} from "@seed/career-core";
import type { UserDetail } from "@/lib/users";
import {
  actionGenerateAnalysis,
  actionSetSavedCareers,
  actionUpdateAssessment,
  actionUpdateProfile,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TRAIT_LABELS: Record<BigFiveTrait, string> = {
  O: "Openness",
  C: "Conscientiousness",
  E: "Extraversion",
  A: "Agreeableness",
  N: "Emotional Stability",
};

const RIASEC_LABELS: Record<RiasecType, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

export function UserDetailView({ detail: initial }: { detail: UserDetail }) {
  const [detail, setDetail] = useState(initial);
  const [pending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState(detail.displayName);
  const [locale, setLocale] = useState(detail.locale);
  const [email, setEmail] = useState(detail.email);
  const [bfAnswers, setBfAnswers] = useState({ ...detail.bigFive.answers });
  const [riAnswers, setRiAnswers] = useState({ ...detail.riasec.answers });
  const [savedKeys, setSavedKeys] = useState(detail.savedCareers.map((s) => s.careerKey));

  function saveProfile() {
    startTransition(async () => {
      try {
        await actionUpdateProfile(detail.id, { displayName, locale, email });
        setDetail((d) => ({ ...d, displayName, locale, email }));
        toast.success("Profile updated");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Update failed");
      }
    });
  }

  function saveAssessment(type: "bigfive" | "riasec") {
    startTransition(async () => {
      try {
        const raw = type === "bigfive" ? bfAnswers : riAnswers;
        const answers = Object.fromEntries(
          Object.entries(raw).filter(([, v]) => typeof v === "number" && v >= 1 && v <= 5),
        );
        const { scores } = await actionUpdateAssessment(detail.id, type, answers);
        setDetail((d) => ({
          ...d,
          [type === "bigfive" ? "bigFive" : "riasec"]: {
            ...(type === "bigfive" ? d.bigFive : d.riasec),
            answers,
            scores,
            status: "completed",
            completedAt: new Date().toISOString(),
          },
          hollandCode:
            type === "riasec"
              ? Object.entries(scores as Record<string, number>)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([k]) => k)
                  .join("")
              : d.hollandCode,
        }));
        toast.success(`${type === "bigfive" ? "Big Five" : "RIASEC"} saved & rescored`);
        // Soft full reload for matches
        window.location.reload();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  function saveCareers() {
    startTransition(async () => {
      try {
        await actionSetSavedCareers(detail.id, savedKeys);
        toast.success("Saved careers updated");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  function generateAi() {
    startTransition(async () => {
      try {
        // #region agent log
        fetch("http://127.0.0.1:7279/ingest/aa5631d9-35e0-4360-9d46-3bef15f7d91f", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fa1da9" },
          body: JSON.stringify({
            sessionId: "fa1da9",
            runId: "ai-gen-1",
            hypothesisId: "E",
            location: "user-detail-view.tsx:generateAi",
            message: "client generate click",
            data: {
              userIdPrefix: detail.id.slice(0, 8),
              hasBf: Boolean(detail.bigFive.scores),
              hasRi: Boolean(detail.riasec.scores),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        const result = await actionGenerateAnalysis(detail.id);
        if (!result.ok) {
          // #region agent log
          fetch("http://127.0.0.1:7279/ingest/aa5631d9-35e0-4360-9d46-3bef15f7d91f", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fa1da9" },
            body: JSON.stringify({
              sessionId: "fa1da9",
              runId: "post-fix",
              hypothesisId: "B",
              location: "user-detail-view.tsx:generateAi",
              message: "action returned error",
              data: { error: result.error.slice(0, 400) },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
          toast.error(result.error);
          return;
        }
        const { analysis, model } = result;
        setDetail((d) => ({
          ...d,
          analysis: {
            model,
            promptVersion: "v1",
            analysis,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }));
        // #region agent log
        fetch("http://127.0.0.1:7279/ingest/aa5631d9-35e0-4360-9d46-3bef15f7d91f", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fa1da9" },
          body: JSON.stringify({
            sessionId: "fa1da9",
            runId: "post-fix",
            hypothesisId: "B",
            location: "user-detail-view.tsx:generateAi",
            message: "generate success",
            data: { model, hasSummary: Boolean(analysis.summary) },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        toast.success("AI report generated");
      } catch (e) {
        // #region agent log
        fetch("http://127.0.0.1:7279/ingest/aa5631d9-35e0-4360-9d46-3bef15f7d91f", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fa1da9" },
          body: JSON.stringify({
            sessionId: "fa1da9",
            runId: "ai-gen-1",
            hypothesisId: "E",
            location: "user-detail-view.tsx:generateAi",
            message: "client caught error",
            data: {
              name: e instanceof Error ? e.name : typeof e,
              message: e instanceof Error ? e.message.slice(0, 400) : String(e).slice(0, 400),
              digest:
                e && typeof e === "object" && "digest" in e
                  ? String((e as { digest?: unknown }).digest)
                  : null,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        toast.error(e instanceof Error ? e.message : "Generation failed");
      }
    });
  }

  const careerOptions = useMemo(() => CAREERS, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 px-0">
            <Link href="/">← Back to users</Link>
          </Button>
          <h1 className="text-2xl font-semibold">{detail.displayName}</h1>
          <p className="text-sm text-muted-foreground">{detail.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">Locale: {detail.locale}</Badge>
            {detail.hollandCode && (
              <Badge variant="outline" className="font-mono">
                Holland: {detail.hollandCode}
              </Badge>
            )}
          </div>
        </div>
        <Button asChild variant="outline">
          <a href={`/api/pdf/${detail.id}`} download>
            Download PDF
          </a>
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="bigfive">Big Five</TabsTrigger>
          <TabsTrigger value="riasec">RIASEC</TabsTrigger>
          <TabsTrigger value="careers">Careers</TabsTrigger>
          <TabsTrigger value="ai">AI Report</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Edit profile</CardTitle>
            </CardHeader>
            <CardContent className="grid max-w-xl gap-4">
              <div className="space-y-2">
                <Label>Display name</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Locale</Label>
                <Input value={locale} onChange={(e) => setLocale(e.target.value)} placeholder="en | ta" />
              </div>
              <p className="text-xs text-muted-foreground">
                Joined {new Date(detail.createdAt).toLocaleString()}
                {detail.lastSignInAt
                  ? ` · Last sign-in ${new Date(detail.lastSignInAt).toLocaleString()}`
                  : ""}
              </p>
              <Button onClick={saveProfile} disabled={pending}>
                Save profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bigfive">
          <AssessmentEditor
            title="Big Five"
            scores={detail.bigFive.scores as Record<string, number> | null}
            scoreLabels={TRAIT_LABELS}
            questions={BIG_FIVE_QUESTIONS.map((q) => ({ id: q.id, label: q.en, group: q.trait }))}
            answers={bfAnswers}
            onChange={(id, val) => setBfAnswers((a) => ({ ...a, [id]: val }))}
            onSave={() => saveAssessment("bigfive")}
            pending={pending}
            status={detail.bigFive.status}
          />
        </TabsContent>

        <TabsContent value="riasec">
          <AssessmentEditor
            title="RIASEC"
            scores={detail.riasec.scores as Record<string, number> | null}
            scoreLabels={RIASEC_LABELS}
            questions={RIASEC_QUESTIONS.map((q) => ({ id: q.id, label: q.en, group: q.type }))}
            answers={riAnswers}
            onChange={(id, val) => setRiAnswers((a) => ({ ...a, [id]: val }))}
            onSave={() => saveAssessment("riasec")}
            pending={pending}
            status={detail.riasec.status}
          />
        </TabsContent>

        <TabsContent value="careers">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Algorithmic matches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {detail.careerMatches.length === 0 && (
                  <p className="text-sm text-muted-foreground">Complete both assessments for matches.</p>
                )}
                {detail.careerMatches.map((m) => (
                  <div key={m.career.key} className="border-b border-foreground/10 py-2 text-sm">
                    <div className="flex justify-between gap-2 font-medium">
                      <span>{m.career.title_en}</span>
                      <span>{m.score}%</span>
                    </div>
                    <p className="text-muted-foreground">{m.reasons.join(" · ")}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Saved careers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {careerOptions.map((c) => {
                    const checked = savedKeys.includes(c.key);
                    return (
                      <label key={c.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSavedKeys((keys) =>
                              checked ? keys.filter((k) => k !== c.key) : [...keys, c.key],
                            )
                          }
                        />
                        {c.title_en}
                      </label>
                    );
                  })}
                </div>
                <Button onClick={saveCareers} disabled={pending}>
                  Save careers
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>AI analysis</CardTitle>
                {detail.analysis && (
                  <p className="text-xs text-muted-foreground">
                    {detail.analysis.model} · updated{" "}
                    {new Date(detail.analysis.updatedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <Button onClick={generateAi} disabled={pending}>
                {detail.analysis ? "Regenerate" : "Generate"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {!detail.analysis && (
                <p className="text-muted-foreground">
                  No report yet. Requires completed Big Five and RIASEC scores.
                </p>
              )}
              {detail.analysis && (
                <>
                  <section>
                    <h3 className="mb-1 font-semibold">Summary</h3>
                    <p className="whitespace-pre-wrap">{detail.analysis.analysis.summary}</p>
                  </section>
                  <section>
                    <h3 className="mb-1 font-semibold">Personality</h3>
                    <ul className="list-inside list-disc space-y-1">
                      {Object.entries(detail.analysis.analysis.personalityProfile).map(([k, v]) => (
                        <li key={k}>
                          <strong>{k}:</strong> {v}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="mb-1 font-semibold">Strengths</h3>
                    <ul className="list-inside list-disc">
                      {detail.analysis.analysis.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="mb-1 font-semibold">Growth areas</h3>
                    <ul className="list-inside list-disc">
                      {detail.analysis.analysis.growthAreas.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="mb-1 font-semibold">Career guidance</h3>
                    <p className="whitespace-pre-wrap">{detail.analysis.analysis.careerGuidance}</p>
                  </section>
                  <section>
                    <h3 className="mb-1 font-semibold">Recommended paths</h3>
                    <ul className="list-inside list-disc">
                      {detail.analysis.analysis.recommendedPaths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="mb-1 font-semibold">Counselor notes</h3>
                    <p className="whitespace-pre-wrap">{detail.analysis.analysis.counselorNotes}</p>
                  </section>
                  <p className="text-xs text-muted-foreground">{detail.analysis.analysis.disclaimer}</p>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssessmentEditor({
  title,
  scores,
  scoreLabels,
  questions,
  answers,
  onChange,
  onSave,
  pending,
  status,
}: {
  title: string;
  scores: Record<string, number> | null;
  scoreLabels: Record<string, string>;
  questions: { id: string; label: string; group: string }[];
  answers: Record<string, number>;
  onChange: (id: string, val: number) => void;
  onSave: () => void;
  pending: boolean;
  status: string | null;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Badge variant={status === "completed" ? "success" : "muted"}>{status ?? "none"}</Badge>
          {!scores && <p className="text-muted-foreground">No scores yet</p>}
          {scores &&
            Object.entries(scores).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span>{scoreLabels[k] ?? k}</span>
                <span className="font-mono">
                  {v} ({level(v)})
                </span>
              </div>
            ))}
          <Button className="mt-4 w-full" onClick={onSave} disabled={pending}>
            Save & rescore {title}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Answers (1–5)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="grid gap-1 border-b border-foreground/10 pb-2 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm">{q.label}</p>
                <p className="text-xs text-muted-foreground">
                  {q.id} · {q.group}
                </p>
              </div>
              <Input
                type="number"
                min={1}
                max={5}
                className="w-20"
                value={answers[q.id] ?? ""}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (n >= 1 && n <= 5) onChange(q.id, n);
                  else if (e.target.value === "") onChange(q.id, 0);
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
