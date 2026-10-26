import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { generateQuiz, submitQuiz } from "@/lib/learn-ai.functions";
import { awardXp } from "@/lib/learnova.functions";
import { Nova } from "@/components/Nova";
import { Loader2, Target, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/quiz")({ component: QuizPage });

type Q = { question: string; options: string[]; correct_index: number; explanation: string };
type Quiz = { id: string; topic: string; difficulty: string; questions: Q[] };

function QuizPage() {
  const qc = useQueryClient();
  const gen = useServerFn(generateQuiz);
  const sub = useServerFn(submitQuiz);
  const award = useServerFn(awardXp);

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy"|"medium"|"hard">("medium");
  const [language, setLanguage] = useState<"english"|"bangla"|"banglish">("english");
  const [busy, setBusy] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{score:number; total:number}|null>(null);

  async function start() {
    if (!topic.trim()) return;
    setBusy(true); setResult(null);
    try {
      const q = await gen({ data: { topic, difficulty, count: 5, language } });
      setQuiz(q as unknown as Quiz);
      setAnswers(new Array((q as unknown as Quiz).questions.length).fill(-1));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate quiz");
    } finally { setBusy(false); }
  }

  async function submit() {
    if (!quiz) return;
    if (answers.some(a => a < 0)) { toast.error("Answer all questions first"); return; }
    setBusy(true);
    try {
      const r = await sub({ data: { quiz_id: quiz.id, answers } });
      setResult({ score: r.score, total: r.total });
      await award({ data: { amount: r.score * 5, reason: `Quiz: ${quiz.topic}` } });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["xp"] });
      qc.invalidateQueries({ queryKey: ["badges"] });
    } finally { setBusy(false); }
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-xl gradient-hero grid place-items-center text-white shadow-glow"><Target className="h-6 w-6"/></div>
        <div>
          <h1 className="text-2xl font-bold">Quizzes & mock tests</h1>
          <p className="text-sm text-muted-foreground">Nova will generate a quiz on any topic</p>
        </div>
      </div>

      {!quiz && (
        <div className="glass rounded-3xl p-6 space-y-4 shadow-glow">
          <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Newton's laws of motion"
            className="w-full rounded-xl border border-border bg-card px-4 py-3"/>
          <div className="grid grid-cols-2 gap-3">
            <select value={difficulty} onChange={e=>setDifficulty(e.target.value as "easy"|"medium"|"hard")}
              className="rounded-xl border border-border bg-card px-4 py-3">
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
            <select value={language} onChange={e=>setLanguage(e.target.value as "english"|"bangla"|"banglish")}
              className="rounded-xl border border-border bg-card px-4 py-3">
              <option value="english">English</option><option value="bangla">বাংলা</option><option value="banglish">Banglish</option>
            </select>
          </div>
          <button onClick={start} disabled={busy || !topic.trim()}
            className="w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground shadow-glow flex items-center justify-center gap-2 disabled:opacity-50">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin"/> Nova is creating your quiz...</> : "Generate quiz ✨"}
          </button>
        </div>
      )}

      {quiz && (
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase text-muted-foreground">{quiz.difficulty}</div>
            <h2 className="text-xl font-bold mt-1">{quiz.topic}</h2>
          </div>
          {quiz.questions.map((q, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className="font-semibold mb-3">{i+1}. {q.question}</div>
              <div className="grid gap-2">
                {q.options.map((opt, oi) => {
                  const picked = answers[i] === oi;
                  const correct = result && oi === q.correct_index;
                  const wrong = result && picked && oi !== q.correct_index;
                  return (
                    <button key={oi} disabled={!!result}
                      onClick={() => setAnswers(a => { const c=[...a]; c[i]=oi; return c; })}
                      className={cn("text-left px-4 py-2.5 rounded-xl border transition flex items-center justify-between",
                        correct ? "border-emerald-500 bg-emerald-500/10" :
                        wrong ? "border-destructive bg-destructive/10" :
                        picked ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                      )}>
                      <span>{opt}</span>
                      {correct && <Check className="h-4 w-4 text-emerald-500"/>}
                      {wrong && <X className="h-4 w-4 text-destructive"/>}
                    </button>
                  );
                })}
              </div>
              {result && <p className="text-sm text-muted-foreground mt-3"><span className="font-semibold">💡 </span>{q.explanation}</p>}
            </div>
          ))}
          {!result ? (
            <button onClick={submit} disabled={busy}
              className="w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground shadow-glow">
              {busy ? "Checking..." : "Submit quiz"}
            </button>
          ) : (
            <div className="glass rounded-3xl p-8 text-center shadow-glow">
              <Nova size={120}/>
              <h2 className="text-3xl font-bold mt-3">Score: <span className="gradient-text">{result.score}/{result.total}</span></h2>
              <p className="text-muted-foreground mt-1">+{result.score * 5} XP earned 🎉</p>
              <button onClick={() => { setQuiz(null); setResult(null); setTopic(""); }}
                className="mt-5 rounded-full gradient-hero px-6 py-2.5 font-semibold text-primary-foreground">
                New quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
