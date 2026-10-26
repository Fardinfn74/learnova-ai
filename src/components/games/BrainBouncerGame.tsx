import { useState } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Sparkles, CheckCircle2, Play, RotateCcw } from "lucide-react";

export const brainbouncerMetadata: GameMetadata = {
  id: "brainbouncer",
  title: "Brain Bouncer 2D — Physics Bounce Puzzle",
  category: "Kids Puzzle",
  ageRange: "Ages 5–15",
  icon: "⭐",
  gradient: "bg-gradient-to-br from-violet-500 to-fuchsia-700 text-white",
  bgGlow: "rgba(139, 92, 246, 0.2)",
  description: "Set bounce trampoline angles to direct falling knowledge stars into target goal buckets!",
  totalLevels: 6,
  tags: ["Puzzle", "Physics", "Bounce", "Kids"],
  isKidsSpecial: true,
};

interface LevelConfig {
  starStart: { x: number; y: number };
  bucketTarget: { x: number; y: number };
  hint: string;
  explanation: string;
}

const LEVELS: LevelConfig[] = [
  {
    starStart: { x: 100, y: 30 },
    bucketTarget: { x: 380, y: 180 },
    hint: "Set trampoline angle to 45° to reflect the falling star into the bucket!",
    explanation: "Angle of Incidence equals Angle of Reflection!",
  },
  {
    starStart: { x: 80, y: 30 },
    bucketTarget: { x: 420, y: 180 },
    hint: "Adjust trampoline position and angle to bounce the star across the screen!",
    explanation: "Vector reflection changes directional momentum.",
  },
  {
    starStart: { x: 150, y: 30 },
    bucketTarget: { x: 350, y: 180 },
    hint: "Set steep 60° bounce angle to land in the close bucket!",
    explanation: "Steeper reflection vectors create higher parabolic arcs.",
  },
  {
    starStart: { x: 200, y: 30 },
    bucketTarget: { x: 450, y: 180 },
    hint: "Set shallow 30° bounce angle for long distance ricochet!",
    explanation: "Low impact angles preserve horizontal momentum.",
  },
  {
    starStart: { x: 100, y: 30 },
    bucketTarget: { x: 300, y: 180 },
    hint: "Fine-tune bounce pad angle to 40°!",
    explanation: "Precision physics targeting requires exact angle calculation.",
  },
  {
    starStart: { x: 60, y: 30 },
    bucketTarget: { x: 440, y: 180 },
    hint: "Master puzzle level! Bounce star into final goal bucket!",
    explanation: "Master physics brain bouncer champion!",
  },
];

export function BrainBouncerGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);

  const cfg = LEVELS[level - 1];

  const [padAngle, setPadAngle] = useState<number>(45);
  const [starPos, setStarPos] = useState<{ x: number; y: number }>(cfg.starStart);
  const [isBouncing, setIsBouncing] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const dropStar = () => {
    if (isBouncing) return;

    setIsBouncing(true);
    gameAudio.playJump();

    let x = cfg.starStart.x;
    let y = cfg.starStart.y;
    let vx = 0;
    let vy = 4;

    const interval = setInterval(() => {
      x += vx;
      y += vy;
      vy += 0.3; // gravity

      // Check collision with bounce pad at y=120, x in 180..260
      if (y >= 120 && y <= 135 && x >= 150 && x <= 270) {
        gameAudio.playPop();
        const rad = (padAngle * Math.PI) / 180;
        vx = Math.cos(rad) * 12;
        vy = -Math.sin(rad) * 12;
      }

      setStarPos({ x, y });

      // Check bucket collision
      const dist = Math.hypot(x - cfg.bucketTarget.x, y - cfg.bucketTarget.y);
      if (dist < 30 && !isCompleted) {
        clearInterval(interval);
        setIsBouncing(false);
        setIsCompleted(true);
        setGameXp((prev) => prev + 25);
        gameAudio.playSuccess();
        gameAudio.playFanfare();
        triggerConfetti();
        return;
      }

      if (y > 220 || x > 500) {
        clearInterval(interval);
        setIsBouncing(false);
        gameAudio.playError();
      }
    }, 30);
  };

  const resetLevel = () => {
    setStarPos(cfg.starStart);
    setIsBouncing(false);
    setIsCompleted(false);
  };

  return (
    <GameShell
      metadata={brainbouncerMetadata}
      currentLevel={level}
      totalLevels={6}
      gameXp={gameXp}
      hintText={cfg.hint}
      explanationText={cfg.explanation}
      onLevelChange={(lvl) => {
        setLevel(lvl);
        setIsCompleted(false);
        setStarPos(LEVELS[lvl - 1].starStart);
      }}
      onRestartLevel={resetLevel}
      onClose={onClose}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
        {/* Header */}
        <div className="text-center space-y-1 bg-card/80 border border-violet-500/30 rounded-2xl p-4 w-full shadow-lg">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> Bounce Star into Goal Bucket!
          </div>
          <p className="text-sm font-semibold text-foreground/90">
            Adjust the bounce trampoline angle to bounce the falling star!
          </p>
        </div>

        {/* 2D Physics Canvas */}
        <div className="relative w-full h-[250px] bg-slate-950 rounded-3xl border-2 border-violet-500/30 overflow-hidden shadow-2xl flex items-center justify-center p-6">
          <svg className="w-full h-full" viewBox="0 0 500 220">
            {/* Goal Bucket */}
            <g transform={`translate(${cfg.bucketTarget.x}, ${cfg.bucketTarget.y})`}>
              <rect x="-25" y="-15" width="50" height="30" fill="#a855f7" rx="6" />
              <text x="0" y="5" textAnchor="middle" fontSize="16">
                🪣
              </text>
            </g>

            {/* Bounce Pad Trampoline */}
            <g transform="translate(210, 125)">
              <line
                x1={-35 * Math.cos((padAngle * Math.PI) / 180)}
                y1={35 * Math.sin((padAngle * Math.PI) / 180)}
                x2={35 * Math.cos((padAngle * Math.PI) / 180)}
                y2={-35 * Math.sin((padAngle * Math.PI) / 180)}
                stroke="#a855f7"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </g>

            {/* Star Orb */}
            <g transform={`translate(${starPos.x}, ${starPos.y})`}>
              <circle cx="0" cy="0" r="14" fill="#facc15" className="animate-ping opacity-30" />
              <text x="0" y="5" textAnchor="middle" fontSize="18">
                ⭐
              </text>
            </g>
          </svg>
        </div>

        {/* Trampoline Angle Controls */}
        <div className="w-full bg-card/80 border border-border/50 rounded-2xl p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground flex justify-between">
              <span>Trampoline Bounce Angle:</span>
              <span className="text-violet-400 font-extrabold">{padAngle}°</span>
            </label>
            <input
              type="range"
              min="15"
              max="75"
              disabled={isBouncing}
              value={padAngle}
              onChange={(e) => setPadAngle(parseInt(e.target.value, 10))}
              className="w-full accent-violet-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              disabled={isBouncing}
              onClick={dropStar}
              className="flex-1 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" /> Drop Knowledge Star
            </button>
            <button
              onClick={resetLevel}
              className="p-3 bg-muted rounded-xl hover:bg-muted/80 text-foreground font-bold transition"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="w-full bg-violet-500/20 border border-violet-500/50 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-violet-400 font-extrabold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Star Landed in Goal Bucket! (+25 XP)
            </div>
            {level < 6 && (
              <button
                onClick={() => {
                  setLevel((prev) => prev + 1);
                  setIsCompleted(false);
                  setStarPos(LEVELS[level].starStart);
                }}
                className="bg-violet-500 hover:bg-violet-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg"
              >
                Next Brain Bounce
              </button>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
