import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/lib/auth-middleware";
import { z } from "zod";

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
    
    // Dynamic streak reset if > 24h passed from last xp_event
    const { data: lastEvent } = await supabase.from("xp_events")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastEvent?.created_at) {
      const lastTime = new Date(lastEvent.created_at).getTime();
      const now = Date.now();
      if (now - lastTime > 24 * 60 * 60 * 1000) {
        data.current_streak = 0;
      }
    } else {
      data.current_streak = 0;
    }
    
    return data;
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

function levelFromXp(xp: number) {
  // 100 xp per level, curved
  return Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
}

export const awardXp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    amount: z.number().int().min(1).max(500),
    reason: z.string().min(1).max(120),
  }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const oneTimeReasons = [
      "Chat with Nova",
      "Voice chat with Nova",
      "Used Draw to Learn",
      "Summarized notes",
      "Generated Audio Podcast"
    ];

    if (oneTimeReasons.includes(data.reason)) {
      const { data: existing } = await supabase.from("xp_events")
        .select("id")
        .eq("user_id", userId)
        .eq("reason", data.reason)
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { data: p } = await supabase.from("profiles").select("*").eq("id", userId).single();
        return { profile: p, awarded: 0 };
      }
    }

    // Get the latest xp event BEFORE inserting this new one to check exact time
    const { data: lastEvent } = await supabase.from("xp_events")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    await supabase.from("xp_events").insert({ user_id: userId, amount: data.amount, reason: data.reason });
    const { data: p } = await supabase.from("profiles").select("xp,current_streak,longest_streak,last_active_date").eq("id", userId).single();
    const newXp = (p?.xp ?? 0) + data.amount;
    const newLevel = levelFromXp(newXp);

    // streak logic (24h strict window)
    const nowStr = new Date().toISOString();
    const now = new Date(nowStr).getTime();
    const lastTime = lastEvent?.created_at ? new Date(lastEvent.created_at).getTime() : 0;
    const diff = now - lastTime;
    let streak = p?.current_streak ?? 0;

    if (streak === 0 || lastTime === 0) {
      streak = 1;
    } else if (diff > 24 * 60 * 60 * 1000) {
      // It's been more than 24 hours since their last precise action, streak resets to 1 for this new action.
      streak = 1;
    } else {
      // It's under 24 hours. Does it increment? 
      // To prevent spamming and incrementing multiple times a day, we only increment if the last action was on a previous calendar day (UTC or local, let's use Date string).
      if (new Date(nowStr).getDate() !== new Date(lastTime).getDate()) {
        streak += 1;
      }
    }

    const longest = Math.max(p?.longest_streak ?? 0, streak);

    // update profile, also keeping last_active_date as a date string just for legacy safety
    const todayStr = new Date().toISOString().slice(0, 10);
    const { data: updated } = await supabase.from("profiles").update({
      xp: newXp, level: newLevel, current_streak: streak, longest_streak: longest, last_active_date: todayStr,
    }).eq("id", userId).select("*").single();

    // auto-award badges
    const badges: { code: string; name: string; description: string; icon: string }[] = [];
    if (newXp >= 100) badges.push({ code: "first_100", name: "First 100 XP", description: "You earned 100 XP!", icon: "⭐" });
    if (newLevel >= 5) badges.push({ code: "level_5", name: "Rising Star", description: "Reached level 5", icon: "🌟" });
    if (streak >= 3) badges.push({ code: "streak_3", name: "On Fire", description: "3-day streak", icon: "🔥" });
    if (streak >= 7) badges.push({ code: "streak_7", name: "Unstoppable", description: "7-day streak", icon: "💎" });
    for (const b of badges) {
      await supabase.from("badges").insert({ user_id: userId, ...b }).select().maybeSingle();
    }
    return { profile: updated, awarded: data.amount };
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
