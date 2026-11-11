import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { extractAudioChunks, extractFrames, makeThumbnail, probe } from "../../../worker/media";

const hasFfmpeg = (() => { try { execFileSync("ffmpeg", ["-version"], { stdio: "ignore" }); return true; } catch { return false; } })();
const d = hasFfmpeg ? describe : describe.skip;

d("worker/media (real ffmpeg on a synthetic 25s clip)", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "lt-media-"));
  const file = path.join(dir, "clip.mp4");
  const silent = path.join(dir, "silent.mp4");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "testsrc=duration=25:size=640x360:rate=10", "-f", "lavfi", "-i", "sine=frequency=440:duration=25", "-shortest", "-pix_fmt", "yuv420p", file]);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "testsrc=duration=6:size=320x240:rate=10", "-pix_fmt", "yuv420p", silent]);

  it("probes duration, streams and size", async () => {
    const p = await probe(file);
    expect(p.durationSeconds).toBe(25);
    expect(p).toMatchObject({ hasVideo: true, hasAudio: true, width: 640, height: 360 });
  });
  it("detects a video without an audio track", async () => {
    expect((await probe(silent)).hasAudio).toBe(false);
  });
  it("extracts evenly spaced frames", async () => {
    const frames = await extractFrames(file, path.join(dir, "frames"), 25, 5);
    expect(frames.length).toBeGreaterThanOrEqual(4);
    expect(frames.length).toBeLessThanOrEqual(5);
    expect(statSync(frames[0]).size).toBeGreaterThan(500);
  });
  it("creates a thumbnail", async () => {
    const out = await makeThumbnail(file, path.join(dir, "thumb.jpg"), 25);
    expect(statSync(out).size).toBeGreaterThan(500);
  });
  it("extracts a small audio track", async () => {
    const chunks = await extractAudioChunks(file, path.join(dir, "audio"));
    expect(chunks.length).toBe(1);
    expect(statSync(chunks[0]).size).toBeGreaterThan(1000);
  });
  it("rejects a corrupt file", async () => {
    const bad = path.join(dir, "bad.mp4");
    execFileSync("sh", ["-c", `head -c 4000 /dev/urandom > ${bad}`]);
    await expect(probe(bad)).rejects.toThrow();
  });
});
