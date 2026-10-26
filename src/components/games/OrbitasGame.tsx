import { useState, useEffect, useRef } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Sparkles, CheckCircle2, Play, ArrowRight, RotateCcw } from "lucide-react";

export const orbitasMetadata: GameMetadata = {
  id: "orbitas",
  title: "Orbitas 2D — Space & Gravity Simulator",
  category: "Astronomy",
  ageRange: "Grades 6–12 (Ages 11–18)",
  icon: "🪐",
  gradient: "bg-gradient-to-br from-blue-500 to-indigo-900 text-white",
  bgGlow: "rgba(59, 130, 246, 0.2)",
  description: "Adjust launch speed and angle to orbit satellites around planets without crashing or flying off into deep space!",
  totalLevels: 6,
  tags: ["Space", "Gravity", "Orbit", "Physics"],
};

interface LevelConfig {
  planetName: string;
  planetRadius: number;
  targetOrbitMin: number;
  targetOrbitMax: number;
  gravityStrength: number;
  description: string;
  hint: string;
  explanation: string;
}

const LEVELS: LevelConfig[] = [
  {
    planetName: "Earth",
    planetRadius: 40,
    targetOrbitMin: 90,
    targetOrbitMax: 130,
    gravityStrength: 1500,
    description: "Launch the satellite into a stable Circular Orbit within the green target ring (Radius 90–130px).",
    hint: "Try launch speed between 4.5 and 5.5 at a 90° angle!",
    explanation: "Circular orbital velocity occurs when gravitational pull equals centripetal force ($v = \\sqrt{GM/r}$).",
  },
  {
    planetName: "Mars (Low Gravity)",
    planetRadius: 32,
    targetOrbitMin: 70,
    targetOrbitMax: 110,
    gravityStrength: 900,
    description: "Mars has lower mass/gravity. Achieve a low Martian orbit in the target ring.",
    hint: "Lower mass means you need less orbital speed (around 3.5 - 4.2).",
    explanation: "Mars gravity is ~38% of Earth, requiring lower velocity to stay in orbit.",
  },
  {
    planetName: "Jupiter (Super Gravity)",
    planetRadius: 60,
    targetOrbitMin: 120,
    targetOrbitMax: 170,
    gravityStrength: 3200,
    description: "Jupiter's massive gravity pulls hard! Launch with higher speed to prevent crashing into the gas giant.",
    hint: "You need high launch speed (7.0 - 8.5) to balance Jupiter's powerful gravitational pull!",
    explanation: "Jupiter is 318x more massive than Earth, creating an immense gravitational field.",
  },
  {
    planetName: "Elliptical Transfer Orbit",
    planetRadius: 40,
    targetOrbitMin: 140,
    targetOrbitMax: 180,
    gravityStrength: 1500,
    description: "Reach an outer elliptical apogee inside the high orbit ring without escaping.",
    hint: "Launch with speed ~6.2 to stretch the orbit into a high ellipse!",
    explanation: "Elliptical orbits have varying distance; speed is highest at perigee and lowest at apogee.",
  },
  {
    planetName: "Geostationary Ring",
    planetRadius: 40,
    targetOrbitMin: 150,
    targetOrbitMax: 190,
    gravityStrength: 1600,
    description: "Place a weather satellite into the distant Geostationary Target Zone.",
    hint: "Aim for launch speed ~6.5 at 90° tangential angle.",
    explanation: "Geostationary satellites match Earth's rotation speed to remain fixed over one spot.",
  },
  {
    planetName: "Deep Space Escape Velocity",
    planetRadius: 45,
    targetOrbitMin: 180,
    targetOrbitMax: 220,
    gravityStrength: 1800,
    description: "Achieve Escape Velocity to break free from the gravity well and cross the deep space target line!",
    hint: "Set speed > 8.0 to break free from orbital lock!",
    explanation: "Escape velocity ($v_e = \\sqrt{2GM/r}$) gives kinetic energy exceeding gravitational potential energy.",
  },
];

export function OrbitasGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);

  // Flight simulation controls
  const [launchSpeed, setLaunchSpeed] = useState<number>(5);
  const [launchAngle, setLaunchAngle] = useState<number>(90); // degrees
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [satPos, setSatPos] = useState<{ x: number; y: number }>({ x: 0, y: -80 });
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [statusText, setStatusText] = useState<string>("Ready to launch!");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const cfg = LEVELS[level - 1];

  const resetSim = () => {
    setIsSimulating(false);
    setSatPos({ x: 0, y: -cfg.planetRadius - 30 });
    setTrail([]);
    setStatusText("Adjust controls and press Launch Satellite!");
    setIsCompleted(false);
  };

  useEffect(() => {
    resetSim();
  }, [level]);

  // Orbit Physics Loop
  useEffect(() => {
    if (!isSimulating) return;

    // Initial position relative to planet center (0,0)
    let px = satPos.x;
    let py = satPos.y;

    const rad = (launchAngle * Math.PI) / 180;
    let vx = Math.cos(rad) * launchSpeed;
    let vy = Math.sin(rad) * launchSpeed;

    const newTrail: { x: number; y: number }[] = [{ x: px, y: py }];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const distSq = px * px + py * py;
      const dist = Math.sqrt(distSq);

      // Check crash into planet
      if (dist <= cfg.planetRadius + 4) {
        clearInterval(interval);
        setIsSimulating(false);
        setStatusText("💥 Crash! The satellite collided with the planet surface.");
        gameAudio.playError();
        return;
      }

      // Check deep space lost
      if (dist > 250) {
        if (cfg.planetName.includes("Escape")) {
          // Escape level victory!
          clearInterval(interval);
          setIsSimulating(false);
          setStatusText("🌌 Escape Velocity achieved! Satellite traveling to deep space!");
          setIsCompleted(true);
          setGameXp((prev) => prev + 25);
          gameAudio.playSuccess();
          gameAudio.playFanfare();
          triggerConfetti();
          return;
        } else {
          clearInterval(interval);
          setIsSimulating(false);
          setStatusText("🚀 Lost in deep space! Launch speed was too high.");
          gameAudio.playError();
          return;
        }
      }

      // Gravity force
      const force = cfg.gravityStrength / distSq;
      const ax = -force * (px / dist);
      const ay = -force * (py / dist);

      vx += ax * 0.15;
      vy += ay * 0.15;

      px += vx * 0.15;
      py += vy * 0.15;

      newTrail.push({ x: px, y: py });
      if (newTrail.length > 120) newTrail.shift();

      setSatPos({ x: px, y: py });
      setTrail([...newTrail]);

      // Check target orbit ring after sufficient steps
      if (step > 60) {
        if (dist >= cfg.targetOrbitMin && dist <= cfg.targetOrbitMax && !isCompleted) {
          clearInterval(interval);
          setIsSimulating(false);
          setIsCompleted(true);
          setStatusText("🎉 Stable Orbit Achieved! Target Ring Lock!");
          setGameXp((prev) => prev + 25);
          gameAudio.playSuccess();
          gameAudio.playFanfare();
          triggerConfetti();
        }
      }

      if (step > 300) {
        clearInterval(interval);
        setIsSimulating(false);
        setStatusText("Completed orbital track.");
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <GameShell
      metadata={orbitasMetadata}
      currentLevel={level}
      totalLevels={LEVELS.length}
      gameXp={gameXp}
      hintText={cfg.hint}
      explanationText={cfg.explanation}
      onLevelChange={(lvl) => setLevel(lvl)}
      onRestartLevel={resetSim}
      onClose={onClose}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
        {/* Header */}
        <div className="text-center space-y-1 bg-card/80 border border-blue-500/30 rounded-2xl p-4 w-full shadow-lg">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> Target: {cfg.planetName} Orbit
          </div>
          <p className="text-sm font-semibold text-foreground/90">{cfg.description}</p>
        </div>

        {/* 2D Space Canvas Viewport */}
        <div className="relative w-full h-[270px] bg-slate-950 rounded-3xl border-2 border-blue-500/30 overflow-hidden shadow-2xl flex items-center justify-center">
          {/* Starfield background */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />

          <svg className="w-full h-full overflow-visible" viewBox="-180 -140 360 280">
            {/* Target Orbit Ring */}
            <circle
              cx="0"
              cy="0"
              r={(cfg.targetOrbitMin + cfg.targetOrbitMax) / 2}
              fill="none"
              stroke="#10b981"
              strokeWidth={cfg.targetOrbitMax - cfg.targetOrbitMin}
              opacity="0.25"
              strokeDasharray="6 6"
            />

            {/* Orbit Trail */}
            {trail.map((p, idx) => (
              <circle key={idx} cx={p.x} cy={p.y} r="2.5" fill="#60a5fa" opacity={(idx + 1) / trail.length} />
            ))}

            {/* Central Planet */}
            <circle cx="0" cy="0" r={cfg.planetRadius} fill="#3b82f6" className="animate-pulse" />
            <circle cx="0" cy="0" r={cfg.planetRadius + 6} fill="none" stroke="#60a5fa" opacity="0.4" />

            {/* Satellite */}
            <g transform={`translate(${satPos.x}, ${satPos.y})`}>
              <rect x="-6" y="-6" width="12" height="12" fill="#f59e0b" rx="2" />
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#06b6d4" strokeWidth="2" />
            </g>
          </svg>

          {/* Status Overlay */}
          <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/30 text-xs font-bold text-foreground shadow-md">
            {statusText}
          </div>
        </div>

        {/* Launch Controls */}
        <div className="w-full bg-card/80 border border-border/50 rounded-2xl p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground flex justify-between">
                <span>Launch Speed:</span>
                <span className="text-blue-400 font-extrabold">{launchSpeed} km/s</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.2"
                disabled={isSimulating}
                value={launchSpeed}
                onChange={(e) => setLaunchSpeed(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground flex justify-between">
                <span>Angle:</span>
                <span className="text-blue-400 font-extrabold">{launchAngle}°</span>
              </label>
              <input
                type="range"
                min="0"
                max="180"
                disabled={isSimulating}
                value={launchAngle}
                onChange={(e) => setLaunchAngle(parseInt(e.target.value, 10))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              disabled={isSimulating}
              onClick={() => {
                gameAudio.playJump();
                setIsSimulating(true);
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" /> Launch Satellite
            </button>
            <button
              onClick={resetSim}
              className="p-3 bg-muted rounded-xl hover:bg-muted/80 text-foreground font-bold transition"
              title="Reset Satellite"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="w-full bg-blue-500/20 border border-blue-500/50 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-blue-400 font-extrabold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Mission Accomplished! (+25 XP)
            </div>
            <p className="text-xs text-muted-foreground">{cfg.explanation}</p>
            {level < LEVELS.length && (
              <button
                onClick={() => setLevel((prev) => prev + 1)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg inline-flex items-center gap-2"
              >
                Next Mission <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
