import { isDemoActive } from "@/lib/demo-mode";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, CheckCircle2, Clapperboard, Clock, Loader2, ShieldCheck, Upload, Wallet, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { applyToTeach, createVideoDraft, getCreatorStatus, listMyVideos, submitVideo } from "@/lib/video.functions";
import { GRADES, GRADE_LABEL, LANGS, LANG_LABEL, STATUS_LABEL, SUBJECTS, SUBJECT_LABEL, fmtDuration, fmtTaka } from "@/lib/video-labels";

export const Route = createFileRoute("/app/studio")({ component: StudioPage });

const MAX_BYTES = 500 * 1024 * 1024;
const EXT: Record<string, "mp4" | "webm" | "mov"> = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" };
const field = "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm";

function Rules() {
  return (
    <div className="glass rounded-2xl p-5 text-sm">
      <h2 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden /> Community rules (parents trust us because we enforce these)</h2>
      <div className="mt-3 grid sm:grid-cols-2 gap-4 text-xs leading-relaxed">
        <div><div className="font-semibold text-emerald-600 dark:text-emerald-300 mb-1">Allowed</div>
          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground"><li>Lessons, tutorials, worked examples, revision, exam prep</li><li>Skills training: coding, languages, arts, careers</li><li>Clear, age-appropriate teaching in Bangla, English or both</li></ul></div>
        <div><div className="font-semibold text-destructive mb-1">Never allowed</div>
          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground"><li>Entertainment, vlogs, memes, music, gossip, "challenges"</li><li>Anything sexual, violent, hateful, scary or unsafe for children</li><li>Adverts, links to other sites, contact details, politics</li><li>Content you don't own or have the right to teach with</li></ul></div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Every upload is checked by AI (title, speech, visuals) and then by a human reviewer before anyone can watch it. Three rejected videos suspend a channel.</p>
    </div>
  );
}

function Apply({ onDone }: { onDone: () => void }) {
  const apply = useServerFn(applyToTeach);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [creds, setCreds] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const toggle = (s: string) => setSubjects((cur) => cur.includes(s) ? cur.filter((x) => x !== s) : cur.length < 5 ? [...cur, s] : cur);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await apply({ data: { displayName: name, bio, subjects: subjects as never, credentials: creds } });
      toast.success("Application sent! We'll review your details.");
      onDone();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Couldn't send your application."); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-bold">Apply to teach</h2>
      <p className="text-sm text-muted-foreground">We verify every teacher before they can upload. Tell us who you are and what you teach.</p>
      <div><label htmlFor="dn" className="text-sm font-medium">Name shown to learners</label><input id="dn" required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={field + " mt-1"} /></div>
      <div><label htmlFor="bio" className="text-sm font-medium">Short bio</label><textarea id="bio" rows={2} maxLength={1000} value={bio} onChange={(e) => setBio(e.target.value)} className={field + " mt-1"} /></div>
      <fieldset><legend className="text-sm font-medium">Subjects (pick up to 5)</legend>
        <div className="mt-2 flex flex-wrap gap-2">{SUBJECTS.map((s) => (
          <button type="button" key={s} onClick={() => toggle(s)} aria-pressed={subjects.includes(s)} className={`rounded-full border px-3 py-1 text-xs ${subjects.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{SUBJECT_LABEL[s]}</button>))}</div></fieldset>
      <div><label htmlFor="cr" className="text-sm font-medium">Qualifications & teaching experience</label><textarea id="cr" required minLength={10} rows={3} maxLength={1500} value={creds} onChange={(e) => setCreds(e.target.value)} placeholder="Degree, school or coaching centre, years of experience, a profile link…" className={field + " mt-1"} /></div>
      <button disabled={busy || subjects.length === 0} className="rounded-xl gradient-hero px-5 py-2.5 font-semibold text-primary-foreground shadow-glow disabled:opacity-50">{busy ? "Sending…" : "Send application"}</button>
    </form>
  );
}

function Uploader({ onUploaded }: { onUploaded: () => void }) {
  const draft = useServerFn(createVideoDraft);
  const submit = useServerFn(submitVideo);
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({ title: "", description: "", subject: "mathematics", grade: "secondary", language: "bangla" });
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<"idle" | "creating" | "uploading" | "submitting">("idle");

  const pick = (fl: File | null) => {
    if (!fl) return setFile(null);
    if (!EXT[fl.type]) return toast.error("Please choose an MP4, WebM or MOV video.");
    if (fl.size > MAX_BYTES) return toast.error("That file is over 500 MB. Please compress it first.");
    setFile(fl);
  };

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Choose a video file first.");
    try {
      setPhase("creating");
      const { id, userId } = await draft({ data: { title: f.title, description: f.description, subject: f.subject as never, grade: f.grade as never, language: f.language as never } });
      setPhase("uploading");
      const ext = EXT[file.type];
      const { error } = await supabase.storage.from("videos").upload(`${userId}/${id}/source.${ext}`, file, { contentType: file.type, upsert: false });
      if (error) throw new Error("The upload failed. Check your connection and try again.");
      setPhase("submitting");
      await submit({ data: { id, ext } });
      toast.success("Uploaded! It will now be checked, then reviewed by our team.");
      setFile(null); setF({ ...f, title: "", description: "" });
      if (fileRef.current) fileRef.current.value = "";
      onUploaded();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Couldn't upload."); }
    finally { setPhase("idle"); }
  };
  const busy = phase !== "idle";

  return (
    <form onSubmit={go} className="glass rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2"><Upload className="h-5 w-5 text-primary" aria-hidden /> Upload a lesson</h2>
      <div><label htmlFor="vt" className="text-sm font-medium">Title</label><input id="vt" required minLength={3} maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={field + " mt-1"} /></div>
      <div><label htmlFor="vd" className="text-sm font-medium">What will learners learn?</label><textarea id="vd" rows={3} maxLength={4000} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={field + " mt-1"} /></div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label htmlFor="vs" className="text-sm font-medium">Subject</label><select id="vs" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} className={field + " mt-1"}>{SUBJECTS.map((s) => <option key={s} value={s}>{SUBJECT_LABEL[s]}</option>)}</select></div>
        <div><label htmlFor="vg" className="text-sm font-medium">Level</label><select id="vg" value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value })} className={field + " mt-1"}>{GRADES.map((g) => <option key={g} value={g}>{GRADE_LABEL[g]}</option>)}</select></div>
        <div><label htmlFor="vl" className="text-sm font-medium">Language</label><select id="vl" value={f.language} onChange={(e) => setF({ ...f, language: e.target.value })} className={field + " mt-1"}>{LANGS.map((l) => <option key={l} value={l}>{LANG_LABEL[l]}</option>)}</select></div>
      </div>
      <div><label htmlFor="vf" className="text-sm font-medium">Video file (MP4, WebM or MOV, up to 500 MB)</label>
        <input id="vf" ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => pick(e.target.files?.[0] ?? null)} className={field + " mt-1"} /></div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" required className="mt-0.5" /> I made this lesson (or have the right to publish it) and it follows the community rules.</label>
      <button disabled={busy || !file} className="rounded-xl gradient-hero px-5 py-2.5 font-semibold text-primary-foreground shadow-glow disabled:opacity-50 inline-flex items-center gap-2">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {phase === "idle" ? "Upload & submit for review" : phase === "creating" ? "Preparing…" : phase === "uploading" ? "Uploading — keep this tab open…" : "Submitting…"}
      </button>
    </form>
  );
}

function StudioPage() {
  const qc = useQueryClient();
  const fetchStatus = useServerFn(getCreatorStatus);
  const fetchMine = useServerFn(listMyVideos);
  const status = useQuery({ queryKey: ["creatorStatus"], queryFn: () => fetchStatus(), enabled: !isDemo });
  const c = (status.data?.creator ?? (isDemo ? { id: "demo-creator", display_name: "Judge Evaluator (Demo)", bio: "Testing Learn Tube Studio", strikes: 0, verification_status: "verified" } : null)) as Record<string, any> | null | undefined;
  const verified = c?.verification_status === "verified";
  const mine = useQuery({ queryKey: ["myVideos"], queryFn: () => fetchMine(), enabled: verified && !isDemo, refetchInterval: 15000 });

  if (status.isLoading && !isDemo) return <div className="grid place-items-center h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  const bal = status.data?.balance ?? (isDemo ? { total_minor: 45000 } : undefined);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl gradient-hero grid place-items-center text-white shadow-glow"><Clapperboard className="h-6 w-6" aria-hidden /></div>
        <div><h1 className="text-2xl font-bold">Teach on Learn Tube</h1><p className="text-sm text-muted-foreground">Share your knowledge with learners across Bangladesh — and earn from it.</p></div>
      </div>

      {status.data?.isGuest && !isDemoActive() ? (
        <div className="glass rounded-2xl p-6 text-sm">Guest accounts can watch but not teach. <Link to="/auth" className="text-primary font-semibold hover:underline">Create a free account</Link> to apply.</div>
      ) : !c ? (
        <><Rules /><Apply onDone={() => qc.invalidateQueries({ queryKey: ["creatorStatus"] })} /></>
      ) : c.verification_status === "pending" ? (
        <div className="glass rounded-2xl p-6 flex gap-3"><Clock className="h-6 w-6 text-amber-500 shrink-0" aria-hidden /><div><h2 className="font-semibold">Your application is being reviewed</h2><p className="text-sm text-muted-foreground mt-1">We check every teacher's details before they can publish. You'll be able to upload here as soon as you're verified.</p></div></div>
      ) : c.verification_status === "rejected" ? (
        <><div className="glass rounded-2xl p-6 flex gap-3"><XCircle className="h-6 w-6 text-destructive shrink-0" aria-hidden /><div><h2 className="font-semibold">We couldn't verify your application</h2><p className="text-sm text-muted-foreground mt-1">You can apply again with more detail about your qualifications.</p></div></div><Apply onDone={() => qc.invalidateQueries({ queryKey: ["creatorStatus"] })} /></>
      ) : c.verification_status === "suspended" ? (
        <div className="glass rounded-2xl p-6 flex gap-3"><XCircle className="h-6 w-6 text-destructive shrink-0" aria-hidden /><div><h2 className="font-semibold">Your channel is suspended</h2><p className="text-sm text-muted-foreground mt-1">Videos that break the community rules lead to suspension. Contact the LEARNOVA team if you think this is a mistake.</p></div></div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 flex items-center gap-3"><BadgeCheck className="h-8 w-8 text-emerald-500" aria-hidden /><div><div className="font-semibold">{c.display_name}</div><div className="text-xs text-muted-foreground">Verified teacher{c.strikes > 0 ? ` · ${c.strikes}/3 strikes` : ""}</div></div></div>
            <div className="glass rounded-2xl p-5 flex items-center gap-3"><Wallet className="h-8 w-8 text-primary" aria-hidden /><div><div className="font-semibold">{fmtTaka(bal?.total_minor ?? 0)}</div><div className="text-xs text-muted-foreground">Earned so far · payouts open when monetization launches</div></div></div>
          </div>
          <Rules />
          <Uploader onUploaded={() => qc.invalidateQueries({ queryKey: ["myVideos"] })} />
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold mb-3">Your videos</h2>
            {mine.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (mine.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Nothing uploaded yet.</p> : (
              <ul className="divide-y divide-border/40">
                {(mine.data as Array<Record<string, any>>).map((v) => {
                  const st = STATUS_LABEL[v.status] ?? STATUS_LABEL.draft;
                  return (
                    <li key={v.id} className="py-3 flex flex-wrap items-center gap-3 justify-between">
                      <div className="min-w-0">
                        <Link to="/app/videos/$videoId" params={{ videoId: v.id }} className="font-medium hover:text-primary truncate block">{v.title}</Link>
                        <div className="text-xs text-muted-foreground">{SUBJECT_LABEL[v.subject]} · {fmtDuration(v.duration_seconds) || "—"} · {v.view_count} views</div>
                        {v.rejection_reason && <div className="text-xs text-destructive mt-1">Reason: {v.rejection_reason}</div>}
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold inline-flex items-center gap-1 ${st.tone}`}>{v.status === "published" && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}{st.text}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
