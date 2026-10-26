import { useState } from "react";
import { Nova } from "@/components/Nova";
import { Sparkles, HelpCircle, Lightbulb, MessageCircle, X, ChevronRight, Send, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { gameAudio } from "./game-audio";

interface NovaGameHelperProps {
  gameTitle: string;
  levelTitle: string;
  hintText: string;
  explanationText?: string;
  onAskNova?: (question: string) => void;
  className?: string;
}

export function NovaGameHelper({
  gameTitle,
  levelTitle,
  hintText,
  explanationText,
  onAskNova,
  className,
}: NovaGameHelperProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"hint" | "explain" | "ask">("hint");
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [novaAnswer, setNovaAnswer] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(!gameAudio.isSoundEnabled());

  const handleToggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    gameAudio.setSoundEnabled(!nextState);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    // Smart contextual response from Nova
    const q = customQuestion.toLowerCase();
    let reply = `In ${gameTitle} - ${levelTitle}: try focusing on the main visual goal! Check Nova's hint above for a quick step-by-step cue. 🚀`;

    if (q.includes("how") || q.includes("solve") || q.includes("do")) {
      reply = `Great question! To solve this level, ${hintText}`;
    } else if (q.includes("why") || q.includes("concept") || q.includes("what")) {
      reply = explanationText || `This concept teaches key principles of ${gameTitle}. Observe what changes when you interact with elements!`;
    } else if (q.includes("hi") || q.includes("hello") || q.includes("nova")) {
      reply = `Hey friend! I'm Nova, your AI learning buddy! You're doing amazing, keep going! ✨`;
    }

    setNovaAnswer(reply);
    if (onAskNova) onAskNova(customQuestion);
    setCustomQuestion("");
  };

  return (
    <div className={cn("relative z-20", className)}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-card/95 backdrop-blur-md border border-amber-500/40 hover:border-amber-500 text-foreground px-3.5 py-2 rounded-2xl shadow-lg transition-all hover:scale-105"
        >
          <Nova size={36} float={false} glow={false} />
          <div className="text-left">
            <div className="text-xs font-bold flex items-center gap-1 text-amber-500">
              Nova AI Helper <Sparkles className="h-3 w-3 animate-spin" />
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">Need a hint?</div>
          </div>
        </button>
      ) : (
        <div className="bg-card/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-4 shadow-2xl max-w-sm w-full space-y-3 relative text-foreground">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <Nova size={40} float={false} glow={false} />
              <div>
                <h4 className="text-xs font-bold flex items-center gap-1 text-amber-500">
                  Nova AI Tutor <Sparkles className="h-3 w-3 text-amber-400" />
                </h4>
                <p className="text-[11px] text-muted-foreground font-medium truncate max-w-[170px]">
                  {levelTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleSound}
                title={isMuted ? "Unmute sounds" : "Mute sounds"}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-500" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("hint")}
              className={cn(
                "py-1.5 rounded-lg flex items-center justify-center gap-1 transition",
                activeTab === "hint" ? "bg-amber-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Lightbulb className="h-3.5 w-3.5" /> Hint
            </button>
            <button
              onClick={() => setActiveTab("explain")}
              className={cn(
                "py-1.5 rounded-lg flex items-center justify-center gap-1 transition",
                activeTab === "explain" ? "bg-amber-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <HelpCircle className="h-3.5 w-3.5" /> Concept
            </button>
            <button
              onClick={() => setActiveTab("ask")}
              className={cn(
                "py-1.5 rounded-lg flex items-center justify-center gap-1 transition",
                activeTab === "ask" ? "bg-amber-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" /> Ask Nova
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-muted/30 rounded-2xl p-3 text-xs leading-relaxed border border-border/30 min-h-[70px]">
            {activeTab === "hint" && (
              <div className="space-y-1">
                <p className="font-medium text-foreground">💡 Nova's Hint:</p>
                <p className="text-muted-foreground">{hintText}</p>
              </div>
            )}

            {activeTab === "explain" && (
              <div className="space-y-1">
                <p className="font-medium text-foreground">🧠 Learning Objective:</p>
                <p className="text-muted-foreground">
                  {explanationText || `${gameTitle} helps you build intuitive understanding through hands-on 2D experimentation.`}
                </p>
              </div>
            )}

            {activeTab === "ask" && (
              <div className="space-y-2">
                {novaAnswer ? (
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground bg-card/80 p-2 rounded-xl border border-amber-500/20">
                      {novaAnswer}
                    </p>
                    <button
                      onClick={() => setNovaAnswer(null)}
                      className="text-[10px] text-amber-500 hover:underline font-semibold"
                    >
                      Ask another question
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuestionSubmit} className="space-y-2">
                    <p className="text-muted-foreground">Ask Nova anything about this level:</p>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="e.g. How do I bond hydrogen?"
                        className="flex-1 bg-card border border-border rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center justify-center"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
