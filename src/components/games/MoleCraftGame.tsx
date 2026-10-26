import { useState, useEffect } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export const molecraftMetadata: GameMetadata = {
  id: "molecraft",
  title: "MoleCraft 2D — Chemistry Bonding Lab",
  category: "Chemistry",
  ageRange: "Grades 6–12 (Ages 11–18)",
  icon: "🧪",
  gradient: "bg-gradient-to-br from-emerald-500 to-teal-700 text-white",
  bgGlow: "rgba(16, 185, 129, 0.2)",
  description: "Drag and bond atoms by valence electrons to synthesize chemical molecules like Water, Methane, and Salt!",
  totalLevels: 6,
  tags: ["Chemistry", "Molecules", "Valence", "Atoms"],
};

interface AtomType {
  symbol: string;
  name: string;
  color: string;
  valency: number;
}

const ATOM_DEFS: Record<string, AtomType> = {
  H: { symbol: "H", name: "Hydrogen", color: "#3b82f6", valency: 1 },
  O: { symbol: "O", name: "Oxygen", color: "#ef4444", valency: 2 },
  C: { symbol: "C", name: "Carbon", color: "#10b981", valency: 4 },
  N: { symbol: "N", name: "Nitrogen", color: "#8b5cf6", valency: 3 },
  Na: { symbol: "Na", name: "Sodium", color: "#f59e0b", valency: 1 },
  Cl: { symbol: "Cl", name: "Chlorine", color: "#06b6d4", valency: 1 },
};

interface LevelConfig {
  targetFormula: string;
  targetName: string;
  description: string;
  requiredAtoms: { symbol: string; count: number }[];
  hint: string;
  explanation: string;
}

const LEVELS: LevelConfig[] = [
  {
    targetFormula: "H2",
    targetName: "Hydrogen Gas",
    description: "Connect 2 Hydrogen atoms to form a covalent single bond (H-H).",
    requiredAtoms: [{ symbol: "H", count: 2 }],
    hint: "Click two Hydrogen (H) atoms to bond them together!",
    explanation: "Each Hydrogen atom shares 1 electron, forming a stable single covalent bond (H₂).",
  },
  {
    targetFormula: "H2O",
    targetName: "Water",
    description: "Oxygen has 2 valence slots. Connect 1 Oxygen atom to 2 Hydrogen atoms.",
    requiredAtoms: [
      { symbol: "O", count: 1 },
      { symbol: "H", count: 2 },
    ],
    hint: "Connect both Hydrogen atoms to the central Oxygen atom.",
    explanation: "Oxygen needs 2 bonds to fill its outer electron shell, forming life-sustaining Water (H₂O)!",
  },
  {
    targetFormula: "CO2",
    targetName: "Carbon Dioxide",
    description: "Carbon has 4 valence slots. Connect 1 Carbon atom to 2 Oxygen atoms.",
    requiredAtoms: [
      { symbol: "C", count: 1 },
      { symbol: "O", count: 2 },
    ],
    hint: "Carbon sits in the middle and forms double bonds with both Oxygen atoms.",
    explanation: "Carbon forms 2 double bonds with 2 Oxygen atoms, creating Carbon Dioxide (CO₂).",
  },
  {
    targetFormula: "NH3",
    targetName: "Ammonia",
    description: "Nitrogen has 3 valence slots. Connect 1 Nitrogen atom to 3 Hydrogen atoms.",
    requiredAtoms: [
      { symbol: "N", count: 1 },
      { symbol: "H", count: 3 },
    ],
    hint: "Attach 3 Hydrogen atoms around the single Nitrogen atom.",
    explanation: "Nitrogen shares electrons with 3 Hydrogen atoms to form Ammonia (NH₃), essential for plant fertilizers!",
  },
  {
    targetFormula: "CH4",
    targetName: "Methane",
    description: "Carbon has 4 valence slots. Connect 1 Carbon atom to 4 Hydrogen atoms.",
    requiredAtoms: [
      { symbol: "C", count: 1 },
      { symbol: "H", count: 4 },
    ],
    hint: "Attach 4 Hydrogens on all 4 sides of the central Carbon atom.",
    explanation: "Methane (CH₄) is a tetrahedral hydrocarbon and primary component of natural gas fuel.",
  },
  {
    targetFormula: "NaCl",
    targetName: "Table Salt (Sodium Chloride)",
    description: "Form an ionic bond between 1 Sodium (Na) and 1 Chlorine (Cl) atom.",
    requiredAtoms: [
      { symbol: "Na", count: 1 },
      { symbol: "Cl", count: 1 },
    ],
    hint: "Sodium donates 1 electron to Chlorine, creating an ionic bond (NaCl).",
    explanation: "Sodium loses an electron to become Na⁺ and Chlorine gains it to become Cl⁻, forming crystal Table Salt!",
  },
];

export function MoleCraftGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);
  const [selectedAtoms, setSelectedAtoms] = useState<string[]>([]);
  const [bonds, setBonds] = useState<[number, number][]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const cfg = LEVELS[level - 1];

  // Initialize pool of atoms for current level
  const [atomPool, setAtomPool] = useState<
    { id: number; symbol: string; x: number; y: number; bondedCount: number }[]
  >([]);

  useEffect(() => {
    resetLevel();
  }, [level]);

  const resetLevel = () => {
    const pool: { id: number; symbol: string; x: number; y: number; bondedCount: number }[] = [];
    let idCounter = 0;

    cfg.requiredAtoms.forEach((req) => {
      for (let i = 0; i < req.count; i++) {
        pool.push({
          id: idCounter++,
          symbol: req.symbol,
          x: 100 + (idCounter * 120) % 500,
          y: 120 + Math.floor(idCounter / 4) * 100,
          bondedCount: 0,
        });
      }
    });

    setAtomPool(pool);
    setBonds([]);
    setSelectedAtoms([]);
    setIsCompleted(false);
  };

  const handleAtomClick = (atomId: number) => {
    if (isCompleted) return;

    gameAudio.playPop();

    if (selectedAtoms.includes(atomId.toString())) {
      setSelectedAtoms([]);
      return;
    }

    if (selectedAtoms.length === 0) {
      setSelectedAtoms([atomId.toString()]);
    } else {
      const atom1Id = parseInt(selectedAtoms[0], 10);
      const atom2Id = atomId;

      if (atom1Id === atom2Id) {
        setSelectedAtoms([]);
        return;
      }

      // Check if bond already exists
      const exists = bonds.some(
        ([a, b]) => (a === atom1Id && b === atom2Id) || (a === atom2Id && b === atom1Id)
      );

      if (!exists) {
        const newBonds: [number, number][] = [...bonds, [atom1Id, atom2Id]];
        setBonds(newBonds);
        setSelectedAtoms([]);

        // Update bonded counts
        setAtomPool((prev) =>
          prev.map((a) => {
            if (a.id === atom1Id || a.id === atom2Id) {
              return { ...a, bondedCount: a.bondedCount + 1 };
            }
            return a;
          })
        );

        checkSolution(newBonds);
      } else {
        setSelectedAtoms([]);
      }
    }
  };

  const checkSolution = (currentBonds: [number, number][]) => {
    // Total required bonds = total bonds needed for formula
    let requiredBondsCount = 0;
    if (cfg.targetFormula === "H2") requiredBondsCount = 1;
    if (cfg.targetFormula === "H2O") requiredBondsCount = 2;
    if (cfg.targetFormula === "CO2") requiredBondsCount = 2; // representation
    if (cfg.targetFormula === "NH3") requiredBondsCount = 3;
    if (cfg.targetFormula === "CH4") requiredBondsCount = 4;
    if (cfg.targetFormula === "NaCl") requiredBondsCount = 1;

    if (currentBonds.length >= requiredBondsCount) {
      setIsCompleted(true);
      setGameXp((prev) => prev + 25);
      gameAudio.playSuccess();
      gameAudio.playFanfare();
      triggerConfetti();
    }
  };

  return (
    <GameShell
      metadata={molecraftMetadata}
      currentLevel={level}
      totalLevels={LEVELS.length}
      gameXp={gameXp}
      hintText={cfg.hint}
      explanationText={cfg.explanation}
      onLevelChange={(lvl) => setLevel(lvl)}
      onRestartLevel={resetLevel}
      onClose={onClose}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
        {/* Molecule Target Header */}
        <div className="text-center space-y-1 bg-card/80 border border-emerald-500/30 rounded-2xl p-4 w-full shadow-lg">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> Target Formula: {cfg.targetFormula} ({cfg.targetName})
          </div>
          <p className="text-sm font-semibold text-foreground/90">{cfg.description}</p>
        </div>

        {/* Interactive Atom Canvas Workbench */}
        <div className="relative w-full h-[280px] bg-slate-950/80 rounded-3xl border-2 border-emerald-500/30 overflow-hidden shadow-inner flex items-center justify-center p-6">
          {/* Render Bond Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {bonds.map(([aId, bId], idx) => {
              const atomA = atomPool.find((a) => a.id === aId);
              const atomB = atomPool.find((a) => a.id === bId);
              if (!atomA || !atomB) return null;

              return (
                <line
                  key={idx}
                  x1={atomA.x}
                  y1={atomA.y}
                  x2={atomB.x}
                  y2={atomB.y}
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              );
            })}
          </svg>

          {/* Render Atoms */}
          {atomPool.map((atom) => {
            const def = ATOM_DEFS[atom.symbol];
            const isSelected = selectedAtoms.includes(atom.id.toString());

            return (
              <button
                key={atom.id}
                onClick={() => handleAtomClick(atom.id)}
                className={`absolute h-18 w-18 rounded-full font-black text-white text-xl flex flex-col items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 ${
                  isSelected ? "ring-4 ring-amber-400 scale-110 animate-bounce" : ""
                }`}
                style={{
                  left: `${atom.x - 36}px`,
                  top: `${atom.y - 36}px`,
                  backgroundColor: def.color,
                  boxShadow: `0 0 20px ${def.color}88`,
                }}
              >
                <span>{atom.symbol}</span>
                <span className="text-[10px] font-normal opacity-90">Val: {def.valency}</span>
              </button>
            );
          })}
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="w-full bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-emerald-500 font-extrabold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Molecule Synthesized: {cfg.targetFormula}! (+25 XP)
            </div>
            <p className="text-xs text-muted-foreground">{cfg.explanation}</p>
            {level < LEVELS.length && (
              <button
                onClick={() => setLevel((prev) => prev + 1)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg inline-flex items-center gap-2"
              >
                Next Molecule <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
