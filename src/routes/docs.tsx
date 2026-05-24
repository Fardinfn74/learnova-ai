import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Nova } from "@/components/Nova";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Live documentation page for LEARNOVA.
 * The page is served at `/docs`.
 */
export const Route = createFileRoute("/docs")({
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="gradient-text font-display tracking-tight">LEARNOVA</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/auth" className="text-sm font-semibold px-5 py-2 rounded-full gradient-hero text-primary-foreground shadow-glow">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
        <div className="text-center space-y-4">
          <Nova size={120} glow={false} />
          <h1 className="text-4xl md:text-5xl font-bold gradient-text tracking-tight">LEARNOVA Documentation</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Technical overview and live system metrics for the LEARNOVA adaptive learning platform.
          </p>
        </div>

        {/* Elevator Pitch */}
        <section id="intro" className="glass rounded-3xl p-8 ring-gradient">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">🚀 Elevator Pitch</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong>LEARNOVA</strong> is an adaptive, multimodal AI tutor designed to make learning personalized and accessible. 
            Unlike traditional search engines or generic chatbots, Nova acts as a patient tutor—breaking down complex concepts step-by-step, 
            generating tailored quizzes, and summarizing study materials. It supports English, Bangla, and Banglish natively, 
            adapting to the user's proficiency level and learning style to ensure concepts truly click.
          </p>
        </section>

        {/* Live System Dashboard */}
        <section id="dashboard" className="glass rounded-3xl p-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">📊 Live System Metrics</h2>
          <LiveStats />
        </section>

        {/* Architecture Diagram */}
        <section id="architecture" className="glass rounded-3xl p-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">🏗️ Technical Architecture</h2>
          <div className="bg-card/50 rounded-xl p-6 border border-border/50 font-mono text-sm overflow-x-auto">
            <pre>
{`graph LR
    UI[React + TanStack Start] --> API[Server Functions]
    API --> Gemini[Gemini‑2.5‑Flash]
    API --> Supabase[Postgres (RLS)]
    UI --> PDFSandbox[PDF.js (client‑side)]
    UI --> Voice[Web Speech API]
    API --> Guardrails[Moderation & Safety]`}
            </pre>
          </div>
        </section>

        {/* API & Stack Details */}
        <section id="stack" className="glass rounded-3xl p-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">🛠️ Stack & Features</h2>
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex gap-3">
              <strong className="text-foreground min-w-[120px]">Frontend:</strong>
              React 19, TanStack Start, Tailwind CSS v4, Radix UI.
            </li>
            <li className="flex gap-3">
              <strong className="text-foreground min-w-[120px]">Backend:</strong>
              TanStack Start API Routes, Vercel/Cloudflare ready.
            </li>
            <li className="flex gap-3">
              <strong className="text-foreground min-w-[120px]">Database & Auth:</strong>
              Supabase (PostgreSQL with RLS), Email/Google OAuth.
            </li>
            <li className="flex gap-3">
              <strong className="text-foreground min-w-[120px]">AI Engine:</strong>
              Google Gemini 2.5 Flash via AI SDK, adaptive prompting.
            </li>
            <li className="flex gap-3">
              <strong className="text-foreground min-w-[120px]">Security:</strong>
              Regex-based content moderation, API rate limiting, safe prompts.
            </li>
          </ul>
        </section>

        <footer className="pt-8 pb-12 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition flex items-center justify-center gap-2">
            ← Back to Home
          </Link>
        </footer>
      </main>
    </div>
  );
}

/** Live stats component – polls admin stats endpoint */
function LiveStats() {
  const [stats, setStats] = useState<{ users: number; quizzes: number; notes: number }>({
    users: 0,
    quizzes: 0,
    notes: 0,
  });

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok && mounted) {
          setStats(await res.json());
        }
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
    }
    fetchStats();
    const id = setInterval(fetchStats, 30_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card/50 rounded-2xl p-6 text-center border border-border/50">
        <div className="text-4xl font-bold gradient-text">{stats.users}</div>
        <div className="text-sm text-muted-foreground mt-2 font-medium">Active Users</div>
      </div>
      <div className="bg-card/50 rounded-2xl p-6 text-center border border-border/50">
        <div className="text-4xl font-bold gradient-text">{stats.quizzes}</div>
        <div className="text-sm text-muted-foreground mt-2 font-medium">Quizzes Created</div>
      </div>
      <div className="bg-card/50 rounded-2xl p-6 text-center border border-border/50">
        <div className="text-4xl font-bold gradient-text">{stats.notes}</div>
        <div className="text-sm text-muted-foreground mt-2 font-medium">Summaries Saved</div>
      </div>
    </div>
  );
}


