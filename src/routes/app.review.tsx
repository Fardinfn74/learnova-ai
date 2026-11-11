import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { toast } from "sonner";
import { staffPreview, staffQueue, staffReviewCreator, staffReviewVideo } from "@/lib/video.functions";
import { GRADE_LABEL, LANG_LABEL, REPORT_LABEL, SUBJECT_LABEL, fmtDuration } from "@/lib/video-labels";

export const Route = createFileRoute("/app/review")({ component: ReviewPage });

const tone: Record<string, string> = { approve: "text-emerald-600 dark:text-emerald-300", review: "text-amber-600 dark:text-amber-300", reject: "text-destructive", info: "text-muted-foreground" };

function VideoCard({ v, events, reports, onDone }: { v: Record<string, any>; events: Array<Record<string, any>>; reports: Array<Record<string, any>>; onDone: () => void }) {
  const preview = useServerFn(staffPreview);
  const review = useServerFn(staffReviewVideo);
  const [url, setUrl] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const act = async (decision: "approve" | "reject" | "remove") => {
    if (decision !== "approve" && !reason.trim()) return toast.error("Write a reason — the teacher will see it.");
    setBusy(true);
    try { await review({ data: { id: v.id, decision, reason: reason.trim() || undefined } }); toast.success(decision === "approve" ? "Published" : "Rejected"); onDone(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <li className="glass rounded-2xl p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><h3 className="font-semibold">{v.title}</h3>
          <p className="text-xs text-muted-foreground">{SUBJECT_LABEL[v.subject]} · {GRADE_LABEL[v.grade_band]} · {LANG_LABEL[v.language]} · {fmtDuration(v.duration_seconds)}</p></div>
        {reports.length > 0 && <span className="rounded-full bg-destructive/15 text-destructive text-xs font-semibold px-2.5 py-1">{reports.length} report{reports.length > 1 ? "s" : ""}</span>}
      </div>
      {v.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{v.description}</p>}

      {url ? <video src={url} controls className="w-full rounded-xl bg-black aspect-video" /> :
        <button onClick={async () => { try { setUrl((await preview({ data: { id: v.id } })).url); } catch { toast.error("Couldn't load the preview."); } }} className="rounded-xl border border-border/60 px-4 py-2 text-sm font-medium hover:bg-muted">Load video preview</button>}

      <div className="rounded-xl bg-muted/50 p-3">
        <div className="text-xs font-semibold mb-1.5">Automatic checks</div>
        <ul className="space-y-1 text-xs">
          {events.length === 0 && <li className="text-muted-foreground">No automatic results yet.</li>}
          {events.map((e, i) => (
            <li key={i}><span className="font-mono text-muted-foreground">{e.stage}</span> <span className={`font-semibold ${tone[e.verdict]}`}>{e.verdict}</span>
              {e.confidence != null && <span className="text-muted-foreground"> ({Math.round(e.confidence * 100)}%)</span>}
              {e.detail?.reason && <span className="text-muted-foreground"> — {String(e.detail.reason).slice(0, 220)}</span>}
              {Array.isArray(e.detail?.flags) && e.detail.flags.length > 0 && <span className="text-destructive"> [{e.detail.flags.join(", ")}]</span>}</li>))}
        </ul>
        {reports.map((r, i) => <div key={i} className="text-xs mt-1.5 text-destructive">Report: {REPORT_LABEL[r.reason]}{r.details ? ` — ${r.details}` : ""}</div>)}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="Reason (required to reject)" aria-label="Decision reason" className="flex-1 min-w-[200px] rounded-xl border border-border bg-card px-3 py-2 text-sm" />
        <button disabled={busy} onClick={() => act("approve")} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" aria-hidden /> Approve</button>
        <button disabled={busy} onClick={() => act("reject")} className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><XCircle className="h-4 w-4" aria-hidden /> Reject</button>
      </div>
    </li>
  );
}

function ReviewPage() {
  const qc = useQueryClient();
  const fetchQueue = useServerFn(staffQueue);
  const reviewCreator = useServerFn(staffReviewCreator);
  const { data, isLoading, error } = useQuery({ queryKey: ["staffQueue"], queryFn: () => fetchQueue(), retry: false, refetchInterval: 30000 });
  const refresh = () => qc.invalidateQueries({ queryKey: ["staffQueue"] });

  if (isLoading) return <div className="grid place-items-center h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error || !data) return <div className="p-10 text-center text-muted-foreground">This page is for LEARNOVA reviewers only.</div>;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3"><div className="h-12 w-12 rounded-xl gradient-hero grid place-items-center text-white shadow-glow"><ShieldAlert className="h-6 w-6" aria-hidden /></div>
        <div><h1 className="text-2xl font-bold">Review queue</h1><p className="text-sm text-muted-foreground">Nothing goes live until a person has watched it and approved it.</p></div></div>

      <section aria-labelledby="ct"><h2 id="ct" className="font-bold mb-3">Teacher applications ({data.creators.length})</h2>
        {data.creators.length === 0 ? <p className="text-sm text-muted-foreground">No pending applications.</p> : (
          <ul className="space-y-3">{data.creators.map((c) => (
            <li key={c.user_id} className="glass rounded-2xl p-5">
              <div className="font-semibold">{c.display_name}</div>
              <div className="text-xs text-muted-foreground">{(c.subjects ?? []).map((s: string) => SUBJECT_LABEL[s]).join(", ")}</div>
              {c.bio && <p className="text-sm mt-2">{c.bio}</p>}
              <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap"><span className="font-semibold text-foreground">Credentials:</span> {c.credentials}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={async () => { await reviewCreator({ data: { userId: c.user_id, decision: "verified" } }); toast.success("Verified"); refresh(); }} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Verify</button>
                <button onClick={async () => { await reviewCreator({ data: { userId: c.user_id, decision: "rejected" } }); toast.success("Rejected"); refresh(); }} className="rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-white">Reject</button>
              </div>
            </li>))}</ul>)}
      </section>

      <section aria-labelledby="vq"><h2 id="vq" className="font-bold mb-3">Videos awaiting review ({data.videos.length})</h2>
        {data.videos.length === 0 ? <p className="text-sm text-muted-foreground">Queue is empty. 🎉</p> : (
          <ul className="space-y-4">{data.videos.map((v) => (
            <VideoCard key={v.id} v={v} events={data.events.filter((e) => e.video_id === v.id)} reports={data.reports.filter((r) => r.video_id === v.id)} onDone={refresh} />))}</ul>)}
      </section>
    </div>
  );
}
