import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Users, LogIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/rooms")({ component: RoomsPage });

function RoomsPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [topic, setTopic] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);

  const createRoom = async () => {
    if (!topic.trim()) return toast.error("Enter a topic!");
    if (!user) return;
    setBusy(true);
    
    // Generate a random 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const { data, error } = await supabase.from("study_rooms").insert({
      topic: topic.trim(),
      host_id: user.id,
      code
    }).select().single();

    setBusy(false);
    
    if (error) {
      console.error(error);
      toast.error(`Failed to create room: ${error.message}`);
    } else if (data) {
      toast.success(`Room created! Code: ${data.code}`);
      nav({ to: `/app/room/${data.id}` });
    }
  };

  const joinRoom = async () => {
    if (!joinCode.trim() || joinCode.length !== 6) {
      return toast.error("Enter a valid 6-digit code!");
    }
    setBusy(true);

    const { data, error } = await supabase.from("study_rooms")
      .select("id")
      .eq("code", joinCode.trim())
      .single();

    setBusy(false);

    if (error || !data) {
      toast.error("Room not found or invalid code.");
    } else {
      toast.success("Joining room...");
      nav({ to: `/app/room/${data.id}` });
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto flex flex-col min-h-[calc(100vh-80px)]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 grid place-items-center text-white shadow-glow">
            <Users className="h-6 w-6"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Study Rooms</h1>
            <p className="text-sm text-muted-foreground">Join a live room to study with others. Tag @Nova for AI help!</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
        <div className="flex flex-col gap-4">
          <div className="glass rounded-2xl p-6 shadow-glow border border-primary/20">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Create Room
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Start a new study session and invite your friends with a 6-digit code.</p>
            <input 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="What do you want to study?"
              className="w-full bg-background/80 border border-border/50 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-primary/50"
            />
            <button 
              onClick={createRoom} 
              disabled={busy || !topic.trim()}
              className="w-full py-3 rounded-xl gradient-hero font-semibold text-primary-foreground disabled:opacity-50 transition hover:scale-[1.02]"
            >
              Start Room
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass rounded-2xl p-6 shadow-glow border border-indigo-500/20">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <LogIn className="h-5 w-5 text-indigo-500" /> Join Room
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Have a code from a friend? Enter it below to join their study session.</p>
            <input 
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full bg-background/80 border border-border/50 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-indigo-500/50 text-center tracking-widest font-mono text-lg"
            />
            <button 
              onClick={joinRoom} 
              disabled={busy || joinCode.length !== 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 font-semibold text-primary-foreground disabled:opacity-50 transition hover:scale-[1.02]"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
