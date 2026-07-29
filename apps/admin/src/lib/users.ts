import "server-only";
import {
  hollandCode,
  matchCareers,
  scoreBigFive,
  scoreRiasec,
  type BigFiveScores,
  type RiasecScores,
} from "@seed/career-core";
import { supabaseAdmin } from "./supabase/admin";
import type { AnalysisResult } from "./analysis-prompt";
import type { Json } from "./supabase/types";

export type UserListRow = {
  id: string;
  email: string;
  displayName: string;
  locale: string;
  createdAt: string;
  lastSignInAt: string | null;
  bigfiveStatus: string | null;
  riasecStatus: string | null;
  hollandCode: string | null;
  hasAnalysis: boolean;
};

export type AssessmentBlock = {
  id: string | null;
  status: string | null;
  answers: Record<string, number>;
  scores: BigFiveScores | RiasecScores | null;
  completedAt: string | null;
  updatedAt: string | null;
};

export type UserDetail = {
  id: string;
  email: string;
  displayName: string;
  locale: string;
  avatarUrl: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  bigFive: AssessmentBlock;
  riasec: AssessmentBlock;
  hollandCode: string | null;
  careerMatches: ReturnType<typeof matchCareers>;
  savedCareers: { careerKey: string; createdAt: string }[];
  analysis: {
    model: string;
    promptVersion: string;
    analysis: AnalysisResult;
    createdAt: string;
    updatedAt: string;
  } | null;
};

function asAnswers(raw: Json | null | undefined): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "number") out[k] = v;
  }
  return out;
}

function asScores<T>(raw: Json | null | undefined): T | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as T;
}

export async function listUsers(): Promise<UserListRow[]> {
  const { data: authList, error: authErr } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  });
  if (authErr) throw new Error(authErr.message);

  const [{ data: profiles }, { data: assessments }, { data: analyses }] = await Promise.all([
    supabaseAdmin.from("profiles").select("id,display_name,locale,created_at"),
    supabaseAdmin.from("assessments").select("user_id,type,status,scores,completed_at"),
    supabaseAdmin.from("assessment_analyses").select("user_id"),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const analysisSet = new Set((analyses ?? []).map((a) => a.user_id));
  type AssessmentRow = NonNullable<typeof assessments>[number];
  const byUser = new Map<string, { bigfive?: AssessmentRow; riasec?: AssessmentRow }>();

  for (const a of assessments ?? []) {
    const entry = byUser.get(a.user_id) ?? {};
    if (a.type === "bigfive") entry.bigfive = a;
    if (a.type === "riasec") entry.riasec = a;
    byUser.set(a.user_id, entry);
  }

  return (authList.users ?? []).map((u) => {
    const p = profileMap.get(u.id);
    const a = byUser.get(u.id);
    const riScores = asScores<RiasecScores>(a?.riasec?.scores ?? null);
    return {
      id: u.id,
      email: u.email ?? "",
      displayName: p?.display_name || u.email || "Unknown",
      locale: p?.locale ?? "en",
      createdAt: p?.created_at ?? u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      bigfiveStatus: a?.bigfive?.status ?? null,
      riasecStatus: a?.riasec?.status ?? null,
      hollandCode: riScores && a?.riasec?.status === "completed" ? hollandCode(riScores) : null,
      hasAnalysis: analysisSet.has(u.id),
    };
  });
}

export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  const [{ data: authData, error: authErr }, { data: profile }, { data: assessments }, { data: saved }, { data: analysisRow }] =
    await Promise.all([
      supabaseAdmin.auth.admin.getUserById(userId),
      supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabaseAdmin.from("assessments").select("*").eq("user_id", userId),
      supabaseAdmin.from("saved_careers").select("career_key,created_at").eq("user_id", userId),
      supabaseAdmin.from("assessment_analyses").select("*").eq("user_id", userId).maybeSingle(),
    ]);

  if (authErr || !authData.user) return null;
  const user = authData.user;
  const bf = (assessments ?? []).find((a) => a.type === "bigfive");
  const ri = (assessments ?? []).find((a) => a.type === "riasec");

  const bfAnswers = asAnswers(bf?.answers);
  const riAnswers = asAnswers(ri?.answers);
  const bfScores = asScores<BigFiveScores>(bf?.scores) ?? (Object.keys(bfAnswers).length ? scoreBigFive(bfAnswers) : null);
  const riScores = asScores<RiasecScores>(ri?.scores) ?? (Object.keys(riAnswers).length ? scoreRiasec(riAnswers) : null);
  const code = riScores ? hollandCode(riScores) : null;
  const matches = bfScores && riScores ? matchCareers(bfScores, riScores, 10) : [];

  return {
    id: userId,
    email: user.email ?? "",
    displayName: profile?.display_name || user.email || "Unknown",
    locale: profile?.locale ?? "en",
    avatarUrl: profile?.avatar_url ?? null,
    createdAt: profile?.created_at ?? user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    bigFive: {
      id: bf?.id ?? null,
      status: bf?.status ?? null,
      answers: bfAnswers,
      scores: bfScores,
      completedAt: bf?.completed_at ?? null,
      updatedAt: bf?.updated_at ?? null,
    },
    riasec: {
      id: ri?.id ?? null,
      status: ri?.status ?? null,
      answers: riAnswers,
      scores: riScores,
      completedAt: ri?.completed_at ?? null,
      updatedAt: ri?.updated_at ?? null,
    },
    hollandCode: code,
    careerMatches: matches,
    savedCareers: (saved ?? []).map((s) => ({ careerKey: s.career_key, createdAt: s.created_at })),
    analysis: analysisRow
      ? {
          model: analysisRow.model,
          promptVersion: analysisRow.prompt_version,
          analysis: analysisRow.analysis as unknown as AnalysisResult,
          createdAt: analysisRow.created_at,
          updatedAt: analysisRow.updated_at,
        }
      : null,
  };
}

export async function updateProfile(
  userId: string,
  patch: { displayName?: string; locale?: string; email?: string },
) {
  if (patch.displayName !== undefined || patch.locale !== undefined) {
    const updates: { display_name?: string; locale?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (patch.displayName !== undefined) updates.display_name = patch.displayName;
    if (patch.locale !== undefined) updates.locale = patch.locale;
    const { error } = await supabaseAdmin.from("profiles").update(updates).eq("id", userId);
    if (error) throw new Error(error.message);
  }
  if (patch.email) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { email: patch.email });
    if (error) throw new Error(error.message);
  }
}

export async function updateAssessmentAnswers(
  userId: string,
  type: "bigfive" | "riasec",
  answers: Record<string, number>,
  markCompleted = true,
) {
  const scores = type === "bigfive" ? scoreBigFive(answers) : scoreRiasec(answers);
  const now = new Date().toISOString();
  const payload = {
    user_id: userId,
    type,
    answers,
    scores,
    status: markCompleted ? ("completed" as const) : ("in_progress" as const),
    completed_at: markCompleted ? now : null,
    updated_at: now,
  };

  const { data: existing } = await supabaseAdmin
    .from("assessments")
    .select("id")
    .eq("user_id", userId)
    .eq("type", type)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabaseAdmin.from("assessments").update(payload).eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("assessments").insert(payload);
    if (error) throw new Error(error.message);
  }

  return scores;
}

export async function setSavedCareers(userId: string, careerKeys: string[]) {
  const { error: delErr } = await supabaseAdmin.from("saved_careers").delete().eq("user_id", userId);
  if (delErr) throw new Error(delErr.message);
  if (careerKeys.length === 0) return;
  const { error } = await supabaseAdmin.from("saved_careers").insert(
    careerKeys.map((career_key) => ({ user_id: userId, career_key })),
  );
  if (error) throw new Error(error.message);
}

export async function saveAnalysis(
  userId: string,
  analysis: AnalysisResult,
  model: string,
  scoresSnapshot: { bigFive: BigFiveScores; riasec: RiasecScores; hollandCode: string },
) {
  const { error } = await supabaseAdmin.from("assessment_analyses").upsert(
    {
      user_id: userId,
      model,
      prompt_version: "v1",
      analysis: analysis as unknown as Json,
      scores_snapshot: scoresSnapshot as unknown as Json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
}
