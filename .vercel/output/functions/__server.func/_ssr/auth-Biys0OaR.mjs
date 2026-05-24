import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CuGaxAnF.mjs";
import { u as useAuth } from "./router-DDX2tWq5.mjs";
import { N as Nova } from "./Nova-CLOa5n3E.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { f as LoaderCircle } from "../_libs/lucide-react.mjs";
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
import "./index-B082ds2F.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function AuthPage() {
  const nav = useNavigate();
  const {
    user,
    loading
  } = useAuth();
  const [mode, setMode] = reactExports.useState("signup");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!loading && user) nav({
      to: "/app/dashboard"
    });
  }, [user, loading, nav]);
  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: name
            }
          }
        });
        if (error) throw error;
        toast.success("Welcome to LEARNOVA! 🎉");
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }
  async function google() {
    setBusy(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/app/dashboard"
        }
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign in failed";
      toast.error(message);
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen grid lg:grid-cols-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:flex flex-col items-center justify-center p-12 relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 gradient-hero opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 280 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-8 text-4xl font-bold text-center", children: [
        "Hi, I'm ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: "Nova" }),
        "!"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground text-center max-w-sm", children: "Your patient, multilingual AI tutor. Let's make today's learning fun." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-6 md:p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md glass rounded-3xl p-8 shadow-glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: mode === "signup" ? "Create your account" : "Welcome back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: mode === "signup" ? "Start learning with Nova in seconds." : "Sign in to continue your journey." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: google, disabled: busy, className: "mt-6 w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted py-3 font-medium transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" })
        ] }),
        "Continue with Google"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-5 flex items-center gap-3 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border" }),
        "or",
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit, className: "space-y-3", children: [
        mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Your name", required: true, className: "w-full rounded-xl border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "Email", required: true, className: "w-full rounded-xl border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Password (min 6)", required: true, minLength: 6, className: "w-full rounded-xl border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: busy, className: "w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground shadow-glow flex items-center justify-center gap-2", children: [
          busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          mode === "signup" ? "Create account" : "Sign in"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-center mt-5 text-muted-foreground", children: [
        mode === "signup" ? "Already have an account?" : "New to LEARNOVA?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMode(mode === "signup" ? "signin" : "signup"), className: "text-primary font-semibold hover:underline", children: mode === "signup" ? "Sign in" : "Create one" })
      ] })
    ] }) })
  ] });
}
export {
  AuthPage as component
};
