import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Reveal } from "@/hooks/use-reveal";
import {
  Code2,
  Play,
  RotateCcw,
  Terminal,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Brain,
  Info,
  ChevronRight,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Nova } from "@/components/Nova";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { awardXp } from "@/lib/learnova.functions";

export const Route = createFileRoute("/app/code-lab")({
  component: CodeLabPage,
});

const C_STARTER = `#include <stdio.h>

int main() {
    printf("Hello, LEARNOVA!\\n");
    return 0;
}
`;

function CodeLabPage() {
  const [code, setCode] = useState(C_STARTER);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [novaFeedback, setNovaFeedback] = useState<string | null>(null);
  const [isNovaThinking, setIsNovaThinking] = useState(false);
  const awardXpFn = useServerFn(awardXp);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    setError("");
    setNovaFeedback(null);

    try {
      // For C execution, we use the public Piston API which is free and reliable
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        body: JSON.stringify({
          language: "c",
          version: "10.2.0",
          files: [{ content: code }],
        }),
      });

      const data = await response.json();

      if (data.run) {
        if (data.run.stderr) {
          setError(data.run.stderr);
          askNovaForHelp(code, data.run.stderr);
        } else {
          setOutput(data.run.stdout || "(Success: No output)");
          if (code !== C_STARTER) {
             awardXpFn({ amount: 15, reason: "Executed perfect C code" });
             toast.success("Correct! +15 XP earned.");
          }
        }
      }
    } catch (err) {
      setError("Failed to connect to the execution server. Please check your internet.");
    } finally {
      setIsRunning(false);
    }
  };

  const askNovaForHelp = async (sourceCode: string, compilationError: string) => {
    setIsNovaThinking(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `I am writing C code in the LEARNOVA Code Lab and I got an error.

              SOURCE CODE:
              \`\`\`c
              ${sourceCode}
              \`\`\`

              ERROR:
              \`\`\`
              ${compilationError}
              \`\`\`

              Can you explain what went wrong and how I can fix it? Keep it short and encouraging like a personal tutor.`
            }
          ]
        })
      });

      if (!response.ok) throw new Error();

      // Since our /api/chat returns a stream, we'll handle it simply for this UI
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          // Parse the UI stream chunks
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('2:')) { // 2 is text-delta in our stream format
                try {
                    const delta = JSON.parse(line.slice(2));
                    fullText += delta;
                    setNovaFeedback(fullText);
                } catch {}
            }
          }
        }
      }
    } catch (err) {
      setNovaFeedback("I'm sorry, I couldn't analyze the error right now. Check your syntax or try again!");
    } finally {
      setIsNovaThinking(false);
    }
  };

  const resetCode = () => {
    if (confirm("Reset code to default?")) {
      setCode(C_STARTER);
      setOutput("");
      setError("");
      setNovaFeedback(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="shrink-0 h-14 border-b border-border/40 flex items-center justify-between px-6 bg-sidebar/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg gradient-hero grid place-items-center text-white shadow-glow">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Code Lab</h1>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">C Language Sandbox</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetCode}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
            title="Reset Code"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-glow",
              isRunning ? "bg-muted text-muted-foreground" : "gradient-hero text-primary-foreground hover:scale-105 active:scale-95"
            )}
          >
            {isRunning ? (
              <div className="h-3 w-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            RUN CODE
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col border-r border-border/40 min-h-[40vh] md:min-h-0">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border/40 bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <Code2 className="h-3 w-3" /> main.c
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 p-6 font-mono text-sm bg-transparent outline-none resize-none leading-relaxed selection:bg-primary/20"
            placeholder="Write your C code here..."
          />
          {/* Quick symbols for mobile */}
          <div className="flex md:hidden items-center gap-1 p-2 bg-muted/40 border-t border-border/40 overflow-x-auto no-scrollbar">
            {['{', '}', '(', ')', ';', '"', '&', '*', '#', '<', '>', '\\n'].map(sym => (
              <button
                key={sym}
                onClick={() => setCode(prev => prev + sym)}
                className="px-3 py-1.5 bg-background border border-border/40 rounded-md text-xs font-mono active:bg-primary/20"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Output & Nova Area */}
        <div className="w-full md:w-[400px] lg:w-[500px] flex flex-col bg-muted/10 overflow-y-auto no-scrollbar">
          {/* Terminal */}
          <div className="flex-1 p-0 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Terminal className="h-3 w-3" /> Console Output
              </div>
              {output && <CheckCircle2 className="h-3 w-3 text-green-500" />}
              {error && <AlertCircle className="h-3 w-3 text-red-500" />}
            </div>

            <div className="p-6 font-mono text-sm flex-1">
              {isRunning && <div className="text-muted-foreground animate-pulse">Executing code...</div>}

              {!isRunning && output && (
                <div className="text-foreground whitespace-pre-wrap">{output}</div>
              )}

              {!isRunning && error && (
                <div className="text-red-400 whitespace-pre-wrap bg-red-500/5 p-4 rounded-xl border border-red-500/10 mb-6">
                  {error}
                </div>
              )}

              {!isRunning && !output && !error && (
                <div className="text-muted-foreground italic flex flex-col items-center justify-center h-full gap-3 py-10 opacity-50">
                  <Terminal className="h-8 w-8" />
                  Run your code to see the output here
                </div>
              )}

              {/* Nova Feedback Section */}
              {(novaFeedback || isNovaThinking) && (
                <Reveal className="mt-4">
                  <div className="glass rounded-2xl p-5 border border-primary/20 relative group">
                    <div className="absolute -top-3 -left-3">
                      <Nova size={40} glow={false} />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3 ml-6">
                      <Brain className="h-3 w-3" /> Nova Analysis
                    </div>
                    <div className="text-xs leading-relaxed text-foreground/90 prose prose-invert prose-p:my-1 prose-sm">
                      {isNovaThinking && !novaFeedback && (
                        <div className="flex items-center gap-2 text-muted-foreground italic">
                           Thinking...
                        </div>
                      )}
                      {novaFeedback}
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="p-6 border-t border-border/40">
             <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold">Pro Tip</div>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Don't forget to include <code className="text-primary">stdio.h</code> for input/output functions like <code className="text-primary">printf</code> and <code className="text-primary">scanf</code>.
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
