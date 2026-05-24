import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, u as useLocation, L as Link, O as Outlet } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth } from "./router-DDX2tWq5.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./createSsrRpc-CbfToRDd.mjs";
import { g as getProfile } from "./learnova.functions-Ca7SVHGM.mjs";
import { s as supabase } from "./client-CuGaxAnF.mjs";
import { N as Nova } from "./Nova-CLOa5n3E.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { T as ThemeToggle } from "./ThemeToggle-BZUPsXrS.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/seroval.mjs";
import { q as Sparkles, e as House, M as MessageSquare, i as Mic, T as Target, F as FileText, v as Trophy, h as LogOut } from "../_libs/lucide-react.mjs";
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
import "./nova-prompts-OzvyQkcx.mjs";
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
import "./index-B082ds2F.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/iceberg-js.mjs";
import "./auth-middleware-B4tEUqco.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
function AppLayout() {
  const {
    user,
    loading
  } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const fetchProfile = useServerFn(getProfile);
  const {
    data: profile
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
    enabled: !!user
  });
  reactExports.useEffect(() => {
    if (!loading && !user) nav({
      to: "/auth"
    });
  }, [user, loading, nav]);
  if (loading || !user) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 120 }) });
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xpForNext = level * level * 50;
  const progressPct = Math.min(100, xp / xpForNext * 100);
  const nav_items = [{
    to: "/app/dashboard",
    icon: House,
    label: "Dashboard"
  }, {
    to: "/app/chat",
    icon: MessageSquare,
    label: "Chat with Nova"
  }, {
    to: "/app/voice",
    icon: Mic,
    label: "Voice with Nova"
  }, {
    to: "/app/draw",
    icon: Sparkles,
    label: "Draw to Learn"
  }, {
    to: "/app/podcast",
    icon: Mic,
    label: "Audio Podcast"
  }, {
    to: "/app/quiz",
    icon: Target,
    label: "Quizzes"
  }, {
    to: "/app/battle",
    icon: Sparkles,
    label: "Brain Battles"
  }, {
    to: "/app/notes",
    icon: FileText,
    label: "Summarizer"
  }, {
    to: "/app/rooms",
    icon: MessageSquare,
    label: "Study Rooms"
  }, {
    to: "/app/badges",
    icon: Trophy,
    label: "Badges"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden md:flex w-64 flex-col border-r border-border/40 bg-sidebar/60 backdrop-blur-xl p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 px-2 py-2 font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-xl gradient-hero grid place-items-center text-white shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text font-display text-lg", children: "LEARNOVA" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 glass rounded-2xl p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 56, float: false, glow: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xl", children: level })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full gradient-hero transition-all", style: {
          width: `${progressPct}%`
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex justify-between text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            xp,
            " XP"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: xpForNext })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-xs", children: [
          "🔥 ",
          profile?.current_streak ?? 0,
          " day streak"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "mt-6 space-y-1 flex-1", children: nav_items.map((i) => {
        const active = loc.pathname.startsWith(i.to);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: i.to, className: cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition", active ? "gradient-hero text-primary-foreground shadow-glow" : "hover:bg-sidebar-accent text-sidebar-foreground"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(i.icon, { className: "h-4 w-4" }),
          " ",
          i.label
        ] }, i.to);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: async () => {
          await supabase.auth.signOut();
          nav({
            to: "/"
          });
        }, className: "flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-sidebar-accent flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
          " Sign out"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {})
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 min-w-0 pb-16 md:pb-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/40 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-around p-2", children: nav_items.slice(0, 5).map((i) => {
      const active = loc.pathname.startsWith(i.to);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: i.to, className: cn("flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition", active ? "text-primary" : "text-muted-foreground hover:text-foreground"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(i.icon, { className: cn("h-5 w-5", active && "text-primary") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[60px]", children: i.label.replace("with Nova", "").trim() })
      ] }, i.to);
    }) }) })
  ] });
}
export {
  AppLayout as component
};
