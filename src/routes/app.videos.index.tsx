import { toast } from "sonner";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, PlaySquare, Search, ShieldCheck, BadgeCheck, Clapperboard, Sparkles } from "lucide-react";
import { listCatalog, verifyEducationalVideo } from "@/lib/video.functions";
import { GRADES, GRADE_LABEL, LANGS, LANG_LABEL, SUBJECTS, SUBJECT_LABEL, fmtDuration } from "@/lib/video-labels";

export const Route = createFileRoute("/app/videos/")({ component: VideosPage });

type Card = {
  id: string; title: string; subject: string; grade_band: string; language: string; duration_seconds: number | null;
  thumbnail_url: string | null; view_count: number; creator_name: string;
};


type GuardrailState = {
  status: "APPROVED" | "FLAGGED_FOR_REVIEW" | "REJECTED";
  pedagogyScore: number;
  reason: string;
  violations: string[];
  suggestedImprovements: string[];
};

function GuardrailTester() {
  const verifyFn = useServerFn(verifyEducationalVideo);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<GuardrailState | null>(null);
  const [title, setTitle] = useState("Step-by-Step Calculus: Limits & Derivatives Explained Simply");
  const [desc, setDesc] = useState("A complete lesson breaking down geometric intuition of derivatives, epsilon-delta definitions, and practical physics examples for college students.");
  const [creator, setCreator] = useState("Prof. Tanvir Ahmed (Math Faculty)");
  const [notes, setNotes] = useState("1. Rate of change definition\n2. Power rule proof\n3. Velocity modeling");

  const loadPreset = (type: "valid" | "cringe" | "nsfw") => {
    setResult(null);
    if (type === "valid") {
      setTitle("Step-by-Step Calculus: Limits & Derivatives Explained Simply");
      setCreator("Prof. Tanvir Ahmed (Math Faculty)");
      setDesc("A complete lesson breaking down geometric intuition of derivatives, epsilon-delta definitions, and practical physics examples for college students.");
      setNotes("1. Rate of change definition\n2. Power rule proof\n3. Velocity modeling");
    } else if (type === "cringe") {
      setTitle("😱 YOU WON'T BELIEVE WHAT HAPPENS NEXT!! 24 HR PRANK (GONE WRONG)");
      setCreator("MemeLord99 (Influencer)");
      setDesc("Watch till the end to see the craziest prank ever! Smash that subscribe button and hit the bell icon!");
      setNotes("No educational content. Just funny meme screaming and reaction faces.");
    } else {
      setTitle("Secret adult hacks and unrestricted darkweb tips 18+");
      setCreator("Anonymous Hacker");
      setDesc("How to bypass parental filters, adult dating secrets, and illegal downloads.");
      setNotes("Harmful unsafe links.");
    }
  };

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      const res = await verifyFn({
        data: {
          title,
          description: desc,
          creatorName: creator,
          keyLearnings: notes,
          category: "Math & Abacus",
          level: "Intermediate",
        }
      });
      setResult(res as unknown as GuardrailState);
    } catch (err: any) {
      toast.error(err?.message || "Guardrail evaluation error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mt-8 glass rounded-3xl p-6 md:p-8 border border-primary/20 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Interactive Judge Evaluator Simulator
          </div>
          <h2 className="text-xl font-bold">EduTube AI & Heuristic Guardrail Simulator</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Test real-time content filtering against cringe, brainrot, spam, and adult content before publishing.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button type="button" onClick={() => loadPreset("valid")} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30 transition">
            ✓ Valid Calculus
          </button>
          <button type="button" onClick={() => loadPreset("cringe")} className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30 transition">
            ⚠ Brainrot/Prank
          </button>
          <button type="button" onClick={() => loadPreset("nsfw")} className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/30 transition">
            ⛔ Harmful/NSFW
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="font-semibold block mb-1">Lesson Title</label>
          <input className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="font-semibold block mb-1">Teacher / Creator</label>
          <input className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" value={creator} onChange={e => setCreator(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="font-semibold block mb-1">Description</label>
          <textarea rows={2} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="font-semibold block mb-1">Key Curriculum Learnings</label>
          <textarea rows={2} className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" disabled={testing} onClick={runTest} className="px-5 py-2.5 rounded-xl gradient-hero text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {testing ? "Analyzing Guardrail..." : "Run Guardrail Verification"}
        </button>
      </div>

      {result && (
        <div className={`p-5 rounded-2xl border ${result.status === "APPROVED" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200" : result.status === "REJECTED" ? "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200" : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"}`}>
          <div className="flex items-center justify-between font-bold text-sm">
            <span>Status: {result.status}</span>
            <span>Pedagogy Score: {result.pedagogyScore}/100</span>
          </div>
          <p className="text-xs mt-2 font-medium">{result.reason}</p>
          {result.violations?.length > 0 && (
            <div className="mt-2 text-xs">
              <span className="font-bold">Detected Violations:</span>
              <ul className="list-disc pl-4 mt-1">
                {result.violations.map((v, i) => <li key={i}>{v}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VideosPage() {
  const fetchCatalog = useServerFn(listCatalog);
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [language, setLanguage] = useState("");
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["catalog", subject, grade, language, applied],
    queryFn: () => fetchCatalog({ data: { subject: (subject || undefined) as never, grade: (grade || undefined) as never, language: (language || undefined) as never, q: applied || undefined } }),
  });
  const cards = (data ?? []) as Card[];
  const sel = "rounded-xl border border-border bg-card px-3 py-2 text-sm";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="glass rounded-3xl p-6 md:p-8 shadow-glow flex flex-col md:flex-row md:items-center gap-5">
        <div className="h-14 w-14 shrink-0 rounded-2xl gradient-hero grid place-items-center text-white shadow-glow"><PlaySquare className="h-7 w-7" aria-hidden /></div>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">Learn Tube</h1>
          <p className="text-sm text-muted-foreground mt-1">Lessons from verified teachers. Only learning content is allowed — no entertainment, no ads, no comments from strangers.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2.5 py-1"><BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Teachers are verified</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 px-2.5 py-1"><ShieldCheck className="h-3.5 w-3.5" aria-hidden /> AI check + human review before publishing</span>
          </div>
        </div>
        <Link to="/app/studio" className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm font-semibold hover:bg-muted"><Clapperboard className="h-4 w-4" aria-hidden /> Teach on Learn Tube</Link>
      </div>

      <form className="mt-6 flex flex-wrap gap-3" onSubmit={(e) => { e.preventDefault(); setApplied(q.trim()); }} role="search">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} maxLength={60} aria-label="Search videos" placeholder="Search lessons…" className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2 text-sm" />
        </div>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className={sel} aria-label="Subject">
          <option value="">All subjects</option>{SUBJECTS.map((s) => <option key={s} value={s}>{SUBJECT_LABEL[s]}</option>)}
        </select>
        <select value={grade} onChange={(e) => setGrade(e.target.value)} className={sel} aria-label="Level">
          <option value="">All levels</option>{GRADES.map((g) => <option key={g} value={g}>{GRADE_LABEL[g]}</option>)}
        </select>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className={sel} aria-label="Language">
          <option value="">Any language</option>{LANGS.map((l) => <option key={l} value={l}>{LANG_LABEL[l]}</option>)}
        </select>
      </form>

      <div className="mt-6">
        <GuardrailTester />

      {isLoading ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : isError ? (
          <p className="text-center text-muted-foreground py-16">Couldn't load videos. Please refresh.</p>
        ) : cards.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center">
            <PlaySquare className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" aria-hidden />
            <h2 className="font-semibold text-lg">No videos here yet</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">Every video is checked before it appears, so the library grows carefully. Are you a teacher? Apply to teach and be one of the first.</p>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((v) => (
              <li key={v.id}>
                <Link to="/app/videos/$videoId" params={{ videoId: v.id }} className="group block glass rounded-2xl overflow-hidden border border-border/40 hover:border-primary/50 transition">
                  <div className="relative aspect-video bg-gradient-to-br from-indigo-500/30 to-cyan-500/30">
                    {v.thumbnail_url ? <img src={v.thumbnail_url} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="h-full w-full grid place-items-center"><PlaySquare className="h-10 w-10 text-white/70" aria-hidden /></div>}
                    {v.duration_seconds ? <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white">{fmtDuration(v.duration_seconds)}</span> : null}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition">{v.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1"><BadgeCheck className="h-3.5 w-3.5 text-emerald-500" aria-label="Verified teacher" /> {v.creator_name}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                      <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5">{SUBJECT_LABEL[v.subject]}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5">{GRADE_LABEL[v.grade_band]?.split(" (")[0]}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5">{LANG_LABEL[v.language]}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
