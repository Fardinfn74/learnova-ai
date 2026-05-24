import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useServerFn } from "@tanstack/react-start";
import { triggerNovaInRoom } from "@/lib/learn-ai.functions";
import { Nova } from "@/components/Nova";
import { Send, Users, User, Loader2, LogOut, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/room/$roomId")({ component: RoomPage });

type Message = { id: string; content: string; user_id: string | null; is_nova: boolean; created_at: string };
type Room = { id: string; topic: string; host_id: string; code?: string };

function RoomPage() {
  const { roomId } = Route.useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const triggerNova = useServerFn(triggerNovaInRoom);
  
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRoomAndMessages();

    const channel = supabase.channel(`room:${roomId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'study_messages',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);
        if (newMsg.user_id) {
          supabase.from("profiles").select("display_name").eq("id", newMsg.user_id).single().then(({data}) => {
            if (data) setProfiles(p => ({ ...p, [newMsg.user_id!]: data.display_name || "Student" }));
          });
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'study_rooms',
        filter: `id=eq.${roomId}`
      }, () => {
        // If room is deleted, boot users out
        if (user && room && user.id !== room.host_id) {
          nav({ to: '/app/rooms' });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, user, room?.host_id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchRoomAndMessages = async () => {
    const [{ data: r }, { data: m }] = await Promise.all([
      supabase.from("study_rooms").select("*").eq("id", roomId).single(),
      supabase.from("study_messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true })
    ]);
    if (r) setRoom(r);
    if (m) {
      setMessages(m);
      const userIds = Array.from(new Set(m.map(msg => msg.user_id).filter(Boolean))) as string[];
      if (userIds.length > 0) {
        const { data: pData } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
        if (pData) {
          const pMap: Record<string, string> = {};
          pData.forEach(p => pMap[p.id] = p.display_name || "Student");
          setProfiles(p => ({ ...p, ...pMap }));
        }
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || sending) return;
    
    const text = input.trim();
    setInput("");
    setSending(true);

    // 1. Insert user message
    const { error } = await supabase.from("study_messages").insert({
      room_id: roomId,
      user_id: user.id,
      content: text,
      is_nova: false
    });

    if (!error && text.toLowerCase().includes("@nova")) {
      // 2. Trigger Nova to read the chat and reply
      try {
        await triggerNova({ data: { roomId } });
      } catch (err) {
        console.error("Failed to trigger Nova", err);
      }
    }

    setSending(false);
  };

  const endRoom = async () => {
    if (!room || !user || room.host_id !== user.id) return;
    await supabase.from("study_rooms").delete().eq("id", roomId);
    nav({ to: '/app/rooms' });
  };

  const leaveRoom = () => {
    nav({ to: '/app/rooms' });
  };

  if (!room) return <div className="grid place-items-center h-[50vh]"><Loader2 className="animate-spin text-primary h-8 w-8"/></div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-80px)] md:h-screen p-4 md:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="glass rounded-t-2xl p-4 border-b border-border/40 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{room.topic}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Live Study Room
              {room.code && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[10px] tracking-wider uppercase border border-primary/20">
                  Code: {room.code}
                </span>
              )}
            </p>
          </div>
        </div>
        
        {user?.id === room.host_id ? (
          <button onClick={endRoom} className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition">
            <Trash2 className="h-3.5 w-3.5" /> End Room
          </button>
        ) : (
          <button onClick={leaveRoom} className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted hover:bg-muted-foreground/20 transition">
            <LogOut className="h-3.5 w-3.5" /> Leave Room
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 glass border-y-0 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">
            Say hi to start the study session! Tag @Nova if you need an AI tutor to explain something.
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.user_id === user?.id;
          const isNova = msg.is_nova;
          
          return (
            <div key={msg.id} className={cn("flex gap-3 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : "")}>
              <div className="shrink-0 mt-1">
                {isNova ? (
                  <Nova size={32} float={false} glow={true} />
                ) : (
                  <div className={cn("h-8 w-8 rounded-full grid place-items-center text-white text-xs", isMe ? "bg-primary" : "bg-muted-foreground")}>
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div className={cn(
                "p-3 rounded-2xl text-sm",
                isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : 
                isNova ? "glass border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)] rounded-tl-sm" : 
                "bg-muted rounded-tl-sm"
              )}>
                <div className="text-[10px] opacity-70 mb-1 font-semibold tracking-wider uppercase">
                  {isNova ? "Nova" : isMe ? "You" : (profiles[msg.user_id!] || "Student")}
                </div>
                <div className={cn("prose prose-sm max-w-none", isMe ? "text-primary-foreground prose-invert" : "dark:prose-invert")}>
                  {isNova ? <ReactMarkdown>{msg.content}</ReactMarkdown> : <p className="whitespace-pre-wrap m-0">{msg.content}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="glass rounded-b-2xl p-3 shrink-0">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message... (Tag @Nova for AI help)"
            className="w-full bg-background border border-border/50 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary/50"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || sending}
            className="absolute right-2 h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center hover:scale-105 transition disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4 ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
