import {
  BIG_FIVE_QUESTIONS,
  RIASEC_QUESTIONS,
  hollandCode,
  level,
  matchCareers,
  type BigFiveScores,
  type RiasecScores,
} from "@seed/career-core";

export type AnalysisPayload = {
  displayName: string;
  email: string;
  locale: string;
  bigFive: BigFiveScores;
  riasec: RiasecScores;
  bigFiveAnswers: Record<string, number>;
  riasecAnswers: Record<string, number>;
  savedCareerKeys: string[];
};

export type AnalysisResult = {
  summary: string;
  personalityProfile: {
    openness: string;
    conscientiousness: string;
    extraversion: string;
    agreeableness: string;
    emotionalStability: string;
  };
  behavioralPatterns: string[];
  strengths: string[];
  growthAreas: string[];
  workStyle: string;
  teamAndSocial: string;
  stressAndResilience: string;
  careerGuidance: string;
  recommendedPaths: string[];
  counselorNotes: string;
  disclaimer: string;
};

const TRAIT_LABELS: Record<string, string> = {
  O: "Openness",
  C: "Conscientiousness",
  E: "Extraversion",
  A: "Agreeableness",
  N: "Emotional Stability",
};

const RIASEC_LABELS: Record<string, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

function answerHighlights(
  answers: Record<string, number>,
  questions: Array<{ id: string; trait?: string; type?: string; en: string }>,
  groupKey: "trait" | "type",
): string[] {
  const highlights: string[] = [];
  for (const q of questions) {
    const val = answers[q.id];
    if (typeof val !== "number") continue;
    const group = groupKey === "trait" ? q.trait : q.type;
    if (val >= 4) highlights.push(`Strong agreement (${val}/5) on "${q.en}" [${group}]`);
    if (val <= 2) highlights.push(`Low agreement (${val}/5) on "${q.en}" [${group}]`);
  }
  return highlights.slice(0, 12);
}

export function buildAnalysisPrompt(payload: AnalysisPayload): string {
  const code = hollandCode(payload.riasec);
  const matches = matchCareers(payload.bigFive, payload.riasec, 5);

  const bfLines = (["O", "C", "E", "A", "N"] as const).map(
    (t) => `${TRAIT_LABELS[t]}: ${payload.bigFive[t]}/100 (${level(payload.bigFive[t])})`,
  );

  const riLines = (["R", "I", "A", "S", "E", "C"] as const).map(
    (t) => `${RIASEC_LABELS[t]}: ${payload.riasec[t]}/100 (${level(payload.riasec[t])})`,
  );

  const matchLines = matches.map(
    (m) => `${m.career.title_en} (${m.score}% match): ${m.reasons.join("; ")}`,
  );

  return `You are an expert career counselor analyzing assessment results for a student in India.
Provide a thorough, empathetic, practical analysis based ONLY on the data below.
This is for career exploration and guidance — NOT a clinical psychological diagnosis.

STUDENT
- Name: ${payload.displayName}
- Email: ${payload.email}
- Locale: ${payload.locale}

BIG FIVE PERSONALITY (0-100, higher = stronger trait)
${bfLines.join("\n")}

RIASEC INTERESTS (Holland Code: ${code})
${riLines.join("\n")}

TOP CAREER MATCHES (algorithmic)
${matchLines.join("\n")}

SAVED CAREERS: ${payload.savedCareerKeys.length ? payload.savedCareerKeys.join(", ") : "None"}

NOTABLE RESPONSE PATTERNS
Big Five highlights:
${answerHighlights(payload.bigFiveAnswers, BIG_FIVE_QUESTIONS, "trait").join("\n") || "None"}

RIASEC highlights:
${answerHighlights(payload.riasecAnswers, RIASEC_QUESTIONS, "type").join("\n") || "None"}

Respond with ONLY valid JSON matching this exact schema (no markdown fences):
{
  "summary": "2-3 paragraph executive summary",
  "personalityProfile": {
    "openness": "...",
    "conscientiousness": "...",
    "extraversion": "...",
    "agreeableness": "...",
    "emotionalStability": "..."
  },
  "behavioralPatterns": ["..."],
  "strengths": ["..."],
  "growthAreas": ["..."],
  "workStyle": "...",
  "teamAndSocial": "...",
  "stressAndResilience": "...",
  "careerGuidance": "...",
  "recommendedPaths": ["..."],
  "counselorNotes": "...",
  "disclaimer": "For career exploration only — not a psychological diagnosis."
}`;
}

export function parseAnalysisResponse(raw: string): AnalysisResult {
  const trimmed = raw.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
  const parsed = JSON.parse(trimmed) as AnalysisResult;
  if (!parsed.summary || !parsed.personalityProfile) {
    throw new Error("Invalid analysis structure from AI model");
  }
  parsed.disclaimer =
    parsed.disclaimer || "For career exploration only — not a psychological diagnosis.";
  return parsed;
}
