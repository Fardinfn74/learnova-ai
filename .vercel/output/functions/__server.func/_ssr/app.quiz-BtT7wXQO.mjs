import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./createSsrRpc-CbfToRDd.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { b as generateQuiz, s as submitQuiz } from "./learn-ai.functions-zm31doCp.mjs";
import { a as awardXp } from "./learnova.functions-Ca7SVHGM.mjs";
import { N as Nova } from "./Nova-CLOa5n3E.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/seroval.mjs";
import { T as Target, f as LoaderCircle, C as Check, X } from "../_libs/lucide-react.mjs";
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
import "./auth-middleware-B4tEUqco.mjs";
import "./index-B082ds2F.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/zod.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
function QuizPage() {
  const qc = useQueryClient();
  const gen = useServerFn(generateQuiz);
  const sub = useServerFn(submitQuiz);
  const award = useServerFn(awardXp);
  const [topic, setTopic] = reactExports.useState("");
  const [difficulty, setDifficulty] = reactExports.useState("medium");
  const [language, setLanguage] = reactExports.useState("english");
  const [busy, setBusy] = reactExports.useState(false);
  const [quiz, setQuiz] = reactExports.useState(null);
  const [answers, setAnswers] = reactExports.useState([]);
  const [result, setResult] = reactExports.useState(null);
  async function start() {
    if (!topic.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const q = await gen({
        data: {
          topic,
          difficulty,
          count: 5,
          language
        }
      });
      setQuiz(q);
      setAnswers(new Array(q.questions.length).fill(-1));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate quiz");
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!quiz) return;
    if (answers.some((a) => a < 0)) {
      toast.error("Answer all questions first");
      return;
    }
    setBusy(true);
    try {
      const r = await sub({
        data: {
          quiz_id: quiz.id,
          answers
        }
      });
      setResult({
        score: r.score,
        total: r.total
      });
      await award({
        data: {
          amount: r.score * 5,
          reason: `Quiz: ${quiz.topic}`
        }
      });
      qc.invalidateQueries({
        queryKey: ["profile"]
      });
      qc.invalidateQueries({
        queryKey: ["xp"]
      });
      qc.invalidateQueries({
        queryKey: ["badges"]
      });
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-10 max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-xl gradient-hero grid place-items-center text-white shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Quizzes & mock tests" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Nova will generate a quiz on any topic" })
      ] })
    ] }),
    !quiz && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-3xl p-6 space-y-4 shadow-glow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: topic, onChange: (e) => setTopic(e.target.value), placeholder: "e.g. Newton's laws of motion", className: "w-full rounded-xl border border-border bg-card px-4 py-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: difficulty, onChange: (e) => setDifficulty(e.target.value), className: "rounded-xl border border-border bg-card px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "easy", children: "Easy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "medium", children: "Medium" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "hard", children: "Hard" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: language, onChange: (e) => setLanguage(e.target.value), className: "rounded-xl border border-border bg-card px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "english", children: "English" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "bangla", children: "বাংলা" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "banglish", children: "Banglish" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: start, disabled: busy || !topic.trim(), className: "w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground shadow-glow flex items-center justify-center gap-2 disabled:opacity-50", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        " Nova is creating your quiz..."
      ] }) : "Generate quiz ✨" })
    ] }),
    quiz && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase text-muted-foreground", children: quiz.difficulty }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mt-1", children: quiz.topic })
      ] }),
      quiz.questions.map((q, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold mb-3", children: [
          i + 1,
          ". ",
          q.question
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: q.options.map((opt, oi) => {
          const picked = answers[i] === oi;
          const correct = result && oi === q.correct_index;
          const wrong = result && picked && oi !== q.correct_index;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: !!result, onClick: () => setAnswers((a) => {
            const c = [...a];
            c[i] = oi;
            return c;
          }), className: cn("text-left px-4 py-2.5 rounded-xl border transition flex items-center justify-between", correct ? "border-emerald-500 bg-emerald-500/10" : wrong ? "border-destructive bg-destructive/10" : picked ? "border-primary bg-primary/10" : "border-border hover:bg-muted"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: opt }),
            correct && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-emerald-500" }),
            wrong && /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 text-destructive" })
          ] }, oi);
        }) }),
        result && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "💡 " }),
          q.explanation
        ] })
      ] }, i)),
      !result ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: submit, disabled: busy, className: "w-full rounded-xl gradient-hero py-3 font-semibold text-primary-foreground shadow-glow", children: busy ? "Checking..." : "Submit quiz" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-3xl p-8 text-center shadow-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 120 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-3xl font-bold mt-3", children: [
          "Score: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "gradient-text", children: [
            result.score,
            "/",
            result.total
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mt-1", children: [
          "+",
          result.score * 5,
          " XP earned 🎉"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setQuiz(null);
          setResult(null);
          setTopic("");
        }, className: "mt-5 rounded-full gradient-hero px-6 py-2.5 font-semibold text-primary-foreground", children: "New quiz" })
      ] })
    ] })
  ] });
}
export {
  QuizPage as component
};
