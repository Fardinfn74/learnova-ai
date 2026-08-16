import { useState, useEffect } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Sparkles, CheckCircle2, Play, RefreshCw } from "lucide-react";

export const dinodashMetadata: GameMetadata = {
  id: "dinodash",
  title: "Dino Math Dash 2D — Prehistoric Arcade Runner",
  category: "Kids Arcade",
  ageRange: "Ages 5–15",
  icon: "🦖",
  gradient: "bg-gradient-to-br from-lime-500 to-emerald-700 text-white",
  bgGlow: "rgba(132, 204, 22, 0.2)",
  description: "Help the cute dinosaur jump over boulders by solving fast mental math questions before impact!",
  totalLevels: 6,
  tags: ["Arcade", "Kids", "Dinosaur", "Speed Math"],
  isKidsSpecial: true,
};

interface Question {
  num1: number;
  num2: number;
  op: "+" | "-" | "×";
  answer: number;
  options: number[];
}

export function DinoMathDashGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);

  const [score, setScore] = useState<number>(0);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [currentQ, setCurrentQ] = useState<Question>({
    num1: 2,
    num2: 3,
    op: "+",
    answer: 5,
    options: [5, 4, 6],
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    generateNewQuestion();
  }, [level]);

  const generateNewQuestion = () => {
    const maxVal = level * 4 + 4;
    const n1 = Math.floor(Math.random() * maxVal) + 1;
    const n2 = Math.floor(Math.random() * maxVal) + 1;
    const ops: ("+" | "-" | "×")[] = level > 2 ? ["+", "-", "×"] : ["+", "-"];
    const chosenOp = ops[Math.floor(Math.random() * ops.length)];

    let ans = n1 + n2;
    if (chosenOp === "-") ans = Math.max(0, n1 - n2);
    if (chosenOp === "×") ans = n1 * n2;

    const opts = [ans, ans + 2, Math.max(1, ans - 2)].sort(() => Math.random() - 0.5);

    setCurrentQ({
      num1: chosenOp === "-" ? Math.max(n1, n2) : n1,
      num2: chosenOp === "-" ? Math.min(n1, n2) : n2,
      op: chosenOp,
      answer: ans,
      options: opts,
    });
  };

  const handleOptionClick = (opt: number) => {
    if (opt === currentQ.answer) {
      gameAudio.playJump();
      setIsJumping(true);
      setScore((prev) => prev + 10);
      setGameXp((prev) => prev + 10);

      setTimeout(() => {
        setIsJumping(false);
        generateNewQuestion();
      }, 500);

      if (score + 10 >= level * 30 && !isCompleted) {
        setIsCompleted(true);
        gameAudio.playSuccess();
        gameAudio.playFanfare();
        triggerConfetti();
      }
    } else {
      gameAudio.playError();
    }
  };

  const resetLevel = () => {
    setScore(0);
    setIsCompleted(false);
    generateNewQuestion();
  };

  return (
    <GameShell
      metadata={dinodashMetadata}
      currentLevel={level}
      totalLevels={6}
      gameXp={gameXp}
      hintText="Click the correct math answer to make the Dino jump over obstacles!"
      explanationText="Mental math speed builds rapid calculation reflexes!"
      onLevelChange={(lvl) => {
        setLevel(lvl);
        setIsCompleted(false);
        setScore(0);
      }}
      onRestartLevel={resetLevel}
      onClose={onClose}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
        {/* Arcade Track Canvas */}
        <div className="relative w-full h-[220px] bg-gradient-to-b from-sky-900 to-amber-950 rounded-3xl border-2 border-lime-500/30 overflow-hidden shadow-2xl flex items-center justify-center p-6">
          {/* Ground */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-amber-900 border-t-4 border-lime-500" />

          {/* Dino Mascot */}
          <div
            className={`absolute left-16 bottom-12 text-5xl transition-all duration-300 ${
              isJumping ? "-translate-y-20 scale-125" : ""
            }`}
          >
            🦖
          </div>

          {/* Obstacle Boulder */}
          <div className="absolute right-20 bottom-12 text-4xl animate-bounce">🪨</div>

          {/* Score HUD */}
          <div className="absolute top-3 right-3 bg-card/90 px-3 py-1 rounded-xl font-bold text-xs text-lime-400">
            Dino Score: {score} pts
          </div>
        </div>

        {/* Question & Answer Options */}
        <div className="w-full bg-card/80 border border-border/50 rounded-2xl p-4 text-center space-y-4">
          <div className="text-3xl font-extrabold text-lime-400">
            {currentQ.num1} {currentQ.op} {currentQ.num2} = ?
          </div>

          <div className="grid grid-cols-3 gap-3">
            {currentQ.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleOptionClick(opt)}
                className="bg-lime-500 hover:bg-lime-600 text-white font-extrabold text-xl py-3 rounded-2xl shadow-lg transition hover:scale-105"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="w-full bg-lime-500/20 border border-lime-500/50 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-lime-400 font-extrabold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Dino Dash Level Complete! (+25 XP)
            </div>
            {level < 6 && (
              <button
                onClick={() => {
                  setLevel((prev) => prev + 1);
                  setIsCompleted(false);
                  setScore(0);
                }}
                className="bg-lime-500 hover:bg-lime-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg"
              >
                Next Dino Level
              </button>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
