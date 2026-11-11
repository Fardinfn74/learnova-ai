import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BadgeCheck, Flag, Loader2, Target, X } from "lucide-react";
import { toast } from "sonner";
import { getVideoForWatch, recordVideoProgress, reportVideo } from "@/lib/video.functions";
import { GRADE_LABEL, LANG_LABEL, REPORT_LABEL, REPORT_REASONS, STATUS_LABEL, SUBJECT_LABEL } from "@/lib/video-labels";

export const Route = createFileRoute("/app/videos/$videoId")({ component: WatchPage });

function WatchPage() {
  const { videoId } = Route.useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const fetchVideo = useServerFn(getVideoForWatch);
  const sendProgress = useServerFn(recordVideoProgress);
  const report = useServerFn(reportVideo);

  const { data, isLoading, isError } = useQuery({ queryKey: ["video", videoId], queryFn: () => fetchVideo({ data: { id: videoId } }), retry: false });

  const ref = useRef<HTMLVideoElement>(null);
  const acc = useRef(0);        // seconds really watched since the last report
  const lastT = useRef(0);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]>("not_educational");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  const live = data?.video.status === "published";

  const flush = async () => {
    const el = ref.current;
    if (!el || !live) return;
    const delta = Math.min(30, Math.round(acc.current));
    acc.current = 0;
    if (delta <= 0 && !el.ended) return;
    try {
      const r = await sendProgress({ data: { id: videoId, position: Math.floor(el.currentTime), delta } });
      if (r.awarded > 0) {
        toast.success(`Lesson finished! +${r.awarded} XP 🎉`);
        qc.invalidateQueries({ queryKey: ["profile"] });
      }
    } catch { /* progress is best-effort */ }
  };

  useEffect(() => () => { void flush(); }, [live]); // eslint-disable-line react-hooks/exhaustive-deps

  const onTime = () => {
    const el = ref.current;
    if (!el || el.paused) return;
    const d = el.currentTime - lastT.current;
    if (d > 0 && d < 2) acc.current += d; // seeking forward doesn't count as watching
    lastT.current = el.currentTime;
    if (acc.current >= 15) void flush();
  };

  const submitReport = async () => {
    setSending(true);
    try {
      const r = await report({ data: { id: videoId, reason, details: details.trim() || undefined } });
      toast.success(r === "quarantined" ? "Thank you. The video is hidden while our team reviews it." : "Thank you — our team will take a look.");
      setReporting(false);
      if (r === "quarantined") nav({ to: "/app/videos" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send your report.");
    } finally { setSending(false); }
  };

  if (isLoading) return <div className="grid place-items-center h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (isError || !data) {
    return (
      <div className="p-10 max-w-xl mx-auto text-center">
        <p className="font-semibold">This video isn't available.</p>
        <Link to="/app/videos" className="mt-4 inline-block text-primary hover:underline">Back to Learn Tube</Link>
      </div>
    );
  }
  const { video, url, poster, creator, progress } = data as typeof data & { video: Record<string, any>; creator: Record<string, string> | null; progress: Record<string, any> | null };
  const st = STATUS_LABEL[video.status];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <Link to="/app/videos" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4" aria-hidden /> Learn Tube</Link>

      {!live && st && (
        <div role="status" className={`mb-4 rounded-xl px-4 py-2.5 text-sm font-medium ${st.tone}`}>
          Preview — this video is not public yet ({st.text}).{video.rejection_reason ? ` Reason: ${video.rejection_reason}` : ""}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden bg-black shadow-glow">
        {url ? (
          url.includes("youtube.com") || url.includes("youtu.be") ? (
            <iframe
              src={url}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full aspect-video border-0"
            />
          ) : (
            <video ref={ref} src={url} poster={poster ?? undefined} controls playsInline preload="metadata" controlsList="nodownload" className="w-full aspect-video"
              onLoadedMetadata={(e) => { if (progress?.position_seconds && !progress.completed) (e.currentTarget.currentTime = progress.position_seconds); lastT.current = e.currentTarget.currentTime; }}
              onTimeUpdate={onTime} onPause={() => void flush()} onEnded={() => void flush()} onSeeked={() => { lastT.current = ref.current?.currentTime ?? 0; }} />
          )
        ) : <div className="aspect-video grid place-items-center text-white/70">Video unavailable</div>}
      </div>

      <div className="mt-5 grid md:grid-cols-[1fr_auto] gap-4 items-start">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{video.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" aria-hidden /> {creator?.display_name ?? "Verified teacher"} · {video.view_count} {video.view_count === 1 ? "learner" : "learners"}</p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-full bg-primary/10 text-primary px-2.5 py-1">{SUBJECT_LABEL[video.subject]}</span>
            <span className="rounded-full bg-muted px-2.5 py-1">{GRADE_LABEL[video.grade_band]}</span>
            <span className="rounded-full bg-muted px-2.5 py-1">{LANG_LABEL[video.language]}</span>
          </div>
          {video.description && <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{video.description}</p>}

          {video.concepts && Array.isArray(video.concepts) && video.concepts.length > 0 && (
            <div className="mt-4 rounded-xl p-3 bg-primary/5 border border-primary/20">
              <p className="text-xs font-bold text-primary mb-1.5 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> Core Concepts Covered in this Lesson:
              </p>
              <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
                {video.concepts.map((c: string, idx: number) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {creator?.bio && <p className="mt-4 text-xs text-muted-foreground border-t border-border/40 pt-3"><span className="font-semibold text-foreground">About the teacher:</span> {creator.bio}</p>}
        </div>
        <div className="flex md:flex-col gap-2">
          <Link to="/app/quiz" search={{ topic: video.title, video: videoId }} className="inline-flex items-center justify-center gap-2 rounded-xl gradient-hero px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow whitespace-nowrap">
            <Target className="h-4 w-4" aria-hidden /> Quiz me on this video
          </Link>
          {live && <button onClick={() => setReporting(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium hover:bg-muted"><Flag className="h-4 w-4" aria-hidden /> Report</button>}
        </div>
      </div>

      {reporting && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Report this video">
          <button className="absolute inset-0 bg-black/60" aria-label="Close" onClick={() => setReporting(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3"><h2 className="font-bold text-lg">Report this video</h2><button onClick={() => setReporting(false)} aria-label="Close"><X className="h-5 w-5" /></button></div>
            <p className="text-xs text-muted-foreground mb-3">Safety reports hide the video straight away while our team checks it.</p>
            <label className="text-sm font-medium" htmlFor="rr">What's wrong?</label>
            <select id="rr" value={reason} onChange={(e) => setReason(e.target.value as typeof reason)} className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm">
              {REPORT_REASONS.map((r) => <option key={r} value={r}>{REPORT_LABEL[r]}</option>)}
            </select>
            <label className="text-sm font-medium mt-3 block" htmlFor="rd">Details (optional)</label>
            <textarea id="rd" value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} rows={3} className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" />
            <button onClick={submitReport} disabled={sending} className="mt-4 w-full rounded-xl gradient-hero py-2.5 font-semibold text-primary-foreground disabled:opacity-50">{sending ? "Sending…" : "Send report"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
