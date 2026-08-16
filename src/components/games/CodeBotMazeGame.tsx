import { useState } from "react";
import { GameShell } from "./GameShell";
import { GameMetadata } from "./types";
import { triggerConfetti } from "./confetti";
import { gameAudio } from "./game-audio";
import { Sparkles, CheckCircle2, Play, RotateCcw, ArrowRight, Bot, ChevronRight } from "lucide-react";

export const codebotMetadata: GameMetadata = {
  id: "codebot",
  title: "CodeBot Maze 2D — Program the Robot",
  category: "Coding & Logic",
  ageRange: "Grades 3–10 (Ages 8–16)",
  icon: "🤖",
  gradient: "bg-gradient-to-br from-indigo-500 to-purple-700 text-white",
  bgGlow: "rgba(99, 102, 241, 0.2)",
  description: "Program a cute robot with drag-and-drop code blocks (Move Forward, Turn Left, Turn Right, Loop) to reach the battery cell!",
  totalLevels: 6,
  tags: ["Coding", "Logic", "Algorithms", "Robot"],
};

type CodeBlock = "MOVE" | "TURN_LEFT" | "TURN_RIGHT" | "REPEAT_2";

interface LevelConfig {
  gridSize: number;
  start: { x: number; y: number };
  target: { x: number; y: number };
  obstacles: { x: number; y: number }[];
  hint: string;
  explanation: string;
}

const LEVELS: LevelConfig[] = [
  {
    gridSize: 5,
    start: { x: 0, y: 2 },
    target: { x: 4, y: 2 },
    obstacles: [],
    hint: "Add 4 'Move Forward' blocks to reach the energy target!",
    explanation: "Sequential logic executes instructions step-by-step from top to bottom.",
  },
  {
    gridSize: 5,
    start: { x: 0, y: 0 },
    target: { x: 2, y: 2 },
    obstacles: [{ x: 1, y: 0 }],
    hint: "Move down, turn right, move forward to bypass the barrier!",
    explanation: "Conditional routing uses turns to navigate around obstacle barriers.",
  },
  {
    gridSize: 5,
    start: { x: 0, y: 0 },
    target: { x: 4, y: 4 },
    obstacles: [
      { x: 1, y: 1 },
      { x: 3, y: 3 },
    ],
    hint: "Use Move and Turn sequence to zigzag through the maze!",
    explanation: "Algorithms break complex spatial navigation into structured sub-steps.",
  },
  {
    gridSize: 5,
    start: { x: 0, y: 4 },
    target: { x: 4, y: 0 },
    obstacles: [
      { x: 2, y: 2 },
      { x: 1, y: 3 },
    ],
    hint: "Navigate along the top perimeter around central obstacle blocks!",
    explanation: "Perimeter pathfinding evaluates open grid paths to avoid impassable blocks.",
  },
  {
    gridSize: 6,
    start: { x: 0, y: 0 },
    target: { x: 5, y: 5 },
    obstacles: [
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
    ],
    hint: "Loop blocks repeat commands efficiently to save code lines!",
    explanation: "Iterative Loops optimize repetitive code execution.",
  },
  {
    gridSize: 6,
    start: { x: 0, y: 5 },
    target: { x: 5, y: 0 },
    obstacles: [
      { x: 1, y: 1 },
      { x: 3, y: 3 },
      { x: 4, y: 1 },
    ],
    hint: "Combine Turns and Repeats to solve the master robot maze!",
    explanation: "Master programmer certification achieved! Clean code logic unlocks the goal.",
  },
];

export function CodeBotMazeGame({ onClose }: { onClose: () => void }) {
  const [level, setLevel] = useState<number>(1);
  const [gameXp, setGameXp] = useState<number>(0);

  const cfg = LEVELS[level - 1];

  const [program, setProgram] = useState<CodeBlock[]>([]);
  const [botPos, setBotPos] = useState<{ x: number; y: number; dir: number }>(
    { x: cfg.start.x, y: cfg.start.y, dir: 0 } // dir: 0=East, 1=South, 2=West, 3=North
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const addBlock = (block: CodeBlock) => {
    if (program.length < 12) {
      setProgram([...program, block]);
      gameAudio.playPop();
    }
  };

  const removeBlock = (index: number) => {
    setProgram(program.filter((_, i) => i !== index));
    gameAudio.playPop();
  };

  const runProgram = () => {
    if (program.length === 0 || isRunning) return;

    setIsRunning(true);
    let curX = cfg.start.x;
    let curY = cfg.start.y;
    let curDir = 0; // East

    const steps: { x: number; y: number; dir: number }[] = [];

    program.forEach((cmd) => {
      if (cmd === "MOVE") {
        if (curDir === 0) curX = Math.min(cfg.gridSize - 1, curX + 1);
        if (curDir === 1) curY = Math.min(cfg.gridSize - 1, curY + 1);
        if (curDir === 2) curX = Math.max(0, curX - 1);
        if (curDir === 3) curY = Math.max(0, curY - 1);
        steps.push({ x: curX, y: curY, dir: curDir });
      } else if (cmd === "TURN_LEFT") {
        curDir = (curDir + 3) % 4;
        steps.push({ x: curX, y: curY, dir: curDir });
      } else if (cmd === "TURN_RIGHT") {
        curDir = (curDir + 1) % 4;
        steps.push({ x: curX, y: curY, dir: curDir });
      } else if (cmd === "REPEAT_2") {
        for (let r = 0; r < 2; r++) {
          if (curDir === 0) curX = Math.min(cfg.gridSize - 1, curX + 1);
          if (curDir === 1) curY = Math.min(cfg.gridSize - 1, curY + 1);
          if (curDir === 2) curX = Math.max(0, curX - 1);
          if (curDir === 3) curY = Math.max(0, curY - 1);
          steps.push({ x: curX, y: curY, dir: curDir });
        }
      }
    });

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        const s = steps[stepIdx];
        setBotPos(s);
        gameAudio.playJump();

        // Check if reached target
        if (s.x === cfg.target.x && s.y === cfg.target.y && !isCompleted) {
          clearInterval(interval);
          setIsRunning(false);
          setIsCompleted(true);
          setGameXp((prev) => prev + 25);
          gameAudio.playSuccess();
          gameAudio.playFanfare();
          triggerConfetti();
          return;
        }
        stepIdx++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
        if (curX !== cfg.target.x || curY !== cfg.target.y) {
          gameAudio.playError();
        }
      }
    }, 400);
  };

  const resetBot = () => {
    setBotPos({ x: cfg.start.x, y: cfg.start.y, dir: 0 });
    setProgram([]);
    setIsRunning(false);
    setIsCompleted(false);
  };

  return (
    <GameShell
      metadata={codebotMetadata}
      currentLevel={level}
      totalLevels={LEVELS.length}
      gameXp={gameXp}
      hintText={cfg.hint}
      explanationText={cfg.explanation}
      onLevelChange={(lvl) => {
        setLevel(lvl);
        setIsCompleted(false);
        setProgram([]);
        setBotPos({ x: LEVELS[lvl - 1].start.x, y: LEVELS[lvl - 1].start.y, dir: 0 });
      }}
      onRestartLevel={resetBot}
      onClose={onClose}
    >
      <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4">
        {/* Header */}
        <div className="text-center space-y-1 bg-card/80 border border-indigo-500/30 rounded-2xl p-4 w-full shadow-lg">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3.5 w-3.5" /> Code Mission Level {level}
          </div>
          <p className="text-sm font-semibold text-foreground/90">{cfg.explanation}</p>
        </div>

        {/* 2D Grid Maze Viewport */}
        <div className="relative w-full h-[250px] bg-slate-950 rounded-3xl border-2 border-indigo-500/30 overflow-hidden shadow-2xl flex items-center justify-center p-4">
          <div
            className="grid gap-1 bg-slate-900 p-2 rounded-2xl border border-indigo-500/20"
            style={{
              gridTemplateColumns: `repeat(${cfg.gridSize}, minmax(0, 1fr))`,
              width: "220px",
              height: "220px",
            }}
          >
            {Array.from({ length: cfg.gridSize * cfg.gridSize }).map((_, idx) => {
              const x = idx % cfg.gridSize;
              const y = Math.floor(idx / cfg.gridSize);

              const isBot = botPos.x === x && botPos.y === x && botPos.y === y;
              const isTarget = cfg.target.x === x && cfg.target.y === y;
              const isObstacle = cfg.obstacles.some((o) => o.x === x && o.y === y);

              return (
                <div
                  key={idx}
                  className={`rounded-lg flex items-center justify-center font-bold text-xs relative ${
                    isObstacle
                      ? "bg-red-500/30 border border-red-500/50 text-red-400"
                      : isTarget
                      ? "bg-amber-500/30 border border-amber-500 text-amber-400 animate-pulse"
                      : "bg-slate-800/80 border border-slate-700/50 text-slate-500"
                  }`}
                >
                  {isObstacle && "🧱"}
                  {isTarget && "🔋"}
                  {botPos.x === x && botPos.y === y && (
                    <div className="text-xl animate-bounce">🤖</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Code Builder Panel */}
        <div className="w-full bg-card/80 border border-border/50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Command Blocks Pool:</span>
            <span className="text-xs font-bold text-indigo-400">{program.length}/12 blocks</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addBlock("MOVE")}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-sm"
            >
              + Move Forward ⬆️
            </button>
            <button
              onClick={() => addBlock("TURN_LEFT")}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-sm"
            >
              + Turn Left ↩️
            </button>
            <button
              onClick={() => addBlock("TURN_RIGHT")}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-sm"
            >
              + Turn Right ↪️
            </button>
            <button
              onClick={() => addBlock("REPEAT_2")}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-sm"
            >
              + Loop 2x 🔁
            </button>
          </div>

          {/* Program Queue */}
          <div className="bg-slate-900/90 rounded-xl p-2.5 min-h-[50px] border border-border/40 flex flex-wrap gap-1.5 items-center">
            {program.length === 0 ? (
              <span className="text-xs text-muted-foreground italic px-2">Click blocks above to build program sequence...</span>
            ) : (
              program.map((b, i) => (
                <button
                  key={i}
                  onClick={() => removeBlock(i)}
                  className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-red-500/20 hover:border-red-500 hover:text-red-300 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <span>{i + 1}. {b}</span>
                </button>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <button
              disabled={isRunning || program.length === 0}
              onClick={runProgram}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" /> Execute Code Sequence
            </button>
            <button
              onClick={resetBot}
              className="p-2.5 bg-muted rounded-xl hover:bg-muted/80 text-foreground font-bold text-xs"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="w-full bg-indigo-500/20 border border-indigo-500/50 rounded-2xl p-4 text-center space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2 text-indigo-400 font-extrabold text-lg">
              <CheckCircle2 className="h-6 w-6" /> Code Executed Successfully! (+25 XP)
            </div>
            <p className="text-xs text-muted-foreground">{cfg.explanation}</p>
            {level < LEVELS.length && (
              <button
                onClick={() => {
                  setLevel((prev) => prev + 1);
                  setIsCompleted(false);
                  setProgram([]);
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-lg inline-flex items-center gap-2"
              >
                Next Code Maze <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
