import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { generatePodcast } from "@/lib/learn-ai.functions";
import { awardXp } from "@/lib/learnova.functions";
import { Nova } from "@/components/Nova";
import { Mic, Headphones, Play, Pause, Square, Loader2, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/podcast")({ component: PodcastPage });

type Segment = { speaker: "host" | "nova"; text: string };
type PodcastData = { title: string; segments: Segment[] };

function PodcastPage() {
  const qc = useQueryClient();
  const generate = useServerFn(generatePodcast);
  const award = useServerFn(awardXp);

  const [text, setText] = useState("");
  const [language, setLanguage] = useState<"english"|"bangla"|"banglish">("english");
  const [busy, setBusy] = useState(false);
  const [podcast, setPodcast] = useState<PodcastData | null>(null);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  // Voices cache
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Cleanup on unmount
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  function pickFemaleVoice(voices: SpeechSynthesisVoice[], targetLang: string): SpeechSynthesisVoice | null {
    const langPrefix = targetLang.slice(0, 2).toLowerCase();
    const matching = voices.filter(v => v.lang === targetLang || v.lang.toLowerCase().startsWith(langPrefix));
    
    if (langPrefix === "bn") {
      const exact = voices.filter(v => v.lang === targetLang || v.lang === "bn-BD" || v.lang === "bn-IN" || v.lang.toLowerCase().startsWith("bn"));
      if (exact.length) {
        const femaleHints = ["female", "woman", "girl", "banani", "tanishka", "shreya"];
        const female = exact.find(v => femaleHints.some(h => v.name.toLowerCase().includes(h)));
        return female || exact[0];
      }
      const banglaByName = voices.find(v => 
        v.name.toLowerCase().includes("bangla") || 
        v.name.toLowerCase().includes("bengali") || 
        v.name.includes("বাংলা")
      );
      if (banglaByName) return banglaByName;
      return null;
    }

    if (!matching.length) return null;

    const preferred = [
      "google us english", "google uk english female", "microsoft jenny", "microsoft aria",
      "microsoft zira", "samantha", "karen", "moira", "tessa", "female"
    ];
    for (const pref of preferred) {
      const found = matching.find(v => v.name.toLowerCase().includes(pref));
      if (found) return found;
    }

    const femaleHints = ["female", "woman", "girl", "zira", "jenny", "aria", "samantha", "karen", "moira", "tessa", "heera", "kalpana", "ava", "emma"];
    const female = matching.find(v => femaleHints.some(h => v.name.toLowerCase().includes(h)));
    if (female) return female;

    return matching[0];
  }

  function pickMaleVoice(voices: SpeechSynthesisVoice[], targetLang: string): SpeechSynthesisVoice | null {
    const langPrefix = targetLang.slice(0, 2).toLowerCase();
    const matching = voices.filter(v => v.lang === targetLang || v.lang.toLowerCase().startsWith(langPrefix));
    
    if (langPrefix === "bn") {
      const exact = voices.filter(v => v.lang === targetLang || v.lang.toLowerCase().startsWith("bn"));
      if (exact.length >= 2) return exact[1];
      return exact[0] || voices.find(v => v.name.toLowerCase().includes("bangla")) || null;
    }

    if (!matching.length) return null;

    const preferred = ["microsoft guy", "microsoft david", "microsoft mark", "microsoft arthur", "daniel", "oliver", "george", "male"];
    for (const pref of preferred) {
      const found = matching.find(v => v.name.toLowerCase().includes(pref));
      if (found) return found;
    }

    const maleHints = ["male", "man", "boy", "david", "mark", "guy", "george", "arthur", "daniel"];
    const male = matching.find(v => maleHints.some(h => v.name.toLowerCase().includes(h)));
    if (male) return male;

    return matching[matching.length - 1];
  }

  const getVoiceForSpeaker = (speaker: "host" | "nova", lang: string) => {
    if (!voices.length) return null;
    // Map our 'english'/'bangla'/'banglish' to actual BCP 47 tags for the voice picker
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
      const result = await generate({ data: { text, language } });
      setPodcast(result);
      const res = await award({ data: { amount: 15, reason: "Generated Audio Podcast" } });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["xp"] });
      if (res.awarded > 0) toast.success(`Podcast generated! +${res.awarded} XP`);
      else toast.success("Podcast generated!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate podcast");
    } finally {
      setBusy(false);
    }
  };

  const playSegment = (index: number) => {
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
    
    // Tweak pitch/rate to exactly match 'Voice with Nova' component
    const isBn = language.startsWith("bangla") || language === "banglish";
    if (segment.speaker === "nova") {
      utterance.pitch = isBn ? 1.0 : 1.18;
      utterance.rate = isBn ? 0.85 : 0.90;
    } else {
      utterance.pitch = isBn ? 0.9 : 0.95; 
      utterance.rate = isBn ? 0.85 : 0.95;
    }

    utterance.onend = () => {
      playSegment(index + 1);
    };

    utterance.onerror = (e) => {
      console.error("Speech error", e);
      // Skip to next if error
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
        // Start from beginning
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

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto flex flex-col h-[calc(100vh-80px)]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 grid place-items-center text-white shadow-glow">
            <Headphones className="h-6 w-6"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Paper to Podcast</h1>
            <p className="text-sm text-muted-foreground">Turn dense text into a conversational audio episode.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 glass rounded-2xl p-1.5">
          <select value={language} onChange={e=>setLanguage(e.target.value as "english"|"bangla"|"banglish")}
            className="rounded-xl border-none bg-transparent px-3 py-2 text-sm outline-none font-medium text-muted-foreground focus:text-foreground">
            <option value="english">English</option><option value="bangla">বাংলা</option><option value="banglish">Banglish</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Input Column */}
        <div className="flex flex-col h-full gap-4 min-h-0">
          <div className="glass rounded-2xl p-5 flex-1 flex flex-col shadow-glow">
            <div className="flex items-center gap-2 mb-3 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-semibold text-foreground">Paste your study material</span>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste a textbook chapter, an article, or your notes here... (minimum 50 characters)"
              className="flex-1 w-full bg-transparent border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 resize-none transition"
            />
            <button
              onClick={handleGenerate}
              disabled={busy || text.trim().length < 50}
              className="mt-4 w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition"
            >
              {busy ? <><Loader2 className="h-4 w-4 animate-spin"/> Generating Script...</> : <><Mic className="h-4 w-4"/> Generate Podcast ✨</>}
            </button>
          </div>
        </div>

        {/* Output Column */}
        <div className="flex flex-col h-full gap-4 min-h-0">
          <div className="glass rounded-2xl flex-1 flex flex-col overflow-hidden shadow-glow">
            
            {!podcast && !busy && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground opacity-60">
                <Headphones className="h-16 w-16 mb-4" />
                <p className="text-sm">Paste your text and hit generate. We'll write a dynamic 2-person script and play it for you!</p>
              </div>
            )}

            {busy && (
              <div className="flex-1 flex flex-col items-center justify-center text-primary p-8">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <span className="shimmer-text font-medium text-sm">Writing the podcast script...</span>
              </div>
            )}

            {podcast && (
              <>
                {/* Audio Player Header */}
                <div className="p-5 border-b border-border/40 bg-background/50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                  <div>
                    <h2 className="font-bold text-lg leading-tight truncate max-w-[250px]" title={podcast.title}>{podcast.title}</h2>
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <Nova size={14} float={false} glow={false}/> Nova & Student Host
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={toggleAudio} className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center hover:scale-110 transition shadow-glow">
                      {isPlaying ? <Pause className="h-5 w-5" fill="currentColor"/> : <Play className="h-5 w-5 ml-1" fill="currentColor"/>}
                    </button>
                    <button onClick={stopAudio} disabled={currentSegmentIndex === -1} className="h-10 w-10 rounded-full bg-destructive/10 text-destructive grid place-items-center hover:bg-destructive/20 transition disabled:opacity-50">
                      <Square className="h-4 w-4" fill="currentColor"/>
                    </button>
                  </div>
                </div>

                {/* Script Scrolling Area */}
                <div className="flex-1 overflow-auto p-5 space-y-4">
                  {podcast.segments.map((seg, i) => {
                    const isActive = currentSegmentIndex === i;
                    const isNova = seg.speaker === "nova";
                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "flex gap-3 p-3 rounded-xl transition-all duration-300",
                          isActive ? "bg-primary/10 border border-primary/20 shadow-sm" : "opacity-70",
                          isNova ? "flex-row" : "flex-row-reverse"
                        )}
                      >
                        <div className="shrink-0 mt-1">
                          {isNova ? (
                            <Nova size={32} float={isActive} glow={isActive}/>
                          ) : (
                            <div className={cn(
                              "h-8 w-8 rounded-full grid place-items-center text-white",
                              isActive ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-muted-foreground"
                            )}>
                              <User className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className={cn("text-sm leading-relaxed", isNova ? "text-left" : "text-right")}>
                          <div className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                            {seg.speaker}
                          </div>
                          <p className={isActive ? "text-foreground font-medium" : "text-foreground"}>
                            {seg.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
