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
    const unavailableFree =
      res.status === 404 && /unavailable for free|not available/i.test(body);
    if (unavailableFree && usedModel !== DEFAULT_MODEL) {
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

  return {
    analysis: parseAnalysisResponse(content),
    model: json.model || usedModel,
  };
}
