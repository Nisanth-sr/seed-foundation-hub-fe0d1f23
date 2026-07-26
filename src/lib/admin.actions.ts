"use server";

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
  getUserDetail as fetchUserDetail,
  saveAnalysis,
  getCachedAnalysis,
} from "./admin.server";
import { generateAnalysis } from "./openrouter.server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

async function getBearerUserId(accessToken?: string): Promise<{ userId: string }> {
  let token = accessToken;
  if (!token) {
    const { headers } = await import("next/headers");
    const h = await headers();
    const auth = h.get("authorization");
    if (!auth?.startsWith("Bearer ")) throw new Error("Unauthorized");
    token = auth.slice(7);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  const supabase = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthorized");
  return { userId: data.user.id };
}

async function requireAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error("Role check failed");
  if (!data?.is_admin) throw new Error("Forbidden: admin only");
}

export async function adminLogin(password: string) {
  if (!verifyAdminPassword(password)) {
    throw new Error("Invalid password");
  }
  const token = await createAdminSessionToken();
  await setAdminCookie(token);
  return { ok: true as const };
}

export async function adminLogout() {
  await requireAdminSession();
  await clearAdminCookie();
  return { ok: true as const };
}

export async function adminCheckSession() {
  const valid = await validateAdminSessionToken(await readAdminCookie());
  return { authenticated: valid };
}

export async function adminListCompletedUsers() {
  await requireAdminSession();
  const users = await listCompletedUsers();
  return { users };
}

export async function adminGetUserDetail(userId: string) {
  await requireAdminSession();
  const detail = await fetchUserDetail(userId);
  if (!detail) throw new Error("User not found or assessments incomplete");
  return { detail };
}

export async function adminGetAnalysis(userId: string) {
  await requireAdminSession();
  const row = await getCachedAnalysis(userId);
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
}

export async function adminGenerateAnalysis(userId: string) {
  await requireAdminSession();
  const detail = await fetchUserDetail(userId);
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

  await saveAnalysis(userId, model, analysis, scoresSnapshot);

  return {
    analysis: {
      model,
      promptVersion: "v1",
      analysis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

export type AdminUserRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  bigfive_status: "not_started" | "in_progress" | "completed";
  riasec_status: "not_started" | "in_progress" | "completed";
  bigfive_completed_at: string | null;
  riasec_completed_at: string | null;
};

export async function listAssessmentUsers(accessToken: string): Promise<AdminUserRow[]> {
  const { userId } = await getBearerUserId(accessToken);
  await requireAdmin(userId);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: authList, error: authErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (authErr) throw authErr;

  const { data: profiles } = await supabaseAdmin.from("profiles").select("id,display_name");
  const { data: assessments } = await supabaseAdmin
    .from("assessments")
    .select("user_id,type,status,completed_at");

  const profileMap = new Map((profiles ?? []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name]));
  const bfMap = new Map<string, { status: string; completed_at: string | null }>();
  const riMap = new Map<string, { status: string; completed_at: string | null }>();
  for (const a of assessments ?? []) {
    if (a.type === "bigfive") bfMap.set(a.user_id, a);
    if (a.type === "riasec") riMap.set(a.user_id, a);
  }

  const rows: AdminUserRow[] = authList.users.map((u) => {
    const bf = bfMap.get(u.id);
    const ri = riMap.get(u.id);
    return {
      user_id: u.id,
      email: u.email ?? null,
      display_name: profileMap.get(u.id) ?? null,
      created_at: u.created_at,
      bigfive_status: (bf?.status as AdminUserRow["bigfive_status"]) ?? "not_started",
      riasec_status: (ri?.status as AdminUserRow["riasec_status"]) ?? "not_started",
      bigfive_completed_at: bf?.completed_at ?? null,
      riasec_completed_at: ri?.completed_at ?? null,
    };
  });

  rows.sort((a, b) => {
    const aDone = a.bigfive_status === "completed" && a.riasec_status === "completed" ? 0 : 1;
    const bDone = b.bigfive_status === "completed" && b.riasec_status === "completed" ? 0 : 1;
    if (aDone !== bDone) return aDone - bDone;
    return (b.created_at || "").localeCompare(a.created_at || "");
  });

  return rows;
}

export type AdminUserDetail = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  bigfive: unknown | null;
  riasec: unknown | null;
  saved_careers: { career_key: string; created_at: string }[];
};

export async function getUserDetail(userId: string, accessToken: string): Promise<AdminUserDetail> {
  z.string().uuid().parse(userId);
  const { userId: adminId } = await getBearerUserId(accessToken);
  await requireAdmin(adminId);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ data: userRes }, { data: profile }, { data: assessments }, { data: saved }] =
    await Promise.all([
      supabaseAdmin.auth.admin.getUserById(userId),
      supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabaseAdmin.from("assessments").select("*").eq("user_id", userId),
      supabaseAdmin.from("saved_careers").select("career_key,created_at").eq("user_id", userId),
    ]);

  const u = userRes?.user;
  if (!u) throw new Error("User not found");

  return {
    user_id: u.id,
    email: u.email ?? null,
    display_name: profile?.display_name ?? null,
    created_at: u.created_at,
    bigfive: (assessments ?? []).find((a: { type: string }) => a.type === "bigfive") ?? null,
    riasec: (assessments ?? []).find((a: { type: string }) => a.type === "riasec") ?? null,
    saved_careers: (saved as { career_key: string; created_at: string }[]) ?? [],
  };
}

export async function analyzeUser(
  userId: string,
  accessToken: string,
  model?: string,
): Promise<{ analysis: string; model: string }> {
  const { userId: adminId } = await getBearerUserId(accessToken);
  await requireAdmin(adminId);
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY not configured");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: userRes }, { data: profile }, { data: assessments }] = await Promise.all([
    supabaseAdmin.auth.admin.getUserById(userId),
    supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabaseAdmin.from("assessments").select("*").eq("user_id", userId),
  ]);
  const u = userRes?.user;
  if (!u) throw new Error("User not found");

  const bf = (assessments ?? []).find((a: { type: string }) => a.type === "bigfive") as
    | { status: string; scores: unknown; answers: unknown; completed_at: string | null }
    | undefined;
  const ri = (assessments ?? []).find((a: { type: string }) => a.type === "riasec") as
    | { status: string; scores: unknown; answers: unknown; completed_at: string | null }
    | undefined;

  const payload = {
    user: {
      email: u.email,
      display_name: profile?.display_name ?? null,
      joined: u.created_at,
    },
    bigfive: bf
      ? { status: bf.status, scores: bf.scores, answers: bf.answers, completed_at: bf.completed_at }
      : null,
    riasec: ri
      ? { status: ri.status, scores: ri.scores, answers: ri.answers, completed_at: ri.completed_at }
      : null,
  };

  const chosenModel = model || "meta-llama/llama-3.3-70b-instruct:free";

  const systemPrompt = `You are an expert organizational psychologist and career counselor. Given a person's Big Five personality scores (O, C, E, A, N — 0-100) and RIASEC interest scores (R, I, A, S, E, C — 0-100), produce a rigorous, warm, and specific personal analysis in Markdown.

Structure:
1. **Snapshot** — 2-3 sentence portrait.
2. **Personality Profile (Big Five)** — Interpret each trait with the actual score, what it looks like day-to-day, strengths, and blind spots.
3. **Interest Profile (RIASEC / Holland Code)** — Compute their 3-letter Holland Code from the top-3 RIASEC scores and interpret it.
4. **Behavioural Tendencies** — How they likely act in teams, under stress, when learning, when leading.
5. **Career Fit Analysis** — Concrete career directions (industries, roles) that fit BOTH the personality and interests, and areas to avoid, with reasoning.
6. **Growth Recommendations** — 3-5 specific, actionable items.
7. **Risk / Watch-outs** — Honest cautions.

Use the actual numbers. Be specific, not generic. No disclaimers about being an AI.`;

  const userPrompt = `Analyze this person:\n\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``;

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_ORIGIN || "https://seedfound.org",
      "X-Title": "Career Intelligence Admin",
    },
    body: JSON.stringify({
      model: chosenModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenRouter ${resp.status}: ${text.slice(0, 400)}`);
  }
  const json = (await resp.json()) as { choices?: { message?: { content?: string } }[] };
  const analysis = json?.choices?.[0]?.message?.content ?? "No analysis returned.";
  return { analysis, model: chosenModel };
}
