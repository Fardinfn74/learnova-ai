import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/lib/auth-middleware";
import { z } from "zod";
import { effectiveStreak } from "./streak";

// ============ PROFILE & XP ============

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    // create if missing (failsafe)
    if (!data) {
      const { data: created } = await supabase
        .from("profiles")
        .insert({ id: userId, display_name: "Learner" })
        .select("*").single();
      return created;
    }
    
    // Streaks are stored by the database (calendar days, Asia/Dhaka). Show 0 if the learner missed a day.
    return { ...data, current_streak: effectiveStreak(data.last_active_date, data.current_streak) };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    display_name: z.string().min(1).max(80).optional(),
    preferred_language: z.enum(["english", "bangla", "banglish"]).optional(),
  }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: updated, error } = await supabase
      .from("profiles").update(data).eq("id", userId).select("*").single();
    if (error) throw error;
    return updated;
  });

// ============ THREADS & MESSAGES ============

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("threads")
      .select("*").eq("user_id", userId).order("updated_at", { ascending: false }).limit(100);
    if (error) throw error;
    return data ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ title: z.string().max(120).optional(), subject: z.string().max(60).optional() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: t, error } = await supabase.from("threads")
      .insert({ user_id: userId, title: data.title ?? "New chat", subject: data.subject ?? null })
      .select("*").single();
    if (error) throw error;
    return t;
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("threads").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw error;
    return { ok: true };
  });

export const getThreadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ threadId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: t } = await supabase.from("threads").select("*").eq("id", data.threadId).eq("user_id", userId).maybeSingle();
    if (!t) throw new Error("Thread not found");
    const { data: msgs, error } = await supabase.from("messages")
      .select("*").eq("thread_id", data.threadId).order("created_at", { ascending: true });
    if (error) throw error;
    return { thread: t, messages: msgs ?? [] };
  });

export const saveMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    thread_id: z.string().uuid(),
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(50000),
    parts: z.unknown().optional(),
  }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("messages").insert({
      thread_id: data.thread_id, user_id: userId, role: data.role, content: data.content,
      parts: (data.parts ?? null) as never,
    });
    if (error) throw error;
    // bump thread updated_at + auto-title if first message
    await supabase.from("threads").update({ updated_at: new Date().toISOString() }).eq("id", data.thread_id);
    if (data.role === "user") {
      const { data: t } = await supabase.from("threads").select("title").eq("id", data.thread_id).single();
      if (t && t.title === "New chat") {
        const title = data.content.slice(0, 60).replace(/\n/g, " ").trim();
        await supabase.from("threads").update({ title }).eq("id", data.thread_id);
      }
    }
    return { ok: true };
  });

// ============ BADGES ============

export const listBadges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("badges").select("*").eq("user_id", userId).order("earned_at", { ascending: false });
    return data ?? [];
  });

// ============ XP HISTORY ============

export const xpHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("xp_events").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30);
    return data ?? [];
  });

export const awardXp = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({
      amount: z.number().int().min(1).max(500),
      reason: z.string().max(200).optional(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    return { ok: true, amount: data.amount, reason: data.reason ?? "activity" };
  });
