import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile } from "@/lib/learnova.functions";
import { supabase } from "@/integrations/supabase/client";
import { Nova } from "@/components/Nova";
import { MessageSquare, Target, FileText, Trophy, LogOut, Sparkles, Home, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const fetchProfile = useServerFn(getProfile);
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
    enabled: !!user,
  });

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);
  if (loading || !user) return <div className="min-h-screen grid place-items-center"><Nova size={120} /></div>;

  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xpForNext = (level * level) * 50;
  const progressPct = Math.min(100, (xp / xpForNext) * 100);

  const nav_items = [
    { to: "/app/dashboard", icon: Home, label: "Dashboard" },
    { to: "/app/chat", icon: MessageSquare, label: "Chat with Nova" },
    { to: "/app/voice", icon: Mic, label: "Voice with Nova" },
    { to: "/app/draw", icon: Sparkles, label: "Draw to Learn" },
    { to: "/app/podcast", icon: Mic, label: "Audio Podcast" },
    { to: "/app/quiz", icon: Target, label: "Quizzes" },
    { to: "/app/battle", icon: Sparkles, label: "Brain Battles" },
    { to: "/app/notes", icon: FileText, label: "Summarizer" },
    { to: "/app/rooms", icon: MessageSquare, label: "Study Rooms" },
    { to: "/app/badges", icon: Trophy, label: "Badges" },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-sidebar/60 backdrop-blur-xl p-4">
        <Link to="/" className="flex items-center gap-2 px-2 py-2 font-bold">
          <div className="h-9 w-9 rounded-xl gradient-hero grid place-items-center text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="gradient-text font-display text-lg">LEARNOVA</span>
        </Link>

        <div className="mt-6 glass rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Nova size={56} float={false} glow={false}/>
            <div>
              <div className="text-xs text-muted-foreground">Level</div>
              <div className="font-bold text-xl">{level}</div>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full gradient-hero transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>{xp} XP</span><span>{xpForNext}</span>
          </div>
          <div className="mt-2 text-xs">🔥 {profile?.current_streak ?? 0} day streak</div>
        </div>

        <nav className="mt-6 space-y-1 flex-1">
          {nav_items.map(i => {
            const active = loc.pathname.startsWith(i.to);
            return (
              <Link key={i.to} to={i.to} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                active ? "gradient-hero text-primary-foreground shadow-glow" : "hover:bg-sidebar-accent text-sidebar-foreground"
              )}>
                <i.icon className="h-4 w-4" /> {i.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-between gap-2 mt-2">
          <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-sidebar-accent flex-1">
            <LogOut className="h-4 w-4"/> Sign out
          </button>
          <ThemeToggle />
        </div>
      </aside>

      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/40 backdrop-blur-xl">
        <div className="flex items-center justify-around p-2">
          {nav_items.slice(0, 5).map(i => {
            const active = loc.pathname.startsWith(i.to);
            return (
              <Link key={i.to} to={i.to} className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                <i.icon className={cn("h-5 w-5", active && "text-primary")} />
                <span className="truncate max-w-[60px]">{i.label.replace("with Nova", "").trim()}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
