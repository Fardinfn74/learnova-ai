import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { b as createRouter, a as createRootRouteWithContext, e as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, c as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { s as supabase } from "./client-CuGaxAnF.mjs";
import { e as requireUser, r as rateLimit, v as validateMessages, m as moderate, l as logEvent, c as clientIp, h as hasAnyAiKey, d as compressConversationHistory, g as generateTextWithFailover, a as buildVoiceSystem, b as buildChatSystem } from "./nova-prompts-OzvyQkcx.mjs";
import { c as convertToModelMessages, a as createUIMessageStream, b as createUIMessageStreamResponse } from "../_libs/ai.mjs";
import { c as createClient } from "./index-B082ds2F.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/ai-sdk__google.mjs";
import "../_libs/ai-sdk__provider-utils.mjs";
import "../_libs/ai-sdk__provider.mjs";
import "../_libs/eventsource-parser.mjs";
import "../_libs/zod.mjs";
import "../_libs/ai-sdk__groq.mjs";
import "../_libs/ai-sdk__gateway.mjs";
import "../_libs/@vercel/oidc.mjs";
import "path";
import "fs";
import "os";
import "../_libs/opentelemetry__api.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/iceberg-js.mjs";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const Ctx$1 = reactExports.createContext({ user: null, session: null, loading: true });
function AuthProvider({ children }) {
  const [session, setSession] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx$1.Provider, { value: { user: session?.user ?? null, session, loading }, children });
}
const useAuth = () => reactExports.useContext(Ctx$1);
function AuroraBg() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none fixed inset-0 -z-10 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full bg-aurora-1 opacity-30 blur-3xl animate-blob" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/3 -right-32 h-[36rem] w-[36rem] rounded-full bg-aurora-2 opacity-25 blur-3xl animate-blob", style: { animationDelay: "-4s" } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-1/3 h-[32rem] w-[32rem] rounded-full bg-aurora-3 opacity-25 blur-3xl animate-blob", style: { animationDelay: "-8s" } })
  ] });
}
const Ctx = reactExports.createContext({
  theme: "dark",
  toggle: () => {
  },
  setTheme: () => {
  }
});
function ThemeProvider({ children }) {
  const [theme, setThemeState] = reactExports.useState("dark");
  reactExports.useEffect(() => {
    const stored = typeof localStorage !== "undefined" && localStorage.getItem("learnova-theme");
    const initial = stored ?? "dark";
    setThemeState(initial);
  }, []);
  reactExports.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("learnova-theme", theme);
    } catch {
    }
  }, [theme]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx.Provider, { value: { theme, toggle: () => setThemeState((t) => t === "dark" ? "light" : "dark"), setTheme: setThemeState }, children });
}
const useTheme = () => reactExports.useContext(Ctx);
const appCss = "/assets/styles-BFph51HH.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-3xl px-10 py-12 text-center shadow-glow", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-8xl font-bold gradient-text", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "Nova couldn't find that page." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-6 inline-flex rounded-full gradient-hero px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow", children: "Back home" })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass max-w-md rounded-3xl p-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Something went wrong" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => {
          router2.invalidate();
          reset();
        },
        className: "mt-4 rounded-full gradient-hero px-5 py-2 text-sm font-semibold text-primary-foreground",
        children: "Try again"
      }
    )
  ] }) });
}
const Route$i = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LEARNOVA — Meet Nova, your AI tutor" },
      { name: "description", content: "Adaptive AI tutor with personalized paths, quizzes, coding help, summaries and gamified learning. Chat with Nova in English, Bangla or Banglish." },
      { property: "og:title", content: "LEARNOVA — Meet Nova, your AI tutor" },
      { property: "og:description", content: "Adaptive AI tutor with personalized paths, quizzes, coding help, summaries and gamified learning. Chat with Nova in English, Bangla or Banglish." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "LEARNOVA — Meet Nova, your AI tutor" },
      { name: "twitter:description", content: "Adaptive AI tutor with personalized paths, quizzes, coding help, summaries and gamified learning. Chat with Nova in English, Bangla or Banglish." }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", className: "dark", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("head", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `(function(){try{var t=localStorage.getItem('learnova-theme')||'dark';var r=document.documentElement;if(t==='dark'){r.classList.add('dark')}else{r.classList.remove('dark')}}catch(e){}})();`
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$i.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuroraBg, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-right", richColors: true })
  ] }) }) });
}
const $$splitComponentImporter$e = () => import("./docs-CP-hGzO2.mjs");
const Route$h = createFileRoute("/docs")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./auth-Biys0OaR.mjs");
const Route$g = createFileRoute("/auth")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component"),
  head: () => ({
    meta: [{
      title: "Sign in · LEARNOVA"
    }]
  })
});
const $$splitComponentImporter$c = () => import("./app-BwKloTLg.mjs");
const Route$f = createFileRoute("/app")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./index-BDvHuPtU.mjs");
const Route$e = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component"),
  head: () => ({
    meta: [{
      title: "LEARNOVA — Adaptive AI tutor with Nova"
    }, {
      name: "description",
      content: "Meet Nova: your friendly AI tutor for personalized learning paths, quizzes, coding help, PDF summaries and XP-based progress. Bangla, Banglish, English."
    }]
  })
});
const $$splitComponentImporter$a = () => import("./app.voice-nncSycB-.mjs");
const Route$d = createFileRoute("/app/voice")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./app.rooms-CGVJxjdo.mjs");
const Route$c = createFileRoute("/app/rooms")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./app.quiz-BtT7wXQO.mjs");
const Route$b = createFileRoute("/app/quiz")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./app.podcast-UhUJoTpv.mjs");
const Route$a = createFileRoute("/app/podcast")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./app.notes-CtBVDl35.mjs");
const Route$9 = createFileRoute("/app/notes")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./app.draw-B6slU_xZ.mjs");
const Route$8 = createFileRoute("/app/draw")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./app.dashboard-C6S4H7d4.mjs");
const Route$7 = createFileRoute("/app/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./app.chat-DtTphf4s.mjs");
const Route$6 = createFileRoute("/app/chat")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./app.battle-8lXZG1Ss.mjs");
const Route$5 = createFileRoute("/app/battle")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./app.badges-CEcqQz6a.mjs");
const Route$4 = createFileRoute("/app/badges")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const Route$3 = createFileRoute("/api/voice")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireUser(request);
        if (auth instanceof Response) return auth;
        const rl = rateLimit(`voice:${auth.userId}`, 40, 6e4);
        if (!rl.ok) return new Response(JSON.stringify({ error: "Slow down a bit." }), {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) }
        });
        let body;
        try {
          body = await request.json();
        } catch {
          return new Response("bad json", { status: 400 });
        }
        const messages = body.messages || [];
        const lang = body.lang || "en-US";
        const err = validateMessages(messages);
        if (err) return new Response(err, { status: 400 });
        const lastUser = messages.slice().reverse().find((m) => m.role === "user");
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
            messages: history.map((m) => ({ role: m.role, content: m.content || "" })),
            maxRetries: 0
          });
          return Response.json({ reply: text }, {
            headers: { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" }
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          const isQuota = /429|quota|RESOURCE_EXHAUSTED|rate.?limit/i.test(msg);
          console.error("[voice] error:", isQuota ? "QUOTA_EXCEEDED" : msg, "ip:", clientIp(request));
          const reply = isQuota ? isBangla ? "আমার একটু বিশ্রাম দরকার — সব API ব্যস্ত। এক মিনিট পর আবার চেষ্টা করো!" : "I need a quick break — all API keys are busy. Please try again in a minute!" : isBangla ? "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো।" : "Something went wrong. Please try again.";
          return Response.json({ reply }, { status: isQuota ? 429 : 500 });
        }
      }
    }
  }
});
function normalizeMessages(messages) {
  return messages.map((m) => {
    const parts = Array.isArray(m.parts) && m.parts.length > 0 ? m.parts.map((p) => ({
      type: p?.type || "text",
      text: p?.text !== void 0 && p?.text !== null ? String(p.text) : ""
    })) : [{ type: "text", text: typeof m.content === "string" ? m.content : "" }];
    const content = typeof m.content === "string" ? m.content : parts.map((p) => p?.type === "text" ? p.text || "" : "").join("");
    return {
      ...m,
      role: m.role,
      content,
      parts
    };
  });
}
const Route$2 = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireUser(request);
        if (auth instanceof Response) return auth;
        const rl = rateLimit(`chat:${auth.userId}`, 30, 6e4);
        if (!rl.ok) return new Response(JSON.stringify({ error: "Rate limit. Slow down a bit." }), {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) }
        });
        let body;
        try {
          body = await request.json();
        } catch {
          return new Response("bad json", { status: 400 });
        }
        const messages = body.messages || [];
        const err = validateMessages(messages);
        if (err) return new Response(err, { status: 400 });
        const last = messages.slice().reverse().find((m) => m.role === "user");
        const lastText = last ? (last.parts || []).map((p) => p.type === "text" ? p.text || "" : "").join("") : "";
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
            messages: modelMessages
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
            }
          });
          return createUIMessageStreamResponse({ stream });
        } catch (e) {
          console.error("[chat] Full error details:", e);
          const msg = e instanceof Error ? e.message : String(e);
          const isQuota = /429|quota|RESOURCE_EXHAUSTED|rate.?limit/i.test(msg);
          console.error("[chat] error:", isQuota ? "QUOTA_EXCEEDED" : msg, "ip:", clientIp(request));
          const userMsg = isQuota ? "Nova is resting for a moment (all API keys busy). Please try again in a minute! 🌙" : "Something went wrong. Please try again.";
          return new Response(JSON.stringify({ error: userMsg }), {
            status: isQuota ? 429 : 500,
            headers: { "Content-Type": "application/json", ...isQuota ? { "Retry-After": "60" } : {} }
          });
        }
      }
    }
  }
});
const $$splitComponentImporter = () => import("./app.room._roomId-7sKrrvnx.mjs");
const Route$1 = createFileRoute("/app/room/$roomId")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const Route = createFileRoute("/api/admin/stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
        const SUPABASE_ANON = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
        if (!SUPABASE_URL || !SUPABASE_ANON) {
          return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
        const supabase2 = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });
        const [{ count: users }, { count: quizzes }, { count: notes }] = await Promise.all([
          supabase2.from("profiles").select("id", { count: "exact", head: true }).maybeSingle(),
          supabase2.from("quizzes").select("id", { count: "exact", head: true }).maybeSingle(),
          supabase2.from("notes").select("id", { count: "exact", head: true }).maybeSingle()
        ]);
        return new Response(JSON.stringify({ users, quizzes, notes }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }
  }
});
const DocsRoute = Route$h.update({
  id: "/docs",
  path: "/docs",
  getParentRoute: () => Route$i
});
const AuthRoute = Route$g.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$i
});
const AppRoute = Route$f.update({
  id: "/app",
  path: "/app",
  getParentRoute: () => Route$i
});
const IndexRoute = Route$e.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$i
});
const AppVoiceRoute = Route$d.update({
  id: "/voice",
  path: "/voice",
  getParentRoute: () => AppRoute
});
const AppRoomsRoute = Route$c.update({
  id: "/rooms",
  path: "/rooms",
  getParentRoute: () => AppRoute
});
const AppQuizRoute = Route$b.update({
  id: "/quiz",
  path: "/quiz",
  getParentRoute: () => AppRoute
});
const AppPodcastRoute = Route$a.update({
  id: "/podcast",
  path: "/podcast",
  getParentRoute: () => AppRoute
});
const AppNotesRoute = Route$9.update({
  id: "/notes",
  path: "/notes",
  getParentRoute: () => AppRoute
});
const AppDrawRoute = Route$8.update({
  id: "/draw",
  path: "/draw",
  getParentRoute: () => AppRoute
});
const AppDashboardRoute = Route$7.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AppRoute
});
const AppChatRoute = Route$6.update({
  id: "/chat",
  path: "/chat",
  getParentRoute: () => AppRoute
});
const AppBattleRoute = Route$5.update({
  id: "/battle",
  path: "/battle",
  getParentRoute: () => AppRoute
});
const AppBadgesRoute = Route$4.update({
  id: "/badges",
  path: "/badges",
  getParentRoute: () => AppRoute
});
const ApiVoiceRoute = Route$3.update({
  id: "/api/voice",
  path: "/api/voice",
  getParentRoute: () => Route$i
});
const ApiChatRoute = Route$2.update({
  id: "/api/chat",
  path: "/api/chat",
  getParentRoute: () => Route$i
});
const AppRoomRoomIdRoute = Route$1.update({
  id: "/room/$roomId",
  path: "/room/$roomId",
  getParentRoute: () => AppRoute
});
const ApiAdminStatsRoute = Route.update({
  id: "/api/admin/stats",
  path: "/api/admin/stats",
  getParentRoute: () => Route$i
});
const AppRouteChildren = {
  AppBadgesRoute,
  AppBattleRoute,
  AppChatRoute,
  AppDashboardRoute,
  AppDrawRoute,
  AppNotesRoute,
  AppPodcastRoute,
  AppQuizRoute,
  AppRoomsRoute,
  AppVoiceRoute,
  AppRoomRoomIdRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRouteWithChildren,
  AuthRoute,
  DocsRoute,
  ApiChatRoute,
  ApiVoiceRoute,
  ApiAdminStatsRoute
};
const routeTree = Route$i._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$1 as R,
  useTheme as a,
  router as r,
  useAuth as u
};
