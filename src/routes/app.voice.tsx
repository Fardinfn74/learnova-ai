import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { awardXp } from "@/lib/learnova.functions";
import { Nova } from "@/components/Nova";
import { Mic, MicOff, Volume2, VolumeX, Loader2, Languages, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/voice")({ component: VoicePage });

type Msg = { role: "user" | "assistant"; content: string };
type Lang = "en-US" | "bn-BD";

// Minimal SpeechRecognition types
type SRResult = { transcript: string };
type SREvent = { results: { [k: number]: { [k: number]: SRResult; isFinal: boolean } & ArrayLike<unknown>; length: number }; resultIndex: number };
type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getSR(): SR | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

function VoicePage() {
  const qc = useQueryClient();
  const award = useServerFn(awardXp);
  const [lang, setLang] = useState<Lang>("en-US");
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [interim, setInterim] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SR | null>(null);
  const finalRef = useRef("");
  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  useEffect(() => {
    const sr = getSR();
    if (!sr) { setSupported(false); return; }
    recRef.current = sr;
    
    // Preload voices
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    return () => { try { sr.abort(); } catch {} window.speechSynthesis?.cancel(); };
  }, []);

  // Pick the best young-female voice available in the browser
  function pickFemaleVoice(voices: SpeechSynthesisVoice[], targetLang: string): SpeechSynthesisVoice | null {
    const langPrefix = targetLang.slice(0, 2).toLowerCase();
    const matching = voices.filter(v => v.lang === targetLang || v.lang.toLowerCase().startsWith(langPrefix));
    
    // For Bangla: very few voices exist — accept any Bangla voice eagerly
    if (langPrefix === "bn") {
      // Try exact lang match first
      const exact = voices.filter(v => v.lang === targetLang || v.lang === "bn-BD" || v.lang === "bn-IN" || v.lang.toLowerCase().startsWith("bn"));
      if (exact.length) {
        // Prefer female-sounding names
        const femaleHints = ["female", "woman", "girl", "banani", "tanishka", "shreya"];
        const female = exact.find(v => femaleHints.some(h => v.name.toLowerCase().includes(h)));
        return female || exact[0];
      }
      // Some browsers list Bangla voices under different naming
      const banglaByName = voices.find(v => 
        v.name.toLowerCase().includes("bangla") || 
        v.name.toLowerCase().includes("bengali") || 
        v.name.includes("বাংলা")
      );
      if (banglaByName) return banglaByName;
      // No Bangla voice at all — return null so browser uses default
      return null;
    }

    if (!matching.length) return null;

    // Preferred female voice names (Chrome / Edge / Windows / macOS)
    const preferred = [
      "google us english",        // Chrome — natural female
      "google uk english female",
      "microsoft jenny",          // Windows 11 neural
      "microsoft aria",           // Edge neural
      "microsoft zira",           // Windows — clear female
      "samantha",                 // macOS
      "karen",                    // macOS AU
      "moira",                    // macOS IE
      "tessa",                    // macOS ZA
      "female",
    ];

    // Try preferred names first (case-insensitive substring match)
    for (const pref of preferred) {
      const found = matching.find(v => v.name.toLowerCase().includes(pref));
      if (found) return found;
    }

    // Fallback: pick any voice whose name hints at female
    const femaleHints = ["female", "woman", "girl", "zira", "jenny", "aria", "samantha", "karen", "moira", "tessa", "heera", "kalpana", "ava", "emma"];
    const female = matching.find(v => femaleHints.some(h => v.name.toLowerCase().includes(h)));
    if (female) return female;

    // Last resort: first available voice for the language
    return matching[0];
  }

  function speak(text: string) {
    if (mutedRef.current || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    // Bangla TTS voices work better with slower rate and normal pitch
    const isBn = lang.startsWith("bn");
    utt.rate = isBn ? 0.85 : 0.90;
    utt.pitch = isBn ? 1.0 : 1.18;
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

  async function sendToNova(userText: string) {
    const next: Msg[] = [...messages, { role: "user", content: userText }];
    setMessages(next);
    setThinking(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: next, lang }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { reply } = await res.json() as { reply: string };
      setMessages([...next, { role: "assistant", content: reply }]);
      speak(reply);
      await award({ data: { amount: 5, reason: "Voice chat with Nova" } });
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (e) {
      toast.error("Nova couldn't reply. Try again.");
      console.error(e);
    } finally {
      setThinking(false);
    }
  }

  function startListening() {
    const sr = recRef.current; if (!sr) return;
    window.speechSynthesis?.cancel();
    finalRef.current = ""; setInterim("");
    sr.lang = lang;
    sr.continuous = false;
    sr.interimResults = true;
    sr.onresult = (e) => {
      let interimText = ""; let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const t = r[0].transcript;
        if (r.isFinal) finalText += t; else interimText += t;
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
    try { sr.start(); setListening(true); } catch (e) { console.error(e); }
  }

  function stopListening() {
    try { recRef.current?.stop(); } catch {}
  }

  function toggleMute() {
    setMuted(m => {
      const next = !m;
      if (next) window.speechSynthesis?.cancel();
      return next;
    });
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b border-border/40 px-6 py-3 flex items-center justify-between backdrop-blur-xl bg-background/60">
        <div className="flex items-center gap-3">
          <Nova size={40} float={false} glow={false} />
          <div>
            <div className="font-semibold">Voice with Nova</div>
            <div className="text-xs text-muted-foreground">Speak naturally — Nova listens and replies.</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass rounded-full p-1 flex text-xs font-medium">
            {(["en-US", "bn-BD"] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={cn("px-3 py-1 rounded-full transition flex items-center gap-1",
                  lang === l ? "gradient-hero text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground")}>
                <Languages className="h-3 w-3"/> {l === "en-US" ? "English" : "বাংলা"}
              </button>
            ))}
          </div>
          <button onClick={toggleMute} title={muted ? "Unmute Nova" : "Mute Nova"}
            className="h-9 w-9 rounded-full glass grid place-items-center hover:scale-110 transition">
            {muted ? <VolumeX className="h-4 w-4"/> : <Volume2 className="h-4 w-4"/>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid place-items-center px-4 py-6 relative">
        {/* Nova orb with reactive rings */}
        <div className="relative flex flex-col items-center gap-8">
          <div className="relative">
            <div className={cn("absolute inset-0 rounded-full gradient-hero blur-3xl transition-opacity",
              speaking || listening ? "opacity-60 animate-pulse" : "opacity-25")} />
            <div className={cn("absolute -inset-8 rounded-full border border-primary/30",
              listening && "animate-ping")} />
            <div className={cn("absolute -inset-16 rounded-full border border-primary/20 animate-spin-slow",
              !listening && !speaking && "opacity-40")} />
            <div className={cn("absolute -inset-24 rounded-full border border-primary/10 animate-spin-slow",
              !listening && !speaking && "opacity-30")} style={{ animationDirection: "reverse" }} />
            <div className="relative">
              <Nova size={260} float={!listening && !speaking} />
            </div>
          </div>

          <div className="min-h-[80px] max-w-2xl text-center">
            {!supported && (
              <p className="text-sm text-destructive">Your browser doesn't support voice input. Try Chrome or Edge.</p>
            )}
            {supported && listening && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-primary uppercase tracking-wider">Listening…</div>
                <p className="text-lg">{interim || <span className="text-muted-foreground italic">say something</span>}</p>
              </div>
            )}
            {supported && thinking && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <Loader2 className="h-4 w-4 animate-spin"/>
                <span className="shimmer-text font-medium">Nova is thinking…</span>
              </div>
            )}
            {supported && speaking && !thinking && (
              <div className="text-xs font-medium text-primary uppercase tracking-wider flex items-center justify-center gap-2">
                <Sparkles className="h-3.5 w-3.5 animate-pulse"/> Nova is speaking
              </div>
            )}
            {supported && !listening && !thinking && !speaking && messages.length === 0 && (
              <p className="text-muted-foreground">Tap the mic and ask Nova anything.</p>
            )}
            {supported && !listening && !thinking && messages.length > 0 && (
              <p className="text-sm text-muted-foreground line-clamp-3">{messages[messages.length - 1].content}</p>
            )}
          </div>

          {/* Big mic button */}
          <button
            onClick={listening ? stopListening : startListening}
            disabled={!supported || thinking}
            className={cn(
              "relative h-20 w-20 rounded-full grid place-items-center text-white shadow-glow transition-all",
              listening ? "bg-destructive scale-110 animate-pulse" : "gradient-hero hover:scale-110",
              (!supported || thinking) && "opacity-50 cursor-not-allowed",
            )}
          >
            {listening ? <MicOff className="h-8 w-8"/> : <Mic className="h-8 w-8"/>}
          </button>
          <div className="text-xs text-muted-foreground">
            {listening ? "Tap to stop" : "Tap to talk"}
          </div>
        </div>
      </div>

      {/* Transcript strip */}
      {messages.length > 0 && (
        <div className="border-t border-border/40 max-h-40 overflow-auto px-6 py-3 backdrop-blur-xl bg-background/60">
          <div className="max-w-3xl mx-auto space-y-2 text-sm">
            {messages.slice(-6).map((m, i) => (
              <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                <span className={cn("text-xs font-semibold mt-0.5", m.role === "user" ? "text-primary" : "text-nova")}>
                  {m.role === "user" ? "You" : "Nova"}
                </span>
                <span className="text-muted-foreground flex-1">{m.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
