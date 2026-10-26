import { useState } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export const geoforgeMetadata: GameMetadata = {
  id: "geoforge",
  title: "GeoForge 2D — Geometry & Area Lab",
  category: "Geometry",
  ageRange: "Grades 5–10 (Ages 10–16)",
  icon: "📐",
  gradient: "bg-gradient-to-br from-purple-500 to-indigo-700 text-white",
  bgGlow: "rgba(139, 92, 246, 0.2)",
  description: "Construct 2D polygons, measure side lengths, and calculate exact perimeters and areas!",
  totalLevels: 6,
  tags: ["Geometry", "Area", "Perimeter", "Shapes"],
};

interface LevelConfig {
  targetShape: string;
  targetArea: number;
  description: string;
  gridUnits: string;
  hint: string;
  explanation: string;
}

const LEVELS: LevelConfig[] = [
  {
    targetShape: "Triangle",
    targetArea: 12,
    description: "Adjust height and base slider so Area = 1/2 × Base × Height = 12 sq units.",
    gridUnits: "sq units",
    hint: "If Base = 6 and Height = 4, Area = 1/2 × 6 × 4 = 12!",
    explanation: "Triangle Area formula is A = 1/2 × base × height.",
  },
  {
    targetShape: "Rectangle",
    targetArea: 24,
    description: "Adjust length and width sliders so Area = Length × Width = 24 sq units.",
    gridUnits: "sq units",
    hint: "Try Width = 4 and Length = 6 (4 × 6 = 24).",
    explanation: "Rectangle Area formula is A = length × width.",
  },
  {
    targetShape: "Square",
    targetArea: 25,
    description: "A square has equal sides (s). Adjust side length s so Area = s² = 25.",
    gridUnits: "sq units",
    hint: "Find the square root of 25: 5 × 5 = 25!",
    explanation: "Square Area formula is A = s², where s is the equal side length.",
  },
  {
    targetShape: "Parallelogram",
    targetArea: 30,
    description: "Adjust Base and Height so Area = Base × Height = 30 sq units.",
    gridUnits: "sq units",
    hint: "Set Base = 6 and Height = 5.",
    explanation: "Parallelogram Area is A = base × perpendicular height.",
  },
  {
    targetShape: "Trapezoid",
    targetArea: 20,
    description: "Area = 1/2 × (Base1 + Base2) × Height. Reach Area = 20 sq units.",
    gridUnits: "sq units",
    hint: "Try Base1 = 3, Base2 = 7, Height = 4 (1/2 × 10 × 4 = 20).",
    explanation: "Trapezoid Area is the average of parallel bases multiplied by height.",
  },
  {
    targetShape: "Circle",
    targetArea: 28, // approx r=3 => pi*r^2 = 28.27
    description: "Adjust radius r so Area ≈ π × r² ≈ 28 sq units.",
    gridUnits: "sq units",
    hint: "Set radius r = 3 (3.14 × 9 = 28.26).",
    explanation: "Circle Area formula is A = π × r².",
  },
];

export function GeoForgeGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);

  // Sliders state
  const [param1, setParam1] = useState<number>(4); // Base / Length / Base1 / Radius
  const [param2, setParam2] = useState<number>(4); // Height / Width / Base2
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const cfg = LEVELS[level - 1];

  // Calculate current area based on shape type
  const calculateArea = (): number => {
    if (cfg.targetShape === "Triangle") return 0.5 * param1 * param2;
    if (cfg.targetShape === "Rectangle") return param1 * param2;
    if (cfg.targetShape === "Square") return param1 * param1;
    if (cfg.targetShape === "Parallelogram") return param1 * param2;
    if (cfg.targetShape === "Trapezoid") return 0.5 * (param1 + param2) * 4; // fixed height 4
    if (cfg.targetShape === "Circle") return Math.round(Math.PI * param1 * param1);
    return 0;
  };

  const currentArea = calculateArea();

  const handleCheck = () => {
    if (Math.abs(currentArea - cfg.targetArea) <= 1) {
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
    setParam1(3);
    setParam2(3);
    setIsCompleted(false);
  };

  return (
    <GameShell
      metadata={geoforgeMetadata}
      currentLevel={level}
      totalLevels={LEVELS.length}
      gameXp={gameXp}
      hintText={cfg.hint}
      explanationText={cfg.explanation}
      onLevelChange={(lvl) => {
        setLevel(lvl);
        setIsCompleted(false);
      }}
      onRestartLevel={resetLevel}
      onClose={onClose}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
        {/* Header */}
        <div className="text-center space-y-1 bg-card/80 border border-purple-500/30 rounded-2xl p-4 w-full shadow-lg">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> Shape: {cfg.targetShape} | Target Area: {cfg.targetArea} sq units
          </div>
          <p className="text-sm font-semibold text-foreground/90">{cfg.description}</p>
        </div>

        {/* 2D Canvas Shape Visualizer */}
        <div className="relative w-full h-[250px] bg-slate-950/90 rounded-3xl border-2 border-purple-500/30 overflow-hidden shadow-inner flex items-center justify-center p-6">
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: "radial-gradient(#8b5cf6 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* SVG Shape Render */}
          <svg className="w-64 h-64 overflow-visible" viewBox="-100 -100 200 200">
            {cfg.targetShape === "Triangle" && (
              <polygon
                points={`-${param1 * 12},${param2 * 8} ${param1 * 12},${param2 * 8} 0,-${param2 * 12}`}
                fill="rgba(139, 92, 246, 0.4)"
                stroke="#8b5cf6"
                strokeWidth="4"
              />
            )}
            {cfg.targetShape === "Rectangle" && (
              <rect
                x={-(param1 * 10) / 2}
                y={-(param2 * 10) / 2}
                width={param1 * 10}
                height={param2 * 10}
                fill="rgba(139, 92, 246, 0.4)"
                stroke="#8b5cf6"
                strokeWidth="4"
              />
            )}
            {cfg.targetShape === "Square" && (
              <rect
                x={-(param1 * 12) / 2}
                y={-(param1 * 12) / 2}
                width={param1 * 12}
                height={param1 * 12}
                fill="rgba(139, 92, 246, 0.4)"
                stroke="#8b5cf6"
                strokeWidth="4"
              />
            )}
            {cfg.targetShape === "Parallelogram" && (
              <polygon
                points={`-${param1 * 8},${param2 * 8} ${param1 * 8},${param2 * 8} ${param1 * 8 + 20},-${param2 * 8} -${param1 * 8 - 20},-${param2 * 8}`}
                fill="rgba(139, 92, 246, 0.4)"
                stroke="#8b5cf6"
                strokeWidth="4"
              />
            )}
            {cfg.targetShape === "Trapezoid" && (
              <polygon
                points={`-${param2 * 10},40 ${param2 * 10},40 ${param1 * 6}, -40 -${param1 * 6}, -40`}
                fill="rgba(139, 92, 246, 0.4)"
                stroke="#8b5cf6"
                strokeWidth="4"
              />
            )}
            {cfg.targetShape === "Circle" && (
              <circle
                cx="0"
                cy="0"
                r={param1 * 15}
                fill="rgba(139, 92, 246, 0.4)"
                stroke="#8b5cf6"
                strokeWidth="4"
              />
            )}
          </svg>

          {/* Area display readout */}
          <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-purple-500/40 text-xs font-bold text-purple-400 shadow-md">
            Calculated Area: {currentArea} sq units
          </div>
        </div>

        {/* Dimension Control Sliders */}
        <div className="w-full bg-card/80 border border-border/50 rounded-2xl p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground flex justify-between">
              <span>{cfg.targetShape === "Circle" ? "Radius (r)" : "Dimension 1 (Base/Length)"}:</span>
              <span className="text-purple-400 font-extrabold">{param1} units</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={param1}
              onChange={(e) => {
                setParam1(parseInt(e.target.value, 10));
                gameAudio.playPop();
              }}
              className="w-full accent-purple-500"
            />
          </div>

          {cfg.targetShape !== "Square" && cfg.targetShape !== "Circle" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground flex justify-between">
                <span>Dimension 2 (Height/Width):</span>
                <span className="text-purple-400 font-extrabold">{param2} units</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={param2}
                onChange={(e) => {
                  setParam2(parseInt(e.target.value, 10));
                  gameAudio.playPop();
                }}
                className="w-full accent-purple-500"
              />
            </div>
          )}

          <button
            onClick={handleCheck}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition shadow-lg text-sm"
          >
            Verify Shape Area ✨
          </button>
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="w-full bg-purple-500/20 border border-purple-500/50 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-purple-400 font-extrabold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Geometry Goal Achieved! (+25 XP)
            </div>
            <p className="text-xs text-muted-foreground">{cfg.explanation}</p>
            {level < LEVELS.length && (
              <button
                onClick={() => {
                  setLevel((prev) => prev + 1);
                  setIsCompleted(false);
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg inline-flex items-center gap-2"
              >
                Next Geometry Challenge <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
