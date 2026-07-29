"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  getUserDetail,
  listUsers,
  saveAnalysis,
  setSavedCareers,
  updateAssessmentAnswers,
  updateProfile,
} from "@/lib/users";
import { generateAnalysis } from "@/lib/openrouter";
import { hollandCode } from "@seed/career-core";
import type { BigFiveScores, RiasecScores } from "@seed/career-core";

export async function actionListUsers() {
  await requireAdmin();
  return listUsers();
}

export async function actionGetUser(userId: string) {
  await requireAdmin();
  const detail = await getUserDetail(userId);
  if (!detail) throw new Error("User not found");
  return detail;
}

export async function actionUpdateProfile(
  userId: string,
  patch: { displayName?: string; locale?: string; email?: string },
) {
  await requireAdmin();
  await updateProfile(userId, patch);
  revalidatePath(`/users/${userId}`);
  revalidatePath("/");
  return { ok: true as const };
}

export async function actionUpdateAssessment(
  userId: string,
  type: "bigfive" | "riasec",
  answers: Record<string, number>,
) {
  await requireAdmin();
  const scores = await updateAssessmentAnswers(userId, type, answers, true);
  revalidatePath(`/users/${userId}`);
  revalidatePath("/");
  return { scores };
}

export async function actionSetSavedCareers(userId: string, careerKeys: string[]) {
  await requireAdmin();
  await setSavedCareers(userId, careerKeys);
  revalidatePath(`/users/${userId}`);
  return { ok: true as const };
}

export async function actionGenerateAnalysis(userId: string) {
  // #region agent log
  const _dbg = (message: string, hypothesisId: string, data: Record<string, unknown> = {}) => {
    fetch("http://127.0.0.1:7279/ingest/aa5631d9-35e0-4360-9d46-3bef15f7d91f", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fa1da9" },
      body: JSON.stringify({
        sessionId: "fa1da9",
        runId: "ai-gen-1",
        hypothesisId,
        location: "apps/admin/src/app/actions/admin.ts:actionGenerateAnalysis",
        message,
        data,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    console.error("[debug:ai-gen]", message, data);
  };
  // #endregion
  try {
    // #region agent log
    _dbg("action start", "E", {
      userIdPrefix: userId.slice(0, 8),
      hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY),
      model: process.env.OPENROUTER_MODEL || "(default)",
    });
    // #endregion
    await requireAdmin();
    const detail = await getUserDetail(userId);
    if (!detail) throw new Error("User not found");
    // #region agent log
    _dbg("detail loaded", "E", {
      hasBfScores: Boolean(detail.bigFive.scores),
      hasRiScores: Boolean(detail.riasec.scores),
      bfAnswerCount: Object.keys(detail.bigFive.answers).length,
      riAnswerCount: Object.keys(detail.riasec.answers).length,
    });
    // #endregion
    if (!detail.bigFive.scores || !detail.riasec.scores) {
      throw new Error("Both assessments must have scores before generating AI report");
    }

    const { analysis, model } = await generateAnalysis({
      displayName: detail.displayName,
      email: detail.email,
      locale: detail.locale,
      bigFive: detail.bigFive.scores as BigFiveScores,
      riasec: detail.riasec.scores as RiasecScores,
      bigFiveAnswers: detail.bigFive.answers,
      riasecAnswers: detail.riasec.answers,
      savedCareerKeys: detail.savedCareers.map((s) => s.careerKey),
    });
    // #region agent log
    _dbg("openrouter ok", "B", {
      model,
      hasSummary: Boolean(analysis?.summary),
    });
    // #endregion

    await saveAnalysis(userId, analysis, model, {
      bigFive: detail.bigFive.scores as BigFiveScores,
      riasec: detail.riasec.scores as RiasecScores,
      hollandCode: hollandCode(detail.riasec.scores as RiasecScores),
    });
    // #region agent log
    _dbg("saveAnalysis ok", "D", {});
    // #endregion

    revalidatePath(`/users/${userId}`);
    revalidatePath("/");
    return { ok: true as const, analysis, model };
  } catch (err) {
    // #region agent log
    _dbg("action failed", "A", {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message.slice(0, 400) : String(err).slice(0, 400),
    });
    // #endregion
    // Return instead of throw so production UI shows the real message (not a digest).
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Generation failed",
    };
  }
}

export async function actionLogout() {
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const { redirect } = await import("next/navigation");
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
