import { useState } from "react";
import { GameMetadata } from "./types";
import { X, RefreshCw, Trophy, ChevronLeft, ChevronRight, Sparkles, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { NovaGameHelper } from "./NovaGameHelper";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";

interface GameShellProps {
  metadata: GameMetadata;
  currentLevel: number;
  totalLevels: number;
  gameXp: number;
  hintText: string;
  explanationText?: string;
  onLevelChange: (level: number) => void;
  onRestartLevel: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

export function GameShell({
  metadata,
  currentLevel,
  totalLevels,
  gameXp,
  hintText,
  explanationText,
  onLevelChange,
  onRestartLevel,
  onClose,
  children,
}: GameShellProps) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(!gameAudio.isSoundEnabled());

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    gameAudio.setSoundEnabled(!next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden p-2 md:p-6 animate-in fade-in duration-200">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4 bg-card/80 border border-border/60 rounded-2xl p-3 shadow-lg z-30">
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded-xl grid place-items-center text-xl shadow-md", metadata.gradient)}>
            {metadata.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm md:text-base tracking-tight leading-none text-foreground">
                {metadata.title}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Level {currentLevel} of {totalLevels}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium hidden sm:block">
              {metadata.category} • {metadata.ageRange}
            </p>
          </div>
        </div>

        {/* HUD Metrics & Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Game XP Badge */}
          <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-500 px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-sm">
            <Trophy className="h-3.5 w-3.5 fill-current" />
            <span>{gameXp} Game XP</span>
          </div>

          {/* Mute Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-emerald-500" />}
          </button>

          {/* Restart Level */}
          <button
            onClick={onRestartLevel}
            className="p-2 rounded-xl bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition flex items-center gap-1 text-xs font-bold"
            title="Restart Level"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Close Game Launcher */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition"
            title="Exit Game"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Game Playing Field Area */}
      <div className="relative flex-1 my-3 rounded-3xl border border-border/60 bg-gradient-to-b from-card/60 to-card/90 overflow-hidden shadow-2xl flex flex-col justify-center items-center">
        {/* Nova Assistant Overlay floating in top-right */}
        <div className="absolute top-3 right-3 z-30 max-w-xs pointer-events-auto">
          <NovaGameHelper
            gameTitle={metadata.title}
            levelTitle={`Level ${currentLevel}`}
            hintText={hintText}
            explanationText={explanationText}
          />
        </div>

        {/* Interactive 2D Game Content */}
        <div className="w-full h-full flex flex-col justify-center items-center p-2 sm:p-4 overflow-auto">
          {children}
        </div>
      </div>

      {/* Bottom Level Progress Controls */}
      <div className="flex items-center justify-between gap-4 bg-card/80 border border-border/60 rounded-2xl p-2.5 shadow-lg z-30">
        <button
          disabled={currentLevel <= 1}
          onClick={() => onLevelChange(currentLevel - 1)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-muted/80 text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        {/* Level Pips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-md px-2 py-1">
          {Array.from({ length: totalLevels }, (_, i) => i + 1).map((lvl) => (
            <button
              key={lvl}
              onClick={() => onLevelChange(lvl)}
              className={cn(
                "h-2.5 rounded-full transition-all",
                lvl === currentLevel
                  ? "w-8 bg-amber-500 shadow-glow"
                  : lvl < currentLevel
                  ? "w-2.5 bg-emerald-500"
                  : "w-2.5 bg-muted-foreground/30"
              )}
              title={`Jump to Level ${lvl}`}
            />
          ))}
        </div>

        <button
          disabled={currentLevel >= totalLevels}
          onClick={() => onLevelChange(currentLevel + 1)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:pointer-events-none transition shadow-sm"
        >
          Next Level <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
