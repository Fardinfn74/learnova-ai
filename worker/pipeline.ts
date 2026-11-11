// Orchestrates ONE video through the automatic checks. All I/O is injected so the flow is unit-tested
// with fakes; worker/moderate-videos.ts wires the real ffmpeg / storage / model implementations.
import { decide, frameResultsToResult, sampleTranscript, textClassificationToResult, type FrameClassification, type StageResult, type TextClassification } from "../src/lib/video-moderation";
import { moderate } from "../src/lib/moderation-rules";
import type { Probe } from "./media";

export type VideoRow = {
  id: string; creator_id: string; title: string; description: string; subject: string;
  grade_band: string; language: string; storage_path: string;
};

export type Deps = {
  workdir: (videoId: string) => Promise<string>;
  download: (storagePath: string, dest: string) => Promise<string>;
  probe: (file: string) => Promise<Probe>;
  extractFrames: (file: string, dir: string, duration: number) => Promise<string[]>;
  makeThumbnail: (file: string, dest: string, duration: number) => Promise<string>;
  extractAudio: (file: string, dir: string) => Promise<string[]>;
  uploadThumbnail: (localFile: string, storagePath: string) => Promise<void>;
  transcribe: (audioFiles: string[], languageHint: string) => Promise<string>;
  classifyText: (kind: "metadata" | "transcript", v: VideoRow, body?: string) => Promise<TextClassification>;
  classifyFrames: (frameFiles: string[]) => Promise<FrameClassification[]>;
  saveTranscript: (videoId: string, language: string, body: string) => Promise<void>;
  creatorStats: (creatorId: string) => Promise<{ approvedCount: number; strikes: number }>;
  log: (videoId: string, stage: string, verdict: string, confidence: number | null, detail: Record<string, unknown>, model?: string) => Promise<void>;
  applyOutcome: (videoId: string, status: "needs_review" | "rejected" | "published", reason: string, summary: Record<string, unknown>, duration: number | null, thumbnail: string | null) => Promise<void>;
  cleanup: (dir: string) => Promise<void>;
  requireHuman: boolean;
};

const MAX_DURATION = 6 * 3600;

export async function processVideo(deps: Deps, v: VideoRow): Promise<"needs_review" | "rejected" | "published"> {
  const dir = await deps.workdir(v.id);
  const results: StageResult[] = [];
  let duration: number | null = null;
  let thumb: string | null = null;
  const record = async (r: StageResult, model?: string) => {
    results.push(r);
    await deps.log(v.id, r.stage, r.verdict, r.confidence, { flags: r.flags, reason: r.reason }, model);
  };

  try {
    // 0. instant text rules on what the creator typed
    const quick = moderate(`${v.title}\n${v.description}`);
    if (!quick.ok) {
      const r: StageResult = { stage: "metadata", verdict: "reject", confidence: 1, flags: [quick.category ?? "unsafe"], reason: `Title/description blocked by safety rules (${quick.category}).` };
      await record(r, "rules");
      return await finish(deps, v, results, null, null);
    }

    // 1. file integrity
    const file = await deps.download(v.storage_path, `${dir}/source`);
    let p: Probe;
    try {
      p = await deps.probe(file);
    } catch {
      await deps.log(v.id, "system", "reject", null, { reason: "unreadable file" });
      await deps.applyOutcome(v.id, "rejected", "The file could not be read as a video. Please export it again as MP4 and re-upload.", { stage: "integrity" }, null, null);
      return "rejected";
    }
    if (!p.hasVideo || p.durationSeconds < 1 || p.durationSeconds > MAX_DURATION) {
      await deps.log(v.id, "system", "reject", null, { reason: "invalid duration/streams", ...p });
      await deps.applyOutcome(v.id, "rejected", "The video must contain a picture track and be between 1 second and 6 hours long.", { stage: "integrity", ...p }, null, null);
      return "rejected";
    }
    duration = p.durationSeconds;

    // 2. metadata
    const meta = await deps.classifyText("metadata", v);
    await record(textClassificationToResult("metadata", meta), "text-classifier");

    // 3. speech -> transcript -> classifier (a video with no speech cannot be verified automatically)
    let transcript = "";
    if (p.hasAudio) {
      const audio = await deps.extractAudio(file, `${dir}/audio`);
      transcript = (await deps.transcribe(audio, v.language)).trim();
    }
    if (transcript.length < 40) {
      await record({ stage: "transcript", verdict: "review", confidence: 0, flags: [], reason: "No usable speech found; a human must check the content." });
    } else {
      await deps.saveTranscript(v.id, v.language, transcript.slice(0, 200_000));
      const quickT = moderate(transcript);
      if (!quickT.ok) {
        await record({ stage: "transcript", verdict: "reject", confidence: 1, flags: [quickT.category ?? "unsafe"], reason: `Speech blocked by safety rules (${quickT.category}).` }, "rules");
      } else {
        const c = await deps.classifyText("transcript", v, sampleTranscript(transcript));
        await record(textClassificationToResult("transcript", c), "text-classifier");
      }
    }

    // 4. frames + thumbnail
    const frames = await deps.extractFrames(file, `${dir}/frames`, p.durationSeconds);
    const batches = frames.length ? await deps.classifyFrames(frames) : [];
    await record(frameResultsToResult(batches), "vision-classifier");

    const thumbLocal = await deps.makeThumbnail(file, `${dir}/thumb.jpg`, p.durationSeconds);
    thumb = `${v.creator_id}/${v.id}/thumb.jpg`;
    await deps.uploadThumbnail(thumbLocal, thumb);

    return await finish(deps, v, results, duration, thumb);
  } catch (e) {
    // Fail SAFE: never publish, never lose the video; a human decides.
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[moderation] ${v.id} failed:`, msg);
    await deps.log(v.id, "system", "review", null, { error: msg.slice(0, 300) });
    await deps.applyOutcome(v.id, "needs_review", "The automatic check could not finish; a human will review it.", { stage: "error" }, duration, thumb);
    return "needs_review";
  } finally {
    await deps.cleanup(dir).catch(() => {});
  }
}

async function finish(deps: Deps, v: VideoRow, results: StageResult[], duration: number | null, thumb: string | null) {
  const stats = await deps.creatorStats(v.creator_id);
  const d = decide(results, { creatorApprovedCount: stats.approvedCount, creatorStrikes: stats.strikes, requireHuman: deps.requireHuman });
  await deps.applyOutcome(v.id, d.status, d.reason, d.summary, duration, thumb);
  return d.status;
}
