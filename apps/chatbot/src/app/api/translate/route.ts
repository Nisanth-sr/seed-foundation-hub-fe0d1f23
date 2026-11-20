import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";

const requestSchema = z.object({
  text: z.string().trim().min(1).max(30000),
});

type GoogleTranslateResponse = {
  data?: {
    translations?: Array<{ translatedText?: unknown }>;
  };
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let parsed: z.infer<typeof requestSchema>;
  try {
    parsed = requestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Text to translate must be between 1 and 30,000 characters" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Tamil translation is not configured. Contact an administrator." }, { status: 503 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: parsed.text, target: "ta", format: "text" }),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    return Response.json({ error: "Google Translate could not be reached. Please try again." }, { status: 502 });
  }

  if (!upstream.ok) {
    if (upstream.status === 401 || upstream.status === 403) {
      return Response.json({ error: "Google Translate is not available. Contact an administrator to check its credentials and API access." }, { status: 502 });
    }
    if (upstream.status === 429) {
      return Response.json({ error: "Google Translate is temporarily rate-limited. Please try again shortly." }, { status: 429 });
    }
    return Response.json({ error: "Google Translate could not translate this response. Please try again." }, { status: 502 });
  }

  let translatedText: unknown;
  try {
    const data = await upstream.json() as GoogleTranslateResponse;
    translatedText = data.data?.translations?.[0]?.translatedText;
  } catch {
    return Response.json({ error: "Google Translate returned an invalid response. Please try again." }, { status: 502 });
  }

  if (typeof translatedText !== "string" || !translatedText.trim()) {
    return Response.json({ error: "Google Translate returned no translation. Please try again." }, { status: 502 });
  }

  return Response.json({ translatedText });
}
