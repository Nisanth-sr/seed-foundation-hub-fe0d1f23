import { buildAnalysisPrompt, parseAnalysisResponse, type AnalysisPayload, type AnalysisResult } from "./admin-analysis-prompt.server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-3.2-3b-instruct:free";

export async function generateAnalysis(payload: AnalysisPayload): Promise<{ analysis: AnalysisResult; model: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const prompt = buildAnalysisPrompt(payload);

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_ORIGIN || "https://seedfound.org",
      "X-Title": "SEED Foundation Career Admin",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are a career guidance expert. Always respond with valid JSON only, no markdown.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
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

  const analysis = parseAnalysisResponse(content);
  return { analysis, model };
}
