import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { N as Nova } from "./Nova-CLOa5n3E.mjs";
import { T as ThemeToggle } from "./ThemeToggle-UbvaIwLr.mjs";
import "../_libs/sonner.mjs";
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
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./router-BWQ2rPTY.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./client-DRwH8z1O.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./nova-prompts-B6aBf0d7.mjs";
import "../_libs/ai-sdk__google.mjs";
import "../_libs/ai-sdk__provider-utils.mjs";
import "../_libs/ai-sdk__provider.mjs";
import "../_libs/eventsource-parser.mjs";
import "../_libs/zod.mjs";
import "../_libs/ai-sdk__groq.mjs";
import "../_libs/ai.mjs";
import "../_libs/ai-sdk__gateway.mjs";
import "../_libs/@vercel/oidc.mjs";
import "path";
import "fs";
import "os";
import "../_libs/opentelemetry__api.mjs";
import "../_libs/lucide-react.mjs";
function DocsPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6 h-16 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "flex items-center gap-2 font-bold text-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text font-display tracking-tight", children: "LEARNOVA" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "text-sm font-semibold px-5 py-2 rounded-full gradient-hero text-primary-foreground shadow-glow", children: "Get started" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-4xl mx-auto p-6 md:p-12 space-y-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 120, glow: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl md:text-5xl font-bold gradient-text tracking-tight", children: "LEARNOVA Documentation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto", children: "Technical overview and live system metrics for the LEARNOVA adaptive learning platform." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "intro", className: "glass rounded-3xl p-8 ring-gradient", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold mb-4 flex items-center gap-2", children: "🚀 Elevator Pitch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "LEARNOVA" }),
          " is an adaptive, multimodal AI tutor designed to make learning personalized and accessible. Unlike traditional search engines or generic chatbots, Nova acts as a patient tutor—breaking down complex concepts step-by-step, generating tailored quizzes, and summarizing study materials. It supports English, Bangla, and Banglish natively, adapting to the user's proficiency level and learning style to ensure concepts truly click."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "dashboard", className: "glass rounded-3xl p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold mb-6 flex items-center gap-2", children: "📊 Live System Metrics" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(LiveStats, {})
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "architecture", className: "glass rounded-3xl p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold mb-4 flex items-center gap-2", children: "🏗️ Technical Architecture" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card/50 rounded-xl p-6 border border-border/50 font-mono text-sm overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { children: `graph LR
    UI[React + TanStack Start] --> API[Server Functions]
    API --> Gemini[Gemini‑2.5‑Flash]
    API --> Supabase[Postgres (RLS)]
    UI --> PDFSandbox[PDF.js (client‑side)]
    UI --> Voice[Web Speech API]
    API --> Guardrails[Moderation & Safety]` }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "stack", className: "glass rounded-3xl p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-semibold mb-4 flex items-center gap-2", children: "🛠️ Stack & Features" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-4 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground min-w-[120px]", children: "Frontend:" }),
            "React 19, TanStack Start, Tailwind CSS v4, Radix UI."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground min-w-[120px]", children: "Backend:" }),
            "TanStack Start API Routes, Vercel/Cloudflare ready."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground min-w-[120px]", children: "Database & Auth:" }),
            "Supabase (PostgreSQL with RLS), Email/Google OAuth."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground min-w-[120px]", children: "AI Engine:" }),
            "Google Gemini 2.5 Flash via AI SDK, adaptive prompting."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground min-w-[120px]", children: "Security:" }),
            "Regex-based content moderation, API rate limiting, safe prompts."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "pt-8 pb-12 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "hover:text-foreground transition flex items-center justify-center gap-2", children: "← Back to Home" }) })
    ] })
  ] });
}
function LiveStats() {
  const [stats, setStats] = reactExports.useState({
    users: 0,
    quizzes: 0,
    notes: 0
  });
  reactExports.useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok && mounted) {
          setStats(await res.json());
        }
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
    }
    fetchStats();
    const id = setInterval(fetchStats, 3e4);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/50 rounded-2xl p-6 text-center border border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl font-bold gradient-text", children: stats.users }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-2 font-medium", children: "Active Users" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/50 rounded-2xl p-6 text-center border border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl font-bold gradient-text", children: stats.quizzes }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-2 font-medium", children: "Quizzes Created" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/50 rounded-2xl p-6 text-center border border-border/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl font-bold gradient-text", children: stats.notes }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-2 font-medium", children: "Summaries Saved" })
    ] })
  ] });
}
export {
  DocsPage as component
};
