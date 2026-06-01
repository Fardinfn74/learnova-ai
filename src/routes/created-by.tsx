import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/hooks/use-reveal";
import { Instagram, Phone, User, Info, Send, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/created-by")({
  component: CreatedByPage,
  head: () => ({
    meta: [
      { title: "Created By — LEARNOVA" },
      { name: "description", content: "Meet the brilliant minds behind LEARNOVA." },
    ],
  }),
});

const team = [
  {
    name: "Fardin FN",
    role: "The Visionary",
    image: "/fardin-fn.png",
    about: ["Team Leader", "AI Engineer", "Full Stack Developer"],
    instagram: "https://www.instagram.com/its_fardinn_?igsh=NDYzaXN3M3VteGJ4",
    whatsapp: "+8801626427659",
  },
  {
    name: "Ahnaf Tahmid Nafi",
    role: "The Architect",
    image: "/ahnaf-nafi.png",
    about: ["Frontend Developer", "Presentation Maker"],
    instagram: "https://www.instagram.com/ahnaf_tahmid_?igsh=bGE1dnY2bWJlMDBi",
    whatsapp: "+8801814837020",
  },
  {
    name: "Erina Siddiqua Eram",
    role: "The Curator",
    image: "/erina-eram.png",
    about: ["Ux Coordinator", "Content Coordinator"],
    instagram: "https://www.instagram.com/erina_eram_?igsh=aHdlamRwOHlzaXNv",
    whatsapp: "+8801832302632",
  },
  {
    name: "Ramisa Anjum Simi",
    role: "The Analyst",
    image: "/ramisa-simi.png",
    about: ["Research", "Documentation"],
    instagram: "https://www.instagram.com/ramis_a_anjum?igsh=MWdiYjEzOW1ocDlydw==",
    whatsapp: "+8801870689173",
  },
  {
    name: "Ramis Fariha Bhabna",
    role: "The Strategist",
    image: "/fariha-bhabna.png",
    about: ["Testing", "Media Coordinator"],
    instagram: "https://www.instagram.com/aint_your_batash?igsh=MTZwcG04aDMyZWFhdg==",
    whatsapp: "",
  },
];

function CreatedByPage() {
  return (
    <div className="min-h-screen selection:bg-amber-200/30 bg-background text-foreground pb-20">
      <main className="max-w-6xl mx-auto px-6 pt-20 md:pt-32">
        <Reveal className="text-center mb-24">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Meet the <span className="gradient-text">Creators</span>
          </h1>
          <p className="text-muted-foreground text-lg">The passionate team behind LEARNOVA.</p>
        </Reveal>

        <div className="space-y-32">
          {team.map((member, idx) => (
            <Reveal key={member.name} delay={idx * 100}>
              <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 w-full">
                {/* Profile Picture */}
                <div className="relative group">
                  {/* White-Gold Glow Effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-white via-amber-200 to-yellow-500 rounded-full opacity-30 group-hover:opacity-60 blur-2xl transition duration-1000 animate-pulse" />

                  <div className="relative h-64 w-64 md:h-80 md:w-80 rounded-full p-1.5 bg-gradient-to-tr from-white/40 via-amber-200/40 to-yellow-500/40 shadow-glow transition-transform duration-700 group-hover:scale-105">
                    <div className="h-full w-full rounded-full overflow-hidden border-2 border-white/20 relative">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-full w-full object-cover scale-105 group-hover:scale-100 transition duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                    </div>
                  </div>
                </div>

                {/* Information Box */}
                <div className="relative w-full max-w-lg">
                  <div className="absolute -inset-1 bg-gradient-to-r from-white/10 via-amber-100/10 to-yellow-400/10 rounded-[2.5rem] blur-2xl" />

                  <div className="relative glass rounded-[2.5rem] p-8 md:p-10 border border-white/20 shadow-2xl backdrop-blur-3xl ring-1 ring-white/20 group hover:ring-amber-200/40 transition-all duration-500">
                    <div className="space-y-6">
                      {/* Name Section */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-amber-200/60 text-[10px] font-bold tracking-[0.3em] uppercase">
                          <User className="h-3 w-3" />
                          Name
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white group-hover:shimmer-gold transition-all">
                          {member.name}
                        </h2>
                        <div className="text-[10px] font-bold text-amber-200/40 tracking-[0.2em] uppercase pt-1">
                          {member.role}
                        </div>
                      </div>

                      {/* About Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-amber-200/60 text-[10px] font-bold tracking-[0.3em] uppercase">
                          <Info className="h-3 w-3" />
                          About
                        </div>
                        <ul className="space-y-2">
                          {member.about.map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-white/90 font-medium">
                              <ArrowRight className="h-4 w-4 text-amber-200/60" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Contact Section */}
                      <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-amber-200/60 text-[10px] font-bold tracking-[0.3em] uppercase">
                          <Send className="h-3 w-3" />
                          Contact
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          {member.whatsapp && (
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 hover:border-amber-200/30 transition-colors">
                              <Phone className="h-4 w-4 text-amber-200" />
                              <span className="font-mono text-sm tracking-tight text-white/80">{member.whatsapp}</span>
                            </div>
                          )}

                          <a
                            href={member.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 group/link px-4 py-2 rounded-2xl bg-gradient-to-tr from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(253,29,29,0.3)]"
                          >
                            <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shadow-lg group-hover/link:scale-110 transition-transform group-hover/link:shadow-[0_0_15px_rgba(253,29,29,0.5)]">
                              <Instagram className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-white text-sm font-bold group-hover/link:text-amber-200 transition-colors drop-shadow-sm">
                              Instagram
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <footer className="mt-40 text-center">
          <Link
            to="/"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 focus:outline-none"
          >
            <span className="mr-2">←</span> Back to Home
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-200 to-yellow-500 rounded-full blur opacity-0 group-hover:opacity-20 transition duration-500" />
          </Link>
        </footer>
      </main>
    </div>
  );
}
