import { c as createMiddleware, g as getRequest } from "./index.mjs";
import { c as createClient } from "./index-B082ds2F.mjs";
const __vite_import_meta_env__ = {};
const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || __vite_import_meta_env__?.VITE_SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || __vite_import_meta_env__?.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      const missing = [
        ...!SUPABASE_URL ? ["SUPABASE_URL"] : [],
        ...!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []
      ];
      console.error(`[Supabase] Missing env variables: ${missing.join(", ")}.`);
      throw new Error("Server configuration error");
    }
    const request = getRequest();
    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized: No authorization header provided");
    }
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false }
      }
    );
    const { data: userData, error } = await supabase.auth.getUser(token);
    if (error || !userData?.user?.id) {
      throw new Error("Unauthorized: Invalid token");
    }
    return next({
      context: {
        supabase,
        userId: userData.user.id,
        claims: { sub: userData.user.id }
      }
    });
  }
);
export {
  requireSupabaseAuth as r
};
