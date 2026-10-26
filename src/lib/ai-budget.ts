/** Per-feature token budgets: caps output length & history size without removing features. */

export type AiBudgetKey =
  | "chat"
  | "voice"
  | "quiz"
  | "summary"
  | "podcast"
  | "draw"
  | "room"
  | "battle";

export type AiBudget = {
  /** Max tokens the model may generate (output). */
  maxOutputTokens: number;
  temperature?: number;
  /** Conversation history caps (chat/voice). */
  maxHistoryMessages?: number;
  fullRecentTurns?: number;
  olderMessageChars?: number;
};

export const AI_BUDGETS: Record<AiBudgetKey, AiBudget> = {
  // Full tutoring replies — 2048 tokens ≈ long step-by-step answer
  chat: {
    maxOutputTokens: 2048,
    temperature: 0.65,
    maxHistoryMessages: 12,
    fullRecentTurns: 4,
    olderMessageChars: 720,
  },
  voice: {
    maxOutputTokens: 220,
    temperature: 0.6,
    maxHistoryMessages: 8,
    fullRecentTurns: 4,
    olderMessageChars: 280,
  },
  quiz: { maxOutputTokens: 2800, temperature: 0.45 },
  summary: { maxOutputTokens: 2400, temperature: 0.45 },
  podcast: { maxOutputTokens: 3200, temperature: 0.55 },
  draw: { maxOutputTokens: 1536, temperature: 0.5 },
  room: { maxOutputTokens: 280, temperature: 0.55 },
  battle: { maxOutputTokens: 2400, temperature: 0.45 },
};

export function truncateMaterial(text: string, maxChars: number): string {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars) + "\n\n[… material truncated for length]";
}
