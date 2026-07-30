"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  approveAnalysis,
  getUserDetail,
  listUsers,
  saveAnalysis,
  saveAnalysisDraft,
  setSavedCareers,
  unpublishAnalysis,
  updateAssessmentAnswers,
  updateProfile,
  type ProfilePatch,
} from "@/lib/users";
import { generateAnalysis } from "@/lib/openrouter";
import { hollandCode } from "@seed/career-core";
import type { BigFiveScores, RiasecScores } from "@seed/career-core";
import type { AnalysisResult } from "@/lib/analysis-prompt";

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

export async function actionUpdateProfile(userId: string, patch: ProfilePatch) {
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
  try {
    await requireAdmin();
    const detail = await getUserDetail(userId);
    if (!detail) throw new Error("User not found");
    if (!detail.bigFive.scores || !detail.riasec.scores) {
      throw new Error("Both assessments must have scores before generating AI report");
    }

    const { analysis, model } = await generateAnalysis({
      displayName: detail.displayName,
      email: detail.email,
      locale: detail.locale,
      phone: detail.phone,
      ageRange: detail.ageRange,
      city: detail.city,
      state: detail.state,
      educationLevel: detail.educationLevel,
      currentStatus: detail.currentStatus,
      schoolOrCollege: detail.schoolOrCollege,
      languagesSpoken: detail.languagesSpoken,
      bigFive: detail.bigFive.scores as BigFiveScores,
      riasec: detail.riasec.scores as RiasecScores,
      bigFiveAnswers: detail.bigFive.answers,
      riasecAnswers: detail.riasec.answers,
      savedCareerKeys: detail.savedCareers.map((s) => s.careerKey),
    });

    await saveAnalysis(userId, analysis, model, {
      bigFive: detail.bigFive.scores as BigFiveScores,
      riasec: detail.riasec.scores as RiasecScores,
      hollandCode: hollandCode(detail.riasec.scores as RiasecScores),
    });

    revalidatePath(`/users/${userId}`);
    revalidatePath("/");
    return { ok: true as const, analysis, model, status: "draft" as const };
  } catch (err) {
    // Return instead of throw so production UI shows the real message (not a digest).
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Generation failed",
    };
  }
}

export async function actionSaveAnalysisDraft(userId: string, analysis: AnalysisResult) {
  try {
    await requireAdmin();
    await saveAnalysisDraft(userId, analysis);
    revalidatePath(`/users/${userId}`);
    revalidatePath("/");
    return { ok: true as const };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Save failed",
    };
  }
}

export async function actionApproveAnalysis(userId: string, analysis: AnalysisResult) {
  try {
    const { user } = await requireAdmin();
    await approveAnalysis(userId, analysis, user.id);
    revalidatePath(`/users/${userId}`);
    revalidatePath("/");
    return { ok: true as const };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Approve failed",
    };
  }
}

export async function actionUnpublishAnalysis(userId: string) {
  try {
    await requireAdmin();
    await unpublishAnalysis(userId);
    revalidatePath(`/users/${userId}`);
    revalidatePath("/");
    return { ok: true as const };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Unpublish failed",
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
