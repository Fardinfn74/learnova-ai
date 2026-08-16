import { useState } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Sparkles, CheckCircle2, Play, ArrowRight, RotateCcw } from "lucide-react";

export const physicaplaygroundMetadata: GameMetadata = {
  id: "physica",
  title: "Physica Playground 2D — Physics Cannon",
  category: "Physics",
  ageRange: "Grades 6–12 (Ages 11–18)",
  icon: "🎯",
  gradient: "bg-gradient-to-br from-emerald-500 to-green-700 text-white",
  bgGlow: "rgba(16, 185, 129, 0.2)",
  description: "Adjust projectile launch angle, speed, and gravity to hit target energy stars across physics obstacles!",
  totalLevels: 6,
  tags: ["Physics", "Projectiles", "Gravity", "Trajectory"],
};

interface LevelConfig {
  targetX: number;
  targetY: number;
  gravity: number;
  hint: string;
  explanation: string;
}

const LEVELS: LevelConfig[] = [
  {
    targetX: 300,
    targetY: 150,
    gravity: 9.8,
    hint: "Launch at 45° angle with velocity ~35 to hit the target star!",
    explanation: "Maximum horizontal range on flat ground occurs at launch angle $\\theta = 45^\\circ$.",
  },
  {
    targetX: 380,
    targetY: 100,
    gravity: 9.8,
    hint: "Increase launch velocity to 45 to reach the distant target!",
    explanation: "Horizontal displacement $x = v_x \\cdot t = v \\cos\\theta \\cdot t$.",
  },
  {
    targetX: 250,
    targetY: 60,
    gravity: 9.8,
    hint: "High parabolic lob! Use 65° angle to clear the high target!",
    explanation: "Steeper angles increase vertical peak height $h = \\frac{v^2 \\sin^2\\theta}{2g}$.",
  },
  {
    targetX: 320,
    targetY: 120,
    gravity: 3.7, // Mars low gravity
    hint: "Mars low gravity (3.7 m/s²) makes the cannonball float further!",
    explanation: "Lower gravitational acceleration increases air hang-time $t_{flight} = \\frac{2v\\sin\\theta}{g}$.",
  },
  {
    targetX: 340,
    targetY: 80,
    gravity: 24.8, // Jupiter high gravity
    hint: "Jupiter super gravity pulls down fast! Use high speed velocity ~60!",
    explanation: "High gravity rapidly accelerates projectiles downward.",
  },
  {
    targetX: 420,
    targetY: 140,
    gravity: 9.8,
    hint: "Master target shot! Set angle ~40° and velocity ~50!",
    explanation: "Kinematic equations accurately predict exact projectile landing coordinates.",
  },
];

export function PhysicaPlaygroundGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);

  const cfg = LEVELS[level - 1];

  const [angle, setAngle] = useState<number>(45);
  const [velocity, setVelocity] = useState<number>(35);
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 40, y: 180 });
  const [isFiring, setIsFiring] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const fireCannon = () => {
    if (isFiring) return;

    setIsFiring(true);
    gameAudio.playJump();

    let t = 0;
    const rad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);

    const interval = setInterval(() => {
      t += 0.15;
      const x = 40 + vx * t;
      const y = 180 - (vy * t - 0.5 * cfg.gravity * t * t);

      setBallPos({ x, y });

      // Check target collision (hit star)
      const dist = Math.hypot(x - cfg.targetX, y - cfg.targetY);
      if (dist < 25 && !isCompleted) {
        clearInterval(interval);
        setIsFiring(false);
        setIsCompleted(true);
        setGameXp((prev) => prev + 25);
        gameAudio.playSuccess();
        gameAudio.playFanfare();
        triggerConfetti();
        return;
      }

      // Check ground collision or out of bounds
      if (y > 200 || x > 480) {
        clearInterval(interval);
        setIsFiring(false);
        gameAudio.playError();
      }
    }, 30);
  };

  const resetLevel = () => {
    setBallPos({ x: 40, y: 180 });
    setIsFiring(false);
    setIsCompleted(false);
  };

  return (
    <GameShell
      metadata={physicaplaygroundMetadata}
      currentLevel={level}
      totalLevels={LEVELS.length}
      gameXp={gameXp}
      hintText={cfg.hint}
      explanationText={cfg.explanation}
      onLevelChange={(lvl) => {
        setLevel(lvl);
        setIsCompleted(false);
        setBallPos({ x: 40, y: 180 });
      }}
      onRestartLevel={resetLevel}
      onClose={onClose}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
        {/* Header */}
        <div className="text-center space-y-1 bg-card/80 border border-emerald-500/30 rounded-2xl p-4 w-full shadow-lg">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> Gravity: {cfg.gravity} m/s²
          </div>
          <p className="text-sm font-semibold text-foreground/90">
            Aim the physics cannon to hit the glowing target star!
          </p>
        </div>

        {/* 2D Physics Viewport */}
        <div className="relative w-full h-[250px] bg-slate-950 rounded-3xl border-2 border-emerald-500/30 overflow-hidden shadow-2xl flex items-center justify-center p-6">
          <svg className="w-full h-full" viewBox="0 0 500 220">
            {/* Ground */}
            <rect x="0" y="195" width="500" height="25" fill="#15803d" />

            {/* Target Star */}
            <g transform={`translate(${cfg.targetX}, ${cfg.targetY})`}>
              <circle cx="0" cy="0" r="18" fill="#f59e0b" className="animate-ping opacity-40" />
              <text x="0" y="6" textAnchor="middle" fontSize="20">
                ⭐
              </text>
            </g>

            {/* Cannon Base */}
            <g transform="translate(40, 180)">
              <rect x="-15" y="-10" width="30" height="20" fill="#475569" rx="4" />
              <line
                x1="0"
                y1="0"
                x2={25 * Math.cos((angle * Math.PI) / 180)}
                y2={-25 * Math.sin((angle * Math.PI) / 180)}
                stroke="#10b981"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </g>

            {/* Cannonball */}
            <circle cx={ballPos.x} cy={ballPos.y} r="8" fill="#f43f5e" />
          </svg>
        </div>

        {/* Cannon Controls */}
        <div className="w-full bg-card/80 border border-border/50 rounded-2xl p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground flex justify-between">
                <span>Angle:</span>
                <span className="text-emerald-400 font-extrabold">{angle}°</span>
              </label>
              <input
                type="range"
                min="10"
                max="85"
                value={angle}
                disabled={isFiring}
                onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground flex justify-between">
                <span>Velocity:</span>
                <span className="text-emerald-400 font-extrabold">{velocity} m/s</span>
              </label>
              <input
                type="range"
                min="15"
                max="65"
                value={velocity}
                disabled={isFiring}
                onChange={(e) => setVelocity(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              disabled={isFiring}
              onClick={fireCannon}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" /> Fire Cannon
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
          <div className="w-full bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Bullseye Target Hit! (+25 XP)
            </div>
            <p className="text-xs text-muted-foreground">{cfg.explanation}</p>
            {level < LEVELS.length && (
              <button
                onClick={() => {
                  setLevel((prev) => prev + 1);
                  setIsCompleted(false);
                  setBallPos({ x: 40, y: 180 });
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg inline-flex items-center gap-2"
              >
                Next Physics Target <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
