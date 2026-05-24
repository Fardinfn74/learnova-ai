import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn } from "./createSsrRpc-CbfToRDd.mjs";
import { l as listBadges } from "./learnova.functions-Ca7SVHGM.mjs";
import "./index.mjs";
import "../_libs/seroval.mjs";
import { v as Trophy } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "./auth-middleware-B4tEUqco.mjs";
import "./index-B082ds2F.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
function BadgesPage() {
  const fn = useServerFn(listBadges);
  const {
    data: badges
  } = useQuery({
    queryKey: ["badges"],
    queryFn: () => fn()
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-10 max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-xl gradient-hero grid place-items-center text-white shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Your badges" })
    ] }),
    !badges?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-3xl p-10 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No badges yet. Keep learning to unlock achievements! 🏆" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 md:grid-cols-3 gap-4", children: badges?.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-6 text-center shadow-glow hover:scale-105 transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-2", children: b.icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: b.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground mt-1", children: b.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-3", children: [
        "Earned ",
        new Date(b.earned_at).toLocaleDateString()
      ] })
    ] }, b.id)) })
  ] });
}
export {
  BadgesPage as component
};
