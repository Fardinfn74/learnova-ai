import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { N as Nova } from "./Nova-CLOa5n3E.mjs";
import { T as ThemeToggle } from "./ThemeToggle-BZUPsXrS.mjs";
import "../_libs/sonner.mjs";
import { q as Sparkles, o as Shield, v as Trophy, L as Languages, a as Brain, M as MessageSquare, c as CodeXml, T as Target, B as BookOpen, i as Mic, t as Swords, H as Headphones, x as Users, l as Pencil } from "../_libs/lucide-react.mjs";
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
import "./router-DDX2tWq5.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./client-CuGaxAnF.mjs";
import "./index-B082ds2F.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/iceberg-js.mjs";
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
function useReveal(opts) {
  const ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cls = "is-visible";
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add(cls);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          el.classList.add(cls);
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [opts?.threshold, opts?.rootMargin, opts?.className]);
  return ref;
}
function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div"
}) {
  const ref = useReveal();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { ref, style: { transitionDelay: `${delay}ms` }, className: `reveal ${className}`, children });
}
const features = [{
  icon: Brain,
  title: "Personalized paths",
  desc: "Nova adapts to your level and goals every session."
}, {
  icon: Languages,
  title: "Bangla • Banglish • English",
  desc: "Chat in any mix — Nova understands all three."
}, {
  icon: MessageSquare,
  title: "Step-by-step explanations",
  desc: "Concepts broken down until they truly click."
}, {
  icon: CodeXml,
  title: "Coding + debugging",
  desc: "Live code help with explanations, not just answers."
}, {
  icon: Target,
  title: "Quizzes & mock tests",
  desc: "AI-generated quizzes that target your weak spots."
}, {
  icon: BookOpen,
  title: "PDF & note summaries",
  desc: "Upload notes — get summaries + flashcards instantly."
}, {
  icon: Mic,
  title: "Voice chat with Nova",
  desc: "Talk out loud — Nova listens and replies with a warm voice."
}, {
  icon: Swords,
  title: "Multiplayer Battles",
  desc: "Compete in live quiz battles with your friends."
}, {
  icon: Headphones,
  title: "AI Podcasts",
  desc: "Turn any topic into an engaging two-host podcast."
}, {
  icon: Users,
  title: "Study Rooms",
  desc: "Collaborate and learn with friends in real-time."
}, {
  icon: Pencil,
  title: "Draw to Learn",
  desc: "Draw math or diagrams and get instant AI solutions."
}, {
  icon: Trophy,
  title: "XP, levels & badges",
  desc: "Earn rewards as you learn. Streaks keep you going."
}, {
  icon: Shield,
  title: "Safe & student-friendly",
  desc: "Responses tuned for learners. Always supportive."
}];
function Landing() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6 h-16 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 font-bold text-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-xl gradient-hero shadow-glow grid place-items-center text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text font-display tracking-tight", children: "LEARNOVA" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden md:flex items-center gap-8 text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/docs", className: "hover:text-foreground transition", children: "Docs" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeToggle, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "text-sm font-medium px-4 py-2 rounded-full hover:bg-muted transition", children: "Sign in" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "text-sm font-semibold px-5 py-2 rounded-full gradient-hero text-primary-foreground shadow-glow hover:scale-105 transition", children: "Get started" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-12 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-7", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-nova animate-pulse" }),
          "Powered by adaptive AI · Built for every learner"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight", children: [
          "Meet ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: "Nova" }),
          ",",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "your personal",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "AI tutor."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-muted-foreground max-w-xl leading-relaxed", children: "LEARNOVA is the adaptive multimodal tutor that explains anything — in Bangla, Banglish or English. Coding help, step-by-step solutions, quizzes, summaries, and XP-based progress. All in one place." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "rounded-full gradient-hero px-7 py-3.5 font-semibold text-primary-foreground shadow-glow hover:scale-105 transition", children: "Start learning free" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#features", className: "rounded-full glass px-7 py-3.5 font-semibold hover:scale-105 transition", children: "Explore features" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6 text-xs text-muted-foreground pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3.5 w-3.5" }),
            " Safe responses"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3.5 w-3.5" }),
            " XP & badges"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "h-3.5 w-3.5" }),
            " 3 languages"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full gradient-hero opacity-20 blur-3xl animate-pulse-glow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute h-80 w-80 rounded-full border border-white/30 animate-spin-slow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute h-96 w-96 rounded-full border border-white/20 animate-spin-slow", style: {
          animationDirection: "reverse"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 360, priority: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 left-4 glass rounded-2xl px-3 py-2 text-xs font-medium animate-float", children: "📚 Math chapter 4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-10 right-2 glass rounded-2xl px-3 py-2 text-xs font-medium animate-float", style: {
          animationDelay: "-2s"
        }, children: "⚡ +25 XP" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/2 -left-4 glass rounded-2xl px-3 py-2 text-xs font-medium animate-float", style: {
          animationDelay: "-1s"
        }, children: "🇧🇩 বাংলা" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "features", className: "mx-auto max-w-7xl px-6 py-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { className: "text-center mb-14", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-4xl md:text-5xl font-bold", children: [
          "Everything a learner needs.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: "Nothing they don't." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground max-w-2xl mx-auto", children: "Ten features built around how students actually learn — from first concept to mock test." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-5", children: features.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { delay: i * 70, className: "group glass tilt-card rounded-3xl p-6 hover:shadow-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-2xl gradient-nova grid place-items-center text-white shadow-glow mb-4 group-hover:scale-110 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(f.icon, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-lg", children: f.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1.5 leading-relaxed", children: f.desc })
      ] }, f.title)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "how", className: "mx-auto max-w-6xl px-6 py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-3 gap-6", children: [{
      n: "01",
      t: "Tell Nova your goal",
      d: "From SSC chemistry to React debugging — say what you want to learn."
    }, {
      n: "02",
      t: "Learn your way",
      d: "Chat, quizzes, code help, or summarize a PDF. Nova adapts to your pace."
    }, {
      n: "03",
      t: "Level up",
      d: "Earn XP, unlock badges, keep your streak alive — progress feels like a game."
    }].map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { delay: i * 120, className: "glass rounded-3xl p-8 ring-gradient", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl font-display font-bold gradient-text", children: s.n }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 text-xl font-semibold", children: s.t }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground text-sm leading-relaxed", children: s.d })
    ] }, s.n)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "nova", className: "mx-auto max-w-6xl px-6 py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { className: "glass rounded-[2.5rem] p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center ring-gradient", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-4xl md:text-5xl font-bold", children: [
          "Say hi to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: "Nova" }),
          " 👋"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground leading-relaxed", children: "Nova isn't a search engine. Nova is a patient tutor that asks the right questions, corrects gently, celebrates progress, and never judges. Built with safety guardrails so parents can trust it and students can love it." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex flex-wrap gap-2", children: ["🧠 Adaptive", "🇧🇩 Bangla", "💬 Banglish", "🇬🇧 English", "🧒 Safe", "✨ Free"].map((x) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full glass px-3 py-1 text-xs font-medium", children: x }, x)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "mt-7 inline-flex rounded-full gradient-hero px-7 py-3 font-semibold text-primary-foreground shadow-glow", children: "Start a conversation" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 300 }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-4xl px-6 py-20 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-4xl md:text-6xl font-extrabold tracking-tight", children: [
        "The future of learning",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "is ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text", children: "personal" }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-muted-foreground max-w-xl mx-auto", children: "Join LEARNOVA. Get a tutor that knows you, fits your schedule, and grows with you." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "mt-8 inline-flex rounded-full gradient-hero px-10 py-4 text-lg font-semibold text-primary-foreground shadow-glow hover:scale-105 transition", children: "Get started — it's free" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border/40 py-8 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "animate-pulse-glow inline-block", children: [
      "Created by VisionX for learners. ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gradient-text font-semibold", children: "LEARNOVA-AI" }),
      " · ",
      (/* @__PURE__ */ new Date()).getFullYear()
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", className: "fixed bottom-6 right-6 z-30 hover:scale-110 transition", title: "Chat with Nova", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full gradient-hero blur-2xl opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative glass rounded-full p-2 shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 64, float: true, glow: false }) })
    ] }) })
  ] });
}
export {
  Landing as component
};
