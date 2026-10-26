import { useState } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Sparkles, CheckCircle2, Zap, ArrowRight, Power } from "lucide-react";

export const circuitcraftMetadata: GameMetadata = {
  id: "circuitcraft",
  title: "CircuitCraft 2D — Electronics & Breadboard Lab",
  category: "Electronics",
  ageRange: "Grades 6–12 (Ages 11–18)",
  icon: "⚡",
  gradient: "bg-gradient-to-br from-amber-500 to-yellow-600 text-white",
  bgGlow: "rgba(245, 158, 11, 0.2)",
  description: "Connect batteries, switches, resistors, and logic gates on an interactive breadboard to light up LEDs!",
  totalLevels: 6,
  tags: ["Electronics", "Circuits", "Logic Gates", "Ohm's Law"],
};

interface LevelConfig {
  title: string;
  description: string;
  hasSwitch1: boolean;
  hasSwitch2: boolean;
  gateType?: "AND" | "OR" | "NOT" | "NONE";
  resistorNeeded?: boolean;
  hint: string;
  explanation: string;
}

const LEVELS: LevelConfig[] = [
  {
    title: "Simple Closed Loop",
    description: "Close Switch 1 to complete the electrical circuit and illuminate the LED!",
    hasSwitch1: true,
    hasSwitch2: false,
    gateType: "NONE",
    hint: "Click Switch 1 to turn it ON!",
    explanation: "Current flows from the positive battery terminal (+), through the closed switch, lighting the LED, back to (-).",
  },
  {
    title: "Series Circuit (Two Switches)",
    description: "In a Series circuit, BOTH Switch 1 AND Switch 2 must be turned ON for current to flow.",
    hasSwitch1: true,
    hasSwitch2: true,
    gateType: "AND",
    hint: "Turn ON both Switch 1 and Switch 2!",
    explanation: "Components in series share the exact same current path. Intercepting either breaks the loop.",
  },
  {
    title: "Parallel Circuit (Either Switch)",
    description: "In a Parallel circuit with an OR gate, turning ON EITHER Switch 1 OR Switch 2 lights the lamp.",
    hasSwitch1: true,
    hasSwitch2: true,
    gateType: "OR",
    hint: "Flip either Switch 1 or Switch 2 to ON!",
    explanation: "Parallel branches provide multiple independent pathways for electric current.",
  },
  {
    title: "Ohm's Law Current Limiter",
    description: "Prevent LED overload! Adjust the resistor to exactly 220 Ω so current $I = V/R = 9V/220\\Omega \\approx 40\\text{mA}$.",
    hasSwitch1: true,
    hasSwitch2: false,
    gateType: "NONE",
    resistorNeeded: true,
    hint: "Set the resistor slider to 220 Ω and flip the switch ON!",
    explanation: "Ohm's Law ($V = IR$) dictates that resistors reduce current to protect delicate electronic components.",
  },
  {
    title: "Inverter Logic Gate (NOT)",
    description: "A NOT gate reverses the signal! Turning Switch 1 OFF turns the LED ON.",
    hasSwitch1: true,
    hasSwitch2: false,
    gateType: "NOT",
    hint: "Turn Switch 1 OFF to trigger the NOT inverter gate!",
    explanation: "A NOT logic gate outputs HIGH (1) when its input is LOW (0).",
  },
  {
    title: "Smart Streetlamp Circuit",
    description: "Combine logic gates so the LED automatically activates when power is ON and sunlight sensor is OFF.",
    hasSwitch1: true,
    hasSwitch2: true,
    gateType: "AND",
    hint: "Turn Main Power ON (Switch 1) and Sunlight OFF (Switch 2) to activate the night streetlamp!",
    explanation: "Smart automation uses logic combinations ($A \\text{ AND } \\text{NOT } B$) to power devices conditionally.",
  },
];

export function CircuitCraftGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);

  // Circuit States
  const [switch1, setSwitch1] = useState<boolean>(false);
  const [switch2, setSwitch2] = useState<boolean>(false);
  const [resistorValue, setResistorValue] = useState<number>(100);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const cfg = LEVELS[level - 1];

  // Determine LED status
  const calculateLedOn = (): boolean => {
    if (cfg.resistorNeeded && resistorValue !== 220) return false;

    if (cfg.gateType === "AND") {
      if (level === 6) return switch1 && !switch2; // level 6 special night light
      return switch1 && switch2;
    }
    if (cfg.gateType === "OR") return switch1 || switch2;
    if (cfg.gateType === "NOT") return !switch1;

    return switch1;
  };

  const isLedOn = calculateLedOn();

  const handleToggleSwitch1 = () => {
    const next = !switch1;
    setSwitch1(next);
    gameAudio.playPop();
    checkVictory(next, switch2, resistorValue);
  };

  const handleToggleSwitch2 = () => {
    const next = !switch2;
    setSwitch2(next);
    gameAudio.playPop();
    checkVictory(switch1, next, resistorValue);
  };

  const checkVictory = (s1: boolean, s2: boolean, rVal: number) => {
    let win = false;
    if (level === 1) win = s1;
    if (level === 2) win = s1 && s2;
    if (level === 3) win = s1 || s2;
    if (level === 4) win = s1 && rVal === 220;
    if (level === 5) win = !s1;
    if (level === 6) win = s1 && !s2;

    if (win && !isCompleted) {
      setIsCompleted(true);
      setGameXp((prev) => prev + 25);
      gameAudio.playSuccess();
      gameAudio.playFanfare();
      triggerConfetti();
    }
  };

  const resetLevel = () => {
    setSwitch1(false);
    setSwitch2(false);
    setResistorValue(100);
    setIsCompleted(false);
  };

  return (
    <GameShell
      metadata={circuitcraftMetadata}
      currentLevel={level}
      totalLevels={LEVELS.length}
      gameXp={gameXp}
      hintText={cfg.hint}
      explanationText={cfg.explanation}
      onLevelChange={(lvl) => {
        setLevel(lvl);
        setIsCompleted(false);
        setSwitch1(false);
        setSwitch2(false);
      }}
      onRestartLevel={resetLevel}
      onClose={onClose}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
        {/* Header */}
        <div className="text-center space-y-1 bg-card/80 border border-amber-500/30 rounded-2xl p-4 w-full shadow-lg">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
            <Zap className="h-3.5 w-3.5" /> Circuit Challenge: {cfg.title}
          </div>
          <p className="text-sm font-semibold text-foreground/90">{cfg.description}</p>
        </div>

        {/* 2D Breadboard Canvas */}
        <div className="relative w-full h-[250px] bg-slate-950 rounded-3xl border-2 border-amber-500/30 overflow-hidden shadow-2xl flex items-center justify-center p-6">
          <svg className="w-full h-full" viewBox="0 0 500 220">
            {/* Wires */}
            <path
              d="M 60 110 L 140 110 L 140 60 L 260 60 L 260 110 L 380 110 L 420 110"
              fill="none"
              stroke={isLedOn ? "#f59e0b" : "#475569"}
              strokeWidth="6"
              strokeLinecap="round"
              className={isLedOn ? "animate-pulse" : ""}
            />

            {/* Battery 9V */}
            <g transform="translate(30, 80)">
              <rect x="0" y="0" width="40" height="60" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" rx="4" />
              <text x="20" y="35" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="bold">
                9V
              </text>
            </g>

            {/* Switch 1 */}
            {cfg.hasSwitch1 && (
              <g transform="translate(150, 40)">
                <circle cx="0" cy="20" r="6" fill="#f59e0b" />
                <circle cx="40" cy="20" r="6" fill="#f59e0b" />
                <line
                  x1="0"
                  y1="20"
                  x2={switch1 ? "40" : "30"}
                  y2={switch1 ? "20" : "0"}
                  stroke="#ef4444"
                  strokeWidth="5"
                />
                <text x="20" y="45" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">
                  SW1 ({switch1 ? "ON" : "OFF"})
                </text>
              </g>
            )}

            {/* Switch 2 */}
            {cfg.hasSwitch2 && (
              <g transform="translate(280, 40)">
                <circle cx="0" cy="20" r="6" fill="#f59e0b" />
                <circle cx="40" cy="20" r="6" fill="#f59e0b" />
                <line
                  x1="0"
                  y1="20"
                  x2={switch2 ? "40" : "30"}
                  y2={switch2 ? "20" : "0"}
                  stroke="#3b82f6"
                  strokeWidth="5"
                />
                <text x="20" y="45" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">
                  {level === 6 ? "Sunlight" : "SW2"} ({switch2 ? "ON" : "OFF"})
                </text>
              </g>
            )}

            {/* Resistor Component */}
            {cfg.resistorNeeded && (
              <g transform="translate(280, 95)">
                <rect x="0" y="0" width="50" height="30" fill="#d97706" rx="4" />
                <text x="25" y="20" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                  {resistorValue}Ω
                </text>
              </g>
            )}

            {/* Output LED */}
            <g transform="translate(430, 85)">
              <circle
                cx="20"
                cy="25"
                r="22"
                fill={isLedOn ? "#f59e0b" : "#334155"}
                stroke="#f59e0b"
                strokeWidth="3"
                className={isLedOn ? "animate-ping opacity-30" : ""}
              />
              <circle
                cx="20"
                cy="25"
                r="18"
                fill={isLedOn ? "#facc15" : "#1e293b"}
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <text x="20" y="30" textAnchor="middle" fill={isLedOn ? "#000000" : "#94a3b8"} fontSize="12" fontWeight="black">
                LED
              </text>
            </g>
          </svg>
        </div>

        {/* Interactive Circuit Controls */}
        <div className="w-full bg-card/80 border border-border/50 rounded-2xl p-4 space-y-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {cfg.hasSwitch1 && (
              <button
                onClick={handleToggleSwitch1}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                  switch1 ? "bg-emerald-500 text-white shadow-lg" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Power className="h-4 w-4" /> Toggle Switch 1 ({switch1 ? "ON" : "OFF"})
              </button>
            )}

            {cfg.hasSwitch2 && (
              <button
                onClick={handleToggleSwitch2}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                  switch2 ? "bg-emerald-500 text-white shadow-lg" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Power className="h-4 w-4" /> Toggle {level === 6 ? "Sunlight Sensor" : "Switch 2"} ({switch2 ? "ON" : "OFF"})
              </button>
            )}
          </div>

          {cfg.resistorNeeded && (
            <div className="space-y-1 pt-2">
              <label className="text-xs font-bold text-muted-foreground flex justify-between">
                <span>Protecting Resistor:</span>
                <span className="text-amber-500 font-extrabold">{resistorValue} Ω</span>
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={resistorValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setResistorValue(val);
                  checkVictory(switch1, switch2, val);
                }}
                className="w-full accent-amber-500"
              />
            </div>
          )}
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="w-full bg-amber-500/20 border border-amber-500/50 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-amber-500 font-extrabold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Circuit Complete & Powered! (+25 XP)
            </div>
            <p className="text-xs text-muted-foreground">{cfg.explanation}</p>
            {level < LEVELS.length && (
              <button
                onClick={() => {
                  setLevel((prev) => prev + 1);
                  setIsCompleted(false);
                  setSwitch1(false);
                  setSwitch2(false);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg inline-flex items-center gap-2"
              >
                Next Circuit Challenge <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
