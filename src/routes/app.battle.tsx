import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { createBattleQuestions } from "@/lib/learn-ai.functions";
import { awardXp } from "@/lib/learnova.functions";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, Swords, Trophy, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/battle")({ component: BattlePage });

type Question = { question: string; options: string[]; correct_index: number; explanation: string };
type Battle = { 
  id: string; 
  topic: string; 
  status: "waiting" | "playing" | "finished"; 
  player1_id: string; 
  player2_id: string | null;
  player1_score: number;
  player2_score: number;
  questions: Question[];
};

function BattlePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const getQuestions = useServerFn(createBattleQuestions);
  const award = useServerFn(awardXp);

  const [battles, setBattles] = useState<Battle[]>([]);
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  
  // Quiz state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    fetchLobby();
    
    // Subscribe to all battle changes
    const channel = supabase.channel("public:battles")
      .on('postgres_changes', { event: '*', schema: 'public', table: 'battles' }, payload => {
        if (payload.eventType === 'INSERT') {
          setBattles(prev => [payload.new as Battle, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Battle;
          setBattles(prev => prev.map(b => b.id === updated.id ? updated : b).filter(b => b.status === "waiting"));
          
          // Update active battle if we are in it
          setActiveBattle(prev => {
            if (prev?.id === updated.id) {
              // If status changed to finished, handle end game
              return updated;
            }
            return prev;
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchLobby = async () => {
    const { data } = await supabase.from("battles").select("*").eq("status", "waiting").order("created_at", { ascending: false });
    if (data) setBattles(data as unknown as Battle[]);
  };

  const createBattle = async () => {
    if (!topic.trim() || !user) return toast.error("Enter a topic!");
    setBusy(true);
    
    try {
      const questions = await getQuestions({ data: { topic: topic.trim() } });
      const { data, error } = await supabase.from("battles").insert({
        topic: topic.trim(),
        player1_id: user.id,
        questions
      }).select().single();
      
      if (error) throw error;
      setActiveBattle(data as unknown as Battle);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to create battle");
    } finally {
      setBusy(false);
    }
  };

  const joinBattle = async (b: Battle) => {
    if (!user) return;
    setBusy(true);
    const { data, error } = await supabase.from("battles")
      .update({ player2_id: user.id, status: "playing" })
      .eq("id", b.id)
      .select().single();
      
    if (error) {
      toast.error("Failed to join. Someone else might have taken it!");
    } else {
      setActiveBattle(data as unknown as Battle);
      setCurrentQIndex(0);
      setSelectedOpt(null);
      setShowExplanation(false);
    }
    setBusy(false);
  };

  const submitAnswer = async (optIndex: number) => {
    if (!activeBattle || !user || showExplanation) return;
    
    const isPlayer1 = activeBattle.player1_id === user.id;
    const isCorrect = activeBattle.questions[currentQIndex].correct_index === optIndex;
    
    setSelectedOpt(optIndex);
    setShowExplanation(true);

    if (isCorrect) {
      const updateField = isPlayer1 ? { player1_score: activeBattle.player1_score + 1 } : { player2_score: activeBattle.player2_score + 1 };
      await supabase.from("battles").update(updateField).eq("id", activeBattle.id);
    }

    setTimeout(async () => {
      if (currentQIndex < activeBattle.questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setSelectedOpt(null);
        setShowExplanation(false);
      } else {
        // Game over
        const { data } = await supabase.from("battles").update({ status: "finished" }).eq("id", activeBattle.id).select().single();
        if (data) setActiveBattle(data as unknown as Battle);
        
        // Award XP (Winner gets 100, Loser gets 20)
        // Check if we won
        if (data) {
          const finalMe = isPlayer1 ? data.player1_score : data.player2_score;
          const finalThem = isPlayer1 ? data.player2_score : data.player1_score;
          if (finalMe > finalThem) {
            await award({ data: { amount: 50, reason: "Won a Brain Battle!" } });
            toast.success("You won! +50 XP 🏆");
          } else if (finalMe === finalThem) {
             await award({ data: { amount: 25, reason: "Tied a Brain Battle!" } });
             toast.info("It's a tie! +25 XP");
          } else {
            await award({ data: { amount: 10, reason: "Played a Brain Battle" } });
            toast.info("You lost, but nice try! +10 XP");
          }
          qc.invalidateQueries({ queryKey: ["profile"] });
          qc.invalidateQueries({ queryKey: ["xp"] });
        }
      }
    }, 2000); // 2 second pause to read explanation
  };

  const leaveBattle = () => {
    setActiveBattle(null);
    setCurrentQIndex(0);
    setSelectedOpt(null);
    setShowExplanation(false);
    fetchLobby();
  };

  // ----- UI STATES -----

  if (activeBattle?.status === "waiting") {
    return (
      <div className="min-h-[calc(100vh-80px)] grid place-items-center p-6">
        <div className="glass rounded-3xl p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(var(--primary),0.2)]">
          <div className="h-20 w-20 mx-auto rounded-full bg-primary/20 grid place-items-center text-primary mb-6 animate-pulse">
            <Swords className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Waiting for opponent...</h2>
          <p className="text-muted-foreground mb-8">Topic: {activeBattle.topic}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
            <Loader2 className="h-4 w-4 animate-spin" /> Matchmaking...
          </div>
          <button onClick={() => supabase.from("battles").delete().eq("id", activeBattle.id).then(leaveBattle)} className="mt-8 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition">
            Cancel Battle
          </button>
        </div>
      </div>
    );
  }

  if (activeBattle && (activeBattle.status === "playing" || activeBattle.status === "finished")) {
    const isPlayer1 = activeBattle.player1_id === user?.id;
    const myScore = isPlayer1 ? activeBattle.player1_score : activeBattle.player2_score;
    const opponentScore = isPlayer1 ? activeBattle.player2_score : activeBattle.player1_score;
    
    if (activeBattle.status === "finished") {
      const won = myScore > opponentScore;
      const tied = myScore === opponentScore;
      return (
        <div className="min-h-[calc(100vh-80px)] grid place-items-center p-6">
          <div className="glass rounded-3xl p-10 max-w-md w-full text-center shadow-glow">
            <Trophy className={cn("h-20 w-20 mx-auto mb-6", won ? "text-yellow-500" : tied ? "text-blue-500" : "text-muted-foreground")} />
            <h2 className="text-3xl font-bold mb-2">{won ? "Victory!" : tied ? "It's a Tie!" : "Defeat"}</h2>
            <p className="text-xl font-medium mb-8 text-muted-foreground">Score: {myScore} - {opponentScore}</p>
            <button onClick={leaveBattle} className="w-full py-3 rounded-xl gradient-hero font-bold text-white hover:scale-105 transition shadow-glow">
              Return to Lobby
            </button>
          </div>
        </div>
      );
    }

    const q = activeBattle.questions[currentQIndex];
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10 min-h-[calc(100vh-80px)] flex flex-col">
        {/* Battle Header */}
        <div className="flex items-center justify-between glass rounded-2xl p-4 mb-8">
          <div className="text-center w-1/3">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">You</div>
            <div className="text-3xl font-bold text-primary">{myScore}</div>
          </div>
          <div className="text-center w-1/3 shrink-0">
            <Swords className="h-6 w-6 mx-auto text-muted-foreground/50 mb-1" />
            <div className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full inline-block">
              Q {currentQIndex + 1} / {activeBattle.questions.length}
            </div>
          </div>
          <div className="text-center w-1/3">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Opponent</div>
            <div className="text-3xl font-bold text-destructive">{opponentScore}</div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 max-w-2xl mx-auto w-full">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-8">{q.question}</h2>
          
          <div className="grid gap-3">
            {q.options.map((opt, i) => {
              const isCorrect = q.correct_index === i;
              const isSelected = selectedOpt === i;
              let btnClass = "glass border-border/50 hover:border-primary/50 hover:bg-sidebar-accent";
              
              if (showExplanation) {
                if (isCorrect) btnClass = "bg-green-500/20 border-green-500 text-green-700 dark:text-green-400";
                else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-700 dark:text-red-400";
                else btnClass = "opacity-50 glass";
              }

              return (
                <button
                  key={i}
                  disabled={showExplanation}
                  onClick={() => submitAnswer(i)}
                  className={cn("w-full text-left p-4 rounded-xl border transition-all duration-200", btnClass)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-background/50 grid place-items-center font-bold text-sm shrink-0">
                      {["A", "B", "C", "D"][i]}
                    </div>
                    <span className="font-medium">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm animate-in fade-in slide-in-from-bottom-2">
              <div className="font-bold flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4" /> Explanation
              </div>
              <p className="text-muted-foreground">{q.explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Lobby
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-80px)]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 grid place-items-center text-white shadow-glow">
            <Swords className="h-6 w-6"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Brain Battles</h1>
            <p className="text-sm text-muted-foreground">Challenge others to a live 1v1 AI-generated quiz.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Create Battle */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="glass rounded-2xl p-5 shadow-glow">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Start a Battle
            </h2>
            <input 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. World War 2, Python, Space"
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-primary/50"
            />
            <button 
              onClick={createBattle} 
              disabled={busy || !topic.trim()}
              className="w-full py-2.5 rounded-xl gradient-hero font-semibold text-primary-foreground disabled:opacity-50 transition hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin"/> : null}
              Create Match
            </button>
          </div>
        </div>

        {/* Lobbies */}
        <div className="md:col-span-2">
          <div className="glass rounded-2xl p-5 min-h-[400px]">
            <h2 className="font-semibold mb-4">Waiting for Opponents</h2>
            
            {battles.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 opacity-70">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No battles currently waiting.</p>
                <p className="text-sm mt-1">Start one and wait for a challenger!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {battles.map(b => (
                  <div key={b.id} className="glass bg-background/50 border border-border/30 rounded-xl p-4 flex items-center justify-between hover:bg-sidebar-accent transition">
                    <div>
                      <div className="font-bold text-lg">{b.topic}</div>
                      <div className="text-xs text-primary font-medium mt-1 uppercase tracking-wider flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Waiting for player 2
                      </div>
                    </div>
                    <button onClick={() => joinBattle(b)} disabled={busy || b.player1_id === user?.id} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100 shadow-glow">
                      Join Battle
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
