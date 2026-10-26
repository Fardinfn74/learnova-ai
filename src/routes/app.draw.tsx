import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { analyzeDrawing } from "@/lib/learn-ai.functions";
import { awardXp } from "@/lib/learnova.functions";
import { Nova } from "@/components/Nova";
import { Pencil, Eraser, RotateCcw, Trash2, Send, Loader2, Palette } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/draw")({ component: DrawPage });

type Line = {
  points: { x: number; y: number }[];
  color: string;
  width: number;
};

function DrawPage() {
  const qc = useQueryClient();
  const analyze = useServerFn(analyzeDrawing);
  const award = useServerFn(awardXp);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [lines, setLines] = useState<Line[]>([]);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [color, setColor] = useState("#ffffff");
  const [width, setWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<"english"|"bangla"|"banglish">("english");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Colors palette
  const colors = ["#ffffff", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ec4899"];

  // Initialize canvas size
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      
      const { width, height } = container.getBoundingClientRect();
      // Set actual canvas size matching display size
      canvas.width = width;
      canvas.height = height;
      redraw();
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [lines, currentLine]); // Re-run when lines change to persist drawing on resize

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fill background with near-black for better contrast with white strokes
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

  useEffect(() => {
    redraw();
  }, [lines, currentLine]);

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement> | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setCurrentLine({
      points: [coords],
      color: isEraser ? "#0f111a" : color,
      width: isEraser ? 20 : width,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !currentLine) return;
    const coords = getCoordinates(e);
    setCurrentLine(prev => prev ? {
      ...prev,
      points: [...prev.points, coords]
    } : null);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentLine) {
      setLines(prev => [...prev, currentLine]);
      setCurrentLine(null);
    }
  };

  const undo = () => {
    setLines(prev => prev.slice(0, -1));
  };

  const clear = () => {
    setLines([]);
  };

  const submitDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Don't submit empty canvas (just checking if lines exist is enough for basic check)
    if (lines.length === 0) {
      toast.error("Please draw something first!");
      return;
    }

    setBusy(true);
    setResult(null);

    try {
      // Get base64 representation of the canvas
      const base64Image = canvas.toDataURL("image/png");
      
      const analysis = await analyze({ 
        data: { 
          image: base64Image, 
          prompt: prompt.trim() || undefined,
          language 
        } 
      });
      
      setResult(analysis);
      const res = await award({ data: { amount: 10, reason: "Used Draw to Learn" } });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["xp"] });
      if (res.awarded > 0) toast.success(`Analysis complete! +${res.awarded} XP`);
      else toast.success("Analysis complete!");
      
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to analyze drawing");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto flex flex-col h-[calc(100vh-80px)]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl gradient-hero grid place-items-center text-white shadow-glow">
            <Pencil className="h-6 w-6"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Draw to Learn</h1>
            <p className="text-sm text-muted-foreground">Draw a math problem or diagram, and Nova will solve it.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 glass rounded-2xl p-1.5">
          <select value={language} onChange={e=>setLanguage(e.target.value as "english"|"bangla"|"banglish")}
            className="rounded-xl border-none bg-transparent px-3 py-2 text-sm outline-none font-medium text-muted-foreground focus:text-foreground">
            <option value="english">English</option><option value="bangla">বাংলা</option><option value="banglish">Banglish</option>
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 flex flex-col h-full relative">
          
          {/* Toolbar */}
          <div className="glass rounded-t-2xl p-3 border-b border-border/40 flex flex-wrap items-center gap-4 shrink-0 z-10">
            <div className="flex items-center gap-1.5">
              {colors.map(c => (
                <button key={c} onClick={() => { setColor(c); setIsEraser(false); }}
                  className={cn("w-6 h-6 rounded-full border-2 transition-transform", 
                    color === c && !isEraser ? "scale-110 border-primary shadow-glow" : "border-transparent hover:scale-110")}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            
            <div className="w-px h-6 bg-border mx-1" />

            <div className="flex items-center gap-2 flex-1">
              <button onClick={() => setIsEraser(false)} 
                className={cn("p-2 rounded-xl transition", !isEraser ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted")}>
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => setIsEraser(true)} 
                className={cn("p-2 rounded-xl transition", isEraser ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted")}>
                <Eraser className="h-4 w-4" />
              </button>
              
              <div className="w-px h-6 bg-border mx-1" />
              
              <button onClick={undo} disabled={lines.length === 0} title="Undo"
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition disabled:opacity-50">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button onClick={clear} disabled={lines.length === 0} title="Clear All"
                className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div ref={containerRef} className="flex-1 relative bg-[#0f111a] rounded-b-2xl overflow-hidden cursor-crosshair border border-t-0 border-border/40 shadow-glow">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerOut={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
            {lines.length === 0 && !isDrawing && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-muted-foreground/30 font-medium text-lg">
                Draw here...
              </div>
            )}
          </div>
        </div>

        {/* Action / Result Sidebar */}
        <div className="flex flex-col h-full gap-4 min-h-0">
          <div className="glass rounded-2xl p-5 shrink-0 shadow-glow">
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="What do you want Nova to do? (e.g. Solve this, Explain this diagram)"
              rows={3}
              className="w-full bg-transparent border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 resize-none transition"
            />
            <button 
              onClick={submitDrawing}
              disabled={busy || lines.length === 0}
              className="mt-3 w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] transition"
            >
              {busy ? <><Loader2 className="h-4 w-4 animate-spin"/> Nova is analyzing...</> : <><Send className="h-4 w-4"/> Analyze Drawing ✨</>}
            </button>
          </div>

          <div className="glass rounded-2xl p-5 flex-1 min-h-0 overflow-auto relative">
            {!result && !busy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-muted-foreground opacity-60">
                <Nova size={80} float={false} glow={false} />
                <p className="mt-4 text-sm">Draw a problem and hit Analyze. I'll read your handwriting and explain the solution!</p>
              </div>
            )}
            
            {busy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-primary">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <span className="shimmer-text font-medium text-sm">Looking at your drawing...</span>
              </div>
            )}

            {result && !busy && (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
