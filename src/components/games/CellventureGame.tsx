import { useState } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export const cellventureMetadata: GameMetadata = {
  id: "cellventure",
  title: "Cellventure 2D — Inside the Living Cell",
  category: "Biology",
  ageRange: "Grades 5–12 (Ages 10–18)",
  icon: "🦠",
  gradient: "bg-gradient-to-br from-rose-500 to-pink-700 text-white",
  bgGlow: "rgba(244, 63, 94, 0.2)",
  description: "Explore organelle microscopic functions and build functional plant and animal cells!",
  totalLevels: 6,
  tags: ["Biology", "Cell Organelles", "Photosynthesis", "ATP Energy"],
};

interface LevelConfig {
  title: string;
  organelleTarget: string;
  description: string;
  organellesNeeded: string[];
  hint: string;
  explanation: string;
}

const LEVELS: LevelConfig[] = [
  {
    title: "Nucleus — The Command Center",
    description: "Place the Nucleus at the core of the cell to store DNA genetic instructions.",
    organelleTarget: "Nucleus",
    organellesNeeded: ["Nucleus"],
    hint: "Click Nucleus from the side panel to assemble it into the cell cytoplasm!",
    explanation: "The Nucleus contains chromatin (DNA) and directs cellular metabolism, growth, and replication.",
  },
  {
    title: "Mitochondria — Powerhouse of the Cell",
    description: "Add Mitochondria organelles to convert glucose into cellular ATP energy.",
    organelleTarget: "Mitochondria",
    organellesNeeded: ["Nucleus", "Mitochondria"],
    hint: "Click Mitochondria to generate ATP energy for cellular processes!",
    explanation: "Mitochondria perform cellular respiration: Glucose + O₂ → ATP + CO₂ + H₂O.",
  },
  {
    title: "Ribosomes & Endoplasmic Reticulum",
    description: "Assemble Ribosomes to synthesize proteins required for cell growth.",
    organelleTarget: "Ribosome",
    organellesNeeded: ["Nucleus", "Mitochondria", "Ribosome"],
    hint: "Attach Ribosomes around the Rough Endoplasmic Reticulum!",
    explanation: "Ribosomes translate mRNA genetic codes into functional polypeptide protein chains.",
  },
  {
    title: "Chloroplast — Plant Photosynthesis Factory",
    description: "Add Chloroplasts to enable green plant cells to absorb sunlight and create sugar.",
    organelleTarget: "Chloroplast",
    organellesNeeded: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
    hint: "Place Chloroplasts to convert sunlight into glucose energy!",
    explanation: "Chloroplasts contain green chlorophyll pigment that powers photosynthesis: CO₂ + H₂O + Light → Glucose + O₂.",
  },
  {
    title: "Vacuole & Cell Wall Structural Assembly",
    description: "Add the central rigid Vacuole and Plant Cell Wall for structural turgor pressure.",
    organelleTarget: "CellWall",
    organellesNeeded: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast", "CellWall"],
    hint: "Add the outer Cell Wall to give the plant cell its rigid shape!",
    explanation: "The cellulose cell wall and large central vacuole maintain plant turgidity and posture.",
  },
  {
    title: "Complete Living Cell Organism",
    description: "Finalize all organelle systems to power a fully functioning synthetic cell!",
    organelleTarget: "Complete",
    organellesNeeded: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast", "CellWall", "Golgi"],
    hint: "Complete the Golgi Apparatus to package proteins for transport!",
    explanation: "The Golgi apparatus sorts and packages proteins into vesicles for secretion or intracellular use.",
  },
];

export function CellventureGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);

  const cfg = LEVELS[level - 1];

  const [placedOrganelles, setPlacedOrganelles] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handlePlaceOrganelle = (org: string) => {
    if (placedOrganelles.includes(org)) return;

    gameAudio.playPop();
    const updated = [...placedOrganelles, org];
    setPlacedOrganelles(updated);

    // Check if level requirement satisfied
    const req = cfg.organellesNeeded;
    const satisfied = req.every((r) => updated.includes(r));

    if (satisfied && !isCompleted) {
      setIsCompleted(true);
      setGameXp((prev) => prev + 25);
      gameAudio.playSuccess();
      gameAudio.playFanfare();
      triggerConfetti();
    }
  };

  const resetLevel = () => {
    setPlacedOrganelles([]);
    setIsCompleted(false);
  };

  return (
    <GameShell
      metadata={cellventureMetadata}
      currentLevel={level}
      totalLevels={LEVELS.length}
      gameXp={gameXp}
      hintText={cfg.hint}
      explanationText={cfg.explanation}
      onLevelChange={(lvl) => {
        setLevel(lvl);
        setIsCompleted(false);
        setPlacedOrganelles([]);
      }}
      onRestartLevel={resetLevel}
      onClose={onClose}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
        {/* Header */}
        <div className="text-center space-y-1 bg-card/80 border border-rose-500/30 rounded-2xl p-4 w-full shadow-lg">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> Stage: {cfg.title}
          </div>
          <p className="text-sm font-semibold text-foreground/90">{cfg.description}</p>
        </div>

        {/* 2D Cell Diagram Viewport */}
        <div className="relative w-full h-[260px] bg-slate-950 rounded-3xl border-2 border-rose-500/30 overflow-hidden shadow-2xl flex items-center justify-center p-4">
          <svg className="w-full h-full" viewBox="0 0 500 240">
            {/* Cell Membrane & Cell Wall Outline */}
            <rect
              x="30"
              y="20"
              width="440"
              height="200"
              rx="60"
              fill="rgba(244, 63, 94, 0.15)"
              stroke={placedOrganelles.includes("CellWall") ? "#10b981" : "#f43f5e"}
              strokeWidth={placedOrganelles.includes("CellWall") ? "10" : "5"}
            />

            {/* Cytoplasm label */}
            <text x="50" y="45" fill="#94a3b8" fontSize="11" fontWeight="bold">
              Cytosol Fluid
            </text>

            {/* Nucleus */}
            {placedOrganelles.includes("Nucleus") && (
              <g transform="translate(250, 120)">
                <circle cx="0" cy="0" r="45" fill="#8b5cf6" opacity="0.8" />
                <circle cx="0" cy="0" r="18" fill="#a855f7" />
                <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="extrabold">
                  Nucleus
                </text>
              </g>
            )}

            {/* Mitochondria */}
            {placedOrganelles.includes("Mitochondria") && (
              <g transform="translate(120, 80)">
                <ellipse cx="0" cy="0" rx="30" ry="16" fill="#ef4444" />
                <path d="M -20 0 Q -10 -8 0 0 Q 10 8 20 0" fill="none" stroke="#ffffff" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                  Mitochondria
                </text>
              </g>
            )}

            {/* Ribosomes */}
            {placedOrganelles.includes("Ribosome") && (
              <g transform="translate(370, 80)">
                <circle cx="-10" cy="0" r="6" fill="#f59e0b" />
                <circle cx="10" cy="0" r="6" fill="#f59e0b" />
                <circle cx="0" cy="10" r="6" fill="#f59e0b" />
                <text x="0" y="-12" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">
                  Ribosomes
                </text>
              </g>
            )}

            {/* Chloroplast */}
            {placedOrganelles.includes("Chloroplast") && (
              <g transform="translate(120, 160)">
                <ellipse cx="0" cy="0" rx="32" ry="18" fill="#10b981" />
                <circle cx="-12" cy="0" r="4" fill="#a7f3d0" />
                <circle cx="0" cy="0" r="4" fill="#a7f3d0" />
                <circle cx="12" cy="0" r="4" fill="#a7f3d0" />
                <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                  Chloroplast
                </text>
              </g>
            )}

            {/* Golgi Apparatus */}
            {placedOrganelles.includes("Golgi") && (
              <g transform="translate(370, 160)">
                <path d="M -25 -10 Q 0 -18 25 -10 M -25 0 Q 0 -8 25 0 M -25 10 Q 0 2 25 10" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                <text x="0" y="22" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="bold">
                  Golgi App
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Organelle Selection Toolbar */}
        <div className="w-full bg-card/80 border border-border/50 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-muted-foreground">Select and Install Organelle:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: "Nucleus", label: "🧬 Nucleus", color: "bg-purple-500" },
              { id: "Mitochondria", label: "⚡ Mitochondria", color: "bg-red-500" },
              { id: "Ribosome", label: "🟡 Ribosome", color: "bg-amber-500" },
              { id: "Chloroplast", label: "🌿 Chloroplast", color: "bg-emerald-500" },
              { id: "CellWall", label: "🧱 Cell Wall", color: "bg-teal-500" },
              { id: "Golgi", label: "📦 Golgi Body", color: "bg-blue-500" },
            ].map((item) => {
              const isInstalled = placedOrganelles.includes(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => handlePlaceOrganelle(item.id)}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-between text-white shadow-sm ${
                    item.color
                  } ${isInstalled ? "ring-2 ring-white opacity-80" : "hover:scale-105"}`}
                >
                  <span>{item.label}</span>
                  {isInstalled && <CheckCircle2 className="h-4 w-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="w-full bg-rose-500/20 border border-rose-500/50 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-extrabold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Organelle System Functional! (+25 XP)
            </div>
            <p className="text-xs text-muted-foreground">{cfg.explanation}</p>
            {level < LEVELS.length && (
              <button
                onClick={() => {
                  setLevel((prev) => prev + 1);
                  setIsCompleted(false);
                }}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg inline-flex items-center gap-2"
              >
                Next Organelle Stage <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
