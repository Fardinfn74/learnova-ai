import { useState } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export const fractionislesMetadata: GameMetadata = {
  id: "fractionisles",
  title: "FractionIsles 2D — Fraction Pizza & Number Line",
  category: "Math",
  ageRange: "Grades 3–8 (Ages 8–14)",
  icon: "🍕",
  gradient: "bg-gradient-to-br from-amber-500 to-red-600 text-white",
  bgGlow: "rgba(245, 158, 11, 0.2)",
  description: "Slice fraction pizzas, match equivalent fractions, and hop across fraction number lines!",
  totalLevels: 6,
  tags: ["Math", "Fractions", "Pizza", "Number Line"],
};

interface LevelConfig {
  targetFractionText: string;
  targetValue: number;
  sliceCount: number;
  hint: string;
  explanation: string;
}

const LEVELS: LevelConfig[] = [
  {
    targetFractionText: "1/2 (Half Pizza)",
    targetValue: 0.5,
    sliceCount: 2,
    hint: "Select 1 slice out of 2 total slices to get 1/2 pizza!",
    explanation: "$1/2$ means 1 part selected out of 2 equal parts.",
  },
  {
    targetFractionText: "3/4 (Three Quarters)",
    targetValue: 0.75,
    sliceCount: 4,
    hint: "Select 3 slices out of 4 total slices!",
    explanation: "$3/4$ represents 3 out of 4 equal pizza slices.",
  },
  {
    targetFractionText: "2/3 (Two Thirds)",
    targetValue: 2 / 3,
    sliceCount: 3,
    hint: "Select 2 slices out of 3 total slices!",
    explanation: "$2/3$ equals two out of three equal portions.",
  },
  {
    targetFractionText: "4/8 Equivalent Fraction",
    targetValue: 0.5,
    sliceCount: 8,
    hint: "Select 4 slices out of 8 total slices (equivalent to 1/2)!",
    explanation: "$4/8 = 1/2$. Multiplying numerator and denominator by 4 keeps value equal.",
  },
  {
    targetFractionText: "5/6 Fraction",
    targetValue: 5 / 6,
    sliceCount: 6,
    hint: "Select 5 slices out of 6 total slices!",
    explanation: "$5/6$ leaves only 1 slice remaining out of 6.",
  },
  {
    targetFractionText: "6/8 Equivalent Fraction",
    targetValue: 0.75,
    sliceCount: 8,
    hint: "Select 6 slices out of 8 total slices (equivalent to 3/4)!",
    explanation: "$6/8 = 3/4$. Reducing fractions by dividing numerator and denominator by 2.",
  },
];

export function FractionIslesGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);

  const cfg = LEVELS[level - 1];

  const [selectedSlices, setSelectedSlices] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleSliceClick = () => {
    const next = (selectedSlices + 1) % (cfg.sliceCount + 1);
    setSelectedSlices(next);
    gameAudio.playPop();

    const currentVal = next / cfg.sliceCount;
    if (Math.abs(currentVal - cfg.targetValue) < 0.01 && !isCompleted) {
      setIsCompleted(true);
      setGameXp((prev) => prev + 25);
      gameAudio.playSuccess();
      gameAudio.playFanfare();
      triggerConfetti();
    }
  };

  const resetLevel = () => {
    setSelectedSlices(0);
    setIsCompleted(false);
  };

  return (
    <GameShell
      metadata={fractionislesMetadata}
      currentLevel={level}
      totalLevels={LEVELS.length}
      gameXp={gameXp}
      hintText={cfg.hint}
      explanationText={cfg.explanation}
      onLevelChange={(lvl) => {
        setLevel(lvl);
        setIsCompleted(false);
        setSelectedSlices(0);
      }}
      onRestartLevel={resetLevel}
      onClose={onClose}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
        {/* Header */}
        <div className="text-center space-y-1 bg-card/80 border border-amber-500/30 rounded-2xl p-4 w-full shadow-lg">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> Target Fraction: {cfg.targetFractionText}
          </div>
          <p className="text-sm font-semibold text-foreground/90">
            Click the pizza to select the correct number of slices!
          </p>
        </div>

        {/* 2D Interactive Fraction Pizza */}
        <div className="relative w-full h-[250px] bg-slate-950 rounded-3xl border-2 border-amber-500/30 overflow-hidden shadow-2xl flex items-center justify-center p-6">
          <button
            onClick={handleSliceClick}
            className="relative w-48 h-48 rounded-full border-4 border-amber-700 bg-amber-900/60 overflow-hidden shadow-2xl transition hover:scale-105"
          >
            <svg className="w-full h-full" viewBox="-100 -100 200 200">
              {Array.from({ length: cfg.sliceCount }).map((_, i) => {
                const anglePerSlice = 360 / cfg.sliceCount;
                const startAngle = (i * anglePerSlice * Math.PI) / 180;
                const endAngle = ((i + 1) * anglePerSlice * Math.PI) / 180;

                const x1 = 90 * Math.cos(startAngle);
                const y1 = 90 * Math.sin(startAngle);
                const x2 = 90 * Math.cos(endAngle);
                const y2 = 90 * Math.sin(endAngle);

                const isSelected = i < selectedSlices;

                return (
                  <path
                    key={i}
                    d={`M 0 0 L ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2} Z`}
                    fill={isSelected ? "#f59e0b" : "#78350f"}
                    stroke="#451a03"
                    strokeWidth="3"
                  />
                );
              })}
            </svg>
          </button>

          <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-xs font-bold text-amber-400">
            Selected: {selectedSlices} / {cfg.sliceCount} Slices
          </div>
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="w-full bg-amber-500/20 border border-amber-500/50 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-extrabold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Perfect Pizza Fraction! (+25 XP)
            </div>
            <p className="text-xs text-muted-foreground">{cfg.explanation}</p>
            {level < LEVELS.length && (
              <button
                onClick={() => {
                  setLevel((prev) => prev + 1);
                  setIsCompleted(false);
                  setSelectedSlices(0);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg inline-flex items-center gap-2"
              >
                Next Fraction Island <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
