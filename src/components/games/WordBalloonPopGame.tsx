import { useState, useEffect } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Sparkles, CheckCircle2 } from "lucide-react";

export const balloonpopMetadata: GameMetadata = {
  id: "balloonpop",
  title: "Word Balloon Pop 2D — Spelling Arcade",
  category: "Kids Arcade",
  ageRange: "Ages 5–15",
  icon: "🎈",
  gradient: "bg-gradient-to-br from-pink-500 to-purple-600 text-white",
  bgGlow: "rgba(236, 72, 153, 0.2)",
  description: "Pop floating letter balloons in the correct order to spell target science and vocabulary words!",
  totalLevels: 6,
  tags: ["Spelling", "Vocabulary", "Balloons", "Kids"],
  isKidsSpecial: true,
};

const WORDS_BY_LEVEL = [
  "NOVA",
  "ATOM",
  "PLANET",
  "ENERGY",
  "GALAXY",
  "SCIENCE",
];

export function WordBalloonPopGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);

  const targetWord = WORDS_BY_LEVEL[level - 1];
  const [currentLetterIdx, setCurrentLetterIdx] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Floating balloons pool with scrambled letters
  const [balloons, setBalloons] = useState<
    { id: number; letter: string; color: string; left: number }[]
  >([]);

  useEffect(() => {
    resetLevel();
  }, [level]);

  const resetLevel = () => {
    const letters = targetWord.split("");
    // Add extra random noise letters
    const noise = ["A", "E", "I", "O", "U", "S", "T", "R"];
    const allLetters = [...letters, ...noise.slice(0, 3)].sort(() => Math.random() - 0.5);

    const colors = ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

    setBalloons(
      allLetters.map((l, idx) => ({
        id: idx,
        letter: l,
        color: colors[idx % colors.length],
        left: 10 + idx * 12,
      }))
    );
    setCurrentLetterIdx(0);
    setIsCompleted(false);
  };

  const handlePop = (id: number, letter: string) => {
    if (letter === targetWord[currentLetterIdx]) {
      gameAudio.playPop();
      setBalloons(balloons.filter((b) => b.id !== id));
      const nextIdx = currentLetterIdx + 1;
      setCurrentLetterIdx(nextIdx);

      if (nextIdx >= targetWord.length && !isCompleted) {
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

  return (
    <GameShell
      metadata={balloonpopMetadata}
      currentLevel={level}
      totalLevels={6}
      gameXp={gameXp}
      hintText={`Pop the balloon with letter '${targetWord[currentLetterIdx]}'!`}
      explanationText="Spelling recognition strengthens vocabulary literacy!"
      onLevelChange={(lvl) => {
        setLevel(lvl);
        setIsCompleted(false);
      }}
      onRestartLevel={resetLevel}
      onClose={onClose}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
        {/* Word Display Header */}
        <div className="text-center space-y-1 bg-card/80 border border-pink-500/30 rounded-2xl p-4 w-full shadow-lg">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> Target Word: {targetWord}
          </div>
          <div className="text-3xl font-black tracking-widest text-foreground py-1">
            {targetWord.split("").map((char, i) => (
              <span
                key={i}
                className={i < currentLetterIdx ? "text-pink-400 font-extrabold" : "opacity-30"}
              >
                {char}{" "}
              </span>
            ))}
          </div>
        </div>

        {/* 2D Floating Balloons Area */}
        <div className="relative w-full h-[250px] bg-slate-950 rounded-3xl border-2 border-pink-500/30 overflow-hidden shadow-2xl flex items-center justify-center p-6">
          {balloons.map((b) => (
            <button
              key={b.id}
              onClick={() => handlePop(b.id, b.letter)}
              style={{
                left: `${b.left}%`,
                backgroundColor: b.color,
                boxShadow: `0 0 15px ${b.color}aa`,
              }}
              className="absolute bottom-6 h-16 w-14 rounded-full font-black text-white text-2xl flex items-center justify-center animate-bounce hover:scale-125 transition"
            >
              {b.letter}
            </button>
          ))}
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="w-full bg-pink-500/20 border border-pink-500/50 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-pink-400 font-extrabold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Word Spelled: {targetWord}! (+25 XP)
            </div>
            {level < 6 && (
              <button
                onClick={() => {
                  setLevel((prev) => prev + 1);
                  setIsCompleted(false);
                }}
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg"
              >
                Next Word Challenge
              </button>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
