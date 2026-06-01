import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Reveal } from "@/hooks/use-reveal";
import { Instagram, Phone, User, Info, Sparkles } from "lucide-react";

export const Route = createFileRoute("/created-by")({
  component: CreatedByPage,
  head: () => ({
    meta: [
      { title: "Created By — LEARNOVA" },
      { name: "description", content: "Meet the minds behind LEARNOVA." },
    ],
  }),
});

function CreatedByPage() {
  return (
    <div className="min-h-screen selection:bg-amber-200/30">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="h-9 w-9 rounded-xl gradient-hero shadow-glow grid place-items-center text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="gradient-text font-display tracking-tight">LEARNOVA</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/auth" className="text-sm font-semibold px-5 py-2 rounded-full gradient-hero text-primary-foreground shadow-glow hover:scale-105 transition">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20 md:py-32">
        <Reveal className="flex flex-col items-center">
          <h2 className="text-sm font-bold tracking-[0.2em] text-amber-200/60 uppercase mb-12">The Visionary</h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 w-full">
            {/* Profile Picture */}
            <div className="relative group">
              {/* White-Gold Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-white via-amber-200 to-yellow-500 rounded-full opacity-40 blur-2xl group-hover:opacity-70 transition duration-1000 animate-pulse" />

              <div className="relative h-72 w-72 md:h-96 md:w-96 rounded-full p-1.5 bg-gradient-to-tr from-white/50 via-amber-200/50 to-yellow-500/50 shadow-[0_0_50px_rgba(255,255,255,0.2)] animate-float">
                <div className="h-full w-full rounded-full overflow-hidden border-2 border-white/30 relative">
                  <img
                    src="/fardin.jpg"
                    alt="Fardin FN"
                    className="h-full w-full object-cover scale-105 group-hover:scale-100 transition duration-1000"
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                </div>
              </div>
            </div>

            {/* Information Box */}
            <div className="relative w-full max-w-lg">
              {/* Box Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-white/20 via-amber-100/20 to-yellow-400/20 rounded-[3rem] blur-2xl" />

              <div className="relative glass rounded-[3rem] p-10 md:p-12 border border-white/20 shadow-2xl backdrop-blur-3xl ring-1 ring-white/30 group hover:ring-amber-200/50 transition-all duration-500">
                <div className="space-y-8">
                  {/* Name Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-200/60 text-[10px] font-bold tracking-[0.3em] uppercase">
                      <User className="h-3 w-3" />
                      Name
                    </div>
                    <div className="relative inline-block">
                      <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white group-hover:shimmer-gold transition-all">
                        Fardin FN
                      </h1>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-200/60 text-[10px] font-bold tracking-[0.3em] uppercase">
                      <Info className="h-3 w-3" />
                      About
                    </div>
                    <p className="text-xl text-white/90 leading-relaxed font-medium">
                      Team Leader, Full Stack Developer, AI Engineer
                    </p>
                  </div>

                  {/* Contact Section */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-amber-200/60 text-[10px] font-bold tracking-[0.3em] uppercase">
                      <Phone className="h-3 w-3" />
                      Contact
                    </div>
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-4 text-white/80 group/item">
                        <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/item:border-amber-200/40 transition-colors shadow-soft">
                          <Phone className="h-5 w-5 text-amber-200" />
                        </div>
                        <span className="font-mono text-lg tracking-tight selection:bg-amber-500/30">+8801626427659</span>
                      </div>

                      <a
                        href="https://www.instagram.com/its_fardinn_?igsh=NDYzaXN3M3VteGJ4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-4 group/link w-fit"
                      >
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shadow-[0_0_20px_rgba(253,29,29,0.3)] group-hover/link:shadow-[0_0_30px_rgba(253,29,29,0.6)] group-hover/link:scale-110 transition-all duration-300">
                          <Instagram className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-white text-lg font-bold group-hover/link:text-amber-200 transition-colors drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                          Instagram
                        </span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Decorative particles/glows inside box */}
                <div className="absolute top-8 right-8 h-1 w-1 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
                <div className="absolute bottom-12 left-6 h-1.5 w-1.5 rounded-full bg-amber-200 animate-pulse delay-700 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
              </div>
            </div>
          </div>
        </Reveal>

        <footer className="mt-32 text-center pb-12">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition inline-flex items-center justify-center gap-2 text-sm font-medium">
            ← Back to Home
          </Link>
        </footer>
      </main>
    </div>
  );
}
