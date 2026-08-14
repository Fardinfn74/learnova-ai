import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Gamepad2, Timer, Trophy, Play, RefreshCw, CheckCircle2, XCircle, Sparkles, Zap, Award, Flame, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { awardXp } from "@/lib/learnova.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/app/games")({
  component: GamesPage,
});

export function GamesPage() {
  const award = useServerFn(awardXp);
  const [activeGame, setActiveGame] = useState<"math" | "word" | "abacus" | null>(null);

  // Math Sprint State
  const [mathScore, setMathScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [num1, setNum1] = useState<number>(5);
  const [num2, setNum2] = useState<number>(3);
  const [op, setOp] = useState<"+" | "-" | "×">("+");
  const [userAnswer, setUserAnswer] = useState<string>("");

  // Word Game State
  const [wordScore, setWordScore] = useState<number>(0);
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [wordInput, setWordInput] = useState<string>("");

  const words = [
    { scrambled: "A V O N", answer: "NOVA", hint: "Your friendly AI tutor" },
    { scrambled: "A C U S A B", answer: "ABACUS", hint: "Ancient soroban math tool" },
    { scrambled: "L A N G B A", answer: "BANGLA", hint: "Our mother tongue language 🇧🇩" },
    { scrambled: "C O D I N G", answer: "CODING", hint: "Creating software for computers" },
    { scrambled: "P Y T H O N", answer: "PYTHON", hint: "Popular programming language" },
  ];

  // Timer logic for Math Sprint
  useEffect(() => {
    let timer: any;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false);
      toast.success(`Game Over! Final Score: ${mathScore} pts 🎉`);
      if (mathScore > 0) {
        award({ data: { amount: Math.min(50, mathScore * 5), reason: "Completed Math Sprint Game" } }).catch(() => {});
      }
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, mathScore]);

  const generateMathQuestion = () => {
    const ops: ("+" | "-" | "×")[] = ["+", "-", "×"];
    const chosenOp = ops[Math.floor(Math.random() * ops.length)];
    let n1 = Math.floor(Math.random() * 12) + 1;
    let n2 = Math.floor(Math.random() * 12) + 1;
    if (chosenOp === "-" && n1 < n2) {
      const temp = n1;
      n1 = n2;
      n2 = temp;
    }
    setNum1(n1);
    setNum2(n2);
    setOp(chosenOp);
    setUserAnswer("");
  };

  const startMathGame = () => {
    setMathScore(0);
    setTimeLeft(30);
    setGameActive(true);
    generateMathQuestion();
  };

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameActive) return;

    let expected = 0;
    if (op === "+") expected = num1 + num2;
    if (op === "-") expected = num1 - num2;
    if (op === "×") expected = num1 * num2;

    if (parseInt(userAnswer.trim(), 10) === expected) {
      setMathScore((prev) => prev + 10);
      toast.success("+10 Pts!", { duration: 800 });
      generateMathQuestion();
    } else {
      toast.error("Try again!", { duration: 800 });
      setUserAnswer("");
    }
  };

  const handleWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const current = words[wordIndex];
    if (wordInput.trim().toUpperCase() === current.answer) {
      setWordScore((prev) => prev + 15);
      toast.success("Correct Word! +15 Pts! 🎉");
      setWordInput("");
      if (wordIndex + 1 < words.length) {
        setWordIndex((prev) => prev + 1);
      } else {
        toast.success("All words completed! Great job!");
        award({ data: { amount: 35, reason: "Completed Word Puzzle Game" } }).catch(() => {});
      }
    } else {
      toast.error("Incorrect spelling!");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-6 md:p-10 text-primary-foreground shadow-glow">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold">
            <Gamepad2 className="h-3.5 w-3.5" /> Interactive Learning Games
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Play, Compete & Learn Fast!
          </h1>
          <p className="text-primary-foreground/90 text-sm md:text-base leading-relaxed">
            Gamified speed math, spelling puzzles, and mental abacus challenges designed to make learning thrilling and natural.
          </p>
        </div>
      </div>

      {/* Game Selector Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Math Sprint */}
        <div className="glass rounded-3xl p-6 flex flex-col justify-between space-y-5 border border-border/50 hover:shadow-glow transition">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-500 grid place-items-center font-bold text-xl">
              ⚡
            </div>
            <h3 className="font-bold text-xl">Math Speed Sprint</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Solve arithmetic equations against the 30-second countdown clock. Boost mental math calculation speed.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveGame("math");
              startMathGame();
            }}
            className="w-full gradient-hero text-primary-foreground font-semibold py-3 rounded-2xl shadow-glow hover:scale-105 transition text-sm flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" /> Play Math Sprint
          </button>
        </div>

        {/* Word Puzzle */}
        <div className="glass rounded-3xl p-6 flex flex-col justify-between space-y-5 border border-border/50 hover:shadow-glow transition">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/20 text-purple-500 grid place-items-center font-bold text-xl">
              🔤
            </div>
            <h3 className="font-bold text-xl">Word & Spelling Scramble</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unscramble educational terms in Bangla and English. Perfect for vocabulary expansion!
            </p>
          </div>
          <button
            onClick={() => setActiveGame("word")}
            className="w-full gradient-hero text-primary-foreground font-semibold py-3 rounded-2xl shadow-glow hover:scale-105 transition text-sm flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" /> Play Word Scramble
          </button>
        </div>

        {/* Abacus Flash */}
        <div className="glass rounded-3xl p-6 flex flex-col justify-between space-y-5 border border-border/50 hover:shadow-glow transition">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-500 grid place-items-center font-bold text-xl">
              🧮
            </div>
            <h3 className="font-bold text-xl">Abacus Flash Speed</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Visualize mental abacus bead moves to solve multi-step mental arithmetic challenges!
            </p>
          </div>
          <button
            onClick={() => {
              setActiveGame("math");
              startMathGame();
            }}
            className="w-full gradient-hero text-primary-foreground font-semibold py-3 rounded-2xl shadow-glow hover:scale-105 transition text-sm flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" /> Play Abacus Challenge
          </button>
        </div>
      </div>

      {/* Interactive Math Sprint Modal */}
      {activeGame === "math" && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl grid place-items-center p-4">
          <div className="glass rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 border border-border shadow-2xl relative text-center">
            <div className="flex items-center justify-between text-sm font-bold text-muted-foreground border-b border-border/40 pb-4">
              <span className="flex items-center gap-1 text-amber-500">
                <Timer className="h-4 w-4 animate-pulse" /> {timeLeft}s Left
              </span>
              <span className="flex items-center gap-1 text-primary">
                <Trophy className="h-4 w-4" /> Score: {mathScore}
              </span>
            </div>

            {gameActive ? (
              <form onSubmit={handleMathSubmit} className="space-y-6">
                <div className="text-5xl font-extrabold tracking-tight gradient-text py-4">
                  {num1} {op} {num2} = ?
                </div>

                <input
                  type="number"
                  autoFocus
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Your answer"
                  className="w-full text-center text-3xl font-bold bg-card border-2 border-primary/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary/20"
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 gradient-hero text-primary-foreground font-bold py-3.5 rounded-2xl shadow-glow hover:scale-105 transition text-base"
                  >
                    Submit Answer 🚀
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Game Over!</h3>
                  <p className="text-lg text-primary font-bold">Final Score: {mathScore} Points</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={startMathGame}
                    className="flex-1 gradient-hero text-primary-foreground font-bold py-3.5 rounded-2xl shadow-glow hover:scale-105 transition text-sm flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" /> Play Again
                  </button>
                  <button
                    onClick={() => setActiveGame(null)}
                    className="px-6 py-3.5 glass rounded-2xl text-sm font-bold hover:bg-muted transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Word Scramble Modal */}
      {activeGame === "word" && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl grid place-items-center p-4">
          <div className="glass rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 border border-border shadow-2xl relative text-center">
            <div className="flex items-center justify-between text-sm font-bold text-muted-foreground border-b border-border/40 pb-4">
              <span>Word {wordIndex + 1} of {words.length}</span>
              <span className="flex items-center gap-1 text-primary">
                <Trophy className="h-4 w-4" /> Score: {wordScore}
              </span>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                Hint: {words[wordIndex].hint}
              </span>
              <div className="text-4xl font-extrabold tracking-widest gradient-text py-2">
                {words[wordIndex].scrambled}
              </div>

              <form onSubmit={handleWordSubmit} className="space-y-4">
                <input
                  type="text"
                  autoFocus
                  value={wordInput}
                  onChange={(e) => setWordInput(e.target.value)}
                  placeholder="Type unscrambled word"
                  className="w-full text-center text-xl font-bold uppercase bg-card border-2 border-primary/50 rounded-2xl p-3.5 outline-none focus:ring-4 focus:ring-primary/20"
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 gradient-hero text-primary-foreground font-bold py-3.5 rounded-2xl shadow-glow hover:scale-105 transition text-sm"
                  >
                    Submit Word ✨
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGame(null)}
                    className="px-6 py-3.5 glass rounded-2xl text-sm font-bold hover:bg-muted transition"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
