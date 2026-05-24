import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./createSsrRpc-CbfToRDd.mjs";
import { g as getProfile, l as listBadges, x as xpHistory } from "./learnova.functions-CCVxPp8L.mjs";
import { N as Nova } from "./Nova-CLOa5n3E.mjs";
import "./index.mjs";
import "../_libs/seroval.mjs";
import { M as MessageSquare, T as Target, F as FileText, v as Trophy, Z as Zap, d as Flame } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./auth-middleware-JBvrN22J.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
function Dashboard() {
  const p = useServerFn(getProfile);
  const b = useServerFn(listBadges);
  const x = useServerFn(xpHistory);
  const {
    data: profile
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => p()
  });
  const {
    data: badges
  } = useQuery({
    queryKey: ["badges"],
    queryFn: () => b()
  });
  const {
    data: events
  } = useQuery({
    queryKey: ["xp"],
    queryFn: () => x()
  });
  const tiles = [{
    to: "/app/chat",
    icon: MessageSquare,
    title: "Chat with Nova",
    desc: "Ask anything, get step-by-step help.",
    color: "from-purple-500 to-pink-500"
  }, {
    to: "/app/quiz",
    icon: Target,
    title: "Take a quiz",
    desc: "AI-generated mock tests in seconds.",
    color: "from-blue-500 to-cyan-500"
  }, {
    to: "/app/notes",
    icon: FileText,
    title: "Summarize notes",
    desc: "Paste text → get summary + flashcards.",
    color: "from-amber-500 to-rose-500"
  }, {
    to: "/app/badges",
    icon: Trophy,
    title: "Your badges",
    desc: `${badges?.length ?? 0} unlocked`,
    color: "from-emerald-500 to-teal-500"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-10 max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 shadow-glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 140 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-center md:text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl md:text-4xl font-bold", children: [
          "Welcome back, ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: profile?.display_name ?? "learner" }),
          "! ✨"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Ready to level up today? I've got quizzes, summaries, and code help waiting." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-3 justify-center md:justify-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Zap, label: "XP", value: profile?.xp ?? 0 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Trophy, label: "Level", value: profile?.level ?? 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: Flame, label: "Streak", value: `${profile?.current_streak ?? 0}d` })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8", children: tiles.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: t.to, className: "group glass rounded-2xl p-5 hover:scale-[1.03] hover:shadow-glow transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-12 w-12 rounded-xl bg-gradient-to-br ${t.color} grid place-items-center text-white shadow-glow mb-3 group-hover:scale-110 transition`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: t.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-1", children: t.desc })
    ] }, t.to)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4 mt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-lg mb-3", children: "Recent XP" }),
        !events?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No activity yet — start a chat to earn your first XP!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: events?.slice(0, 8).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: e.reason }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-primary", children: [
            "+",
            e.amount,
            " XP"
          ] })
        ] }, e.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-lg mb-3", children: "Latest badges" }),
        !badges?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Earn XP to unlock badges 🏆" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: badges?.slice(0, 6).map((b2) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center glass rounded-xl p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl", children: b2.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold mt-1", children: b2.name })
        ] }, b2.id)) })
      ] })
    ] })
  ] });
}
function Stat({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl px-4 py-2 flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-primary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: value })
  ] });
}
export {
  Dashboard as component
};
