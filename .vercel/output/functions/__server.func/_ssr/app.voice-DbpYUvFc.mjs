import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./createSsrRpc-CbfToRDd.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-DRwH8z1O.mjs";
import { a as awardXp } from "./learnova.functions-CCVxPp8L.mjs";
import { N as Nova } from "./Nova-CLOa5n3E.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/seroval.mjs";
import { L as Languages, y as VolumeX, V as Volume2, f as LoaderCircle, q as Sparkles, j as MicOff, i as Mic } from "../_libs/lucide-react.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./auth-middleware-JBvrN22J.mjs";
import "../_libs/zod.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
function getSR() {
  if (typeof window === "undefined") return null;
  const w = window;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}
function VoicePage() {
  const qc = useQueryClient();
  const award = useServerFn(awardXp);
  const [lang, setLang] = reactExports.useState("en-US");
  const [listening, setListening] = reactExports.useState(false);
  const [thinking, setThinking] = reactExports.useState(false);
  const [speaking, setSpeaking] = reactExports.useState(false);
  const [muted, setMuted] = reactExports.useState(false);
  const [interim, setInterim] = reactExports.useState("");
  const [messages, setMessages] = reactExports.useState([]);
  const [supported, setSupported] = reactExports.useState(true);
  const recRef = reactExports.useRef(null);
  const finalRef = reactExports.useRef("");
  const mutedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);
  reactExports.useEffect(() => {
    const sr = getSR();
    if (!sr) {
      setSupported(false);
      return;
    }
    recRef.current = sr;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    return () => {
      try {
        sr.abort();
      } catch {
      }
      window.speechSynthesis?.cancel();
    };
  }, []);
  function pickFemaleVoice(voices, targetLang) {
    const langPrefix = targetLang.slice(0, 2).toLowerCase();
    const matching = voices.filter((v) => v.lang === targetLang || v.lang.toLowerCase().startsWith(langPrefix));
    if (langPrefix === "bn") {
      const exact = voices.filter((v) => v.lang === targetLang || v.lang === "bn-BD" || v.lang === "bn-IN" || v.lang.toLowerCase().startsWith("bn"));
      if (exact.length) {
        const femaleHints2 = ["female", "woman", "girl", "banani", "tanishka", "shreya"];
        const female2 = exact.find((v) => femaleHints2.some((h) => v.name.toLowerCase().includes(h)));
        return female2 || exact[0];
      }
      const banglaByName = voices.find((v) => v.name.toLowerCase().includes("bangla") || v.name.toLowerCase().includes("bengali") || v.name.includes("বাংলা"));
      if (banglaByName) return banglaByName;
      return null;
    }
    if (!matching.length) return null;
    const preferred = [
      "google us english",
      // Chrome — natural female
      "google uk english female",
      "microsoft jenny",
      // Windows 11 neural
      "microsoft aria",
      // Edge neural
      "microsoft zira",
      // Windows — clear female
      "samantha",
      // macOS
      "karen",
      // macOS AU
      "moira",
      // macOS IE
      "tessa",
      // macOS ZA
      "female"
    ];
    for (const pref of preferred) {
      const found = matching.find((v) => v.name.toLowerCase().includes(pref));
      if (found) return found;
    }
    const femaleHints = ["female", "woman", "girl", "zira", "jenny", "aria", "samantha", "karen", "moira", "tessa", "heera", "kalpana", "ava", "emma"];
    const female = matching.find((v) => femaleHints.some((h) => v.name.toLowerCase().includes(h)));
    if (female) return female;
    return matching[0];
  }
  function speak(text) {
    if (mutedRef.current || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    const isBn = lang.startsWith("bn");
    utt.rate = isBn ? 0.85 : 0.9;
    utt.pitch = isBn ? 1 : 1.18;
    const voices = window.speechSynthesis.getVoices();
    const v = pickFemaleVoice(voices, lang);
    if (v) {
      utt.voice = v;
      console.log(`[Nova TTS] Using voice: ${v.name} (${v.lang})`);
    } else {
      console.log(`[Nova TTS] No matching voice for ${lang}, using browser default`);
    }
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }
  async function sendToNova(userText) {
    const next = [...messages, {
      role: "user",
      content: userText
    }];
    setMessages(next);
    setThinking(true);
    try {
      const {
        data: sess
      } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...token ? {
            Authorization: `Bearer ${token}`
          } : {}
        },
        body: JSON.stringify({
          messages: next,
          lang
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const {
        reply
      } = await res.json();
      setMessages([...next, {
        role: "assistant",
        content: reply
      }]);
      speak(reply);
      await award({
        data: {
          amount: 5,
          reason: "Voice chat with Nova"
        }
      });
      qc.invalidateQueries({
        queryKey: ["profile"]
      });
    } catch (e) {
      toast.error("Nova couldn't reply. Try again.");
      console.error(e);
    } finally {
      setThinking(false);
    }
  }
  function startListening() {
    const sr = recRef.current;
    if (!sr) return;
    window.speechSynthesis?.cancel();
    finalRef.current = "";
    setInterim("");
    sr.lang = lang;
    sr.continuous = false;
    sr.interimResults = true;
    sr.onresult = (e) => {
      let interimText = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const t = r[0].transcript;
        if (r.isFinal) finalText += t;
        else interimText += t;
      }
      if (finalText) finalRef.current += finalText;
      setInterim(interimText);
    };
    sr.onerror = (ev) => {
      if (ev.error !== "no-speech" && ev.error !== "aborted") toast.error(`Mic error: ${ev.error}`);
      setListening(false);
    };
    sr.onend = () => {
      setListening(false);
      setInterim("");
      const text = finalRef.current.trim();
      if (text) sendToNova(text);
    };
    try {
      sr.start();
      setListening(true);
    } catch (e) {
      console.error(e);
    }
  }
  function stopListening() {
    try {
      recRef.current?.stop();
    } catch {
    }
  }
  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      if (next) window.speechSynthesis?.cancel();
      return next;
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-screen flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/40 px-6 py-3 flex items-center justify-between backdrop-blur-xl bg-background/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 40, float: false, glow: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Voice with Nova" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Speak naturally — Nova listens and replies." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-full p-1 flex text-xs font-medium", children: ["en-US", "bn-BD"].map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setLang(l), className: cn("px-3 py-1 rounded-full transition flex items-center gap-1", lang === l ? "gradient-hero text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "h-3 w-3" }),
          " ",
          l === "en-US" ? "English" : "বাংলা"
        ] }, l)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleMute, title: muted ? "Unmute Nova" : "Mute Nova", className: "h-9 w-9 rounded-full glass grid place-items-center hover:scale-110 transition", children: muted ? /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden grid place-items-center px-4 py-6 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col items-center gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("absolute inset-0 rounded-full gradient-hero blur-3xl transition-opacity", speaking || listening ? "opacity-60 animate-pulse" : "opacity-25") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("absolute -inset-8 rounded-full border border-primary/30", listening && "animate-ping") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("absolute -inset-16 rounded-full border border-primary/20 animate-spin-slow", !listening && !speaking && "opacity-40") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("absolute -inset-24 rounded-full border border-primary/10 animate-spin-slow", !listening && !speaking && "opacity-30"), style: {
          animationDirection: "reverse"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 260, float: !listening && !speaking }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[80px] max-w-2xl text-center", children: [
        !supported && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Your browser doesn't support voice input. Try Chrome or Edge." }),
        supported && listening && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-primary uppercase tracking-wider", children: "Listening…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: interim || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "say something" }) })
        ] }),
        supported && thinking && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer-text font-medium", children: "Nova is thinking…" })
        ] }),
        supported && speaking && !thinking && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-medium text-primary uppercase tracking-wider flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 animate-pulse" }),
          " Nova is speaking"
        ] }),
        supported && !listening && !thinking && !speaking && messages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Tap the mic and ask Nova anything." }),
        supported && !listening && !thinking && messages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground line-clamp-3", children: messages[messages.length - 1].content })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: listening ? stopListening : startListening, disabled: !supported || thinking, className: cn("relative h-20 w-20 rounded-full grid place-items-center text-white shadow-glow transition-all", listening ? "bg-destructive scale-110 animate-pulse" : "gradient-hero hover:scale-110", (!supported || thinking) && "opacity-50 cursor-not-allowed"), children: listening ? /* @__PURE__ */ jsxRuntimeExports.jsx(MicOff, { className: "h-8 w-8" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: listening ? "Tap to stop" : "Tap to talk" })
    ] }) }),
    messages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/40 max-h-40 overflow-auto px-6 py-3 backdrop-blur-xl bg-background/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-3xl mx-auto space-y-2 text-sm", children: messages.slice(-6).map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-xs font-semibold mt-0.5", m.role === "user" ? "text-primary" : "text-nova"), children: m.role === "user" ? "You" : "Nova" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground flex-1", children: m.content })
    ] }, i)) }) })
  ] });
}
export {
  VoicePage as component
};
