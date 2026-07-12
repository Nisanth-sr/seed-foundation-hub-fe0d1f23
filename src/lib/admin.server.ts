import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  hollandCode,
  level,
  matchCareers,
  type BigFiveScores,
  type RiasecScores,
} from "./career-scoring";
import type { AnalysisResult } from "./admin-analysis-prompt.server";

const TRAIT_LABELS: Record<string, string> = {
  O: "Openness",
  C: "Conscientiousness",
  E: "Extraversion",
  A: "Agreeableness",
  N: "Emotional Stability",
};

const RIASEC_LABELS: Record<string, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

export type CompletedUserSummary = {
  userId: string;
  displayName: string;
  email: string;
  locale: string;
  hollandCode: string;
  topTraits: string[];
  bigFiveCompletedAt: string | null;
  riasecCompletedAt: string | null;
  profileCreatedAt: string;
  hasAnalysis: boolean;
};

export type UserDetail = {
  userId: string;
  displayName: string;
  email: string;
  locale: string;
  avatarUrl: string | null;
  profileCreatedAt: string;
  lastSignInAt: string | null;
  authCreatedAt: string | null;
  bigFive: {
    scores: BigFiveScores;
    answers: Record<string, number>;
    completedAt: string | null;
    traits: Array<{ key: string; label: string; score: number; level: string }>;
  };
  riasec: {
    scores: RiasecScores;
    answers: Record<string, number>;
    completedAt: string | null;
    hollandCode: string;
    types: Array<{ key: string; label: string; score: number; level: string }>;
  };
  careerMatches: ReturnType<typeof matchCareers>;
  savedCareers: Array<{ careerKey: string; createdAt: string }>;
  analysis: {
    model: string;
    promptVersion: string;
    analysis: AnalysisResult;
    createdAt: string;
    updatedAt: string;
  } | null;
};

async function getAuthUserMap(userIds: string[]): Promise<Map<string, { email: string; lastSignInAt: string | null; createdAt: string | null }>> {
  const map = new Map<string, { email: string; lastSignInAt: string | null; createdAt: string | null }>();
  if (userIds.length === 0) return map;

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new Error(error.message);

  for (const u of data.users) {
    if (userIds.includes(u.id)) {
      map.set(u.id, {
        email: u.email ?? "",
        lastSignInAt: u.last_sign_in_at ?? null,
        createdAt: u.created_at ?? null,
      });
    }
  }
  return map;
}

function getCompletedUserIds(
  rows: Array<{ user_id: string; type: string; status: string }>,
): Set<string> {
  const byUser = new Map<string, Set<string>>();
  for (const r of rows) {
    if (r.status !== "completed") continue;
    const set = byUser.get(r.user_id) ?? new Set();
    set.add(r.type);
    byUser.set(r.user_id, set);
  }
  const ids = new Set<string>();
  for (const [uid, types] of byUser) {
    if (types.has("bigfive") && types.has("riasec")) ids.add(uid);
  }
  return ids;
}

export async function listCompletedUsers(): Promise<CompletedUserSummary[]> {
  const [{ data: assessments, error: aErr }, { data: profiles, error: pErr }, { data: analyses, error: anErr }] =
    await Promise.all([
      supabaseAdmin.from("assessments").select("user_id,type,status,scores,completed_at").eq("status", "completed"),
      supabaseAdmin.from("profiles").select("id,display_name,locale,created_at"),
      supabaseAdmin.from("assessment_analyses").select("user_id"),
    ]);

  if (aErr) throw new Error(aErr.message);
  if (pErr) throw new Error(pErr.message);
  if (anErr) throw new Error(anErr.message);

  const completedIds = getCompletedUserIds(assessments ?? []);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const analysisSet = new Set((analyses ?? []).map((a) => a.user_id));
  const authMap = await getAuthUserMap([...completedIds]);

  const assessByUser = new Map<string, typeof assessments>();
  for (const a of assessments ?? []) {
    const list = assessByUser.get(a.user_id) ?? [];
    list.push(a);
    assessByUser.set(a.user_id, list);
  }

  const results: CompletedUserSummary[] = [];

  for (const userId of completedIds) {
    const prof = profileMap.get(userId);
    const auth = authMap.get(userId);
    const userAssess = assessByUser.get(userId) ?? [];
    const bf = userAssess.find((a) => a.type === "bigfive");
    const ri = userAssess.find((a) => a.type === "riasec");
    const bfScores = bf?.scores as BigFiveScores | null;
    const riScores = ri?.scores as RiasecScores | null;

    const topTraits =
      bfScores
        ? (["O", "C", "E", "A", "N"] as const)
            .map((t) => [t, bfScores[t]] as const)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([t]) => TRAIT_LABELS[t])
        : [];

    results.push({
      userId,
      displayName: prof?.display_name ?? auth?.email?.split("@")[0] ?? "Unknown",
      email: auth?.email ?? "",
      locale: prof?.locale ?? "en",
      hollandCode: riScores ? hollandCode(riScores) : "",
      topTraits,
      bigFiveCompletedAt: bf?.completed_at ?? null,
      riasecCompletedAt: ri?.completed_at ?? null,
      profileCreatedAt: prof?.created_at ?? "",
      hasAnalysis: analysisSet.has(userId),
    });
  }

  return results.sort(
    (a, b) =>
      new Date(b.riasecCompletedAt ?? b.bigFiveCompletedAt ?? 0).getTime() -
      new Date(a.riasecCompletedAt ?? a.bigFiveCompletedAt ?? 0).getTime(),
  );
}

export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  const [{ data: prof }, { data: assessRows }, { data: saved }, { data: analysisRow }] = await Promise.all([
    supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabaseAdmin.from("assessments").select("*").eq("user_id", userId).eq("status", "completed"),
    supabaseAdmin.from("saved_careers").select("career_key,created_at").eq("user_id", userId),
    supabaseAdmin.from("assessment_analyses").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  const bf = assessRows?.find((a) => a.type === "bigfive");
  const ri = assessRows?.find((a) => a.type === "riasec");
  if (!bf || !ri) return null;

  const bfScores = bf.scores as BigFiveScores;
  const riScores = ri.scores as RiasecScores;
  const bfAnswers = (bf.answers as Record<string, number>) ?? {};
  const riAnswers = (ri.answers as Record<string, number>) ?? {};

  const authMap = await getAuthUserMap([userId]);
  const auth = authMap.get(userId);

  return {
    userId,
    displayName: prof?.display_name ?? auth?.email?.split("@")[0] ?? "Unknown",
    email: auth?.email ?? "",
    locale: prof?.locale ?? "en",
    avatarUrl: prof?.avatar_url ?? null,
    profileCreatedAt: prof?.created_at ?? "",
    lastSignInAt: auth?.lastSignInAt ?? null,
    authCreatedAt: auth?.createdAt ?? null,
    bigFive: {
      scores: bfScores,
      answers: bfAnswers,
      completedAt: bf.completed_at,
      traits: (["O", "C", "E", "A", "N"] as const).map((t) => ({
        key: t,
        label: TRAIT_LABELS[t],
        score: bfScores[t],
        level: level(bfScores[t]),
      })),
    },
    riasec: {
      scores: riScores,
      answers: riAnswers,
      completedAt: ri.completed_at,
      hollandCode: hollandCode(riScores),
      types: (["R", "I", "A", "S", "E", "C"] as const).map((t) => ({
        key: t,
        label: RIASEC_LABELS[t] ?? t,
        score: riScores[t],
        level: level(riScores[t]),
      })),
    },
    careerMatches: matchCareers(bfScores, riScores, 10),
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

export async function saveAnalysis(
  userId: string,
  model: string,
  analysis: AnalysisResult,
  scoresSnapshot: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabaseAdmin.from("assessment_analyses").upsert(
    {
      user_id: userId,
      model,
      prompt_version: "v1",
      analysis: analysis as unknown as never,
      scores_snapshot: scoresSnapshot as unknown as never,
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
}

export async function getCachedAnalysis(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("assessment_analyses")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
