import { useState } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export const algebalanceMetadata: GameMetadata = {
  id: "algebalance",
  title: "AlgeBalance 2D — Visual Equation Seesaw",
  category: "Algebra",
  ageRange: "Grades 5–10 (Ages 10–16)",
  icon: "⚖️",
  gradient: "bg-gradient-to-br from-cyan-500 to-blue-700 text-white",
  bgGlow: "rgba(6, 182, 212, 0.2)",
  description: "Solve linear equations visually by balancing weights and unknown x-variables on a 2D seesaw scale!",
  totalLevels: 6,
  tags: ["Algebra", "Equations", "Variables", "Math"],
};

interface LevelConfig {
  equation: string;
  targetX: number;
  leftXCount: number;
  leftUnitCount: number;
  rightXCount: number;
  rightUnitCount: number;
  hint: string;
  explanation: string;
}

const LEVELS: LevelConfig[] = [
  {
    equation: "x + 3 = 7",
    targetX: 4,
    leftXCount: 1,
    leftUnitCount: 3,
    rightXCount: 0,
    rightUnitCount: 7,
    hint: "Subtract 3 units from both sides! Left = x, Right = 7 - 3 = 4.",
    explanation: "Subtracting 3 from both sides isolates $x = 4$.",
  },
  {
    equation: "2x + 1 = 9",
    targetX: 4,
    leftXCount: 2,
    leftUnitCount: 1,
    rightXCount: 0,
    rightUnitCount: 9,
    hint: "Subtract 1 unit from both sides (2x = 8), then divide by 2 (x = 4)!",
    explanation: "$2x + 1 = 9 \\Rightarrow 2x = 8 \\Rightarrow x = 4$.",
  },
  {
    equation: "3x + 2 = 2x + 7",
    targetX: 5,
    leftXCount: 3,
    leftUnitCount: 2,
    rightXCount: 2,
    rightUnitCount: 7,
    hint: "Subtract 2x from both sides (x + 2 = 7), then subtract 2!",
    explanation: "Subtracting $2x$ and $2$ gives $x = 5$.",
  },
  {
    equation: "4x + 1 = 13",
    targetX: 3,
    leftXCount: 4,
    leftUnitCount: 1,
    rightXCount: 0,
    rightUnitCount: 13,
    hint: "Subtract 1 (4x = 12), then divide 12 by 4!",
    explanation: "$4x = 12 \\Rightarrow x = 3$.",
  },
  {
    equation: "2x + 5 = x + 9",
    targetX: 4,
    leftXCount: 2,
    leftUnitCount: 5,
    rightXCount: 1,
    rightUnitCount: 9,
    hint: "Subtract x from both sides (x + 5 = 9), then subtract 5!",
    explanation: "$2x + 5 = x + 9 \\Rightarrow x = 4$.",
  },
  {
    equation: "3x + 4 = 19",
    targetX: 5,
    leftXCount: 3,
    leftUnitCount: 4,
    rightXCount: 0,
    rightUnitCount: 19,
    hint: "Subtract 4 (3x = 15), then divide 15 by 3!",
    explanation: "$3x = 15 \\Rightarrow x = 5$.",
  },
];

export function AlgeBalanceGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);

  const cfg = LEVELS[level - 1];

  const [userX, setUserX] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Calculate left pan weight vs right pan weight
  const leftPanWeight = cfg.leftXCount * userX + cfg.leftUnitCount;
  const rightPanWeight = cfg.rightXCount * userX + cfg.rightUnitCount;

  const tiltAngle = Math.max(-20, Math.min(20, (rightPanWeight - leftPanWeight) * 3));

  const handleVerify = () => {
    if (userX === cfg.targetX) {
      if (!isCompleted) {
        setIsCompleted(true);
        setGameXp((prev) => prev + 25);
        gameAudio.playSuccess();
        gameAudio.playFanfare();
        triggerConfetti();
      }
    } else {
      gameAudio.playError();
    }
  };

  const resetLevel = () => {
    setUserX(1);
    setIsCompleted(false);
  };

  return (
    <GameShell
      metadata={algebalanceMetadata}
      currentLevel={level}
      totalLevels={LEVELS.length}
      gameXp={gameXp}
      hintText={cfg.hint}
      explanationText={cfg.explanation}
      onLevelChange={(lvl) => {
        setLevel(lvl);
        setIsCompleted(false);
        setUserX(1);
      }}
      onRestartLevel={resetLevel}
      onClose={onClose}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
        {/* Header */}
        <div className="text-center space-y-1 bg-card/80 border border-cyan-500/30 rounded-2xl p-4 w-full shadow-lg">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> Equation: {cfg.equation}
          </div>
          <p className="text-sm font-semibold text-foreground/90">
            Find the unknown value $x$ that balances both sides of the scale perfectly!
          </p>
        </div>

        {/* 2D Seesaw Balance Viewport */}
        <div className="relative w-full h-[250px] bg-slate-950 rounded-3xl border-2 border-cyan-500/30 overflow-hidden shadow-2xl flex items-center justify-center p-6">
          <svg className="w-full h-full" viewBox="0 0 500 220">
            {/* Fulcrum Triangle */}
            <polygon points="250,180 230,220 270,220" fill="#06b6d4" />

            {/* Seesaw Beam */}
            <g transform={`rotate(${tiltAngle}, 250, 180)`}>
              <line x1="80" y1="180" x2="420" y2="180" stroke="#0284c7" strokeWidth="8" strokeLinecap="round" />

              {/* Left Pan */}
              <g transform="translate(80, 180)">
                <line x1="0" y1="0" x2="0" y2="30" stroke="#94a3b8" strokeWidth="3" />
                <rect x="-40" y="30" width="80" height="10" fill="#0284c7" rx="3" />
                <text x="0" y="25" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold">
                  Weight: {leftPanWeight}
                </text>
              </g>

              {/* Right Pan */}
              <g transform="translate(420, 180)">
                <line x1="0" y1="0" x2="0" y2="30" stroke="#94a3b8" strokeWidth="3" />
                <rect x="-40" y="30" width="80" height="10" fill="#0284c7" rx="3" />
                <text x="0" y="25" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold">
                  Weight: {rightPanWeight}
                </text>
              </g>
            </g>
          </svg>

          {/* Balance Indicator Status */}
          <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-xs font-bold text-cyan-400 shadow-md">
            {leftPanWeight === rightPanWeight ? "⚖️ Perfect Balance!" : "⚠️ Scale Unbalanced"}
          </div>
        </div>

        {/* Variable Value Controls */}
        <div className="w-full bg-card/80 border border-border/50 rounded-2xl p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground flex justify-between">
              <span>Set value of x:</span>
              <span className="text-cyan-400 font-extrabold text-base">x = {userX}</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={userX}
              onChange={(e) => {
                setUserX(parseInt(e.target.value, 10));
                gameAudio.playPop();
              }}
              className="w-full accent-cyan-500"
            />
          </div>

          <button
            onClick={handleVerify}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl transition shadow-lg text-sm"
          >
            Check Equation Balance ⚖️
          </button>
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="w-full bg-cyan-500/20 border border-cyan-500/50 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-cyan-400 font-extrabold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Equation Solved: x = {cfg.targetX}! (+25 XP)
            </div>
            <p className="text-xs text-muted-foreground">{cfg.explanation}</p>
            {level < LEVELS.length && (
              <button
                onClick={() => {
                  setLevel((prev) => prev + 1);
                  setIsCompleted(false);
                }}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg inline-flex items-center gap-2"
              >
                Next Equation Challenge <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
