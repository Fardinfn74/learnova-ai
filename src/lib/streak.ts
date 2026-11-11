// Streaks are counted in whole calendar days in Bangladesh time (Asia/Dhaka), not rolling 24h windows.
// (The old rule reset a streak for anyone who studied at 9am and then 10am the next day.)

export function dhakaDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Streak to DISPLAY: the stored value if the learner was active today or yesterday, otherwise 0. */
export function effectiveStreak(lastActiveDate: string | null | undefined, storedStreak: number, now: Date = new Date()): number {
  if (!lastActiveDate || storedStreak <= 0) return 0;
  const days = Math.round((Date.parse(dhakaDate(now)) - Date.parse(lastActiveDate.slice(0, 10))) / 86_400_000);
  return days <= 1 ? storedStreak : 0;
}
