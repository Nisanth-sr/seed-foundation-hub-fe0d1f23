"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BIG_FIVE_QUESTIONS,
  RIASEC_QUESTIONS,
  CAREERS,
  AGE_RANGES,
  AGE_RANGE_LABELS,
  CURRENT_STATUSES,
  CURRENT_STATUS_LABELS,
  EDUCATION_LEVELS,
  EDUCATION_LEVEL_LABELS,
  level,
  parseLanguagesInput,
  type AgeRange,
  type BigFiveTrait,
  type CurrentStatus,
  type EducationLevel,
  type RiasecType,
} from "@seed/career-core";
import type { UserDetail } from "@/lib/users";
import type { AnalysisResult } from "@/lib/analysis-prompt";
import {
  actionApproveAnalysis,
  actionGenerateAnalysis,
  actionSaveAnalysisDraft,
  actionSetSavedCareers,
  actionUnpublishAnalysis,
  actionUpdateAssessment,
  actionUpdateProfile,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

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
  const [phone, setPhone] = useState(detail.phone ?? "");
  const [ageRange, setAgeRange] = useState<AgeRange | "">(detail.ageRange ?? "");
  const [city, setCity] = useState(detail.city ?? "");
  const [state, setState] = useState(detail.state ?? "");
  const [educationLevel, setEducationLevel] = useState<EducationLevel | "">(detail.educationLevel ?? "");
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus | "">(detail.currentStatus ?? "");
  const [schoolOrCollege, setSchoolOrCollege] = useState(detail.schoolOrCollege ?? "");
  const [languagesRaw, setLanguagesRaw] = useState(detail.languagesSpoken.join(", "));
  const [bfAnswers, setBfAnswers] = useState({ ...detail.bigFive.answers });
  const [riAnswers, setRiAnswers] = useState({ ...detail.riasec.answers });
  const [savedKeys, setSavedKeys] = useState(detail.savedCareers.map((s) => s.careerKey));
  const [draftAnalysis, setDraftAnalysis] = useState<AnalysisResult | null>(
    detail.analysis?.analysis ?? null,
  );
  const [analysisMeta, setAnalysisMeta] = useState(
    detail.analysis
      ? {
          model: detail.analysis.model,
          status: detail.analysis.status,
          approvedAt: detail.analysis.approvedAt,
          updatedAt: detail.analysis.updatedAt,
        }
      : null,
  );

  function patchAnalysis(patch: Partial<AnalysisResult>) {
    setDraftAnalysis((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function patchPersonality(key: keyof AnalysisResult["personalityProfile"], value: string) {
    setDraftAnalysis((prev) =>
      prev
        ? { ...prev, personalityProfile: { ...prev.personalityProfile, [key]: value } }
        : prev,
    );
  }

  function saveProfile() {
    startTransition(async () => {
      try {
        const languagesSpoken = parseLanguagesInput(languagesRaw);
        await actionUpdateProfile(detail.id, {
          displayName,
          locale,
          email,
          phone: phone.trim() || null,
          ageRange: ageRange || null,
          city: city.trim() || null,
          state: state.trim() || null,
          educationLevel: educationLevel || null,
          currentStatus: currentStatus || null,
          schoolOrCollege: schoolOrCollege.trim() || null,
          languagesSpoken,
        });
        setDetail((d) => ({
          ...d,
          displayName,
          locale,
          email,
          phone: phone.trim() || null,
          ageRange: ageRange || null,
          city: city.trim() || null,
          state: state.trim() || null,
          educationLevel: educationLevel || null,
          currentStatus: currentStatus || null,
          schoolOrCollege: schoolOrCollege.trim() || null,
          languagesSpoken,
        }));
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
        const result = await actionGenerateAnalysis(detail.id);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        const { analysis, model } = result;
        setDraftAnalysis(analysis);
        setAnalysisMeta({
          model,
          status: "draft",
          approvedAt: null,
          updatedAt: new Date().toISOString(),
        });
        setDetail((d) => ({
          ...d,
          analysis: {
            model,
            promptVersion: "v1",
            analysis,
            status: "draft",
            approvedAt: null,
            approvedBy: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }));
        toast.success("AI report generated (draft)");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Generation failed");
      }
    });
  }

  function saveDraft() {
    if (!draftAnalysis) return;
    startTransition(async () => {
      const result = await actionSaveAnalysisDraft(detail.id, draftAnalysis);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setAnalysisMeta((m) => (m ? { ...m, status: "draft", approvedAt: null } : m));
      toast.success("Draft saved");
    });
  }

  function approveAndSend() {
    if (!draftAnalysis) return;
    startTransition(async () => {
      const result = await actionApproveAnalysis(detail.id, draftAnalysis);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const now = new Date().toISOString();
      setAnalysisMeta((m) => (m ? { ...m, status: "approved", approvedAt: now } : m));
      toast.success("Approved & sent — user can see Seed Report");
    });
  }

  function unpublish() {
    startTransition(async () => {
      const result = await actionUnpublishAnalysis(detail.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setAnalysisMeta((m) => (m ? { ...m, status: "draft", approvedAt: null } : m));
      toast.success("Unpublished — hidden from user");
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
            <CardContent className="grid max-w-2xl gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Display name</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" />
              </div>
              <div className="space-y-2">
                <Label>Locale</Label>
                <Input value={locale} onChange={(e) => setLocale(e.target.value)} placeholder="en | ta" />
              </div>
              <div className="space-y-2">
                <Label>Age range</Label>
                <select
                  className={selectClassName}
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value as AgeRange | "")}
                >
                  <option value="">—</option>
                  {AGE_RANGES.map((v) => (
                    <option key={v} value={v}>
                      {AGE_RANGE_LABELS[v]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Current status</Label>
                <select
                  className={selectClassName}
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as CurrentStatus | "")}
                >
                  <option value="">—</option>
                  {CURRENT_STATUSES.map((v) => (
                    <option key={v} value={v}>
                      {CURRENT_STATUS_LABELS[v]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Education level</Label>
                <select
                  className={selectClassName}
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value as EducationLevel | "")}
                >
                  <option value="">—</option>
                  {EDUCATION_LEVELS.map((v) => (
                    <option key={v} value={v}>
                      {EDUCATION_LEVEL_LABELS[v]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>School / college</Label>
                <Input value={schoolOrCollege} onChange={(e) => setSchoolOrCollege(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Languages spoken</Label>
                <Input
                  value={languagesRaw}
                  onChange={(e) => setLanguagesRaw(e.target.value)}
                  placeholder="Tamil, English, Hindi"
                />
                <p className="text-xs text-muted-foreground">Comma-separated</p>
              </div>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Joined {new Date(detail.createdAt).toLocaleString()}
                {detail.lastSignInAt
                  ? ` · Last sign-in ${new Date(detail.lastSignInAt).toLocaleString()}`
                  : ""}
              </p>
              <div className="sm:col-span-2">
                <Button onClick={saveProfile} disabled={pending}>
                  Save profile
                </Button>
              </div>
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
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  AI analysis
                  {analysisMeta && (
                    <Badge variant={analysisMeta.status === "approved" ? "success" : "outline"}>
                      {analysisMeta.status === "approved" ? "Approved" : "Draft"}
                    </Badge>
                  )}
                </CardTitle>
                {analysisMeta && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {analysisMeta.model}
                    {analysisMeta.approvedAt
                      ? ` · approved ${new Date(analysisMeta.approvedAt).toLocaleString()}`
                      : ` · updated ${new Date(analysisMeta.updatedAt).toLocaleString()}`}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={generateAi} disabled={pending} variant="outline">
                  {draftAnalysis ? "Regenerate" : "Generate"}
                </Button>
                {draftAnalysis && (
                  <>
                    <Button onClick={saveDraft} disabled={pending} variant="outline">
                      Save draft
                    </Button>
                    <Button onClick={approveAndSend} disabled={pending}>
                      Approve &amp; Send
                    </Button>
                    {analysisMeta?.status === "approved" && (
                      <Button onClick={unpublish} disabled={pending} variant="secondary">
                        Unpublish
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {!draftAnalysis && (
                <p className="text-muted-foreground">
                  No report yet. Requires completed Big Five and RIASEC scores.
                </p>
              )}
              {draftAnalysis && (
                <div className="space-y-4">
                  <Field label="Summary">
                    <TextArea
                      value={draftAnalysis.summary}
                      onChange={(v) => patchAnalysis({ summary: v })}
                      rows={4}
                    />
                  </Field>
                  {(
                    [
                      ["openness", "Openness"],
                      ["conscientiousness", "Conscientiousness"],
                      ["extraversion", "Extraversion"],
                      ["agreeableness", "Agreeableness"],
                      ["emotionalStability", "Emotional stability"],
                    ] as const
                  ).map(([key, label]) => (
                    <Field key={key} label={label}>
                      <TextArea
                        value={draftAnalysis.personalityProfile[key]}
                        onChange={(v) => patchPersonality(key, v)}
                        rows={2}
                      />
                    </Field>
                  ))}
                  <Field label="Behavioral patterns (one per line)">
                    <TextArea
                      value={draftAnalysis.behavioralPatterns.join("\n")}
                      onChange={(v) =>
                        patchAnalysis({
                          behavioralPatterns: v.split("\n").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      rows={3}
                    />
                  </Field>
                  <Field label="Strengths (one per line)">
                    <TextArea
                      value={draftAnalysis.strengths.join("\n")}
                      onChange={(v) =>
                        patchAnalysis({
                          strengths: v.split("\n").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      rows={3}
                    />
                  </Field>
                  <Field label="Growth areas (one per line)">
                    <TextArea
                      value={draftAnalysis.growthAreas.join("\n")}
                      onChange={(v) =>
                        patchAnalysis({
                          growthAreas: v.split("\n").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      rows={3}
                    />
                  </Field>
                  <Field label="Work style">
                    <TextArea
                      value={draftAnalysis.workStyle}
                      onChange={(v) => patchAnalysis({ workStyle: v })}
                      rows={2}
                    />
                  </Field>
                  <Field label="Team & social">
                    <TextArea
                      value={draftAnalysis.teamAndSocial}
                      onChange={(v) => patchAnalysis({ teamAndSocial: v })}
                      rows={2}
                    />
                  </Field>
                  <Field label="Stress & resilience">
                    <TextArea
                      value={draftAnalysis.stressAndResilience}
                      onChange={(v) => patchAnalysis({ stressAndResilience: v })}
                      rows={2}
                    />
                  </Field>
                  <Field label="Career guidance">
                    <TextArea
                      value={draftAnalysis.careerGuidance}
                      onChange={(v) => patchAnalysis({ careerGuidance: v })}
                      rows={4}
                    />
                  </Field>
                  <Field label="Recommended paths (one per line)">
                    <TextArea
                      value={draftAnalysis.recommendedPaths.join("\n")}
                      onChange={(v) =>
                        patchAnalysis({
                          recommendedPaths: v.split("\n").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      rows={3}
                    />
                  </Field>
                  <Field label="Counselor notes (admin only — not shown to user)">
                    <TextArea
                      value={draftAnalysis.counselorNotes}
                      onChange={(v) => patchAnalysis({ counselorNotes: v })}
                      rows={3}
                    />
                  </Field>
                  <Field label="Disclaimer">
                    <TextArea
                      value={draftAnalysis.disclaimer}
                      onChange={(v) => patchAnalysis({ disclaimer: v })}
                      rows={2}
                    />
                  </Field>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      className={cn(
        "w-full rounded border border-foreground bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
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
