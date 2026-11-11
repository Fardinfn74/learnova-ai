// Thin, typed-by-hand wrappers around Supabase RPCs. The generated `Database` type predates the
// new SQL functions, so these helpers keep call sites honest without `any` leaking everywhere.
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export function adminConfigured(): boolean {
  const env = typeof process !== "undefined" ? process.env : ({} as Record<string, string | undefined>);
  return Boolean(env.SUPABASE_SERVICE_ROLE_KEY && (env.SUPABASE_URL || env.VITE_SUPABASE_URL));
}

/** Call a SQL function as the signed-in user (RLS + auth.uid() apply). */
export async function userRpc<T = unknown>(
  client: SupabaseClient<any, any, any>,
  fn: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const { data, error } = await (client as any).rpc(fn, args);
  if (error) throw new Error(cleanDbError(error.message));
  return data as T;
}

/** Call a service-role-only SQL function. Never reachable from the browser. */
export async function adminRpc<T = unknown>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await (supabaseAdmin as any).rpc(fn, args);
  if (error) throw new Error(cleanDbError(error.message));
  return data as T;
}

export function admin(): SupabaseClient<any, any, any> {
  return supabaseAdmin as unknown as SupabaseClient<any, any, any>;
}

/** Postgres messages we raise on purpose are safe to show; anything else becomes generic. */
const FRIENDLY = [
  "battle is no longer available", "battle is not in progress", "battle not found", "out of order answer",
  "room not found", "quiz not found", "only verified creators can do this", "guest accounts cannot apply to teach",
  "too many unfinished drafts (max 10)", "you already have 3 videos waiting for review", "video not found",
  "video not available", "a reason is required", "staff only",
];
export function cleanDbError(message: string): string {
  const hit = FRIENDLY.find((m) => message.toLowerCase().includes(m));
  if (hit) return hit.charAt(0).toUpperCase() + hit.slice(1);
  console.error("[db]", message);
  return "Something went wrong. Please try again.";
}

/** Awards XP through the server-only rule engine. Never throws: XP must not break a feature. */
export async function grantXp(userId: string, rule: string, ref?: string | null, units = 1): Promise<number> {
  if (!adminConfigured()) return 0;
  try {
    const n = await adminRpc<number>("grant_xp", { p_user: userId, p_rule: rule, p_ref: ref ?? null, p_units: units });
    return typeof n === "number" ? n : 0;
  } catch (e) {
    console.warn("[xp] grant failed", rule, e instanceof Error ? e.message : e);
    return 0;
  }
}
