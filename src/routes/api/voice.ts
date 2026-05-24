import { createFileRoute } from "@tanstack/react-router";
import { compressConversationHistory, generateTextWithFailover, hasAnyAiKey } from "@/lib/ai-gateway";
import { buildVoiceSystem } from "@/lib/nova-prompts";
import { rateLimit, requireUser, clientIp, validateMessages, moderate, logEvent } from "@/lib/api-guards.server";

export const Route = createFileRoute("/api/voice")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const auth = await requireUser(request);
        if (auth instanceof Response) return auth;

        const rl = rateLimit(`voice:${auth.userId}`, 40, 60_000);
        if (!rl.ok) return new Response(JSON.stringify({ error: "Slow down a bit." }), {
          status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) },
        });

        let body: { messages?: { role: "user" | "assistant"; content: string }[]; lang?: string };
        try { body = await request.json(); } catch { return new Response("bad json", { status: 400 }); }
        const messages = body.messages || [];
        const lang = body.lang || "en-US";
        const err = validateMessages(messages as never);
        if (err) return new Response(err, { status: 400 });

        const lastUser = messages.slice().reverse().find(m => m.role === "user");
        const lastText = lastUser?.content || "";
        const mod = moderate(lastText);
        if (!mod.ok) {
          logEvent("moderation_block", { route: "voice", userId: auth.userId, ip: clientIp(request), category: mod.category, preview: lastText.slice(0, 120) });
          return Response.json({ reply: "I can't help with that. Let's pick a study topic instead." });
        }
        logEvent("voice_request", { userId: auth.userId, ip: clientIp(request), msgs: messages.length, chars: lastText.length });

        if (!hasAnyAiKey()) {
          return new Response("Missing AI API keys", { status: 500 });
        }

        const isBangla = lang === "bn-BD" || /[\u0980-\u09FF]/.test(lastText);
        const history = compressConversationHistory(messages, "voice");

        try {
          const { text } = await generateTextWithFailover({
            tier: "quality",
            budget: "voice",
            system: buildVoiceSystem(isBangla),
            messages: history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content || "" })),
            maxRetries: 0,
          });
          return Response.json({ reply: text }, {
            headers: { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" },
          });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          const isQuota = /429|quota|RESOURCE_EXHAUSTED|rate.?limit/i.test(msg);
          console.error("[voice] error:", isQuota ? "QUOTA_EXCEEDED" : msg, "ip:", clientIp(request));
          const reply = isQuota
            ? (isBangla ? "আমার একটু বিশ্রাম দরকার — সব API ব্যস্ত। এক মিনিট পর আবার চেষ্টা করো!" : "I need a quick break — all API keys are busy. Please try again in a minute!")
            : (isBangla ? "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো।" : "Something went wrong. Please try again.");
          return Response.json({ reply }, { status: isQuota ? 429 : 500 });
        }
      },
    },
  },
});
