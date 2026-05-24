import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { summarizeNote, listNotes, getNote } from "@/lib/learn-ai.functions";
import { awardXp } from "@/lib/learnova.functions";
import { FileText, Loader2, Upload, ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { extractPdfText, PDF_LIMITS } from "@/lib/pdf-sandbox";

export const Route = createFileRoute("/app/notes")({ component: NotesPage });

type Note = { id: string; title: string; summary: string; flashcards: { question: string; answer: string }[] };

function NotesPage() {
  const qc = useQueryClient();
  const sum = useServerFn(summarizeNote);
  const list = useServerFn(listNotes);
  const get = useServerFn(getNote);
  const award = useServerFn(awardXp);

  const { data: notes } = useQuery({ queryKey: ["notes"], queryFn: () => list() });
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<"english"|"bangla"|"banglish">("english");
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<Note | null>(null);
  const [pdfProgress, setPdfProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      setPdfProgress(0);
      const extracted = await extractPdfText(f, (p) => setPdfProgress(p));
      if (!extracted || extracted.length < 50) {
        toast.error("Couldn't read text from this PDF (scanned image?)");
        return;
      }
      setText(prev => (prev ? prev + "\n\n" : "") + extracted);
      toast.success(`Extracted ${extracted.length.toLocaleString()} chars from "${f.name}"`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF failed");
    } finally {
      setPdfProgress(null);
    }
  }

  async function summarize() {
    if (text.trim().length < 50) { toast.error("Paste at least 50 characters"); return; }
    setBusy(true);
    try {
      const n = await sum({ data: { text, language } });
      setActive(n as unknown as Note);
      setText("");
      await award({ data: { amount: 12, reason: "Summarized notes" } });
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  }

  async function open(id: string) {
    const n = await get({ data: { id } });
    setActive(n as unknown as Note);
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl gradient-hero grid place-items-center text-white shadow-glow"><FileText className="h-6 w-6"/></div>
        <div>
          <h1 className="text-2xl font-bold">Summarizer & flashcards</h1>
          <p className="text-sm text-muted-foreground">Paste notes or text from a PDF — get a summary and flashcards</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-4">
          <div className="glass rounded-2xl p-5 ring-gradient">
            <textarea value={text} onChange={e=>setText(e.target.value)} rows={8}
              placeholder="Paste your study material here, or upload a PDF…"
              className="w-full bg-transparent outline-none resize-none text-sm"/>
            <div className="flex flex-wrap justify-between items-center gap-3 mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 flex-wrap">
                <select value={language} onChange={e=>setLanguage(e.target.value as "english"|"bangla"|"banglish")}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  <option value="english">English</option><option value="bangla">বাংলা</option><option value="banglish">Banglish</option>
                </select>
                <input ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={onPdf} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={pdfProgress !== null}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted transition disabled:opacity-50">
                  {pdfProgress !== null
                    ? <><Loader2 className="h-4 w-4 animate-spin"/> Reading PDF {pdfProgress}%</>
                    : <><Upload className="h-4 w-4"/> Upload PDF</>}
                </button>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3 w-3"/> Sandboxed · max {Math.round(PDF_LIMITS.MAX_BYTES/1024/1024)}MB · {PDF_LIMITS.MAX_PAGES} pages
                </span>
              </div>
              <button onClick={summarize} disabled={busy}
                className="rounded-xl gradient-hero px-5 py-2.5 font-semibold text-primary-foreground shadow-glow flex items-center gap-2 disabled:opacity-50">
                {busy ? <><Loader2 className="h-4 w-4 animate-spin"/> Summarizing...</> : "Summarize ✨"}
              </button>
            </div>
          </div>

          {active && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold gradient-text">{active.title}</h2>
              <div className="mt-3 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{active.summary}</ReactMarkdown>
              </div>
              <div className="mt-5">
                <h3 className="font-semibold mb-2">📇 Flashcards</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {active.flashcards?.map((f, i) => (
                    <details key={i} className="glass rounded-xl p-3 cursor-pointer">
                      <summary className="font-medium text-sm">{f.question}</summary>
                      <p className="mt-2 text-sm text-muted-foreground">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-2">
          <h3 className="font-semibold text-sm px-2">Your notes</h3>
          {!notes?.length && <p className="text-xs text-muted-foreground px-2">No notes yet.</p>}
          {notes?.map(n => (
            <button key={n.id} onClick={() => open(n.id)}
              className="block w-full text-left glass rounded-xl px-3 py-2.5 text-sm hover:scale-[1.02] transition">
              {n.title}
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
}
