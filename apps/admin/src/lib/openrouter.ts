import "server-only";
import {
  buildAnalysisPrompt,
  parseAnalysisResponse,
  type AnalysisPayload,
  type AnalysisResult,
} from "./analysis-prompt";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
/** Auto-picks a currently available free model (specific :free slugs rotate often). */
const DEFAULT_MODEL = "openrouter/free";

export async function generateAnalysis(
  payload: AnalysisPayload,
): Promise<{ analysis: AnalysisResult; model: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  let model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  // Legacy/unavailable free slug — OpenRouter now requires paid for this model.
  if (model === "meta-llama/llama-3.3-70b-instruct:free") {
    model = DEFAULT_MODEL;
  }
  const prompt = buildAnalysisPrompt(payload);

  // #region agent log
  fetch("http://127.0.0.1:7279/ingest/aa5631d9-35e0-4360-9d46-3bef15f7d91f", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fa1da9" },
    body: JSON.stringify({
      sessionId: "fa1da9",
      runId: "post-fix",
      hypothesisId: "B",
      location: "apps/admin/src/lib/openrouter.ts:generateAnalysis",
      message: "calling openrouter",
      data: {
        model,
        promptLen: prompt.length,
        referer: process.env.APP_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || "fallback",
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  async function callModel(modelId: string) {
    return fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.APP_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || "https://admin.seedfound.org",
        "X-Title": "SEED Assessment Admin",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: "You are a career counselor. Respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      }),
    });
  }

  let res = await callModel(model);
  let usedModel = model;

  if (!res.ok) {
    const body = await res.text();
    // #region agent log
    fetch("http://127.0.0.1:7279/ingest/aa5631d9-35e0-4360-9d46-3bef15f7d91f", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fa1da9" },
      body: JSON.stringify({
        sessionId: "fa1da9",
        runId: "post-fix",
        hypothesisId: "B",
        location: "apps/admin/src/lib/openrouter.ts:generateAnalysis",
        message: "openrouter non-ok",
        data: { status: res.status, body: body.slice(0, 300), model: usedModel },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const unavailableFree =
      res.status === 404 && /unavailable for free|not available/i.test(body);
    if (unavailableFree && usedModel !== DEFAULT_MODEL) {
      // #region agent log
      fetch("http://127.0.0.1:7279/ingest/aa5631d9-35e0-4360-9d46-3bef15f7d91f", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fa1da9" },
        body: JSON.stringify({
          sessionId: "fa1da9",
          runId: "post-fix",
          hypothesisId: "B",
          location: "apps/admin/src/lib/openrouter.ts:generateAnalysis",
          message: "retrying with openrouter/free",
          data: { previousModel: usedModel },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      usedModel = DEFAULT_MODEL;
      res = await callModel(usedModel);
      if (!res.ok) {
        const retryBody = await res.text();
        throw new Error(`OpenRouter error (${res.status}): ${retryBody.slice(0, 300)}`);
      }
    } else {
      throw new Error(`OpenRouter error (${res.status}): ${body.slice(0, 300)}`);
    }
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    model?: string;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty response");

  const resolvedModel = json.model || usedModel;

  try {
    return { analysis: parseAnalysisResponse(content), model: resolvedModel };
  } catch (parseErr) {
    // #region agent log
    fetch("http://127.0.0.1:7279/ingest/aa5631d9-35e0-4360-9d46-3bef15f7d91f", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fa1da9" },
      body: JSON.stringify({
        sessionId: "fa1da9",
        runId: "post-fix",
        hypothesisId: "C",
        location: "apps/admin/src/lib/openrouter.ts:generateAnalysis",
        message: "parse failed",
        data: {
          parseMessage: parseErr instanceof Error ? parseErr.message : String(parseErr),
          contentPreview: content.slice(0, 200),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw parseErr;
  }
}
