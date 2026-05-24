import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./createSsrRpc-CbfToRDd.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { e as summarizeNote, d as getNote, l as listNotes } from "./learn-ai.functions-DCGJGXfx.mjs";
import { a as awardXp } from "./learnova.functions-CCVxPp8L.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/seroval.mjs";
import { F as FileText, f as LoaderCircle, U as Upload, p as ShieldCheck } from "../_libs/lucide-react.mjs";
import { M as Markdown } from "../_libs/react-markdown.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./auth-middleware-JBvrN22J.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/devlop.mjs";
import "../_libs/unified.mjs";
import "../_libs/bail.mjs";
import "../_libs/extend.mjs";
import "../_libs/is-plain-obj.mjs";
import "../_libs/trough.mjs";
import "../_libs/vfile.mjs";
import "../_libs/vfile-message.mjs";
import "../_libs/unist-util-stringify-position.mjs";
import "node:process";
import "node:path";
import "node:url";
import "../_libs/remark-parse.mjs";
import "../_libs/mdast-util-from-markdown.mjs";
import "../_libs/micromark-util-decode-numeric-character-reference+[...].mjs";
import "../_libs/micromark-util-decode-string.mjs";
import "../_libs/decode-named-character-reference+[...].mjs";
import "../_libs/character-entities.mjs";
import "../_libs/micromark-util-normalize-identifier+[...].mjs";
import "../_libs/micromark.mjs";
import "../_libs/micromark-util-combine-extensions+[...].mjs";
import "../_libs/micromark-util-chunked.mjs";
import "../_libs/micromark-factory-space.mjs";
import "../_libs/micromark-util-character.mjs";
import "../_libs/micromark-core-commonmark.mjs";
import "../_libs/micromark-util-classify-character+[...].mjs";
import "../_libs/micromark-util-resolve-all.mjs";
import "../_libs/micromark-util-subtokenize.mjs";
import "../_libs/micromark-factory-destination.mjs";
import "../_libs/micromark-factory-label.mjs";
import "../_libs/micromark-factory-title.mjs";
import "../_libs/micromark-factory-whitespace.mjs";
import "../_libs/micromark-util-html-tag-name.mjs";
import "../_libs/mdast-util-to-string.mjs";
import "../_libs/remark-rehype.mjs";
import "../_libs/mdast-util-to-hast.mjs";
import "../_libs/ungap__structured-clone.mjs";
import "../_libs/micromark-util-sanitize-uri.mjs";
import "../_libs/unist-util-position.mjs";
import "../_libs/trim-lines.mjs";
import "../_libs/unist-util-visit.mjs";
import "../_libs/unist-util-visit-parents.mjs";
import "../_libs/unist-util-is.mjs";
import "../_libs/hast-util-to-jsx-runtime.mjs";
import "../_libs/comma-separated-tokens.mjs";
import "../_libs/property-information.mjs";
import "../_libs/space-separated-tokens.mjs";
import "../_libs/style-to-js.mjs";
import "../_libs/style-to-object.mjs";
import "../_libs/inline-style-parser.mjs";
import "../_libs/hast-util-whitespace.mjs";
import "../_libs/estree-util-is-identifier-name.mjs";
import "../_libs/html-url-attributes.mjs";
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_PAGES = 50;
const MAX_CHARS = 8e4;
async function extractPdfText(file, onProgress) {
  if (!file) throw new Error("No file");
  if (!/pdf/i.test(file.type) && !/\.pdf$/i.test(file.name)) throw new Error("Please upload a PDF file");
  if (file.size > MAX_BYTES) throw new Error("PDF too large (max 10 MB)");
  const pdfjs = await import("../_libs/pdfjs-dist.mjs");
  const workerUrl = (await import("./pdf.worker.min-dwAkBuWR.mjs")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const buf = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buf),
    disableAutoFetch: true,
    isEvalSupported: false,
    // disable eval'd JS in PDFs
    isOffscreenCanvasSupported: false
  });
  const doc = await loadingTask.promise;
  const pages = Math.min(doc.numPages, MAX_PAGES);
  let out = "";
  for (let i = 1; i <= pages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((it) => typeof it.str === "string" ? it.str : "").join(" ");
    out += pageText + "\n\n";
    onProgress?.(Math.round(i / pages * 100));
    if (out.length > MAX_CHARS) {
      out = out.slice(0, MAX_CHARS);
      break;
    }
  }
  out = out.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ");
  return out.trim();
}
const PDF_LIMITS = { MAX_BYTES, MAX_PAGES };
function NotesPage() {
  const qc = useQueryClient();
  const sum = useServerFn(summarizeNote);
  const list = useServerFn(listNotes);
  const get = useServerFn(getNote);
  const award = useServerFn(awardXp);
  const {
    data: notes
  } = useQuery({
    queryKey: ["notes"],
    queryFn: () => list()
  });
  const [text, setText] = reactExports.useState("");
  const [language, setLanguage] = reactExports.useState("english");
  const [busy, setBusy] = reactExports.useState(false);
  const [active, setActive] = reactExports.useState(null);
  const [pdfProgress, setPdfProgress] = reactExports.useState(null);
  const fileRef = reactExports.useRef(null);
  async function onPdf(e) {
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
      setText((prev) => (prev ? prev + "\n\n" : "") + extracted);
      toast.success(`Extracted ${extracted.length.toLocaleString()} chars from "${f.name}"`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF failed");
    } finally {
      setPdfProgress(null);
    }
  }
  async function summarize() {
    if (text.trim().length < 50) {
      toast.error("Paste at least 50 characters");
      return;
    }
    setBusy(true);
    try {
      const n = await sum({
        data: {
          text,
          language
        }
      });
      setActive(n);
      setText("");
      await award({
        data: {
          amount: 12,
          reason: "Summarized notes"
        }
      });
      qc.invalidateQueries({
        queryKey: ["notes"]
      });
      qc.invalidateQueries({
        queryKey: ["profile"]
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function open(id) {
    const n = await get({
      data: {
        id
      }
    });
    setActive(n);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-10 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-xl gradient-hero grid place-items-center text-white shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Summarizer & flashcards" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Paste notes or text from a PDF — get a summary and flashcards" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 ring-gradient", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: text, onChange: (e) => setText(e.target.value), rows: 8, placeholder: "Paste your study material here, or upload a PDF…", className: "w-full bg-transparent outline-none resize-none text-sm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-between items-center gap-3 mt-3 pt-3 border-t border-border/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: language, onChange: (e) => setLanguage(e.target.value), className: "rounded-lg border border-border bg-card px-3 py-2 text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "english", children: "English" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "bangla", children: "বাংলা" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "banglish", children: "Banglish" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: "application/pdf,.pdf", onChange: onPdf, className: "hidden" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => fileRef.current?.click(), disabled: pdfProgress !== null, className: "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted transition disabled:opacity-50", children: pdfProgress !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
                " Reading PDF ",
                pdfProgress,
                "%"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
                " Upload PDF"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3" }),
                " Sandboxed · max ",
                Math.round(PDF_LIMITS.MAX_BYTES / 1024 / 1024),
                "MB · ",
                PDF_LIMITS.MAX_PAGES,
                " pages"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: summarize, disabled: busy, className: "rounded-xl gradient-hero px-5 py-2.5 font-semibold text-primary-foreground shadow-glow flex items-center gap-2 disabled:opacity-50", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
              " Summarizing..."
            ] }) : "Summarize ✨" })
          ] })
        ] }),
        active && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold gradient-text", children: active.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 prose prose-sm dark:prose-invert max-w-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: active.summary }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold mb-2", children: "📇 Flashcards" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-3", children: active.flashcards?.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "glass rounded-xl p-3 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "font-medium text-sm", children: f.question }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: f.answer })
            ] }, i)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm px-2", children: "Your notes" }),
        !notes?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground px-2", children: "No notes yet." }),
        notes?.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => open(n.id), className: "block w-full text-left glass rounded-xl px-3 py-2.5 text-sm hover:scale-[1.02] transition", children: n.title }, n.id))
      ] })
    ] })
  ] });
}
export {
  NotesPage as component
};
