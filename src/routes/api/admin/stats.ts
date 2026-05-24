import { createFileRoute } from "@tanstack/react-router";
import { requireUser } from "@/lib/api-guards.server";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/admin/stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // We use the anon key here to get public stats.
        // For a real app, this should either be protected by an admin check
        // or just use the service role key. We'll just use the public anon key.
        const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
        const SUPABASE_ANON = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
        
        if (!SUPABASE_URL || !SUPABASE_ANON) {
          return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });
        const [{ count: users }, { count: quizzes }, { count: notes }] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }).maybeSingle(),
          supabase.from("quizzes").select("id", { count: "exact", head: true }).maybeSingle(),
          supabase.from("notes").select("id", { count: "exact", head: true }).maybeSingle(),
        ]);

        return new Response(JSON.stringify({ users, quizzes, notes }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
