import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  verifyAdminPassword,
  createAdminSessionToken,
  validateAdminSessionToken,
  readAdminCookie,
  setAdminCookie,
  clearAdminCookie,
  requireAdminSession,
} from "./admin-auth.server";
import {
  listCompletedUsers,
  getUserDetail,
  saveAnalysis,
  getCachedAnalysis,
} from "./admin.server";
import { generateAnalysis } from "./openrouter.server";

export const adminLogin = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1) }))
  .handler(async ({ data }) => {
    if (!verifyAdminPassword(data.password)) {
      throw new Error("Invalid password");
    }
    const token = await createAdminSessionToken();
    setAdminCookie(token);
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  await requireAdminSession();
  clearAdminCookie();
  return { ok: true as const };
});

export const adminCheckSession = createServerFn({ method: "GET" }).handler(async () => {
  const valid = await validateAdminSessionToken(readAdminCookie());
  return { authenticated: valid };
});

export const adminListCompletedUsers = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminSession();
  const users = await listCompletedUsers();
  return { users };
});

export const adminGetUserDetail = createServerFn({ method: "GET" })
  .validator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const detail = await getUserDetail(data.userId);
    if (!detail) throw new Error("User not found or assessments incomplete");
    return { detail };
  });

export const adminGetAnalysis = createServerFn({ method: "GET" })
  .validator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const row = await getCachedAnalysis(data.userId);
    if (!row) return { analysis: null };
    return {
      analysis: {
        model: row.model,
        promptVersion: row.prompt_version,
        analysis: row.analysis,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    };
  });

export const adminGenerateAnalysis = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data }) => {
    await requireAdminSession();
    const detail = await getUserDetail(data.userId);
    if (!detail) throw new Error("User not found or assessments incomplete");

    const { analysis, model } = await generateAnalysis({
      displayName: detail.displayName,
      email: detail.email,
      locale: detail.locale,
      bigFive: detail.bigFive.scores,
      riasec: detail.riasec.scores,
      bigFiveAnswers: detail.bigFive.answers,
      riasecAnswers: detail.riasec.answers,
      savedCareerKeys: detail.savedCareers.map((s) => s.careerKey),
    });

    const scoresSnapshot = {
      bigFive: detail.bigFive.scores,
      riasec: detail.riasec.scores,
      hollandCode: detail.riasec.hollandCode,
    };

    await saveAnalysis(data.userId, model, analysis, scoresSnapshot);

    return {
      analysis: {
        model,
        promptVersion: "v1",
        analysis,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  });
