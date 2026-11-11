// ffmpeg / ffprobe helpers used by the moderation worker. Requires `ffmpeg` on PATH.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const run = promisify(execFile);
const BIG = { maxBuffer: 64 * 1024 * 1024 };

export type Probe = { durationSeconds: number; hasVideo: boolean; hasAudio: boolean; width: number; height: number };

export async function probe(file: string): Promise<Probe> {
  const { stdout } = await run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file], BIG);
  const j = JSON.parse(stdout) as { format?: { duration?: string }; streams?: Array<{ codec_type: string; width?: number; height?: number }> };
  const v = j.streams?.find((s) => s.codec_type === "video");
  return {
    durationSeconds: Math.round(Number(j.format?.duration ?? 0)),
    hasVideo: Boolean(v),
    hasAudio: Boolean(j.streams?.some((s) => s.codec_type === "audio")),
    width: v?.width ?? 0,
    height: v?.height ?? 0,
  };
}

/** One 512px-wide JPEG every `everySeconds`, at most `max` frames (evenly spread for long videos). */
export async function extractFrames(file: string, outDir: string, durationSeconds: number, max = 24): Promise<string[]> {
  await mkdir(outDir, { recursive: true });
  const every = Math.max(5, Math.ceil(durationSeconds / max));
  await run("ffmpeg", ["-v", "error", "-y", "-i", file, "-vf", `fps=1/${every},scale=512:-2`, "-frames:v", String(max), "-q:v", "4", path.join(outDir, "f_%03d.jpg")], BIG);
  return (await readdir(outDir)).filter((f) => f.startsWith("f_")).sort().map((f) => path.join(outDir, f));
}

export async function makeThumbnail(file: string, out: string, durationSeconds: number): Promise<string> {
  const at = Math.max(1, Math.min(10, Math.floor(durationSeconds * 0.1)));
  await run("ffmpeg", ["-v", "error", "-y", "-ss", String(at), "-i", file, "-frames:v", "1", "-vf", "scale=640:-2", "-q:v", "3", out], BIG);
  return out;
}

/** Speech track as small mono 16 kHz MP3 chunks (<= ~10 min each) so each fits speech-to-text upload limits. */
export async function extractAudioChunks(file: string, outDir: string): Promise<string[]> {
  await mkdir(outDir, { recursive: true });
  await run("ffmpeg", ["-v", "error", "-y", "-i", file, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "32k", "-f", "segment", "-segment_time", "600", path.join(outDir, "a_%03d.mp3")], BIG);
  return (await readdir(outDir)).filter((f) => f.startsWith("a_")).sort().map((f) => path.join(outDir, f));
}
