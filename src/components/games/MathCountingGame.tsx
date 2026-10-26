import { useRef, useState } from "react";
import { X, Maximize2, Minimize2, RotateCcw, Gamepad2 } from "lucide-react";
import { GameMetadata } from "./types";

export const mathcountingMetadata: GameMetadata = {
  id: "mathcounting" as const,
  title: "Numbers & Counting — Kids Math Game Suite",
  category: "Kids Specials" as const,
  ageRange: "Ages 4–9",
  icon: "🔢",
  gradient: "bg-gradient-to-br from-orange-400 to-purple-600 text-white",
  bgGlow: "rgba(251, 146, 60, 0.2)",
  description:
    "5-in-1 kids math adventure with a bunny mascot! Count objects, compare numbers, practice addition & subtraction, and play memory card matching — all in a beautifully illustrated world!",
  totalLevels: 5,
  tags: ["Math", "Counting", "Numbers", "Addition", "Kids", "Memory"],
  isKidsSpecial: true,
};

export function MathCountingGame({ onClose }: { onClose: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const toggleFullscreen = () => {
    const el = document.documentElement;
    if (!isFullscreen) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 bg-card/80 border-b border-border/60 px-4 py-2.5 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-purple-600 grid place-items-center text-xl shadow-md">
            🔢
          </div>
          <div>
            <h2 className="font-extrabold text-sm md:text-base tracking-tight leading-none text-foreground">
              Numbers & Counting
            </h2>
            <p className="text-[11px] text-muted-foreground font-medium hidden sm:block">
              Kids Special • Ages 4–9 • 5 Math Games
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge */}
          <div className="hidden md:flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-500 px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-sm">
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>5 Math Game Modes</span>
          </div>

          {/* Reload */}
          <button
            onClick={handleReload}
            className="p-2 rounded-xl bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition"
            title="Reload Game"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition"
            title="Exit Game"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Game iframe */}
      <div className="flex-1 relative overflow-hidden bg-slate-950">
        <iframe
          ref={iframeRef}
          src="/math-games/index.html"
          className="w-full h-full border-0"
          title="Numbers & Counting Math Game"
          allow="autoplay; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
}
