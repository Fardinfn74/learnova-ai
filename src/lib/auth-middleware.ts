import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { authenticateToken, bearerToken, supabaseAnonKey, supabaseUrl } from "./auth.server";

/**
 * Authenticates every server function call.
 * context.supabase  -> client acting AS the user (RLS applies)
 * context.userId    -> verified user id
 * context.isAnonymous -> true for guest / judge-demo sessions
 */
export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) {
    console.error("[Supabase] Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY");
    throw new Error("Server configuration error");
  }

  const request = getRequest();
  if (!request?.headers) throw new Error("Unauthorized: No request headers available");

  const token = bearerToken(request);
  if (!token) throw new Error("Unauthorized: No authorization header provided");

  const user = await authenticateToken(token);
  if (!user) throw new Error("Unauthorized: Invalid token");

  const supabase = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return next({
    context: {
      supabase,
      userId: user.userId,
      isAnonymous: user.isAnonymous,
      claims: { sub: user.userId },
    },
  });
});
