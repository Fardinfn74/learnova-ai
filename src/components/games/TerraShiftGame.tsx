import { useState } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Sparkles, CheckCircle2, ArrowRight, Mountain, Flame, Layers } from "lucide-react";

export const terrashiftMetadata: GameMetadata = {
  id: "terrashift",
  title: "TerraShift 2D — Plate Tectonics & Earth Systems",
  category: "Earth Science",
  ageRange: "Grades 5–12 (Ages 10–18)",
  icon: "🌍",
  gradient: "bg-gradient-to-br from-orange-500 to-amber-700 text-white",
  bgGlow: "rgba(249, 115, 22, 0.2)",
  description: "Manipulate tectonic plate boundaries, simulate continental drift, and control volcanic magma pressure!",
  totalLevels: 6,
  tags: ["Earth Science", "Tectonics", "Volcanoes", "Geology"],
};

interface LevelConfig {
  title: string;
  boundaryType: "Divergent" | "Convergent" | "Transform" | "Volcano" | "Pangaea" | "RockCycle";
  description: string;
  hint: string;
  explanation: string;
}

const LEVELS: LevelConfig[] = [
  {
    title: "Pangaea Supercontinent Drift",
    description: "Drag continental landmasses into alignment to reconstruct the supercontinent Pangaea!",
    boundaryType: "Pangaea",
    hint: "Align South America next to Africa and Eurasia at the top!",
    explanation: "250 million years ago, all Earth continents were joined in the Pangaea supercontinent before tectonic drift.",
  },
  {
    title: "Divergent Boundary — Seafloor Spreading",
    description: "Pull two tectonic plates apart to allow magma to rise and form a Mid-Ocean Ridge.",
    boundaryType: "Divergent",
    hint: "Move the plate sliders outward (apart from each other)!",
    explanation: "Divergent boundaries create new oceanic crust as mantle magma wells up and cools.",
  },
  {
    title: "Convergent Boundary — Mountain Building",
    description: "Push continental plates together to buckle crust into massive mountain ranges like the Himalayas!",
    boundaryType: "Convergent",
    hint: "Push both plates inward toward the center collision zone!",
    explanation: "When continental plates collide, immense pressure crumples crust upward into high mountain peaks.",
  },
  {
    title: "Transform Fault — Earthquake Tension",
    description: "Slide plates sideways against each other until accumulated friction releases as an Earthquake!",
    boundaryType: "Transform",
    hint: "Slide Plate A left and Plate B right until tension snaps!",
    explanation: "Friction at transform faults like San Andreas builds potential energy until sudden slippage causes seismic shockwaves.",
  },
  {
    title: "Volcanic Magma Chamber Pressure Valve",
    description: "Equalize chamber gas pressure to trigger a controlled volcanic eruption without crust destruction.",
    boundaryType: "Volcano",
    hint: "Adjust the vent valve pressure slider to 80% to release magma safely!",
    explanation: "Subduction zones melt oceanic crust, generating buoyant magma and explosive gas pressures.",
  },
  {
    title: "The Rock Cycle Transformation",
    description: "Transform Igneous rock into Sedimentary and Metamorphic rock through heat and pressure.",
    boundaryType: "RockCycle",
    hint: "Apply Heat & Pressure to transform Igneous rock into Metamorphic rock!",
    explanation: "The Rock Cycle continuously recycles Earth material via weathering, melting, heat, and compaction.",
  },
];

export function TerraShiftGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);

  const cfg = LEVELS[level - 1];

  const [platePos, setPlatePos] = useState<number>(50); // 0 to 100 slider
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleSliderChange = (val: number) => {
    setPlatePos(val);
    gameAudio.playPop();

    let win = false;
    if (cfg.boundaryType === "Pangaea") win = val >= 80;
    if (cfg.boundaryType === "Divergent") win = val <= 20;
    if (cfg.boundaryType === "Convergent") win = val >= 85;
    if (cfg.boundaryType === "Transform") win = val >= 90;
    if (cfg.boundaryType === "Volcano") win = val >= 75 && val <= 85;
    if (cfg.boundaryType === "RockCycle") win = val >= 80;

    if (win && !isCompleted) {
      setIsCompleted(true);
      setGameXp((prev) => prev + 25);
      gameAudio.playSuccess();
      gameAudio.playFanfare();
      triggerConfetti();
    }
  };

  const resetLevel = () => {
    setPlatePos(50);
    setIsCompleted(false);
  };

  return (
    <GameShell
      metadata={terrashiftMetadata}
      currentLevel={level}
      totalLevels={LEVELS.length}
      gameXp={gameXp}
      hintText={cfg.hint}
      explanationText={cfg.explanation}
      onLevelChange={(lvl) => {
        setLevel(lvl);
        setIsCompleted(false);
        setPlatePos(50);
      }}
      onRestartLevel={resetLevel}
      onClose={onClose}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
        {/* Header */}
        <div className="text-center space-y-1 bg-card/80 border border-orange-500/30 rounded-2xl p-4 w-full shadow-lg">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> Stage: {cfg.title}
          </div>
          <p className="text-sm font-semibold text-foreground/90">{cfg.description}</p>
        </div>

        {/* 2D Tectonic Viewport */}
        <div className="relative w-full h-[250px] bg-slate-950 rounded-3xl border-2 border-orange-500/30 overflow-hidden shadow-2xl flex items-center justify-center p-6">
          <svg className="w-full h-full" viewBox="0 0 500 220">
            {/* Mantle Magma Base */}
            <rect x="0" y="140" width="500" height="80" fill="#c2410c" />

            {cfg.boundaryType === "Divergent" && (
              <>
                <rect x={100 - platePos} y="80" width="180" height="60" fill="#78350f" rx="6" />
                <rect x={220 + platePos} y="80" width="180" height="60" fill="#78350f" rx="6" />
                {platePos < 30 && (
                  <path d="M 230 140 L 250 100 L 270 140 Z" fill="#f97316" className="animate-pulse" />
                )}
              </>
            )}

            {cfg.boundaryType === "Convergent" && (
              <>
                <rect x={50 + platePos * 0.8} y="80" width="180" height="60" fill="#78350f" rx="6" />
                <rect x={270 - platePos * 0.8} y="80" width="180" height="60" fill="#78350f" rx="6" />
                {platePos > 70 && (
                  <polygon points="250,30 210,100 290,100" fill="#b45309" stroke="#f97316" strokeWidth="3" />
                )}
              </>
            )}

            {cfg.boundaryType === "Volcano" && (
              <>
                <polygon points="250,50 150,180 350,180" fill="#78350f" />
                <circle cx="250" cy="50" r={platePos > 70 ? "25" : "10"} fill="#f97316" className="animate-ping" />
              </>
            )}

            {cfg.boundaryType === "Pangaea" && (
              <g transform="translate(250, 100)">
                <ellipse cx="0" cy="0" rx={140 - platePos * 0.8} ry="60" fill="#15803d" />
                <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="black">
                  {platePos >= 80 ? "PANGAEA SUPERCONTINENT" : "Drifting Landmasses"}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Tectonic Action Control Slider */}
        <div className="w-full bg-card/80 border border-border/50 rounded-2xl p-4 space-y-3">
          <label className="text-xs font-bold text-muted-foreground flex justify-between">
            <span>Tectonic Plate Motion / Magma Pressure:</span>
            <span className="text-orange-400 font-extrabold">{platePos}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={platePos}
            onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
            className="w-full accent-orange-500"
          />
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="w-full bg-orange-500/20 border border-orange-500/50 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-orange-400 font-extrabold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Earth Geological Process Verified! (+25 XP)
            </div>
            <p className="text-xs text-muted-foreground">{cfg.explanation}</p>
            {level < LEVELS.length && (
              <button
                onClick={() => {
                  setLevel((prev) => prev + 1);
                  setIsCompleted(false);
                  setPlatePos(50);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg inline-flex items-center gap-2"
              >
                Next Tectonic Stage <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
