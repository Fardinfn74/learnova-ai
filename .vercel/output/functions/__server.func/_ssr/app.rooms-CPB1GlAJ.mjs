import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-DRwH8z1O.mjs";
import { u as useAuth } from "./router-BWQ2rPTY.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { x as Users, n as Plus, g as LogIn } from "../_libs/lucide-react.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
function RoomsPage() {
  const {
    user
  } = useAuth();
  const nav = useNavigate();
  const [topic, setTopic] = reactExports.useState("");
  const [joinCode, setJoinCode] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const createRoom = async () => {
    if (!topic.trim()) return toast.error("Enter a topic!");
    if (!user) return;
    setBusy(true);
    const code = Math.floor(1e5 + Math.random() * 9e5).toString();
    const {
      data,
      error
    } = await supabase.from("study_rooms").insert({
      topic: topic.trim(),
      host_id: user.id,
      code
    }).select().single();
    setBusy(false);
    if (error) {
      console.error(error);
      toast.error(`Failed to create room: ${error.message}`);
    } else if (data) {
      toast.success(`Room created! Code: ${data.code}`);
      nav({
        to: `/app/room/${data.id}`
      });
    }
  };
  const joinRoom = async () => {
    if (!joinCode.trim() || joinCode.length !== 6) {
      return toast.error("Enter a valid 6-digit code!");
    }
    setBusy(true);
    const {
      data,
      error
    } = await supabase.from("study_rooms").select("id").eq("code", joinCode.trim()).single();
    setBusy(false);
    if (error || !data) {
      toast.error("Room not found or invalid code.");
    } else {
      toast.success("Joining room...");
      nav({
        to: `/app/room/${data.id}`
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-10 max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-80px)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center justify-between gap-4 mb-8 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 grid place-items-center text-white shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Study Rooms" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Join a live room to study with others. Tag @Nova for AI help!" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-6 shadow-glow border border-primary/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5 text-primary" }),
          " Create Room"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Start a new study session and invite your friends with a 6-digit code." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: topic, onChange: (e) => setTopic(e.target.value), placeholder: "What do you want to study?", className: "w-full bg-background/80 border border-border/50 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-primary/50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: createRoom, disabled: busy || !topic.trim(), className: "w-full py-3 rounded-xl gradient-hero font-semibold text-primary-foreground disabled:opacity-50 transition hover:scale-[1.02]", children: "Start Room" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-6 shadow-glow border border-indigo-500/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "h-5 w-5 text-indigo-500" }),
          " Join Room"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Have a code from a friend? Enter it below to join their study session." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: joinCode, onChange: (e) => setJoinCode(e.target.value), placeholder: "Enter 6-digit code", maxLength: 6, className: "w-full bg-background/80 border border-border/50 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-indigo-500/50 text-center tracking-widest font-mono text-lg" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: joinRoom, disabled: busy || joinCode.length !== 6, className: "w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 font-semibold text-primary-foreground disabled:opacity-50 transition hover:scale-[1.02]", children: "Join Room" })
      ] }) })
    ] })
  ] });
}
export {
  RoomsPage as component
};
