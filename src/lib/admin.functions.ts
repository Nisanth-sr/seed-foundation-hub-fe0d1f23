import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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
    const detail = await fetchUserDetail(data.userId);
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
    const detail = await fetchUserDetail(data.userId);
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

async function requireAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", context.userId)
    .maybeSingle();
  if (error) throw new Error("Role check failed");
  if (!data?.is_admin) throw new Error("Forbidden: admin only");
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

export const listAssessmentUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    await requireAdmin(context);
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

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p.display_name]));
    const bfMap = new Map<string, any>();
    const riMap = new Map<string, any>();
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
        bigfive_status: bf?.status ?? "not_started",
        riasec_status: ri?.status ?? "not_started",
        bigfive_completed_at: bf?.completed_at ?? null,
        riasec_completed_at: ri?.completed_at ?? null,
      };
    });

    // Show completed-both first
    rows.sort((a, b) => {
      const aDone = a.bigfive_status === "completed" && a.riasec_status === "completed" ? 0 : 1;
      const bDone = b.bigfive_status === "completed" && b.riasec_status === "completed" ? 0 : 1;
      if (aDone !== bDone) return aDone - bDone;
      return (b.created_at || "").localeCompare(a.created_at || "");
    });

    return rows;
  });

export type AdminUserDetail = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  bigfive: any | null;
  riasec: any | null;
  saved_careers: { career_key: string; created_at: string }[];
};

export const getUserDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string }) => {
    if (!data?.userId || typeof data.userId !== "string") throw new Error("userId required");
    return data;
  })
  .handler(async ({ data, context }): Promise<AdminUserDetail> => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: userRes }, { data: profile }, { data: assessments }, { data: saved }] =
      await Promise.all([
        supabaseAdmin.auth.admin.getUserById(data.userId),
        supabaseAdmin.from("profiles").select("*").eq("id", data.userId).maybeSingle(),
        supabaseAdmin.from("assessments").select("*").eq("user_id", data.userId),
        supabaseAdmin
          .from("saved_careers")
          .select("career_key,created_at")
          .eq("user_id", data.userId),
      ]);

    const u = userRes?.user;
    if (!u) throw new Error("User not found");

    return {
      user_id: u.id,
      email: u.email ?? null,
      display_name: profile?.display_name ?? null,
      created_at: u.created_at,
      bigfive: (assessments ?? []).find((a: any) => a.type === "bigfive") ?? null,
      riasec: (assessments ?? []).find((a: any) => a.type === "riasec") ?? null,
      saved_careers: (saved as any) ?? [],
    };
  });

export const analyzeUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; model?: string }) => {
    if (!data?.userId) throw new Error("userId required");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ analysis: string; model: string }> => {
    await requireAdmin(context);
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("OPENROUTER_API_KEY not configured");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: userRes }, { data: profile }, { data: assessments }] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(data.userId),
      supabaseAdmin.from("profiles").select("*").eq("id", data.userId).maybeSingle(),
      supabaseAdmin.from("assessments").select("*").eq("user_id", data.userId),
    ]);
    const u = userRes?.user;
    if (!u) throw new Error("User not found");

    const bf = (assessments ?? []).find((a: any) => a.type === "bigfive");
    const ri = (assessments ?? []).find((a: any) => a.type === "riasec");

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

    const model = data.model || "meta-llama/llama-3.3-70b-instruct:free";

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
        "HTTP-Referer": "https://seed-foundation-hub.lovable.app",
        "X-Title": "Career Intelligence Admin",
      },
      body: JSON.stringify({
        model,
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
    const json: any = await resp.json();
    const analysis = json?.choices?.[0]?.message?.content ?? "No analysis returned.";
    return { analysis, model };
  });
