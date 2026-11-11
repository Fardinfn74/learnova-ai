import { describe, expect, it, vi } from "vitest";
import { processVideo, type Deps, type VideoRow } from "../../../worker/pipeline";

const video: VideoRow = { id: "v1", creator_id: "c1", title: "Fractions for class 5", description: "Adding fractions", subject: "mathematics", grade_band: "primary", language: "bangla", storage_path: "c1/v1/source.mp4" };
const goodText = { educational: true, educational_confidence: 0.97, matches_declared_subject: true, age_appropriate_for_declared_grade: true, flags: [] as any[], reason: "ok" };
const goodFrames = [{ frames: [{ index: 0, looks_educational: true, flags: [] as any[] }, { index: 1, looks_educational: true, flags: [] as any[] }], reason: "" }];

function deps(o: Partial<Deps> = {}) {
  const calls: Record<string, any[]> = { outcome: [], log: [] };
  const d: Deps = {
    workdir: async () => "/tmp/x", download: async () => "/tmp/x/source",
    probe: async () => ({ durationSeconds: 120, hasVideo: true, hasAudio: true, width: 1280, height: 720 }),
    extractFrames: async () => ["a.jpg", "b.jpg"], makeThumbnail: async () => "/tmp/x/thumb.jpg",
    extractAudio: async () => ["a.mp3"], uploadThumbnail: async () => {},
    transcribe: async () => "Today we learn how to add fractions with unlike denominators step by step.",
    classifyText: async () => goodText, classifyFrames: async () => goodFrames,
    saveTranscript: async () => {}, creatorStats: async () => ({ approvedCount: 0, strikes: 0 }),
    log: async (...a) => { calls.log.push(a); },
    applyOutcome: async (...a) => { calls.outcome.push(a); },
    cleanup: async () => {}, requireHuman: true, ...o,
  };
  return { d, calls };
}

describe("processVideo", () => {
  it("clean video -> needs_review (human gate), thumbnail + duration saved", async () => {
    const { d, calls } = deps();
    expect(await processVideo(d, video)).toBe("needs_review");
    const [id, status, , , duration, thumb] = calls.outcome[0];
    expect([id, status, duration, thumb]).toEqual(["v1", "needs_review", 120, "c1/v1/thumb.jpg"]);
    expect(calls.log.map((l) => l[1])).toEqual(expect.arrayContaining(["metadata", "transcript", "frames"]));
  });
  it("unsafe frames -> rejected", async () => {
    const { d, calls } = deps({ classifyFrames: async () => [{ frames: [{ index: 0, looks_educational: false, flags: ["nudity"] }], reason: "x" }] });
    expect(await processVideo(d, video)).toBe("rejected");
    expect(calls.outcome[0][1]).toBe("rejected");
  });
  it("blocked words in the title are rejected before any download", async () => {
    const download = vi.fn(async () => "/tmp/x/source");
    const { d } = deps({ download });
    expect(await processVideo(d, { ...video, title: "free porn videos" })).toBe("rejected");
    expect(download).not.toHaveBeenCalled();
  });
  it("transcript rule hit -> rejected", async () => {
    const { d } = deps({ transcribe: async () => "welcome, today I will show you how to make a bomb at home in detail for everyone" });
    expect(await processVideo(d, video)).toBe("rejected");
  });
  it("no audio track -> human review, never auto-approved", async () => {
    const { d } = deps({ probe: async () => ({ durationSeconds: 60, hasVideo: true, hasAudio: false, width: 1, height: 1 }) });
    expect(await processVideo(d, video)).toBe("needs_review");
  });
  it("unreadable file -> rejected with a helpful message", async () => {
    const { d, calls } = deps({ probe: async () => { throw new Error("moov atom not found"); } });
    expect(await processVideo(d, video)).toBe("rejected");
    expect(calls.outcome[0][2]).toMatch(/could not be read/);
  });
  it("absurd length -> rejected", async () => {
    const { d } = deps({ probe: async () => ({ durationSeconds: 99999, hasVideo: true, hasAudio: true, width: 1, height: 1 }) });
    expect(await processVideo(d, video)).toBe("rejected");
  });
  it("a crashing model call FAILS SAFE to human review (never published)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { d, calls } = deps({ classifyFrames: async () => { throw new Error("gemini 503"); } });
    expect(await processVideo(d, video)).toBe("needs_review");
    expect(calls.outcome[0][1]).toBe("needs_review");
  });
  it("trusted creator + humans not required -> auto-publish", async () => {
    const { d } = deps({ requireHuman: false, creatorStats: async () => ({ approvedCount: 20, strikes: 0 }) });
    expect(await processVideo(d, video)).toBe("published");
  });
  it("trusted creator but one soft doubt -> still human review", async () => {
    const { d } = deps({ requireHuman: false, creatorStats: async () => ({ approvedCount: 20, strikes: 0 }), classifyText: async () => ({ ...goodText, flags: ["scam_or_ads"] }) });
    expect(await processVideo(d, video)).toBe("needs_review");
  });
  it("always cleans the temp directory", async () => {
    const cleanup = vi.fn(async () => {});
    const { d } = deps({ cleanup, classifyText: async () => { throw new Error("x"); } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    await processVideo(d, video);
    expect(cleanup).toHaveBeenCalled();
  });
});
