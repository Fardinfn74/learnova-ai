import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./createSsrRpc-CbfToRDd.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { g as generatePodcast } from "./learn-ai.functions-DCGJGXfx.mjs";
import { a as awardXp } from "./learnova.functions-CCVxPp8L.mjs";
import { N as Nova } from "./Nova-CLOa5n3E.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/seroval.mjs";
import { H as Headphones, F as FileText, f as LoaderCircle, i as Mic, P as Pause, m as Play, r as Square, w as User } from "../_libs/lucide-react.mjs";
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
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
function PodcastPage() {
  const qc = useQueryClient();
  const generate = useServerFn(generatePodcast);
  const award = useServerFn(awardXp);
  const [text, setText] = reactExports.useState("");
  const [language, setLanguage] = reactExports.useState("english");
  const [busy, setBusy] = reactExports.useState(false);
  const [podcast, setPodcast] = reactExports.useState(null);
  const [isPlaying, setIsPlaying] = reactExports.useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = reactExports.useState(-1);
  const synthRef = reactExports.useRef(null);
  const [voices, setVoices] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);
  function pickFemaleVoice(voices2, targetLang) {
    const langPrefix = targetLang.slice(0, 2).toLowerCase();
    const matching = voices2.filter((v) => v.lang === targetLang || v.lang.toLowerCase().startsWith(langPrefix));
    if (langPrefix === "bn") {
      const exact = voices2.filter((v) => v.lang === targetLang || v.lang === "bn-BD" || v.lang === "bn-IN" || v.lang.toLowerCase().startsWith("bn"));
      if (exact.length) {
        const femaleHints2 = ["female", "woman", "girl", "banani", "tanishka", "shreya"];
        const female2 = exact.find((v) => femaleHints2.some((h) => v.name.toLowerCase().includes(h)));
        return female2 || exact[0];
      }
      const banglaByName = voices2.find((v) => v.name.toLowerCase().includes("bangla") || v.name.toLowerCase().includes("bengali") || v.name.includes("বাংলা"));
      if (banglaByName) return banglaByName;
      return null;
    }
    if (!matching.length) return null;
    const preferred = ["google us english", "google uk english female", "microsoft jenny", "microsoft aria", "microsoft zira", "samantha", "karen", "moira", "tessa", "female"];
    for (const pref of preferred) {
      const found = matching.find((v) => v.name.toLowerCase().includes(pref));
      if (found) return found;
    }
    const femaleHints = ["female", "woman", "girl", "zira", "jenny", "aria", "samantha", "karen", "moira", "tessa", "heera", "kalpana", "ava", "emma"];
    const female = matching.find((v) => femaleHints.some((h) => v.name.toLowerCase().includes(h)));
    if (female) return female;
    return matching[0];
  }
  function pickMaleVoice(voices2, targetLang) {
    const langPrefix = targetLang.slice(0, 2).toLowerCase();
    const matching = voices2.filter((v) => v.lang === targetLang || v.lang.toLowerCase().startsWith(langPrefix));
    if (langPrefix === "bn") {
      const exact = voices2.filter((v) => v.lang === targetLang || v.lang.toLowerCase().startsWith("bn"));
      if (exact.length >= 2) return exact[1];
      return exact[0] || voices2.find((v) => v.name.toLowerCase().includes("bangla")) || null;
    }
    if (!matching.length) return null;
    const preferred = ["microsoft guy", "microsoft david", "microsoft mark", "microsoft arthur", "daniel", "oliver", "george", "male"];
    for (const pref of preferred) {
      const found = matching.find((v) => v.name.toLowerCase().includes(pref));
      if (found) return found;
    }
    const maleHints = ["male", "man", "boy", "david", "mark", "guy", "george", "arthur", "daniel"];
    const male = matching.find((v) => maleHints.some((h) => v.name.toLowerCase().includes(h)));
    if (male) return male;
    return matching[matching.length - 1];
  }
  const getVoiceForSpeaker = (speaker, lang) => {
    if (!voices.length) return null;
    const bcp47 = lang.startsWith("bangla") || lang === "banglish" ? "bn-BD" : "en-US";
    if (speaker === "nova") {
      return pickFemaleVoice(voices, bcp47);
    } else {
      return pickMaleVoice(voices, bcp47);
    }
  };
  const handleGenerate = async () => {
    if (text.trim().length < 50) {
      toast.error("Please enter at least 50 characters to generate a podcast.");
      return;
    }
    setBusy(true);
    setPodcast(null);
    stopAudio();
    try {
      const result = await generate({
        data: {
          text,
          language
        }
      });
      setPodcast(result);
      const res = await award({
        data: {
          amount: 15,
          reason: "Generated Audio Podcast"
        }
      });
      qc.invalidateQueries({
        queryKey: ["profile"]
      });
      qc.invalidateQueries({
        queryKey: ["xp"]
      });
      if (res.awarded > 0) toast.success(`Podcast generated! +${res.awarded} XP`);
      else toast.success("Podcast generated!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate podcast");
    } finally {
      setBusy(false);
    }
  };
  const playSegment = (index) => {
    if (!podcast || !synthRef.current) return;
    if (index >= podcast.segments.length) {
      setIsPlaying(false);
      setCurrentSegmentIndex(-1);
      return;
    }
    setCurrentSegmentIndex(index);
    setIsPlaying(true);
    const segment = podcast.segments[index];
    const utterance = new SpeechSynthesisUtterance(segment.text);
    const voice = getVoiceForSpeaker(segment.speaker, language);
    if (voice) utterance.voice = voice;
    const isBn = language.startsWith("bangla") || language === "banglish";
    if (segment.speaker === "nova") {
      utterance.pitch = isBn ? 1 : 1.18;
      utterance.rate = isBn ? 0.85 : 0.9;
    } else {
      utterance.pitch = isBn ? 0.9 : 0.95;
      utterance.rate = isBn ? 0.85 : 0.95;
    }
    utterance.onend = () => {
      playSegment(index + 1);
    };
    utterance.onerror = (e) => {
      console.error("Speech error", e);
      playSegment(index + 1);
    };
    synthRef.current.speak(utterance);
  };
  const toggleAudio = () => {
    if (!synthRef.current) return;
    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (currentSegmentIndex === -1 && podcast) {
        playSegment(0);
      } else {
        synthRef.current.resume();
        setIsPlaying(true);
      }
    }
  };
  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setCurrentSegmentIndex(-1);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-10 max-w-5xl mx-auto flex flex-col h-[calc(100vh-80px)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 grid place-items-center text-white shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Headphones, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Paper to Podcast" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Turn dense text into a conversational audio episode." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 glass rounded-2xl p-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: language, onChange: (e) => setLanguage(e.target.value), className: "rounded-xl border-none bg-transparent px-3 py-2 text-sm outline-none font-medium text-muted-foreground focus:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "english", children: "English" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "bangla", children: "বাংলা" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "banglish", children: "Banglish" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6 flex-1 min-h-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col h-full gap-4 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 flex-1 flex flex-col shadow-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: "Paste your study material" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: text, onChange: (e) => setText(e.target.value), placeholder: "Paste a textbook chapter, an article, or your notes here... (minimum 50 characters)", className: "flex-1 w-full bg-transparent border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 resize-none transition" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleGenerate, disabled: busy || text.trim().length < 50, className: "mt-4 w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          " Generating Script..."
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4" }),
          " Generate Podcast ✨"
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col h-full gap-4 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl flex-1 flex flex-col overflow-hidden shadow-glow", children: [
        !podcast && !busy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground opacity-60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Headphones, { className: "h-16 w-16 mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Paste your text and hit generate. We'll write a dynamic 2-person script and play it for you!" })
        ] }),
        busy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-primary p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer-text font-medium text-sm", children: "Writing the podcast script..." })
        ] }),
        podcast && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-b border-border/40 bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold text-lg leading-tight truncate max-w-[250px]", title: podcast.title, children: podcast.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-primary mt-1 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 14, float: false, glow: false }),
                " Nova & Student Host"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleAudio, className: "h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center hover:scale-110 transition shadow-glow", children: isPlaying ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-5 w-5", fill: "currentColor" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-5 w-5 ml-1", fill: "currentColor" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: stopAudio, disabled: currentSegmentIndex === -1, className: "h-10 w-10 rounded-full bg-destructive/10 text-destructive grid place-items-center hover:bg-destructive/20 transition disabled:opacity-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4", fill: "currentColor" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto p-5 space-y-4", children: podcast.segments.map((seg, i) => {
            const isActive = currentSegmentIndex === i;
            const isNova = seg.speaker === "nova";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex gap-3 p-3 rounded-xl transition-all duration-300", isActive ? "bg-primary/10 border border-primary/20 shadow-sm" : "opacity-70", isNova ? "flex-row" : "flex-row-reverse"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 mt-1", children: isNova ? /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 32, float: isActive, glow: isActive }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-8 w-8 rounded-full grid place-items-center text-white", isActive ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-muted-foreground"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("text-sm leading-relaxed", isNova ? "text-left" : "text-right"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider", children: seg.speaker }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: isActive ? "text-foreground font-medium" : "text-foreground", children: seg.text })
              ] })
            ] }, i);
          }) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  PodcastPage as component
};
