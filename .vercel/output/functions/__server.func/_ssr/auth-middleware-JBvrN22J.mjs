import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import { c as createMiddleware, g as getRequest } from "./index.mjs";
const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://ogrhbvgoghberhiflmbc.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ncmhidmdvZ2hiZXJoaWZsbWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTU4MTQsImV4cCI6MjA5NDY5MTgxNH0.jR74YoXDVwXA1YBjks2crGc3mjg-_VeeuFC2XAS6Aoc";
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
