import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { feedbackSchema } from "@/lib/feedback";
import { appendFeedbackRow } from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = feedbackSchema.parse(body);

    if (parsed.website?.trim()) {
      // Honeypot filled — pretend success to avoid tipping off bots.
      return NextResponse.json({ ok: true });
    }

    await appendFeedbackRow({
      timestamp: new Date().toISOString(),
      name: parsed.name,
      email: parsed.email,
      contact: parsed.contact,
      category: parsed.category,
      feedback: parsed.feedback,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      const message = err.errors[0]?.message ?? "Invalid feedback submission";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const message = err instanceof Error ? err.message : "Failed to submit feedback";
    const isConfig = message.includes("Google Sheets is not configured");
    console.error("[feedback]", message);
    return NextResponse.json(
      { error: isConfig ? "Feedback is temporarily unavailable." : "Could not submit feedback. Please try again." },
      { status: isConfig ? 503 : 500 },
    );
  }
}
