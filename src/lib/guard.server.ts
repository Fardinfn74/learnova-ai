// Per-user rate limits + daily AI quotas shared by every server instance (Postgres-backed).
// Falls back to an in-memory limiter when SUPABASE_SERVICE_ROLE_KEY is not configured (local dev).
import { adminConfigured, adminRpc } from "@/lib/db.server";
import { moderate, SAFETY_REPLIES, detectBangla } from "@/lib/moderation-rules";

export type PolicyName =
  | "chat" | "voice" | "quiz" | "summarize" | "podcast" | "draw" | "battle"
  | "nova_room" | "room_join" | "game_help" | "code_help" | "code_run" | "room_message"
  | "video_progress" | "video_upload" | "video_report";

type Policy = { perMin: number; daily: number };
export const POLICIES: Record<PolicyName, Policy> = {
  chat: { perMin: 20, daily: 400 },
  voice: { perMin: 15, daily: 200 },
  quiz: { perMin: 4, daily: 40 },
  summarize: { perMin: 4, daily: 30 },
  podcast: { perMin: 3, daily: 20 },
  draw: { perMin: 4, daily: 30 },
  battle: { perMin: 3, daily: 30 },
  nova_room: { perMin: 6, daily: 100 },
  room_join: { perMin: 10, daily: 100 },
  game_help: { perMin: 10, daily: 100 },
  code_help: { perMin: 6, daily: 60 },
  code_run: { perMin: 10, daily: 200 },
  room_message: { perMin: 20, daily: 2000 },
  video_progress: { perMin: 40, daily: 5000 },
  video_upload: { perMin: 5, daily: 20 },
  video_report: { perMin: 5, daily: 30 },
};

/** Guest (anonymous / judge-demo) accounts get a smaller share of every limit. */
export const GUEST_SCALE = 0.3;

export class RateLimitError extends Error {
  constructor(public retryAfter: number, public scope: "minute" | "day" = "minute") {
    super(
      scope === "day"
        ? "You've reached today's limit for this feature. It resets tomorrow."
        : `You're going a little fast — try again in ${retryAfter}s.`,
    );
    this.name = "RateLimitError";
  }
}

const memory = new Map<string, number[]>();
function memoryHit(key: string, limit: number, windowSec: number) {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const arr = (memory.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    memory.set(key, arr);
    return { ok: false, retryAfter: Math.max(1, Math.ceil((windowMs - (now - arr[0])) / 1000)) };
  }
  arr.push(now);
  memory.set(key, arr);
  if (memory.size > 5000) for (const [k, v] of memory) if (!v.length || now - v[v.length - 1] > windowMs * 4) memory.delete(k);
  return { ok: true, retryAfter: 0 };
}

async function hit(userId: string, bucket: string, limit: number, windowSec: number) {
  if (adminConfigured()) {
    try {
      const r = await adminRpc<{ ok: boolean; retry_after: number }>("check_rate_limit", {
        p_user: userId, p_bucket: bucket, p_limit: limit, p_window_seconds: windowSec,
      });
      return { ok: r.ok, retryAfter: r.retry_after };
    } catch (e) {
      console.warn("[rate-limit] db limiter unavailable, using memory:", e instanceof Error ? e.message : e);
    }
  }
  return memoryHit(`${userId}:${bucket}`, limit, windowSec);
}

export function effectiveLimits(policy: PolicyName, isAnonymous: boolean): Policy {
  const p = POLICIES[policy];
  const s = isAnonymous ? GUEST_SCALE : 1;
  return { perMin: Math.max(2, Math.floor(p.perMin * s)), daily: Math.max(5, Math.floor(p.daily * s)) };
}

export async function enforce(userId: string, isAnonymous: boolean, policy: PolicyName): Promise<void> {
  const { perMin, daily } = effectiveLimits(policy, isAnonymous);
  const m = await hit(userId, `${policy}:m`, perMin, 60);
  if (!m.ok) throw new RateLimitError(m.retryAfter, "minute");
  const d = await hit(userId, `${policy}:d`, daily, 86_400);
  if (!d.ok) throw new RateLimitError(d.retryAfter, "day");
}

export class UnsafeInputError extends Error {
  constructor(public category: string, public userFacing: string) {
    super(userFacing);
    this.name = "UnsafeInputError";
  }
}

/** Throws a friendly error if free text trips the safety rules (quiz topics, notes, prompts, ...). */
export function assertSafe(text: string): void {
  const r = moderate(text);
  if (r.ok) return;
  const bangla = detectBangla(text);
  const msg = r.category === "self_harm"
    ? (bangla ? SAFETY_REPLIES.self_harm.bn : SAFETY_REPLIES.self_harm.en)
    : "That isn't something we can help with on LEARNOVA. Try a school topic instead.";
  throw new UnsafeInputError(r.category!, msg);
}
