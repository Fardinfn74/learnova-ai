import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from "ai";
import { compressConversationHistory, generateTextWithFailover, hasAnyAiKey } from "@/lib/ai-gateway";
import { buildChatSystem } from "@/lib/nova-prompts";
import { rateLimit, requireUser, clientIp, validateMessages, moderate, logEvent } from "@/lib/api-guards.server";

function normalizeMessages(messages: any[]): any[] {
  return messages.map((m: any) => {
    const parts = Array.isArray(m.parts) && m.parts.length > 0
      ? m.parts.map((p: any) => ({
          type: p?.type || "text",
          text: p?.text !== undefined && p?.text !== null ? String(p.text) : "",
        }))
      : [{ type: "text", text: typeof m.content === "string" ? m.content : "" }];

    const content = typeof m.content === "string"
      ? m.content
      : parts.map((p: any) => (p?.type === "text" ? (p.text || "") : "")).join("");

    return {
      ...m,
      role: m.role,
      content,
      parts,
    };
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const auth = await requireUser(request);
        if (auth instanceof Response) return auth;

        const rl = rateLimit(`chat:${auth.userId}`, 30, 60_000);
        if (!rl.ok) return new Response(JSON.stringify({ error: "Rate limit. Slow down a bit." }), {
          status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) },
        });

        let body: { messages?: UIMessage[] };
        try { body = await request.json(); } catch { return new Response("bad json", { status: 400 }); }
        const messages = body.messages || [];
        const err = validateMessages(messages as never);
        if (err) return new Response(err, { status: 400 });

        const last = messages.slice().reverse().find(m => m.role === "user");
        const lastText = last ? (last.parts || []).map(p => p.type === "text" ? (p.text || "") : "").join("") : "";
        const mod = moderate(lastText);
        if (!mod.ok) {
          logEvent("moderation_block", { userId: auth.userId, ip: clientIp(request), category: mod.category, preview: lastText.slice(0, 120) });
          return new Response(JSON.stringify({ error: "Request blocked by safety filter." }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        logEvent("chat_request", { userId: auth.userId, ip: clientIp(request), msgs: messages.length, chars: lastText.length });

        if (!hasAnyAiKey()) {
          return new Response(JSON.stringify({ error: "AI not configured on server." }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        const isBangla = /[\u0980-\u09FF]/.test(lastText);

        try {
          const history = compressConversationHistory(normalizeMessages(messages), "chat");
          const modelMessages = await convertToModelMessages(history);

          const { text } = await generateTextWithFailover({
            tier: "quality",
            budget: "chat",
            system: buildChatSystem(isBangla),
            messages: modelMessages,
          });

          const stream = createUIMessageStream({
            execute: ({ writer }) => {
              const partId = crypto.randomUUID();
              writer.write({ type: "start" });
              writer.write({ type: "start-step" });
              writer.write({ type: "text-start", id: partId });
              writer.write({ type: "text-delta", id: partId, delta: text });
              writer.write({ type: "text-end", id: partId });
              writer.write({ type: "finish-step" });
              writer.write({ type: "finish", finishReason: "stop" });
            },
          });

          return createUIMessageStreamResponse({ stream });
        } catch (e: unknown) {
          console.error("[chat] Full error details:", e);
          const msg = e instanceof Error ? e.message : String(e);
          const isQuota = /429|quota|RESOURCE_EXHAUSTED|rate.?limit/i.test(msg);
          console.error("[chat] error:", isQuota ? "QUOTA_EXCEEDED" : msg, "ip:", clientIp(request));
          const userMsg = isQuota
            ? "Nova is resting for a moment (all API keys busy). Please try again in a minute! 🌙"
            : "Something went wrong. Please try again.";
          return new Response(JSON.stringify({ error: userMsg }), {
            status: isQuota ? 429 : 500,
            headers: { "Content-Type": "application/json", ...(isQuota ? { "Retry-After": "60" } : {}) },
          });
        }
      },
    },
  },
});
