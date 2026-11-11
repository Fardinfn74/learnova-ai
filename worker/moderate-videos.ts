/**
 * Learn Tube moderation worker.
 *
 *   npm run worker:moderate          # keep polling forever
 *   npm run worker:moderate -- --once  # process the queue once and exit (cron / CI)
 *
 * Needs: ffmpeg on PATH, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY (speech-to-text) and
 * GEMINI_API_KEY (vision). Runs as a long-lived container (see worker/Dockerfile) — NOT on a serverless
 * function, because ffmpeg needs real CPU time and disk.
 */
import { createClient } from "@supabase/supabase-js";
import { Output } from "ai";
import { createWriteStream } from "node:fs";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { generateTextWithFailover, getGroqApiKey } from "../src/lib/ai-gateway";
import { FRAME_PROMPT, FrameClassificationSchema, TextClassificationSchema, textClassifierPrompt, type FrameClassification } from "../src/lib/video-moderation";
import { NOVA_TASK_SYSTEM } from "../src/lib/nova-prompts";
import { extractAudioChunks, extractFrames, makeThumbnail, probe } from "./media";
import { processVideo, type Deps, type VideoRow } from "./pipeline";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const BUCKET = "videos";

async function rpc<T = unknown>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error(`${fn}: ${error.message}`);
  return data as T;
}

async function transcribeChunk(file: string, lang: string): Promise<string> {
  const keys = (process.env.GROQ_API_KEY || "").split(",").map((k) => k.trim()).filter(Boolean);
  if (!keys.length) throw new Error("GROQ_API_KEY missing (speech-to-text)");
  const bytes = await readFile(file);
  let last = "";
  for (let i = 0; i < keys.length; i++) {
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: "audio/mpeg" }), "audio.mp3");
    form.append("model", process.env.STT_MODEL || "whisper-large-v3-turbo");
    form.append("response_format", "json");
    form.append("temperature", "0");
    if (lang === "bangla") form.append("language", "bn");
    else if (lang === "english") form.append("language", "en");
    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST", headers: { Authorization: `Bearer ${getGroqApiKey() ?? keys[i]}` }, body: form,
    });
    if (res.ok) return ((await res.json()) as { text?: string }).text ?? "";
    last = `${res.status} ${(await res.text()).slice(0, 200)}`;
    if (![429, 500, 502, 503].includes(res.status)) break;
  }
  throw new Error(`speech-to-text failed: ${last}`);
}

const realDeps: Deps = {
  requireHuman: process.env.MODERATION_REQUIRE_HUMAN !== "false",
  workdir: async (id) => { const d = await mkdtemp(path.join(tmpdir(), `lt-${id}-`)); await mkdir(d, { recursive: true }); return d; },
  cleanup: (dir) => rm(dir, { recursive: true, force: true }),
  download: async (storagePath, dest) => {
    const { data, error } = await db.storage.from(BUCKET).createSignedUrl(storagePath, 3600);
    if (error || !data) throw new Error(`cannot sign download: ${error?.message}`);
    const res = await fetch(data.signedUrl);
    if (!res.ok || !res.body) throw new Error(`download failed: ${res.status}`);
    await pipeline(Readable.fromWeb(res.body as never), createWriteStream(dest));
    return dest;
  },
  probe, extractFrames: (f, d, dur) => extractFrames(f, d, dur), makeThumbnail, extractAudio: extractAudioChunks,
  uploadThumbnail: async (local, storagePath) => {
    const { error } = await db.storage.from(BUCKET).upload(storagePath, await readFile(local), { contentType: "image/jpeg", upsert: true });
    if (error) throw new Error(`thumbnail upload: ${error.message}`);
  },
  transcribe: async (files, lang) => (await Promise.all(files.map((f) => transcribeChunk(f, lang)))).join(" "),
  classifyText: async (kind, v, body) => {
    const { experimental_output: out } = await generateTextWithFailover({
      tier: "quality", system: NOVA_TASK_SYSTEM,
      experimental_output: Output.object({ schema: TextClassificationSchema }),
      prompt: textClassifierPrompt(kind, { title: v.title, description: v.description, subject: v.subject, grade: v.grade_band, language: v.language, body }),
    });
    return out;
  },
  classifyFrames: async (files) => {
    const batches: FrameClassification[] = [];
    for (let i = 0; i < files.length; i += 8) {
      const slice = files.slice(i, i + 8);
      const images = await Promise.all(slice.map((f) => readFile(f)));
      const { experimental_output: out } = await generateTextWithFailover({
        vision: true, tier: "quality", system: NOVA_TASK_SYSTEM,
        experimental_output: Output.object({ schema: FrameClassificationSchema }),
        messages: [{ role: "user", content: [{ type: "text", text: `${FRAME_PROMPT}\nThere are ${slice.length} images, indexed 0-${slice.length - 1} in order.` }, ...images.map((image) => ({ type: "image" as const, image }))] }],
      });
      batches.push(out);
    }
    return batches;
  },
  saveTranscript: async (videoId, language, body) => { await db.from("video_transcripts").upsert({ video_id: videoId, language, body }); },
  creatorStats: async (creatorId) => {
    const [{ count }, { data: c }] = await Promise.all([
      db.from("videos").select("id", { count: "exact", head: true }).eq("creator_id", creatorId).eq("status", "published"),
      db.from("creator_profiles").select("strikes").eq("user_id", creatorId).maybeSingle(),
    ]);
    return { approvedCount: count ?? 0, strikes: c?.strikes ?? 0 };
  },
  log: async (videoId, stage, verdict, confidence, detail, model) => {
    await rpc("log_moderation_event", { p_video_id: videoId, p_stage: stage, p_verdict: verdict, p_confidence: confidence, p_detail: detail, p_model: model ?? null });
  },
  applyOutcome: async (videoId, status, reason, summary, duration, thumbnail) => {
    await rpc("apply_moderation_outcome", { p_video_id: videoId, p_status: status, p_reason: reason, p_summary: summary, p_duration: duration, p_thumbnail: thumbnail });
  },
};

export async function drainQueue(once: boolean, sleepMs = 10_000) {
  for (;;) {
    await rpc("requeue_stuck_videos").catch(() => {});
    const claimed = await rpc<VideoRow | null>("claim_next_video_for_moderation");
    if (claimed?.id) {
      const started = Date.now();
      const outcome = await processVideo(realDeps, claimed);
      console.log(JSON.stringify({ kind: "moderation", video: claimed.id, outcome, ms: Date.now() - started }));
      continue;
    }
    if (once) return;
    await new Promise((r) => setTimeout(r, sleepMs));
  }
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  drainQueue(process.argv.includes("--once")).catch((e) => { console.error(e); process.exit(1); });
}
