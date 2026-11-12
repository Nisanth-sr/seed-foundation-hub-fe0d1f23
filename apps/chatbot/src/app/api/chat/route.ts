import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildSystemPrompt } from "@/lib/system-prompt";

const requestSchema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  message: z.string().trim().min(1).max(10000),
});

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type OpenRouterEvent = {
  choices?: Array<{ delta?: { content?: string | Array<{ text?: string }> } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null;
};

const MAX_COMPLETION_TOKENS = 8000;
const CHAT_PAGE_SIZE = 50;

function eventStream(value: Record<string, unknown>) {
  return `data: ${JSON.stringify(value)}\n\n`;
}

function estimateTokens(text: string) {
  return Math.ceil(new TextEncoder().encode(text).byteLength / 3);
}

async function logActivity(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  userId: string,
  conversationId: string | null,
  event: string,
  metadata: Record<string, string | number>,
) {
  const { error } = await admin.from("chatbot_activity_logs").insert({
    user_id: userId,
    conversation_id: conversationId,
    event,
    metadata,
  });
  if (error) console.error("Chatbot activity logging failed", error.message);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let parsed: z.infer<typeof requestSchema>;
  try {
    parsed = requestSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "A message of up to 10,000 characters is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  if (!apiKey || !model) return Response.json({ error: "The assistant is not configured" }, { status: 503 });

  const admin = getSupabaseAdminClient();
  let conversationId = parsed.conversationId ?? null;
  if (conversationId) {
    const { data, error } = await admin.from("chatbot_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) return Response.json({ error: "Could not load conversation" }, { status: 500 });
    if (!data) return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  const [{ data: settings, error: settingsError }, { data: sources, error: sourcesError }] = await Promise.all([
    admin.from("chatbot_user_settings").select("instruction").eq("user_id", user.id).maybeSingle(),
    admin.from("chatbot_source_files").select("file_name, content").eq("user_id", user.id).order("created_at", { ascending: true }),
  ]);
  if (settingsError || sourcesError) {
    return Response.json({ error: "Could not prepare your conversation" }, { status: 500 });
  }

  let history: { role: string; content: string }[] = [];
  if (conversationId) {
    const { data, error } = await admin.from("chatbot_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(CHAT_PAGE_SIZE);
    if (error) return Response.json({ error: "Could not load conversation history" }, { status: 500 });
    history = data;
  }

  const systemPrompt = buildSystemPrompt(settings?.instruction ?? null, sources ?? []);
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.reverse()
      .map((entry) => ({ role: entry.role as ChatMessage["role"], content: entry.content })),
    { role: "user", content: parsed.message },
  ];
  const usageDate = new Date().toISOString().slice(0, 10);
  const estimatedPromptTokens = estimateTokens(JSON.stringify(messages));
  const { data: reservationData, error: reservationError } = await admin.rpc("chatbot_reserve_daily_tokens", {
    p_user_id: user.id,
    p_usage_date: usageDate,
    p_estimated_prompt_tokens: estimatedPromptTokens,
    p_requested_completion_tokens: MAX_COMPLETION_TOKENS,
  });
  if (reservationError) {
    console.error("Could not reserve daily chatbot tokens", reservationError.message);
    return Response.json({ error: "Could not check the daily chat limit" }, { status: 500 });
  }
  const reservation = Array.isArray(reservationData) ? reservationData[0] : reservationData;
  if (
    !reservation ||
    typeof reservation.allowed !== "boolean" ||
    !Number.isSafeInteger(reservation.max_completion_tokens) ||
    !Number.isSafeInteger(reservation.used_tokens)
  ) {
    console.error("Daily chatbot token reservation returned an invalid result");
    return Response.json({ error: "Could not check the daily chat limit" }, { status: 500 });
  }
  if (!reservation?.allowed) {
    await logActivity(admin, user.id, conversationId, "daily_token_limit_reached", {
      used_tokens: Number(reservation?.used_tokens ?? 0),
      daily_token_limit: Number(reservation?.daily_token_limit ?? 0),
    });
    const tomorrowUtc = new Date(`${usageDate}T00:00:00.000Z`).getTime() + 24 * 60 * 60 * 1000;
    return Response.json(
      { error: "Your daily chat token limit has been reached. You can continue after the UTC day resets." },
      { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((tomorrowUtc - Date.now()) / 1000))) } },
    );
  }
  const maxCompletionTokens = reservation.max_completion_tokens;
  if (maxCompletionTokens < 1 || maxCompletionTokens > MAX_COMPLETION_TOKENS) {
    console.error("Daily chatbot token reservation exceeded the requested completion budget");
    return Response.json({ error: "Could not check the daily chat limit" }, { status: 500 });
  }
  const reservedTokens = estimatedPromptTokens + maxCompletionTokens;

  async function settleTokens(actualTokens: number) {
    const { error } = await admin.rpc("chatbot_settle_daily_tokens", {
      p_user_id: user.id,
      p_usage_date: usageDate,
      p_reserved_tokens: reservedTokens,
      p_actual_tokens: actualTokens,
    });
    if (error) console.error("Could not settle daily chatbot token usage", error.message);
  }

  if (!conversationId) {
    const title = parsed.message.replace(/\s+/g, " ").slice(0, 100) || "New conversation";
    const { data, error } = await admin.from("chatbot_conversations")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();
    if (error || !data) {
      await settleTokens(0);
      return Response.json({ error: "Could not create conversation" }, { status: 500 });
    }
    conversationId = data.id;
  }
  const resolvedConversationId = conversationId;
  if (!resolvedConversationId) {
    await settleTokens(0);
    return Response.json({ error: "Could not create conversation" }, { status: 500 });
  }

  const { error: saveUserError } = await admin.from("chatbot_messages").insert({
    conversation_id: resolvedConversationId,
    user_id: user.id,
    role: "user",
    content: parsed.message,
  });
  if (saveUserError) {
    await settleTokens(0);
    return Response.json({ error: "Could not save your message" }, { status: 500 });
  }
  await logActivity(admin, user.id, resolvedConversationId, "chat_started", {});

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_CHATBOT_URL || "http://localhost:3002",
      "X-Title": "SEED Assistant",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxCompletionTokens,
      stream: true,
      stream_options: { include_usage: true },
    }),
    signal: request.signal,
  }).catch(() => null);
  const upstreamBody = upstream?.body;
  if (!upstream?.ok || !upstreamBody) {
    await settleTokens(0);
    await logActivity(admin, user.id, resolvedConversationId, "chat_failed", {
      reason: "upstream_unavailable",
      status: upstream?.status ?? 0,
    });
    return Response.json({ error: "The assistant is temporarily unavailable" }, { status: 502 });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      let answer = "";
      let buffer = "";
      let actualTokens: number | null = null;
      controller.enqueue(encoder.encode(eventStream({ conversationId: resolvedConversationId })));
      try {
        const reader = upstreamBody.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ") || line.slice(6) === "[DONE]") continue;
            let payload: OpenRouterEvent;
            try {
              payload = JSON.parse(line.slice(6)) as OpenRouterEvent;
            } catch {
              continue;
            }
            if (payload.usage) {
              const { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: totalTokens } = payload.usage;
              if (Number.isSafeInteger(totalTokens) && (totalTokens ?? -1) >= 0) {
                actualTokens = totalTokens!;
              } else if (
                Number.isSafeInteger(promptTokens) && (promptTokens ?? -1) >= 0 &&
                Number.isSafeInteger(completionTokens) && (completionTokens ?? -1) >= 0
              ) {
                actualTokens = promptTokens! + completionTokens!;
              }
            }
            const rawContent = payload.choices?.[0]?.delta?.content;
            const delta = typeof rawContent === "string" ? rawContent : rawContent?.map((part) => part.text ?? "").join("") ?? "";
            if (delta) {
              const accepted = delta.slice(0, 30000 - answer.length);
              if (accepted) {
                answer += accepted;
                controller.enqueue(encoder.encode(eventStream({ delta: accepted })));
              }
              if (answer.length >= 30000) {
                await reader.cancel();
                break;
              }
            }
          }
        }
        if (buffer.startsWith("data: ") && buffer.slice(6) !== "[DONE]") {
          try {
            const finalPayload = JSON.parse(buffer.slice(6)) as OpenRouterEvent;
            const finalUsage = finalPayload.usage;
            if (finalUsage) {
              const { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: totalTokens } = finalUsage;
              if (Number.isSafeInteger(totalTokens) && (totalTokens ?? -1) >= 0) {
                actualTokens = totalTokens!;
              } else if (
                Number.isSafeInteger(promptTokens) && (promptTokens ?? -1) >= 0 &&
                Number.isSafeInteger(completionTokens) && (completionTokens ?? -1) >= 0
              ) {
                actualTokens = promptTokens! + completionTokens!;
              }
            }
          } catch {
            console.error("Could not parse final OpenRouter usage event");
          }
        }
        if (answer) {
          const { error: saveError } = await admin.from("chatbot_messages").insert({
            conversation_id: resolvedConversationId,
            user_id: user.id,
            role: "assistant",
            content: answer.slice(0, 30000),
          });
          if (saveError) throw new Error("Could not save assistant response");
        }
        const { error: conversationUpdateError } = await admin.from("chatbot_conversations").update({ updated_at: new Date().toISOString() })
          .eq("id", resolvedConversationId)
          .eq("user_id", user.id);
        if (conversationUpdateError) console.error("Could not update chatbot conversation timestamp", conversationUpdateError.message);
        await logActivity(admin, user.id, resolvedConversationId, "chat_completed", { model, response_characters: answer.length });
        controller.enqueue(encoder.encode(eventStream({ done: true })));
        controller.close();
      } catch {
        console.error("Chatbot response stream failed");
        await logActivity(admin, user.id, resolvedConversationId, "chat_failed", { reason: "response_stream_or_persistence_error" });
        controller.enqueue(encoder.encode(eventStream({ error: "The assistant response could not be saved" })));
        controller.close();
      } finally {
        const tokensToSettle = actualTokens ?? estimateTokens(JSON.stringify(messages) + answer);
        if (actualTokens === null) {
          await logActivity(admin, user.id, resolvedConversationId, "token_usage_estimated", {
            estimated_tokens: tokensToSettle,
          });
        }
        await settleTokens(tokensToSettle);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
