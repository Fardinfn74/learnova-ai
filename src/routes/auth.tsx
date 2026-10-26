import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Nova } from "@/components/Nova";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in · LEARNOVA" }] }),
});

function AuthPage() {
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) nav({ to: "/app/dashboard" });
  }, [user, loading, nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Welcome to LEARNOVA! 🎉");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/app/dashboard",
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign in failed";
      toast.error(message);
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: branded panel */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-20" />
        <Nova size={280} />
        <h2 className="mt-8 text-4xl font-bold text-center">Hi, I'm <span className="gradient-text">Nova</span>!</h2>
        <p className="mt-2 text-muted-foreground text-center max-w-sm">
          Your patient, multilingual AI tutor. Let's make today's learning fun.
        </p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md glass rounded-3xl p-8 shadow-glow">
          <h1 className="text-3xl font-bold">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signup" ? "Start learning with Nova in seconds." : "Sign in to continue your journey."}
          </p>

          <button onClick={google} disabled={busy}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted py-3 font-medium transition">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border"/>or<div className="h-px flex-1 bg-border"/>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" required
                className="w-full rounded-xl border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"/>
            )}
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required
              className="w-full rounded-xl border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"/>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password (min 6)" required minLength={6}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"/>
            <button disabled={busy} className="w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground shadow-glow flex items-center justify-center gap-2">
              {busy && <Loader2 className="h-4 w-4 animate-spin"/>}
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-center mt-5 text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New to LEARNOVA?"}{" "}
            <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="text-primary font-semibold hover:underline">
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
