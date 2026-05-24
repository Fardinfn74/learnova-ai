import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-CuGaxAnF.mjs";
import { u as useAuth } from "./router-DDX2tWq5.mjs";
import { u as useServerFn } from "./createSsrRpc-CbfToRDd.mjs";
import { c as createBattleQuestions } from "./learn-ai.functions-zm31doCp.mjs";
import { a as awardXp } from "./learnova.functions-Ca7SVHGM.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/seroval.mjs";
import { t as Swords, f as LoaderCircle, v as Trophy, b as CircleAlert, q as Sparkles } from "../_libs/lucide-react.mjs";
import "./index-B082ds2F.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/tanstack__query-core.mjs";
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
import "./nova-prompts-OzvyQkcx.mjs";
import "../_libs/ai-sdk__google.mjs";
import "../_libs/ai-sdk__provider-utils.mjs";
import "../_libs/ai-sdk__provider.mjs";
import "../_libs/eventsource-parser.mjs";
import "../_libs/zod.mjs";
import "../_libs/ai-sdk__groq.mjs";
import "../_libs/ai.mjs";
import "../_libs/ai-sdk__gateway.mjs";
import "../_libs/@vercel/oidc.mjs";
import "path";
import "fs";
import "os";
import "../_libs/opentelemetry__api.mjs";
import "./auth-middleware-B4tEUqco.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
function BattlePage() {
  const {
    user
  } = useAuth();
  const qc = useQueryClient();
  const getQuestions = useServerFn(createBattleQuestions);
  const award = useServerFn(awardXp);
  const [battles, setBattles] = reactExports.useState([]);
  const [activeBattle, setActiveBattle] = reactExports.useState(null);
  const [topic, setTopic] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [currentQIndex, setCurrentQIndex] = reactExports.useState(0);
  const [selectedOpt, setSelectedOpt] = reactExports.useState(null);
  const [showExplanation, setShowExplanation] = reactExports.useState(false);
  reactExports.useEffect(() => {
    fetchLobby();
    const channel = supabase.channel("public:battles").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "battles"
    }, (payload) => {
      if (payload.eventType === "INSERT") {
        setBattles((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        const updated = payload.new;
        setBattles((prev) => prev.map((b) => b.id === updated.id ? updated : b).filter((b) => b.status === "waiting"));
        setActiveBattle((prev) => {
          if (prev?.id === updated.id) {
            return updated;
          }
          return prev;
        });
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const fetchLobby = async () => {
    const {
      data
    } = await supabase.from("battles").select("*").eq("status", "waiting").order("created_at", {
      ascending: false
    });
    if (data) setBattles(data);
  };
  const createBattle = async () => {
    if (!topic.trim() || !user) return toast.error("Enter a topic!");
    setBusy(true);
    try {
      const questions = await getQuestions({
        data: {
          topic: topic.trim()
        }
      });
      const {
        data,
        error
      } = await supabase.from("battles").insert({
        topic: topic.trim(),
        player1_id: user.id,
        questions
      }).select().single();
      if (error) throw error;
      setActiveBattle(data);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to create battle");
    } finally {
      setBusy(false);
    }
  };
  const joinBattle = async (b) => {
    if (!user) return;
    setBusy(true);
    const {
      data,
      error
    } = await supabase.from("battles").update({
      player2_id: user.id,
      status: "playing"
    }).eq("id", b.id).select().single();
    if (error) {
      toast.error("Failed to join. Someone else might have taken it!");
    } else {
      setActiveBattle(data);
      setCurrentQIndex(0);
      setSelectedOpt(null);
      setShowExplanation(false);
    }
    setBusy(false);
  };
  const submitAnswer = async (optIndex) => {
    if (!activeBattle || !user || showExplanation) return;
    const isPlayer1 = activeBattle.player1_id === user.id;
    const isCorrect = activeBattle.questions[currentQIndex].correct_index === optIndex;
    setSelectedOpt(optIndex);
    setShowExplanation(true);
    if (isCorrect) {
      const updateField = isPlayer1 ? {
        player1_score: activeBattle.player1_score + 1
      } : {
        player2_score: activeBattle.player2_score + 1
      };
      await supabase.from("battles").update(updateField).eq("id", activeBattle.id);
    }
    setTimeout(async () => {
      if (currentQIndex < activeBattle.questions.length - 1) {
        setCurrentQIndex((prev) => prev + 1);
        setSelectedOpt(null);
        setShowExplanation(false);
      } else {
        const {
          data
        } = await supabase.from("battles").update({
          status: "finished"
        }).eq("id", activeBattle.id).select().single();
        if (data) setActiveBattle(data);
        if (data) {
          const finalMe = isPlayer1 ? data.player1_score : data.player2_score;
          const finalThem = isPlayer1 ? data.player2_score : data.player1_score;
          if (finalMe > finalThem) {
            await award({
              data: {
                amount: 50,
                reason: "Won a Brain Battle!"
              }
            });
            toast.success("You won! +50 XP 🏆");
          } else if (finalMe === finalThem) {
            await award({
              data: {
                amount: 25,
                reason: "Tied a Brain Battle!"
              }
            });
            toast.info("It's a tie! +25 XP");
          } else {
            await award({
              data: {
                amount: 10,
                reason: "Played a Brain Battle"
              }
            });
            toast.info("You lost, but nice try! +10 XP");
          }
          qc.invalidateQueries({
            queryKey: ["profile"]
          });
          qc.invalidateQueries({
            queryKey: ["xp"]
          });
        }
      }
    }, 2e3);
  };
  const leaveBattle = () => {
    setActiveBattle(null);
    setCurrentQIndex(0);
    setSelectedOpt(null);
    setShowExplanation(false);
    fetchLobby();
  };
  if (activeBattle?.status === "waiting") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[calc(100vh-80px)] grid place-items-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-3xl p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(var(--primary),0.2)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 w-20 mx-auto rounded-full bg-primary/20 grid place-items-center text-primary mb-6 animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-10 w-10" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mb-2", children: "Waiting for opponent..." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mb-8", children: [
        "Topic: ",
        activeBattle.topic
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-sm text-primary font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        " Matchmaking..."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => supabase.from("battles").delete().eq("id", activeBattle.id).then(leaveBattle), className: "mt-8 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition", children: "Cancel Battle" })
    ] }) });
  }
  if (activeBattle && (activeBattle.status === "playing" || activeBattle.status === "finished")) {
    const isPlayer1 = activeBattle.player1_id === user?.id;
    const myScore = isPlayer1 ? activeBattle.player1_score : activeBattle.player2_score;
    const opponentScore = isPlayer1 ? activeBattle.player2_score : activeBattle.player1_score;
    if (activeBattle.status === "finished") {
      const won = myScore > opponentScore;
      const tied = myScore === opponentScore;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[calc(100vh-80px)] grid place-items-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-3xl p-10 max-w-md w-full text-center shadow-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: cn("h-20 w-20 mx-auto mb-6", won ? "text-yellow-500" : tied ? "text-blue-500" : "text-muted-foreground") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold mb-2", children: won ? "Victory!" : tied ? "It's a Tie!" : "Defeat" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-medium mb-8 text-muted-foreground", children: [
          "Score: ",
          myScore,
          " - ",
          opponentScore
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: leaveBattle, className: "w-full py-3 rounded-xl gradient-hero font-bold text-white hover:scale-105 transition shadow-glow", children: "Return to Lobby" })
      ] }) });
    }
    const q = activeBattle.questions[currentQIndex];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto p-6 md:p-10 min-h-[calc(100vh-80px)] flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between glass rounded-2xl p-4 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center w-1/3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground font-bold uppercase tracking-wider", children: "You" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-primary", children: myScore })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center w-1/3 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-6 w-6 mx-auto text-muted-foreground/50 mb-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full inline-block", children: [
            "Q ",
            currentQIndex + 1,
            " / ",
            activeBattle.questions.length
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center w-1/3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground font-bold uppercase tracking-wider", children: "Opponent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold text-destructive", children: opponentScore })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 max-w-2xl mx-auto w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl md:text-2xl font-bold text-center mb-8", children: q.question }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: q.options.map((opt, i) => {
          const isCorrect = q.correct_index === i;
          const isSelected = selectedOpt === i;
          let btnClass = "glass border-border/50 hover:border-primary/50 hover:bg-sidebar-accent";
          if (showExplanation) {
            if (isCorrect) btnClass = "bg-green-500/20 border-green-500 text-green-700 dark:text-green-400";
            else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-700 dark:text-red-400";
            else btnClass = "opacity-50 glass";
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: showExplanation, onClick: () => submitAnswer(i), className: cn("w-full text-left p-4 rounded-xl border transition-all duration-200", btnClass), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-lg bg-background/50 grid place-items-center font-bold text-sm shrink-0", children: ["A", "B", "C", "D"][i] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: opt })
          ] }) }, i);
        }) }),
        showExplanation && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm animate-in fade-in slide-in-from-bottom-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4" }),
            " Explanation"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: q.explanation })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-10 max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-80px)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center justify-between gap-4 mb-8 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 grid place-items-center text-white shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { className: "h-6 w-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Brain Battles" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Challenge others to a live 1v1 AI-generated quiz." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-1 flex flex-col gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 shadow-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
          " Start a Battle"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: topic, onChange: (e) => setTopic(e.target.value), placeholder: "e.g. World War 2, Python, Space", className: "w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-primary/50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: createBattle, disabled: busy || !topic.trim(), className: "w-full py-2.5 rounded-xl gradient-hero font-semibold text-primary-foreground disabled:opacity-50 transition hover:scale-[1.02] flex items-center justify-center gap-2", children: [
          busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : null,
          "Create Match"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-5 min-h-[400px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold mb-4", children: "Waiting for Opponents" }),
        battles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-muted-foreground py-10 opacity-70", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-12 w-12 mx-auto mb-3 opacity-50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No battles currently waiting." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Start one and wait for a challenger!" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: battles.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass bg-background/50 border border-border/30 rounded-xl p-4 flex items-center justify-between hover:bg-sidebar-accent transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-lg", children: b.topic }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-primary font-medium mt-1 uppercase tracking-wider flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
              " Waiting for player 2"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => joinBattle(b), disabled: busy || b.player1_id === user?.id, className: "px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100 shadow-glow", children: "Join Battle" })
        ] }, b.id)) })
      ] }) })
    ] })
  ] });
}
export {
  BattlePage as component
};
