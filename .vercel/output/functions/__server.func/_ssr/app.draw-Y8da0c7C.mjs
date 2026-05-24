import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./createSsrRpc-CbfToRDd.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { a as analyzeDrawing } from "./learn-ai.functions-DCGJGXfx.mjs";
import { a as awardXp } from "./learnova.functions-CCVxPp8L.mjs";
import { N as Nova } from "./Nova-CLOa5n3E.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/seroval.mjs";
import { l as Pencil, E as Eraser, R as RotateCcw, u as Trash2, f as LoaderCircle, S as Send } from "../_libs/lucide-react.mjs";
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
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
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
function DrawPage() {
  const qc = useQueryClient();
  const analyze = useServerFn(analyzeDrawing);
  const award = useServerFn(awardXp);
  const canvasRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const [lines, setLines] = reactExports.useState([]);
  const [currentLine, setCurrentLine] = reactExports.useState(null);
  const [isDrawing, setIsDrawing] = reactExports.useState(false);
  const [color, setColor] = reactExports.useState("#ffffff");
  const [width, setWidth] = reactExports.useState(3);
  const [isEraser, setIsEraser] = reactExports.useState(false);
  const [prompt, setPrompt] = reactExports.useState("");
  const [language, setLanguage] = reactExports.useState("english");
  const [busy, setBusy] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(null);
  const colors = ["#ffffff", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ec4899"];
  reactExports.useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const {
        width: width2,
        height
      } = container.getBoundingClientRect();
      canvas.width = width2;
      canvas.height = height;
      redraw();
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [lines, currentLine]);
  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f111a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const allLines = currentLine ? [...lines, currentLine] : lines;
    for (const line of allLines) {
      if (line.points.length === 0) continue;
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.moveTo(line.points[0].x, line.points[0].y);
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }
      ctx.stroke();
    }
  };
  reactExports.useEffect(() => {
    redraw();
  }, [lines, currentLine]);
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return {
      x: 0,
      y: 0
    };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };
  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setCurrentLine({
      points: [coords],
      color: isEraser ? "#0f111a" : color,
      width: isEraser ? 20 : width
    });
  };
  const handlePointerMove = (e) => {
    e.preventDefault();
    if (!isDrawing || !currentLine) return;
    const coords = getCoordinates(e);
    setCurrentLine((prev) => prev ? {
      ...prev,
      points: [...prev.points, coords]
    } : null);
  };
  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentLine) {
      setLines((prev) => [...prev, currentLine]);
      setCurrentLine(null);
    }
  };
  const undo = () => {
    setLines((prev) => prev.slice(0, -1));
  };
  const clear = () => {
    setLines([]);
  };
  const submitDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (lines.length === 0) {
      toast.error("Please draw something first!");
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const base64Image = canvas.toDataURL("image/png");
      const analysis = await analyze({
        data: {
          image: base64Image,
          prompt: prompt.trim() || void 0,
          language
        }
      });
      setResult(analysis);
      const res = await award({
        data: {
          amount: 10,
          reason: "Used Draw to Learn"
        }
      });
      qc.invalidateQueries({
        queryKey: ["profile"]
      });
      qc.invalidateQueries({
        queryKey: ["xp"]
      });
      if (res.awarded > 0) toast.success(`Analysis complete! +${res.awarded} XP`);
      else toast.success("Analysis complete!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to analyze drawing");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-10 max-w-[1400px] mx-auto flex flex-col h-[calc(100vh-80px)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-xl gradient-hero grid place-items-center text-white shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Draw to Learn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Draw a math problem or diagram, and Nova will solve it." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 glass rounded-2xl p-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: language, onChange: (e) => setLanguage(e.target.value), className: "rounded-xl border-none bg-transparent px-3 py-2 text-sm outline-none font-medium text-muted-foreground focus:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "english", children: "English" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "bangla", children: "বাংলা" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "banglish", children: "Banglish" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-h-0 grid lg:grid-cols-4 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-3 flex flex-col h-full relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-t-2xl p-3 border-b border-border/40 flex flex-wrap items-center gap-4 shrink-0 z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5", children: colors.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setColor(c);
            setIsEraser(false);
          }, className: cn("w-6 h-6 rounded-full border-2 transition-transform", color === c && !isEraser ? "scale-110 border-primary shadow-glow" : "border-transparent hover:scale-110"), style: {
            backgroundColor: c
          } }, c)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-6 bg-border mx-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsEraser(false), className: cn("p-2 rounded-xl transition", !isEraser ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsEraser(true), className: cn("p-2 rounded-xl transition", isEraser ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eraser, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-6 bg-border mx-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: undo, disabled: lines.length === 0, title: "Undo", className: "p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition disabled:opacity-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: clear, disabled: lines.length === 0, title: "Clear All", className: "p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition disabled:opacity-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: "flex-1 relative bg-[#0f111a] rounded-b-2xl overflow-hidden cursor-crosshair border border-t-0 border-border/40 shadow-glow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "absolute inset-0 touch-none", onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, onPointerOut: handlePointerUp, onPointerCancel: handlePointerUp }),
          lines.length === 0 && !isDrawing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none flex items-center justify-center text-muted-foreground/30 font-medium text-lg", children: "Draw here..." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full gap-4 min-h-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 shrink-0 shadow-glow", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: prompt, onChange: (e) => setPrompt(e.target.value), placeholder: "What do you want Nova to do? (e.g. Solve this, Explain this diagram)", rows: 3, className: "w-full bg-transparent border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 resize-none transition" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: submitDrawing, disabled: busy || lines.length === 0, className: "mt-3 w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
            " Nova is analyzing..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
            " Analyze Drawing ✨"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 flex-1 min-h-0 overflow-auto relative", children: [
          !result && !busy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-muted-foreground opacity-60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 80, float: false, glow: false }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm", children: "Draw a problem and hit Analyze. I'll read your handwriting and explain the solution!" })
          ] }),
          busy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin mb-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer-text font-medium text-sm", children: "Looking at your drawing..." })
          ] }),
          result && !busy && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: result }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  DrawPage as component
};
