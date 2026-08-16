import { useState, useEffect, useRef } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Heart, Clock, Trophy, Zap, RefreshCw, AlertCircle, Play, CheckCircle2 } from "lucide-react";

export const dinodashMetadata: GameMetadata = {
  id: "dinodash",
  title: "Dino Math Dash 2D — Prehistoric Arcade Runner",
  category: "Kids Arcade",
  ageRange: "Ages 5–15",
  icon: "🦖",
  gradient: "bg-gradient-to-br from-lime-500 to-emerald-700 text-white",
  bgGlow: "rgba(132, 204, 22, 0.2)",
  description: "Run through prehistoric worlds, dodge cacti, rocks & pterodactyls by solving math problems before impact!",
  totalLevels: 100,
  tags: ["Arcade", "Kids", "Dinosaur", "Speed Math", "Infinite Runner"],
  isKidsSpecial: true,
};

interface Question {
  num1: number;
  num2: number;
  op: "+" | "-" | "×" | "÷";
  answer: number;
  options: number[];
}

type ObstacleType = "cactus" | "stone" | "pterodactyl";

interface Obstacle {
  type: ObstacleType;
  icon: string;
  name: string;
  isFlying: boolean;
}

const OBSTACLE_TYPES: Obstacle[] = [
  { type: "cactus", icon: "🌵", name: "Spiky Cactus", isFlying: false },
  { type: "stone", icon: "🪨", name: "Ancient Boulder", isFlying: false },
  { type: "pterodactyl", icon: "🦅", name: "Flying Pterodactyl", isFlying: true },
];

export function DinoMathDashGame({ onClose }: { onClose: () => void }) {
  // Game state
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [hearts, setHearts] = useState<number>(5);

  // Runner mechanics & animation state
  const [gameState, setGameState] = useState<"RUNNING" | "QUESTION" | "CRASH" | "GAME_OVER">("RUNNING");
  const [obstaclePos, setObstaclePos] = useState<number>(100); // percentage 100% (right) to 20% (near dino)
  const [currentObstacle, setCurrentObstacle] = useState<Obstacle>(OBSTACLE_TYPES[0]);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isCrashing, setIsCrashing] = useState<boolean>(false);
  const [dinoFrame, setDinoFrame] = useState<number>(0);

  // Math question state
  const [currentQ, setCurrentQ] = useState<Question>({
    num1: 3,
    num2: 4,
    op: "+",
    answer: 7,
    options: [7, 5, 8],
  });

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerMax, setTimerMax] = useState<number | null>(null);

  const animationRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate timer duration based on level (starts at level 20, 30s min 5s, -2s per 10 levels)
  const getTimerForLevel = (lvl: number): number | null => {
    if (lvl < 20) return null;
    const decreaseSteps = Math.floor((lvl - 20) / 10);
    const duration = 30 - decreaseSteps * 2;
    return Math.max(5, duration);
  };

  // Generate question according to level progression
  const generateQuestionForLevel = (lvl: number): Question => {
    let allowedOps: ("+" | "-" | "×" | "÷")[] = ["+", "-"];
    if (lvl >= 6 && lvl < 11) allowedOps = ["+", "-", "×"];
    if (lvl >= 11) allowedOps = ["+", "-", "×", "÷"];

    const chosenOp = allowedOps[Math.floor(Math.random() * allowedOps.length)];
    let n1 = 1;
    let n2 = 1;
    let ans = 0;

    const baseMax = Math.min(100, 10 + lvl * 3);

    if (chosenOp === "+") {
      n1 = Math.floor(Math.random() * baseMax) + 1;
      n2 = Math.floor(Math.random() * baseMax) + 1;
      ans = n1 + n2;
    } else if (chosenOp === "-") {
      const a = Math.floor(Math.random() * baseMax) + 2;
      const b = Math.floor(Math.random() * a) + 1;
      n1 = a;
      n2 = b;
      ans = n1 - n2;
    } else if (chosenOp === "×") {
      const multMax = Math.min(15, 3 + Math.floor(lvl / 3));
      n1 = Math.floor(Math.random() * multMax) + 2;
      n2 = Math.floor(Math.random() * multMax) + 2;
      ans = n1 * n2;
    } else {
      // Division with clean integer result
      const divMax = Math.min(12, 2 + Math.floor(lvl / 4));
      n2 = Math.floor(Math.random() * divMax) + 2;
      ans = Math.floor(Math.random() * divMax) + 1;
      n1 = n2 * ans;
    }

    // Generate unique options
    const distractors = new Set<number>();
    while (distractors.size < 2) {
      const offset = (Math.random() < 0.5 ? -1 : 1) * (Math.floor(Math.random() * 5) + 1);
      const d = ans + offset;
      if (d >= 0 && d !== ans) {
        distractors.add(d);
      }
    }

    const options = [ans, ...Array.from(distractors)].sort(() => Math.random() - 0.5);

    return { num1: n1, num2: n2, op: chosenOp, answer: ans, options };
  };

  // Dino legs animation effect
  useEffect(() => {
    const frameInterval = setInterval(() => {
      setDinoFrame((prev) => (prev + 1) % 2);
    }, 180);
    return () => clearInterval(frameInterval);
  }, []);

  // Main game loop: obstacle moving forward in RUNNING state
  useEffect(() => {
    if (gameState !== "RUNNING") return;

    let pos = 100;
    setObstaclePos(100);

    // Pick obstacle
    const randomObstacle = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    setCurrentObstacle(randomObstacle);

    const speed = Math.min(1.2, 0.45 + level * 0.02);

    const step = () => {
      pos -= speed;
      if (pos <= 22) {
        // Obstacle has reached the dino -> Trigger Math Question
        setObstaclePos(22);
        setGameState("QUESTION");

        const q = generateQuestionForLevel(level);
        setCurrentQ(q);

        const duration = getTimerForLevel(level);
        setTimeLeft(duration);
        setTimerMax(duration);
      } else {
        setObstaclePos(pos);
        animationRef.current = requestAnimationFrame(step);
      }
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState, level]);

  // Handle Countdown Timer during QUESTION state
  useEffect(() => {
    if (gameState !== "QUESTION" || timeLeft === null) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState, timeLeft]);

  // Keyboard shortcut listener for options 1, 2, 3
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "QUESTION") return;

      if (e.key === "1" || e.code === "Numpad1") {
        handleOptionSelect(currentQ.options[0]);
      } else if (e.key === "2" || e.code === "Numpad2") {
        handleOptionSelect(currentQ.options[1]);
      } else if (e.key === "3" || e.code === "Numpad3") {
        handleOptionSelect(currentQ.options[2]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, currentQ]);

  // Answer handler
  const handleOptionSelect = (selected: number) => {
    if (gameState !== "QUESTION") return;

    if (selected === currentQ.answer) {
      // Correct answer -> Dino jumps over obstacle & runs forward
      gameAudio.playJump();
      setIsJumping(true);

      const pts = 10 + Math.floor(level * 2);
      setScore((prev) => {
        const next = prev + pts;
        if (next > highScore) setHighScore(next);
        return next;
      });
      setGameXp((prev) => prev + 10);

      // Transition obstacle past dino
      setGameState("RUNNING");
      setLevel((prev) => prev + 1);

      if ((level + 1) % 10 === 0) {
        triggerConfetti();
        gameAudio.playFanfare();
      }

      setTimeout(() => {
        setIsJumping(false);
      }, 600);
    } else {
      // Incorrect answer -> Dino crashes with obstacle & loses heart
      handleCrash();
    }
  };

  // Timeout handler
  const handleTimeOut = () => {
    handleCrash();
  };

  // Crash & Hearts deduction
  const handleCrash = () => {
    gameAudio.playError();
    setIsCrashing(true);
    setGameState("CRASH");

    const newHearts = hearts - 1;
    setHearts(newHearts);

    setTimeout(() => {
      setIsCrashing(false);
      if (newHearts <= 0) {
        setGameState("GAME_OVER");
      } else {
        // Resume running with next obstacle
        setGameState("RUNNING");
      }
    }, 900);
  };

  // Full Restart Game
  const restartGame = () => {
    setLevel(1);
    setScore(0);
    setHearts(5);
    setGameXp(0);
    setIsJumping(false);
    setIsCrashing(false);
    setGameState("RUNNING");
  };

  return (
    <GameShell
      metadata={dinodashMetadata}
      currentLevel={level}
      totalLevels={Math.max(100, level + 10)}
      gameXp={gameXp}
      hintText="Press 1, 2, 3 on your keyboard or tap buttons to choose the right answer so Dino can jump!"
      explanationText="Speed math improves fast calculation, focus, and reflexes under pressure!"
      onLevelChange={(lvl) => {
        setLevel(lvl);
        setGameState("RUNNING");
      }}
      onRestartLevel={restartGame}
      onClose={onClose}
    >
      <div className="w-full max-w-3xl flex flex-col items-center gap-4 p-2 sm:p-4 select-none">
        {/* TOP STATUS HUD BAR */}
        <div className="w-full flex items-center justify-between gap-2 bg-card/90 border border-border/70 rounded-2xl p-3 shadow-md">
          {/* Hearts Display */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-muted-foreground hidden sm:inline mr-1">Lives:</span>
            {Array.from({ length: 5 }, (_, i) => (
              <Heart
                key={i}
                className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 ${
                  i < hearts
                    ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] scale-100"
                    : "text-muted-foreground/30 scale-90"
                }`}
              />
            ))}
          </div>

          {/* Level & Highscore */}
          <div className="flex items-center gap-3 text-xs sm:text-sm font-extrabold">
            <div className="bg-lime-500/10 border border-lime-500/30 text-lime-400 px-3 py-1 rounded-xl flex items-center gap-1.5">
              <Zap className="h-4 w-4 fill-lime-400" /> Level {level}
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-xl flex items-center gap-1.5">
              <Trophy className="h-4 w-4 fill-amber-400" /> {score} pts
            </div>
          </div>

          {/* Question Timer (active from Level 20) */}
          {timerMax !== null && timeLeft !== null && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-extrabold text-xs sm:text-sm transition-colors ${
                timeLeft <= 5
                  ? "bg-red-500/20 border border-red-500 text-red-400 animate-pulse"
                  : "bg-sky-500/10 border border-sky-500/30 text-sky-400"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* ARCADE TRACK RUNNER CANVAS */}
        <div
          className={`relative w-full h-[220px] sm:h-[260px] rounded-3xl border-2 overflow-hidden shadow-2xl flex flex-col justify-between transition-colors duration-300 ${
            isCrashing
              ? "border-red-500 bg-red-950/40 animate-shake"
              : "border-lime-500/30 bg-gradient-to-b from-sky-950 via-sky-900 to-amber-950"
          }`}
        >
          {/* Background Elements (Clouds & Sun) */}
          <div className="absolute top-4 left-10 text-2xl opacity-60 animate-pulse">☁️</div>
          <div className="absolute top-8 left-1/2 text-3xl opacity-40">☁️</div>
          <div className="absolute top-3 right-12 text-3xl text-amber-300 opacity-80">☀️</div>

          {/* Sky Pterodactyl decoration in background */}
          <div className="absolute top-10 left-[70%] text-xl opacity-30 animate-float">🦅</div>

          {/* Track Distance Indicator */}
          <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-lime-400 border border-lime-500/20">
            🏃 Prehistoric Dash Path
          </div>

          {/* Pause Notification Overlay when Math Problem stops Dino */}
          {gameState === "QUESTION" && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-500/90 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
              <AlertCircle className="h-3.5 w-3.5" /> OBSTACLE AHEAD! Solve to Jump!
            </div>
          )}

          {/* Ground Surface */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-amber-800 to-amber-950 border-t-4 border-lime-500 flex items-center justify-around overflow-hidden">
            {/* Ground detail bumps */}
            <div className="text-amber-900/40 text-xs font-mono select-none">
              •••••••• •••••••• •••••••• •••••••• •••••••• •••••••• ••••••••
            </div>
          </div>

          {/* DINO MASCOT RUNNER */}
          <div
            className={`absolute left-12 sm:left-16 transition-all duration-300 z-10 select-none ${
              currentObstacle.isFlying ? "bottom-12" : "bottom-12"
            } ${isJumping ? "-translate-y-24 scale-125 rotate-[-12deg]" : ""} ${
              isCrashing ? "scale-90 rotate-45 opacity-80" : ""
            }`}
          >
            <div className="relative">
              {/* Dino Emoji Sprite */}
              <span className="text-5xl sm:text-6xl inline-block drop-shadow-md">
                {isCrashing ? "💥" : "🦖"}
              </span>

              {/* Running feet indicator */}
              {!isJumping && !isCrashing && gameState === "RUNNING" && (
                <div className="absolute -bottom-1 left-2 text-xs font-black text-lime-400">
                  {dinoFrame === 0 ? "🦶 " : " 🦶"}
                </div>
              )}
            </div>
          </div>

          {/* APPROACHING OBSTACLE */}
          <div
            className={`absolute z-10 transition-all duration-100 select-none ${
              currentObstacle.isFlying ? "bottom-24" : "bottom-11"
            }`}
            style={{ left: `${obstaclePos}%` }}
          >
            <div className="relative flex flex-col items-center">
              <span className="text-4xl sm:text-5xl drop-shadow-lg">{currentObstacle.icon}</span>
              <span className="text-[10px] font-bold text-amber-200 bg-black/60 px-1.5 rounded mt-0.5 whitespace-nowrap">
                {currentObstacle.name}
              </span>
            </div>
          </div>
        </div>

        {/* MATH QUESTION & ANSWER PANEL */}
        {gameState === "QUESTION" && (
          <div className="w-full bg-card/90 border-2 border-lime-500/50 rounded-2xl p-4 text-center space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-xs font-bold text-lime-400 tracking-wider uppercase flex items-center justify-center gap-1.5">
              <span>Solve fast to jump safely!</span>
              {timeLeft !== null && (
                <span className="text-amber-400 font-mono">({timeLeft}s left)</span>
              )}
            </div>

            <div className="text-3xl sm:text-4xl font-black tracking-wider text-foreground py-1">
              {currentQ.num1} {currentQ.op} {currentQ.num2} = ?
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(opt)}
                  className="group relative bg-gradient-to-b from-lime-500 to-emerald-600 hover:from-lime-400 hover:to-emerald-500 text-white font-black text-xl sm:text-2xl py-3 sm:py-4 rounded-2xl shadow-lg hover:shadow-lime-500/30 transition transform hover:-translate-y-1 active:translate-y-0 flex flex-col items-center justify-center"
                >
                  <span className="absolute top-1.5 left-2 text-[10px] bg-black/30 text-lime-200 px-1.5 rounded font-mono">
                    [{idx + 1}]
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground font-medium">
              💡 Tip: Press <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono text-foreground">1</kbd>,{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono text-foreground">2</kbd>, or{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono text-foreground">3</kbd> on your keyboard!
            </p>
          </div>
        )}

        {/* GAME OVER MODAL OVERLAY */}
        {gameState === "GAME_OVER" && (
          <div className="w-full bg-card/95 border-2 border-red-500/60 rounded-2xl p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="text-4xl">🦖💥</div>
            <h3 className="text-2xl font-black text-red-500 tracking-tight">GAME OVER!</h3>
            <p className="text-sm text-muted-foreground">
              Dino ran out of hearts, but made great progress!
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto bg-muted/50 p-3 rounded-xl border border-border/50 text-xs font-extrabold">
              <div>
                <span className="text-muted-foreground block text-[10px]">HIGHEST LEVEL</span>
                <span className="text-lime-400 text-base">Level {level}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">FINAL SCORE</span>
                <span className="text-amber-400 text-base">{score} pts</span>
              </div>
            </div>

            <button
              onClick={restartGame}
              className="bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-400 hover:to-emerald-500 text-white font-extrabold px-6 py-3 rounded-xl text-base shadow-lg transition flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className="h-5 w-5" /> Play Again
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
