import { describe, expect, it } from "vitest";
import { decide, frameResultsToResult, sampleTranscript, textClassificationToResult, type StageResult, type TextClassification } from "../video-moderation";

const text = (o: Partial<TextClassification> = {}): TextClassification => ({
  educational: true, educational_confidence: 0.97, matches_declared_subject: true,
  age_appropriate_for_declared_grade: true, flags: [], reason: "ok", ...o,
});
const ok = (stage: StageResult["stage"], confidence = 0.95): StageResult => ({ stage, verdict: "approve", confidence, flags: [], reason: "ok" });
const ctx = { creatorApprovedCount: 0, creatorStrikes: 0 };

describe("text classification -> verdict", () => {
  it("approves clearly educational, safe content", () => {
    expect(textClassificationToResult("metadata", text()).verdict).toBe("approve");
  });
  it.each(["sexual", "violence", "hate", "self_harm", "harassment", "dangerous_activity", "adult_themes", "contact_solicitation"] as const)(
    "rejects hard flag %s even if the video is 'educational'", (flag) => {
      expect(textClassificationToResult("transcript", text({ flags: [flag] })).verdict).toBe("reject");
    });
  it("rejects confidently non-educational content (vlog, meme, entertainment)", () => {
    expect(textClassificationToResult("metadata", text({ educational: false, educational_confidence: 0.92 })).verdict).toBe("reject");
  });
  it("sends borderline / soft-flag / mismatched content to a human", () => {
    expect(textClassificationToResult("metadata", text({ educational_confidence: 0.7 })).verdict).toBe("review");
    expect(textClassificationToResult("metadata", text({ flags: ["scam_or_ads"] })).verdict).toBe("review");
    expect(textClassificationToResult("metadata", text({ matches_declared_subject: false })).verdict).toBe("review");
    expect(textClassificationToResult("metadata", text({ age_appropriate_for_declared_grade: false })).verdict).toBe("review");
    expect(textClassificationToResult("metadata", text({ educational: false, educational_confidence: 0.5 })).verdict).toBe("review");
  });
});

describe("frame classification -> verdict", () => {
  const frame = (i: number, edu = true, flags: any[] = []) => ({ index: i, looks_educational: edu, flags });
  it("approves when frames are educational", () => {
    expect(frameResultsToResult([{ frames: [frame(0), frame(1), frame(2)], reason: "" }]).verdict).toBe("approve");
  });
  it("a single unsafe frame rejects the whole video", () => {
    expect(frameResultsToResult([{ frames: [frame(0), frame(1), frame(2, true, ["nudity"])], reason: "" }]).verdict).toBe("reject");
  });
  it("mostly non-educational visuals need a human", () => {
    expect(frameResultsToResult([{ frames: [frame(0, false), frame(1, false), frame(2)], reason: "" }]).verdict).toBe("review");
  });
  it("no frames analysed -> human", () => {
    expect(frameResultsToResult([]).verdict).toBe("review");
  });
  it("aggregates several batches", () => {
    const r = frameResultsToResult([{ frames: [frame(0)], reason: "" }, { frames: [frame(8, true, ["gore"])], reason: "" }]);
    expect(r.verdict).toBe("reject");
  });
});

describe("decide (default-deny)", () => {
  const all = [ok("metadata"), ok("transcript"), ok("frames")];
  it("even a perfect video waits for a human by default", () => {
    expect(decide(all, ctx).status).toBe("needs_review");
  });
  it("any rejection wins over everything", () => {
    const r = decide([ok("metadata"), { stage: "frames", verdict: "reject", confidence: 1, flags: ["gore"], reason: "gore" }, ok("transcript")], ctx);
    expect(r.status).toBe("rejected");
    expect(r.reason).toContain("gore");
  });
  it("a missing stage fails SAFE (human review), never published", () => {
    expect(decide([ok("metadata"), ok("frames")], { ...ctx, requireHuman: false, creatorApprovedCount: 99 }).status).toBe("needs_review");
  });
  it("low confidence -> human, even when the verdict was 'approve'", () => {
    expect(decide([ok("metadata"), ok("transcript", 0.6), ok("frames")], { ...ctx, requireHuman: false, creatorApprovedCount: 99 }).status).toBe("needs_review");
  });
  it("auto-publish only for trusted creators with no strikes, and only when humans are not required", () => {
    expect(decide(all, { creatorApprovedCount: 12, creatorStrikes: 0, requireHuman: false }).status).toBe("published");
    expect(decide(all, { creatorApprovedCount: 12, creatorStrikes: 1, requireHuman: false }).status).toBe("needs_review");
    expect(decide(all, { creatorApprovedCount: 3, creatorStrikes: 0, requireHuman: false }).status).toBe("needs_review");
    expect(decide(all, { creatorApprovedCount: 99, creatorStrikes: 0, requireHuman: true }).status).toBe("needs_review");
  });
  it("records a summary for the audit trail", () => {
    expect(decide(all, ctx).summary).toMatchObject({ requireHuman: true });
  });
});

describe("sampleTranscript", () => {
  it("keeps short transcripts intact", () => expect(sampleTranscript("hello", 100)).toBe("hello"));
  it("covers start, middle and end of a long lecture", () => {
    const t = "A".repeat(5000) + "MIDDLE" + "B".repeat(5000) + "Z".repeat(5000);
    const s = sampleTranscript(t, 3000);
    expect(s.length).toBeLessThanOrEqual(3100);
    expect(s).toContain("AAAA");
    expect(s).toContain("ZZZZ");
  });
});
