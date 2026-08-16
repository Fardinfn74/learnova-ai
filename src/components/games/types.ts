export type GameId =
  | "molecraft"
  | "geoforge"
  | "orbitas"
  | "circuitcraft"
  | "cellventure"
  | "algebalance"
  | "terrashift"
  | "codebot"
  | "physica"
  | "fractionisles"
  | "dinodash"
  | "balloonpop"
  | "brainbouncer";

export type SubjectCategory =
  | "Chemistry"
  | "Geometry"
  | "Astronomy"
  | "Electronics"
  | "Biology"
  | "Algebra"
  | "Earth Science"
  | "Coding & Logic"
  | "Physics"
  | "Math"
  | "Kids Arcade"
  | "Kids Puzzle";

export interface GameMetadata {
  id: GameId;
  title: string;
  category: SubjectCategory;
  ageRange: string;
  icon: string;
  gradient: string;
  bgGlow: string;
  description: string;
  totalLevels: number;
  tags: string[];
  isKidsSpecial?: boolean;
}

export interface NovaSpeech {
  text: string;
  type?: "hint" | "cheer" | "celebrate" | "info";
}
