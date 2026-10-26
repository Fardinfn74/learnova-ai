import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile, listBadges, xpHistory } from "@/lib/learnova.functions";
import { Nova } from "@/components/Nova";
import { MessageSquare, Target, FileText, Trophy, Flame, Zap, GraduationCap, BookOpen, Gamepad2, CreditCard, Sparkles } from "lucide-react";
import { isDemoActive, DEMO_USER_PROFILE } from "@/lib/demo-mode";

export const Route = createFileRoute("/app/dashboard")({ component: Dashboard });

function Dashboard() {
  const p = useServerFn(getProfile);
  const b = useServerFn(listBadges);
  const x = useServerFn(xpHistory);
  const isDemo = isDemoActive();

  const { data: profileData } = useQuery({ queryKey: ["profile"], queryFn: () => p(), enabled: !isDemo });
  const { data: badges } = useQuery({ queryKey: ["badges"], queryFn: () => b(), enabled: !isDemo });
  const { data: events } = useQuery({ queryKey: ["xp"], queryFn: () => x(), enabled: !isDemo });

  const activeProfile = profileData || (isDemo ? DEMO_USER_PROFILE : null);

  const tiles = [
    { to: "/app/courses", icon: GraduationCap, title: "Interactive Courses", desc: "Abacus, Phonics, Coding & Language", color: "from-amber-500 to-orange-500" },
    { to: "/app/library", icon: BookOpen, title: "Animated Library", desc: "Stories, workbooks & illustrated guides", color: "from-emerald-500 to-teal-500" },
    { to: "/app/games", icon: Gamepad2, title: "Learning Games", desc: "Math Sprint, Word Puzzles & Abacus Flash", color: "from-indigo-500 to-purple-500" },
    { to: "/app/chat", icon: MessageSquare, title: "Chat with Nova", desc: "Socratic AI tutor in Bangla & English", color: "from-purple-500 to-pink-500" },
    { to: "/app/quiz", icon: Target, title: "Adaptive Quizzes", desc: "AI mock tests & instant feedback", color: "from-blue-500 to-cyan-500" },
    { to: "/app/notes", icon: FileText, title: "Summarizer & PDF", desc: "Notes to summaries + flashcards", color: "from-amber-500 to-rose-500" },
    { to: "/app/pricing", icon: CreditCard, title: "Plans & Pricing", desc: "Flexible subscriptions (BDT / USD)", color: "from-rose-500 to-pink-600" },
    { to: "/app/badges", icon: Trophy, title: "Badges & Streaks", desc: `${badges?.length ?? (isDemo ? 3 : 0)} unlocked`, color: "from-teal-500 to-cyan-600" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="glass rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 shadow-glow">
        <Nova size={140} />
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Learnova Kids & Student Platform
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Welcome back, <span className="gradient-text">{activeProfile?.display_name ?? "Learner"}</span>! ✨</h1>
          <p className="text-muted-foreground mt-1">Explore Abacus courses, animated storybooks, speed math games, and Nova AI chat.</p>
          <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
            <Stat icon={Zap} label="XP" value={activeProfile?.xp ?? 1250} />
            <Stat icon={Trophy} label="Level" value={activeProfile?.level ?? 5} />
            <Stat icon={Flame} label="Streak" value={`${activeProfile?.current_streak ?? 3}d`} />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {tiles.map(t => (
          <Link key={t.to} to={t.to} className="group glass rounded-2xl p-5 hover:scale-[1.03] hover:shadow-glow transition">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${t.color} grid place-items-center text-white shadow-glow mb-3 group-hover:scale-110 transition`}>
              <t.icon className="h-5 w-5" />
            </div>
            <div className="font-semibold">{t.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{t.desc}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-3">Recent XP</h2>
          {!events?.length && <p className="text-sm text-muted-foreground">No activity yet — start a chat to earn your first XP!</p>}
          <ul className="space-y-2">
            {events?.slice(0, 8).map(e => (
              <li key={e.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{e.reason}</span>
                <span className="font-semibold text-primary">+{e.amount} XP</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-3">Latest badges</h2>
          {!badges?.length && <p className="text-sm text-muted-foreground">Earn XP to unlock badges 🏆</p>}
          <div className="grid grid-cols-3 gap-3">
            {badges?.slice(0, 6).map(b => (
              <div key={b.id} className="text-center glass rounded-xl p-3">
                <div className="text-3xl">{b.icon}</div>
                <div className="text-xs font-semibold mt-1">{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{className?:string}>; label: string; value: React.ReactNode }) {
  return (
    <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary"/>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
