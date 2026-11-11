import { createFileRoute } from "@tanstack/react-router";
import { compressConversationHistory, generateTextWithFailover, hasAnyAiKey } from "@/lib/ai-gateway";
import { buildVoiceSystem } from "@/lib/nova-prompts";
import { requireUser, clientIp, validateMessages, logEvent } from "@/lib/api-guards.server";
import { detectBangla, moderate, SAFETY_REPLIES } from "@/lib/moderation-rules";
import { enforce, RateLimitError } from "@/lib/guard.server";
import { grantXp } from "@/lib/db.server";

const SECURITY_HEADERS = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };

export const Route = createFileRoute("/api/voice")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const auth = await requireUser(request);
        if (auth instanceof Response) return auth;

        let body: { messages?: { role: "user" | "assistant"; content: string }[]; lang?: string };
        try {
          body = await request.json();
        } catch {
          return new Response("bad json", { status: 400 });
        }
        const messages = body.messages || [];
        const lang = body.lang || "en-US";
        const err = validateMessages(messages as never);
        if (err) return new Response(err, { status: 400 });

        const lastText = messages.slice().reverse().find((m) => m.role === "user")?.content || "";
        const mod = moderate(lastText);
        if (!mod.ok) {
          logEvent("moderation_block", { route: "voice", userId: auth.userId, ip: clientIp(request), category: mod.category, preview: lastText.slice(0, 120) });
          const bn = lang === "bn-BD" || detectBangla(lastText);
          if (mod.category === "self_harm") return Response.json({ reply: bn ? SAFETY_REPLIES.self_harm.bn : SAFETY_REPLIES.self_harm.en });
          return Response.json({ reply: bn ? "এটা নিয়ে আমি সাহায্য করতে পারব না। চলো পড়াশোনার কোনো বিষয় বেছে নিই।" : "I can't help with that. Let's pick a study topic instead." });
        }

        try {
          await enforce(auth.userId, auth.isAnonymous, "voice");
        } catch (e) {
          if (e instanceof RateLimitError) {
            return Response.json({ reply: e.message }, { status: 429, headers: { "Retry-After": String(e.retryAfter) } });
          }
          throw e;
        }
        logEvent("voice_request", { userId: auth.userId, guest: auth.isAnonymous, ip: clientIp(request), msgs: messages.length, chars: lastText.length });

        if (!hasAnyAiKey()) return new Response("Missing AI API keys", { status: 500 });

        const isBangla = lang === "bn-BD" || detectBangla(lastText);
        const history = compressConversationHistory(messages, "voice");

        try {
          const { text } = await generateTextWithFailover({
            tier: "quality",
            budget: "voice",
            system: buildVoiceSystem(isBangla),
            messages: history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content || "" })),
            maxRetries: 0,
          });
          void grantXp(auth.userId, "voice_reply");
          return Response.json({ reply: text }, { headers: SECURITY_HEADERS });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          const isQuota = /429|quota|RESOURCE_EXHAUSTED|rate.?limit|overloaded/i.test(msg);
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
