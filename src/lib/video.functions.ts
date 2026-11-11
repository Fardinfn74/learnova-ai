// Server functions for Learn Tube (browsing, streaming, creator studio, staff review).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/auth-middleware";
import { admin, userRpc } from "@/lib/db.server";
import { assertSafe, enforce } from "@/lib/guard.server";
import { GRADES, LANGS, REPORT_REASONS, SUBJECTS } from "@/lib/video-labels";
import { checkVideoEducationalGuardrail, type GuardrailResult } from "./video-guardrail";
import { SAMPLE_VIDEOS } from "./sample-videos";

const SIGN_SECONDS = 2 * 60 * 60; // 2 hour playback token

async function signMany(paths: Array<string | null | undefined>): Promise<Map<string, string>> {
  const clean = Array.from(new Set(paths.filter((p): p is string => typeof p === "string" && !!p)));
  if (!clean.length) return new Map();
  const sb = admin();
  const { data, error } = await sb.storage.from("videos").createSignedUrls(clean, SIGN_SECONDS);
  if (error || !data) return new Map();
  return new Map(data.filter((d) => !d.error && d.signedUrl).map((d) => [d.path as string, d.signedUrl]));
}

async function sign(path: string | null) {
  return path ? (await signMany([path])).get(path) ?? null : null;
}

async function assertStaff(supabase: any) {
  if (!(await userRpc<boolean>(supabase, "is_staff"))) throw new Error("Staff only");
}

// ---------- guardrail verification (compatibility) ----------
const VerifyVideoInputSchema = z.object({
  title: z.string().min(5).max(180),
  description: z.string().min(10).max(3000),
  category: z.string().min(2).max(60),
  targetAudience: z.string().min(2).max(60),
  tags: z.array(z.string()).max(10).optional(),
  sampleTranscriptOrOutline: z.string().max(4000).optional(),
});

export const verifyEducationalVideo = createServerFn({ method: "POST" })
  .validator((d: unknown) => VerifyVideoInputSchema.parse(d))
  .handler(async ({ data }): Promise<GuardrailResult> => {
    return await checkVideoEducationalGuardrail(data);
  });

// ---------- creators ----------
export const getCreatorStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    let data: any = null;
    let balance: any = null;
    let staff = false;
    try {
      const res = await supabase.from("creator_profiles" as never).select("display_name,bio,subjects,verification_status,strikes").eq("user_id", userId).maybeSingle();
      data = res.data;
      balance = data ? await userRpc<{ total_minor: number; entries: number; watch_seconds: number }>(supabase, "creator_balance") : null;
      staff = await userRpc<boolean>(supabase, "is_staff");
    } catch {
      // fallback
    }
    return { creator: (data as Record<string, any> | null) ?? null, balance, isStaff: staff, isGuest: context.isAnonymous };
  });

export const applyToTeach = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    displayName: z.string().trim().min(2).max(80),
    bio: z.string().trim().max(1000).default(""),
    subjects: z.array(z.enum(SUBJECTS)).min(1).max(5),
    credentials: z.string().trim().min(10).max(1500),
  }).parse(d))
  .handler(async ({ context, data }) => {
    assertSafe(`${data.displayName} ${data.bio} ${data.credentials}`);
    return userRpc<string>(context.supabase, "apply_to_teach", { p_display_name: data.displayName, p_bio: data.bio, p_subjects: data.subjects, p_credentials: data.credentials });
  });

// ---------- uploading ----------
export const createVideoDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().max(4000).default(""),
    subject: z.enum(SUBJECTS), grade: z.enum(GRADES), language: z.enum(LANGS),
  }).parse(d))
  .handler(async ({ context, data }) => {
    await enforce(context.userId, context.isAnonymous, "video_upload");
    assertSafe(`${data.title}\n${data.description}`);
    const id = await userRpc<string>(context.supabase, "create_video_draft", { p_title: data.title, p_description: data.description, p_subject: data.subject, p_grade: data.grade, p_language: data.language });
    return { id, userId: context.userId };
  });

export const submitVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), ext: z.enum(["mp4", "webm", "mov"]) }).parse(d))
  .handler(async ({ context, data }) => {
    await userRpc(context.supabase, "submit_video_for_review", { p_video_id: data.id, p_path: `${context.userId}/${data.id}/source.${data.ext}` });
    return true;
  });

export const listMyVideos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("videos" as never)
      .select("id,title,subject,grade_band,language,status,rejection_reason,duration_seconds,view_count,created_at,published_at")
      .eq("creator_id", context.userId).order("created_at", { ascending: false }).limit(50);
    return (data as Array<Record<string, any>> | null) ?? [];
  });

// ---------- watching ----------
export const listCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    subject: z.enum(SUBJECTS).optional(), grade: z.enum(GRADES).optional(), language: z.enum(LANGS).optional(),
    q: z.string().max(60).optional(), offset: z.number().int().min(0).max(1000).default(0),
  }).parse(d ?? {}))
  .handler(async ({ context, data }) => {
    let rows: Array<Record<string, any>> = [];
    try {
      rows = await userRpc<Array<Record<string, any>>>(context.supabase, "list_published_videos", {
        p_subject: data.subject ?? null, p_grade: data.grade ?? null, p_language: data.language ?? null,
        p_query: data.q?.trim() || null, p_limit: 24, p_offset: data.offset,
      });
    } catch {
      rows = [];
    }

    // Filter sample videos matching criteria
    const filteredSamples = SAMPLE_VIDEOS.filter((sv) => {
      if (data.subject && sv.subject !== data.subject) return false;
      if (data.grade && sv.grade_band !== data.grade) return false;
      if (data.language && sv.language !== data.language) return false;
      if (data.q) {
        const query = data.q.toLowerCase();
        return sv.title.toLowerCase().includes(query) || sv.description.toLowerCase().includes(query);
      }
      return true;
    }).map((sv) => ({
      id: sv.id,
      title: sv.title,
      description: sv.description,
      subject: sv.subject,
      grade_band: sv.grade_band,
      language: sv.language,
      duration_seconds: sv.duration_seconds,
      view_count: sv.view_count,
      thumbnail_url: sv.thumbnail_url,
      thumbnail_path: null,
      creator_name: sv.creator.display_name,
    }));

    if (!rows.length) {
      return filteredSamples;
    }

    const urls = await signMany(rows.map((r) => r.thumbnail_path));
    const dbVideos = rows.map((r) => ({ ...r, thumbnail_url: r.thumbnail_path ? urls.get(r.thumbnail_path) ?? null : null }));
    return [...dbVideos, ...filteredSamples];
  });

export const getVideoForWatch = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    // Check sample videos first
    const sample = SAMPLE_VIDEOS.find((sv) => sv.id === data.id);
    if (sample) {
      return {
        video: {
          id: sample.id,
          title: sample.title,
          description: sample.description,
          subject: sample.subject,
          grade_band: sample.grade_band,
          language: sample.language,
          status: "published",
          duration_seconds: sample.duration_seconds,
          view_count: sample.view_count,
          creator_id: "sample-creator-id",
          published_at: new Date().toISOString(),
          rejection_reason: null,
          concepts: sample.concepts,
        },
        url: sample.video_url,
        poster: sample.thumbnail_url,
        creator: sample.creator,
        progress: null,
      };
    }

    // RLS: a learner only gets a row if it is published (and its creator verified), or it is their own / staff.
    const { data: v } = await context.supabase.from("videos" as never)
      .select("id,title,description,subject,grade_band,language,status,storage_path,thumbnail_path,duration_seconds,view_count,creator_id,published_at,rejection_reason").eq("id", data.id).maybeSingle();
    const video = v as Record<string, any> | null;
    if (!video || !video.storage_path) throw new Error("Video not found");
    const [url, poster, creator, progress] = await Promise.all([
      sign(video.storage_path), sign(video.thumbnail_path),
      context.supabase.from("public_creators" as never).select("display_name,bio").eq("user_id", video.creator_id).maybeSingle(),
      context.supabase.from("video_progress" as never).select("position_seconds,completed").eq("video_id", data.id).eq("user_id", context.userId).maybeSingle(),
    ]);
    const { storage_path: _omit, ...safe } = video;
    return { video: safe, url, poster, creator: (creator.data as Record<string, string> | null) ?? null, progress: (progress.data as Record<string, any> | null) ?? null };
  });

export const recordVideoProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string(), position: z.number().int().min(0).max(21600), delta: z.number().int().min(0).max(60) }).parse(d))
  .handler(async ({ context, data }) => {
    if (data.id.startsWith("sample-")) {
      return { completed: true, awarded: 5, watched_seconds: data.position };
    }
    await enforce(context.userId, context.isAnonymous, "video_progress");
    return userRpc<{ completed: boolean; awarded: number; watched_seconds: number }>(context.supabase, "record_video_progress", { p_video_id: data.id, p_position: data.position, p_delta: data.delta });
  });

export const reportVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string(), reason: z.enum(REPORT_REASONS), details: z.string().trim().max(1000).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    await enforce(context.userId, context.isAnonymous, "video_report");
    if (data.details) assertSafe(data.details);
    return userRpc<"quarantined" | "received">(context.supabase, "report_video", { p_video_id: data.id, p_reason: data.reason, p_details: data.details ?? null });
  });

// ---------- staff review ----------
export const staffQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    await assertStaff(supabase);
    const [videos, creators, reports] = await Promise.all([
      supabase.from("videos" as never).select("id,title,description,subject,grade_band,language,duration_seconds,moderation,creator_id,created_at,status").eq("status", "needs_review").order("updated_at", { ascending: true }).limit(50),
      supabase.from("creator_profiles" as never).select("user_id,display_name,bio,subjects,credentials,created_at").eq("verification_status", "pending").order("created_at", { ascending: true }).limit(50),
      supabase.from("video_reports" as never).select("video_id,reason,details,created_at").eq("status", "open").order("created_at", { ascending: false }).limit(100),
    ]);
    const vids = (videos.data as Array<Record<string, any>> | null) ?? [];
    const events = vids.length
      ? await supabase.from("video_moderation_events" as never).select("video_id,stage,verdict,confidence,detail,created_at").in("video_id", vids.map((v) => v.id)).order("created_at", { ascending: true })
      : { data: [] };
    return { videos: vids, creators: (creators.data as Array<Record<string, any>> | null) ?? [], reports: (reports.data as Array<Record<string, any>> | null) ?? [], events: (events.data as Array<Record<string, any>> | null) ?? [] };
  });

export const staffPreview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertStaff(context.supabase);
    const { data: v } = await context.supabase.from("videos" as never).select("storage_path").eq("id", data.id).maybeSingle();
    const path = (v as { storage_path?: string } | null)?.storage_path;
    if (!path) throw new Error("Video not found");
    return { url: await sign(path) };
  });

export const staffReviewVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), decision: z.enum(["approve", "reject", "remove"]), reason: z.string().trim().max(500).optional() }).parse(d))
  .handler(async ({ context, data }) =>
    userRpc<string>(context.supabase, "review_video", { p_video_id: data.id, p_decision: data.decision, p_reason: data.reason ?? null }));

export const staffReviewCreator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), decision: z.enum(["verified", "rejected", "suspended"]) }).parse(d))
  .handler(async ({ context, data }) => {
    await userRpc(context.supabase, "review_creator", { p_user: data.userId, p_decision: data.decision, p_note: null });
    return true;
  });
