import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from "ai";
import { compressConversationHistory, hasAnyAiKey, streamTextWithFailover } from "@/lib/ai-gateway";
import { buildChatSystem } from "@/lib/nova-prompts";
import { requireUser, clientIp, validateMessages, logEvent } from "@/lib/api-guards.server";
import { detectBangla, moderate, SAFETY_REPLIES } from "@/lib/moderation-rules";
import { enforce, RateLimitError } from "@/lib/guard.server";
import { grantXp } from "@/lib/db.server";

const jsonError = (status: number, error: string, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify({ error }), { status, headers: { "Content-Type": "application/json", ...headers } });

function normalizeMessages(messages: any[]): any[] {
  return messages.map((m: any) => {
    const parts =
      Array.isArray(m.parts) && m.parts.length > 0
        ? m.parts.map((p: any) => ({ type: p?.type || "text", text: p?.text != null ? String(p.text) : "" }))
        : [{ type: "text", text: typeof m.content === "string" ? m.content : "" }];
    const content =
      typeof m.content === "string" ? m.content : parts.map((p: any) => (p?.type === "text" ? p.text || "" : "")).join("");
    return { ...m, role: m.role, content, parts };
  });
}

/** Text of a UI message, whether the client sent `parts` or plain `content`. */
function messageText(m: any): string {
  if (Array.isArray(m?.parts) && m.parts.length) return m.parts.map((p: any) => (p?.type === "text" ? p.text || "" : "")).join("");
  return typeof m?.content === "string" ? m.content : "";
}

/** A complete assistant reply delivered through the normal UI-message stream protocol. */
function staticReply(text: string): Response {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const id = crypto.randomUUID();
      writer.write({ type: "start" });
      writer.write({ type: "start-step" });
      writer.write({ type: "text-start", id });
      writer.write({ type: "text-delta", id, delta: text });
      writer.write({ type: "text-end", id });
      writer.write({ type: "finish-step" });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const auth = await requireUser(request);
        if (auth instanceof Response) return auth;

        let body: { messages?: UIMessage[] };
        try {
          body = await request.json();
        } catch {
          return jsonError(400, "bad json");
        }
        const messages = body.messages || [];
        const err = validateMessages(messages as never);
        if (err) return jsonError(400, err);

        const last = messages.slice().reverse().find((m) => m.role === "user");
        const lastText = messageText(last);

        const mod = moderate(lastText);
        if (!mod.ok) {
          logEvent("moderation_block", { route: "chat", userId: auth.userId, ip: clientIp(request), category: mod.category, preview: lastText.slice(0, 120) });
          if (mod.category === "self_harm") {
            // Never answer distress with an error: respond with care.
            return staticReply(detectBangla(lastText) ? SAFETY_REPLIES.self_harm.bn : SAFETY_REPLIES.self_harm.en);
          }
          return jsonError(400, "Request blocked by safety filter.");
        }

        try {
          await enforce(auth.userId, auth.isAnonymous, "chat");
        } catch (e) {
          if (e instanceof RateLimitError) return jsonError(429, e.message, { "Retry-After": String(e.retryAfter) });
          throw e;
        }

        logEvent("chat_request", { userId: auth.userId, guest: auth.isAnonymous, ip: clientIp(request), msgs: messages.length, chars: lastText.length });

        if (!hasAnyAiKey()) return jsonError(500, "AI not configured on server.");

        const isBangla = detectBangla(lastText);

        try {
          const history = compressConversationHistory(normalizeMessages(messages), "chat");
          const modelMessages = await convertToModelMessages(history);
          const { modelId, stream: deltas } = await streamTextWithFailover({
            tier: "quality",
            budget: "chat",
            system: buildChatSystem(isBangla),
            messages: modelMessages,
          });

          const stream = createUIMessageStream({
            execute: async ({ writer }) => {
              const id = crypto.randomUUID();
              writer.write({ type: "start" });
              writer.write({ type: "start-step" });
              writer.write({ type: "text-start", id });
              try {
                for await (const delta of deltas) writer.write({ type: "text-delta", id, delta });
              } catch (e) {
                console.error("[chat] stream interrupted:", modelId, e instanceof Error ? e.message : e);
                writer.write({ type: "text-delta", id, delta: isBangla ? "\n\n…(সংযোগে সমস্যা হয়েছে, আবার চেষ্টা করো)" : "\n\n…(connection hiccup — please try again)" });
              }
              writer.write({ type: "text-end", id });
              writer.write({ type: "finish-step" });
              writer.write({ type: "finish", finishReason: "stop" });
              void grantXp(auth.userId, "chat_reply");
            },
          });
          return createUIMessageStreamResponse({ stream });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          const isQuota = /429|quota|RESOURCE_EXHAUSTED|rate.?limit|overloaded/i.test(msg);
          console.error("[chat] error:", isQuota ? "QUOTA_EXCEEDED" : msg, "ip:", clientIp(request));
          return jsonError(
            isQuota ? 429 : 500,
            isQuota ? "Nova is resting for a moment (all API keys busy). Please try again in a minute! 🌙" : "Something went wrong. Please try again.",
            isQuota ? { "Retry-After": "60" } : {},
          );
        }
      },
    },
  },
});
