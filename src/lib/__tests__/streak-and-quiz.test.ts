import { describe, expect, it } from "vitest";
import { dhakaDate, effectiveStreak } from "../streak";
import { filterByAgreement, stripKeys, verifierPrompt } from "../quiz-verify";

describe("streaks (Asia/Dhaka calendar days)", () => {
  it("uses Dhaka time, not UTC (UTC 20:00 is already tomorrow in Dhaka)", () => {
    expect(dhakaDate(new Date("2026-11-05T20:00:00Z"))).toBe("2026-11-06");
    expect(dhakaDate(new Date("2026-11-05T17:59:00Z"))).toBe("2026-11-05");
  });
  it("keeps the streak if the learner was active yesterday (even if 25h ago)", () => {
    expect(effectiveStreak("2026-11-04", 5, new Date("2026-11-05T05:00:00Z"))).toBe(5);
  });
  it("keeps the streak if active today", () => {
    expect(effectiveStreak("2026-11-05", 3, new Date("2026-11-05T05:00:00Z"))).toBe(3);
  });
  it("drops to 0 after a missed day", () => {
    expect(effectiveStreak("2026-11-02", 9, new Date("2026-11-05T05:00:00Z"))).toBe(0);
  });
  it("handles missing data", () => {
    expect(effectiveStreak(null, 4)).toBe(0);
    expect(effectiveStreak("2026-11-05", 0, new Date("2026-11-05T05:00:00Z"))).toBe(0);
  });
});

const q = (c: number) => ({ question: "q", options: ["a", "b", "c", "d"], correct_index: c, explanation: "e" });

describe("quiz verification", () => {
  it("drops questions where the verifier disagrees with the key", () => {
    const r = filterByAgreement([q(0), q(1), q(2), q(3), q(0)], [
      { index: 0, choice: 0 }, { index: 1, choice: 1 }, { index: 2, choice: 0 }, { index: 3, choice: 3 }, { index: 4, choice: 0 },
    ]);
    expect(r.kept).toHaveLength(4);
    expect(r.dropped).toBe(1);
    expect(r.verified).toBe(true);
  });
  it("never shrinks a quiz below 3 questions", () => {
    const r = filterByAgreement([q(0), q(1), q(2)], [{ index: 0, choice: 3 }, { index: 1, choice: 3 }, { index: 2, choice: 3 }]);
    expect(r.kept).toHaveLength(3);
    expect(r.verified).toBe(false);
  });
  it("keeps questions the verifier did not answer", () => {
    expect(filterByAgreement([q(0), q(1), q(2), q(3)], [{ index: 0, choice: 0 }]).kept).toHaveLength(4);
  });
  it("treats an empty verifier response as unverified", () => {
    expect(filterByAgreement([q(0), q(1), q(2)], []).verified).toBe(false);
  });
  it("strips answer keys before sending to the browser", () => {
    const out = stripKeys([q(2)]);
    expect(JSON.stringify(out)).not.toMatch(/correct_index|explanation/);
  });
  it("the verifier prompt never contains the key", () => {
    expect(verifierPrompt([q(2)])).not.toMatch(/correct_index/);
  });
});
