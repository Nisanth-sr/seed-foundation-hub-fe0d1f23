import "server-only";
import {
  buildAnalysisPrompt,
  parseAnalysisResponse,
  type AnalysisPayload,
  type AnalysisResult,
} from "./analysis-prompt";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct:free";

export async function generateAnalysis(
  payload: AnalysisPayload,
): Promise<{ analysis: AnalysisResult; model: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const prompt = buildAnalysisPrompt(payload);

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || "https://admin.seedfound.org",
      "X-Title": "SEED Assessment Admin",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a career counselor. Respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter error (${res.status}): ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty response");

  return { analysis: parseAnalysisResponse(content), model };
}
