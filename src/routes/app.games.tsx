import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Gamepad2, Play, Sparkles, Trophy, Search, Filter, Flame, Star, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { GameId, GameMetadata, SubjectCategory } from "@/components/games/types";
import { MoleCraftGame, molecraftMetadata } from "@/components/games/MoleCraftGame";
import { GeoForgeGame, geoforgeMetadata } from "@/components/games/GeoForgeGame";
import { OrbitasGame, orbitasMetadata } from "@/components/games/OrbitasGame";
import { CircuitCraftGame, circuitcraftMetadata } from "@/components/games/CircuitCraftGame";
import { CellventureGame, cellventureMetadata } from "@/components/games/CellventureGame";
import { AlgeBalanceGame, algebalanceMetadata } from "@/components/games/AlgeBalanceGame";
import { TerraShiftGame, terrashiftMetadata } from "@/components/games/TerraShiftGame";
import { CodeBotMazeGame, codebotMetadata } from "@/components/games/CodeBotMazeGame";
import { PhysicaPlaygroundGame, physicaplaygroundMetadata } from "@/components/games/PhysicaPlaygroundGame";
import { FractionIslesGame, fractionislesMetadata } from "@/components/games/FractionIslesGame";
import { DinoMathDashGame, dinodashMetadata } from "@/components/games/DinoMathDashGame";
import { WordBalloonPopGame, balloonpopMetadata } from "@/components/games/WordBalloonPopGame";
import { BrainBouncerGame, brainbouncerMetadata } from "@/components/games/BrainBouncerGame";

export const Route = createFileRoute("/app/games")({
  component: GamesPage,
});

const ALL_GAMES: GameMetadata[] = [
  molecraftMetadata,
  geoforgeMetadata,
  orbitasMetadata,
  circuitcraftMetadata,
  cellventureMetadata,
  algebalanceMetadata,
  terrashiftMetadata,
  codebotMetadata,
  physicaplaygroundMetadata,
  fractionislesMetadata,
  dinodashMetadata,
  balloonpopMetadata,
  brainbouncerMetadata,
];

const CATEGORIES: (SubjectCategory | "All" | "Kids Specials")[] = [
  "All",
  "Chemistry",
  "Physics",
  "Geometry",
  "Biology",
  "Coding & Logic",
  "Math",
  "Kids Specials",
];

export function GamesPage() {
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredGames = ALL_GAMES.filter((game) => {
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedCategory === "All") return matchesSearch;
    if (selectedCategory === "Kids Specials") return matchesSearch && game.isKidsSpecial;
    return matchesSearch && game.category === selectedCategory;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-6 md:p-10 text-primary-foreground shadow-glow">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-semibold">
            <Gamepad2 className="h-4 w-4" /> 13 Interactive 2D Learning Games
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Learnova 2D Games Suite
          </h1>
          <p className="text-primary-foreground/90 text-sm md:text-base leading-relaxed">
            Hands-on 2D STEM labs, physics sandboxes, visual geometry, chemistry bonding, code runners, and addictive kids arcade games guided by Nova AI!
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card/60 backdrop-blur-md p-4 rounded-3xl border border-border/50">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition",
                selectedCategory === cat
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {cat === "Kids Specials" ? "🎮 Kids Specials" : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 13 games..."
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-2xl text-xs outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
      </div>

      {/* 13 Individual Game Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="glass rounded-3xl p-6 flex flex-col justify-between space-y-5 border border-border/50 hover:shadow-2xl transition group relative overflow-hidden"
          >
            {/* Top Accent Line */}
            <div className={cn("absolute top-0 inset-x-0 h-1.5", game.gradient)} />

            <div className="space-y-3.5 pt-2">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "h-12 w-12 rounded-2xl grid place-items-center text-2xl shadow-md transition group-hover:scale-110",
                    game.gradient
                  )}
                >
                  {game.icon}
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {game.totalLevels} Levels
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-foreground group-hover:text-amber-500 transition">
                  {game.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {game.category}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {game.ageRange}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {game.description}
              </p>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => setActiveGameId(game.id)}
              className="w-full gradient-hero text-primary-foreground font-extrabold py-3 rounded-2xl shadow-glow hover:scale-102 transition text-xs flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" /> Launch {game.title.split(" — ")[0]}
            </button>
          </div>
        ))}
      </div>

      {/* Active Game Launcher Overlay */}
      {activeGameId === "molecraft" && <MoleCraftGame onClose={() => setActiveGameId(null)} />}
      {activeGameId === "geoforge" && <GeoForgeGame onClose={() => setActiveGameId(null)} />}
      {activeGameId === "orbitas" && <OrbitasGame onClose={() => setActiveGameId(null)} />}
      {activeGameId === "circuitcraft" && <CircuitCraftGame onClose={() => setActiveGameId(null)} />}
      {activeGameId === "cellventure" && <CellventureGame onClose={() => setActiveGameId(null)} />}
      {activeGameId === "algebalance" && <AlgeBalanceGame onClose={() => setActiveGameId(null)} />}
      {activeGameId === "terrashift" && <TerraShiftGame onClose={() => setActiveGameId(null)} />}
      {activeGameId === "codebot" && <CodeBotMazeGame onClose={() => setActiveGameId(null)} />}
      {activeGameId === "physica" && <PhysicaPlaygroundGame onClose={() => setActiveGameId(null)} />}
      {activeGameId === "fractionisles" && <FractionIslesGame onClose={() => setActiveGameId(null)} />}
      {activeGameId === "dinodash" && <DinoMathDashGame onClose={() => setActiveGameId(null)} />}
      {activeGameId === "balloonpop" && <WordBalloonPopGame onClose={() => setActiveGameId(null)} />}
      {activeGameId === "brainbouncer" && <BrainBouncerGame onClose={() => setActiveGameId(null)} />}
    </div>
  );
}
