import { createFileRoute, Link } from "@tanstack/react-router";
import { Nova } from "@/components/Nova";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Reveal } from "@/hooks/use-reveal";
import { Sparkles, BookOpen, Code2, Trophy, Languages, FileText, Brain, MessageSquare, Target, Shield, Mic, Swords, Headphones, Users, Pencil } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "LEARNOVA — Adaptive AI tutor with Nova" },
      { name: "description", content: "Meet Nova: your friendly AI tutor for personalized learning paths, quizzes, coding help, PDF summaries and XP-based progress. Bangla, Banglish, English." },
    ],
  }),
});

const features = [
  { icon: Brain, title: "Personalized paths", desc: "Nova adapts to your level and goals every session." },
  { icon: Languages, title: "Bangla • Banglish • English", desc: "Chat in any mix — Nova understands all three." },
  { icon: MessageSquare, title: "Step-by-step explanations", desc: "Concepts broken down until they truly click." },
  { icon: Code2, title: "Coding + debugging", desc: "Live code help with explanations, not just answers." },
  { icon: Target, title: "Quizzes & mock tests", desc: "AI-generated quizzes that target your weak spots." },
  { icon: BookOpen, title: "PDF & note summaries", desc: "Upload notes — get summaries + flashcards instantly." },
  { icon: Mic, title: "Voice chat with Nova", desc: "Talk out loud — Nova listens and replies with a warm voice." },
  { icon: Swords, title: "Multiplayer Battles", desc: "Compete in live quiz battles with your friends." },
  { icon: Headphones, title: "AI Podcasts", desc: "Turn any topic into an engaging two-host podcast." },
  { icon: Users, title: "Study Rooms", desc: "Collaborate and learn with friends in real-time." },
  { icon: Pencil, title: "Draw to Learn", desc: "Draw math or diagrams and get instant AI solutions." },
  { icon: Trophy, title: "XP, levels & badges", desc: "Earn rewards as you learn. Streaks keep you going." },
  { icon: Shield, title: "Safe & student-friendly", desc: "Responses tuned for learners. Always supportive." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="h-9 w-9 rounded-xl gradient-hero shadow-glow grid place-items-center text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="gradient-text font-display tracking-tight">LEARNOVA</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/docs" className="hover:text-foreground transition">Docs</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/auth" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-muted transition">Sign in</Link>
            <Link to="/auth" className="text-sm font-semibold px-5 py-2 rounded-full gradient-hero text-primary-foreground shadow-glow hover:scale-105 transition">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-nova animate-pulse" />
              Powered by adaptive AI · Built for every learner
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight">
              Meet <span className="gradient-text">Nova</span>,<br/>
              your personal<br/>AI tutor.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              LEARNOVA is the adaptive multimodal tutor that explains anything — in Bangla, Banglish or English.
              Coding help, step-by-step solutions, quizzes, summaries, and XP-based progress. All in one place.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/auth" className="rounded-full gradient-hero px-7 py-3.5 font-semibold text-primary-foreground shadow-glow hover:scale-105 transition">
                Start learning free
              </Link>
              <a href="#features" className="rounded-full glass px-7 py-3.5 font-semibold hover:scale-105 transition">
                Explore features
              </a>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5"/> Safe responses</span>
              <span className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5"/> XP & badges</span>
              <span className="flex items-center gap-1.5"><Languages className="h-3.5 w-3.5"/> 3 languages</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full gradient-hero opacity-20 blur-3xl animate-pulse-glow" />
            <div className="absolute h-80 w-80 rounded-full border border-white/30 animate-spin-slow" />
            <div className="absolute h-96 w-96 rounded-full border border-white/20 animate-spin-slow" style={{ animationDirection: "reverse" }} />
            <Nova size={360} priority />
            {/* Floating chips */}
            <div className="absolute top-4 left-4 glass rounded-2xl px-3 py-2 text-xs font-medium animate-float">📚 Math chapter 4</div>
            <div className="absolute bottom-10 right-2 glass rounded-2xl px-3 py-2 text-xs font-medium animate-float" style={{ animationDelay: "-2s" }}>⚡ +25 XP</div>
            <div className="absolute top-1/2 -left-4 glass rounded-2xl px-3 py-2 text-xs font-medium animate-float" style={{ animationDelay: "-1s" }}>🇧🇩 বাংলা</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <Reveal className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold">Everything a learner needs.<br/><span className="gradient-text">Nothing they don't.</span></h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Ten features built around how students actually learn — from first concept to mock test.</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 70} className="group glass tilt-card rounded-3xl p-6 hover:shadow-glow">
              <div className="h-12 w-12 rounded-2xl gradient-nova grid place-items-center text-white shadow-glow mb-4 group-hover:scale-110 transition">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "01", t: "Tell Nova your goal", d: "From SSC chemistry to React debugging — say what you want to learn." },
            { n: "02", t: "Learn your way", d: "Chat, quizzes, code help, or summarize a PDF. Nova adapts to your pace." },
            { n: "03", t: "Level up", d: "Earn XP, unlock badges, keep your streak alive — progress feels like a game." },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 120} className="glass rounded-3xl p-8 ring-gradient">
              <div className="text-5xl font-display font-bold gradient-text">{s.n}</div>
              <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* MEET NOVA */}
      <section id="nova" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="glass rounded-[2.5rem] p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center ring-gradient">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold">Say hi to <span className="gradient-text">Nova</span> 👋</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Nova isn't a search engine. Nova is a patient tutor that asks the right questions,
              corrects gently, celebrates progress, and never judges. Built with safety guardrails so
              parents can trust it and students can love it.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["🧠 Adaptive", "🇧🇩 Bangla", "💬 Banglish", "🇬🇧 English", "🧒 Safe", "✨ Free"].map(x => (
                <span key={x} className="rounded-full glass px-3 py-1 text-xs font-medium">{x}</span>
              ))}
            </div>
            <Link to="/auth" className="mt-7 inline-flex rounded-full gradient-hero px-7 py-3 font-semibold text-primary-foreground shadow-glow">
              Start a conversation
            </Link>
          </div>
          <div className="flex items-center justify-center">
            <Nova size={300} />
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          The future of learning<br/>is <span className="gradient-text">personal</span>.
        </h2>
        <p className="mt-5 text-muted-foreground max-w-xl mx-auto">Join LEARNOVA. Get a tutor that knows you, fits your schedule, and grows with you.</p>
        <Link to="/auth" className="mt-8 inline-flex rounded-full gradient-hero px-10 py-4 text-lg font-semibold text-primary-foreground shadow-glow hover:scale-105 transition">
          Get started — it's free
        </Link>
      </section>

      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        <span className="animate-pulse-glow inline-block">
          Created by VisionX for learners. <span className="gradient-text font-semibold">LEARNOVA-AI</span> · {new Date().getFullYear()}
        </span>
      </footer>

      {/* Floating mini Nova */}
      <Link to="/auth" className="fixed bottom-6 right-6 z-30 hover:scale-110 transition" title="Chat with Nova">
        <div className="relative">
          <div className="absolute inset-0 rounded-full gradient-hero blur-2xl opacity-50" />
          <div className="relative glass rounded-full p-2 shadow-glow">
            <Nova size={64} float glow={false} />
          </div>
        </div>
      </Link>
    </div>
  );
}
