import { c as createServerRpc } from "./createServerRpc-wV0Vk4NU.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-JBvrN22J.mjs";
import { a as createServerFn } from "./index.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { m as objectType, i as enumType, t as stringType, k as numberType, y as unknownType } from "../_libs/zod.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
const getProfile_createServerFn_handler = createServerRpc({
  id: "2cf72878db8e18ebacc3ab18eed1bef4cb3152fd8eaff5fedc805f882179fc75",
  name: "getProfile",
  filename: "src/lib/learnova.functions.ts"
}, (opts) => getProfile.__executeServer(opts));
const getProfile = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getProfile_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  if (!data) {
    const {
      data: created
    } = await supabase.from("profiles").insert({
      id: userId,
      display_name: "Learner"
    }).select("*").single();
    return created;
  }
  const {
    data: lastEvent
  } = await supabase.from("xp_events").select("created_at").eq("user_id", userId).order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  if (lastEvent?.created_at) {
    const lastTime = new Date(lastEvent.created_at).getTime();
    const now = Date.now();
    if (now - lastTime > 24 * 60 * 60 * 1e3) {
      data.current_streak = 0;
    }
  } else {
    data.current_streak = 0;
  }
  return data;
});
const updateProfile_createServerFn_handler = createServerRpc({
  id: "b7ff9bb7d762a81cb8704aba02fb217741ea3bc1d73535d2b4d0d4475b0ea5d8",
  name: "updateProfile",
  filename: "src/lib/learnova.functions.ts"
}, (opts) => updateProfile.__executeServer(opts));
const updateProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  display_name: stringType().min(1).max(80).optional(),
  preferred_language: enumType(["english", "bangla", "banglish"]).optional()
}).parse(d)).handler(updateProfile_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: updated,
    error
  } = await supabase.from("profiles").update(data).eq("id", userId).select("*").single();
  if (error) throw error;
  return updated;
});
function levelFromXp(xp) {
  return Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
}
const awardXp_createServerFn_handler = createServerRpc({
  id: "0a8085101806ca5c704ccec4ec31b55b8d67cc3055a3d1cb34cce3511894f6df",
  name: "awardXp",
  filename: "src/lib/learnova.functions.ts"
}, (opts) => awardXp.__executeServer(opts));
const awardXp = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  amount: numberType().int().min(1).max(500),
  reason: stringType().min(1).max(120)
}).parse(d)).handler(awardXp_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const oneTimeReasons = ["Chat with Nova", "Voice chat with Nova", "Used Draw to Learn", "Summarized notes", "Generated Audio Podcast"];
  if (oneTimeReasons.includes(data.reason)) {
    const {
      data: existing
    } = await supabase.from("xp_events").select("id").eq("user_id", userId).eq("reason", data.reason).limit(1).maybeSingle();
    if (existing) {
      const {
        data: p2
      } = await supabase.from("profiles").select("*").eq("id", userId).single();
      return {
        profile: p2,
        awarded: 0
      };
    }
  }
  const {
    data: lastEvent
  } = await supabase.from("xp_events").select("created_at").eq("user_id", userId).order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  await supabase.from("xp_events").insert({
    user_id: userId,
    amount: data.amount,
    reason: data.reason
  });
  const {
    data: p
  } = await supabase.from("profiles").select("xp,current_streak,longest_streak,last_active_date").eq("id", userId).single();
  const newXp = (p?.xp ?? 0) + data.amount;
  const newLevel = levelFromXp(newXp);
  const nowStr = (/* @__PURE__ */ new Date()).toISOString();
  const now = new Date(nowStr).getTime();
  const lastTime = lastEvent?.created_at ? new Date(lastEvent.created_at).getTime() : 0;
  const diff = now - lastTime;
  let streak = p?.current_streak ?? 0;
  if (streak === 0 || lastTime === 0) {
    streak = 1;
  } else if (diff > 24 * 60 * 60 * 1e3) {
    streak = 1;
  } else {
    if (new Date(nowStr).getDate() !== new Date(lastTime).getDate()) {
      streak += 1;
    }
  }
  const longest = Math.max(p?.longest_streak ?? 0, streak);
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const {
    data: updated
  } = await supabase.from("profiles").update({
    xp: newXp,
    level: newLevel,
    current_streak: streak,
    longest_streak: longest,
    last_active_date: todayStr
  }).eq("id", userId).select("*").single();
  const badges = [];
  if (newXp >= 100) badges.push({
    code: "first_100",
    name: "First 100 XP",
    description: "You earned 100 XP!",
    icon: "⭐"
  });
  if (newLevel >= 5) badges.push({
    code: "level_5",
    name: "Rising Star",
    description: "Reached level 5",
    icon: "🌟"
  });
  if (streak >= 3) badges.push({
    code: "streak_3",
    name: "On Fire",
    description: "3-day streak",
    icon: "🔥"
  });
  if (streak >= 7) badges.push({
    code: "streak_7",
    name: "Unstoppable",
    description: "7-day streak",
    icon: "💎"
  });
  for (const b of badges) {
    await supabase.from("badges").insert({
      user_id: userId,
      ...b
    }).select().maybeSingle();
  }
  return {
    profile: updated,
    awarded: data.amount
  };
});
const listThreads_createServerFn_handler = createServerRpc({
  id: "807b46fd34ccb53aee8d2323f2f49d06048a688cef95bded43d46e17a905e130",
  name: "listThreads",
  filename: "src/lib/learnova.functions.ts"
}, (opts) => listThreads.__executeServer(opts));
const listThreads = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listThreads_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("threads").select("*").eq("user_id", userId).order("updated_at", {
    ascending: false
  }).limit(100);
  if (error) throw error;
  return data ?? [];
});
const createThread_createServerFn_handler = createServerRpc({
  id: "c7bda1f65790bbfa3dd835523f816c6e03aeb264230f3f310a845e947ed9a0df",
  name: "createThread",
  filename: "src/lib/learnova.functions.ts"
}, (opts) => createThread.__executeServer(opts));
const createThread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  title: stringType().max(120).optional(),
  subject: stringType().max(60).optional()
}).parse(d)).handler(createThread_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: t,
    error
  } = await supabase.from("threads").insert({
    user_id: userId,
    title: data.title ?? "New chat",
    subject: data.subject ?? null
  }).select("*").single();
  if (error) throw error;
  return t;
});
const deleteThread_createServerFn_handler = createServerRpc({
  id: "d77a95895b0a42df2722c950307f63e14d619ba3f481a38e08c40b01d167dd32",
  name: "deleteThread",
  filename: "src/lib/learnova.functions.ts"
}, (opts) => deleteThread.__executeServer(opts));
const deleteThread = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteThread_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("threads").delete().eq("id", data.id).eq("user_id", userId);
  if (error) throw error;
  return {
    ok: true
  };
});
const getThreadMessages_createServerFn_handler = createServerRpc({
  id: "977a307db3b12d62b2b86e112fd47189f08ef3be335fe72593b0421de09a73d5",
  name: "getThreadMessages",
  filename: "src/lib/learnova.functions.ts"
}, (opts) => getThreadMessages.__executeServer(opts));
const getThreadMessages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  threadId: stringType().uuid()
}).parse(d)).handler(getThreadMessages_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: t
  } = await supabase.from("threads").select("*").eq("id", data.threadId).eq("user_id", userId).maybeSingle();
  if (!t) throw new Error("Thread not found");
  const {
    data: msgs,
    error
  } = await supabase.from("messages").select("*").eq("thread_id", data.threadId).order("created_at", {
    ascending: true
  });
  if (error) throw error;
  return {
    thread: t,
    messages: msgs ?? []
  };
});
const saveMessage_createServerFn_handler = createServerRpc({
  id: "696da997bc432283232876748c665c27d205fec22d987ffc1b6948fb98061ff0",
  name: "saveMessage",
  filename: "src/lib/learnova.functions.ts"
}, (opts) => saveMessage.__executeServer(opts));
const saveMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  thread_id: stringType().uuid(),
  role: enumType(["user", "assistant"]),
  content: stringType().min(1).max(5e4),
  parts: unknownType().optional()
}).parse(d)).handler(saveMessage_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("messages").insert({
    thread_id: data.thread_id,
    user_id: userId,
    role: data.role,
    content: data.content,
    parts: data.parts ?? null
  });
  if (error) throw error;
  await supabase.from("threads").update({
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.thread_id);
  if (data.role === "user") {
    const {
      data: t
    } = await supabase.from("threads").select("title").eq("id", data.thread_id).single();
    if (t && t.title === "New chat") {
      const title = data.content.slice(0, 60).replace(/\n/g, " ").trim();
      await supabase.from("threads").update({
        title
      }).eq("id", data.thread_id);
    }
  }
  return {
    ok: true
  };
});
const listBadges_createServerFn_handler = createServerRpc({
  id: "8298200df457bf6c3defa152606ad9cf8e39c5b1fdfa069056490728ad0022e1",
  name: "listBadges",
  filename: "src/lib/learnova.functions.ts"
}, (opts) => listBadges.__executeServer(opts));
const listBadges = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listBadges_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data
  } = await supabase.from("badges").select("*").eq("user_id", userId).order("earned_at", {
    ascending: false
  });
  return data ?? [];
});
const xpHistory_createServerFn_handler = createServerRpc({
  id: "362c02b0a718f55c96672705bcf6d2b090915d42b9be5bdf464d5641b2123d53",
  name: "xpHistory",
  filename: "src/lib/learnova.functions.ts"
}, (opts) => xpHistory.__executeServer(opts));
const xpHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(xpHistory_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data
  } = await supabase.from("xp_events").select("*").eq("user_id", userId).order("created_at", {
    ascending: false
  }).limit(30);
  return data ?? [];
});
export {
  awardXp_createServerFn_handler,
  createThread_createServerFn_handler,
  deleteThread_createServerFn_handler,
  getProfile_createServerFn_handler,
  getThreadMessages_createServerFn_handler,
  listBadges_createServerFn_handler,
  listThreads_createServerFn_handler,
  saveMessage_createServerFn_handler,
  updateProfile_createServerFn_handler,
  xpHistory_createServerFn_handler
};
