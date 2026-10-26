import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listThreads, createThread, getThreadMessages, saveMessage, deleteThread, awardXp } from "@/lib/learnova.functions";
import { Nova } from "@/components/Nova";
import { Plus, Trash2, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/chat")({ component: ChatPage });

function ChatPage() {
  const qc = useQueryClient();
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);
  const getMsgs = useServerFn(getThreadMessages);
  const save = useServerFn(saveMessage);
  const award = useServerFn(awardXp);

  const { data: threads } = useQuery({ queryKey: ["threads"], queryFn: () => list() });
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (threads && threads.length && !activeId) setActiveId(threads[0].id);
  }, [threads, activeId]);

  async function newChat() {
    const t = await create({ data: { title: "New chat" } });
    qc.invalidateQueries({ queryKey: ["threads"] });
    setActiveId(t.id);
  }

  async function removeThread(id: string) {
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["threads"] });
    if (activeId === id) setActiveId(null);
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex relative">
      {/* Sidebar - hidden on mobile, unless explicitly opened if we added that, but currently it's hidden lg:flex */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-border/40 bg-sidebar/40 backdrop-blur-xl p-3">
        <button onClick={newChat} className="flex items-center justify-center gap-2 rounded-xl gradient-hero py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
          <Plus className="h-4 w-4"/> New chat
        </button>
        <div className="mt-4 space-y-1 overflow-auto flex-1">
          {threads?.map(t => (
            <div key={t.id} className={cn("group flex items-center gap-1 rounded-lg pr-1",
              activeId === t.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60")}>
              <button onClick={() => setActiveId(t.id)} className="flex-1 text-left px-3 py-2 text-sm truncate">
                {t.title}
              </button>
              <button onClick={() => removeThread(t.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5"/>
              </button>
            </div>
          ))}
          {!threads?.length && <p className="text-xs text-muted-foreground p-3">No chats yet. Start one!</p>}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-72 h-full bg-sidebar/95 p-4 shadow-xl border-r border-border/40 animate-in slide-in-from-left duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">My Chats</h3>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-muted rounded-md"><Plus className="h-5 w-5 rotate-45"/></button>
            </div>
            <button onClick={() => { newChat(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 rounded-xl gradient-hero py-2.5 text-sm font-semibold text-primary-foreground shadow-glow mb-4">
              <Plus className="h-4 w-4"/> New chat
            </button>
            <div className="space-y-1 overflow-auto max-h-[calc(100vh-140px)]">
              {threads?.map(t => (
                <div key={t.id} className={cn("group flex items-center gap-1 rounded-lg pr-1",
                  activeId === t.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60")}>
                  <button onClick={() => { setActiveId(t.id); setMobileMenuOpen(false); }} className="flex-1 text-left px-3 py-2 text-sm truncate">
                    {t.title}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        {activeId ? (
          <ChatWindow key={activeId} threadId={activeId} getMsgs={getMsgs} save={save} award={award} onNewChat={newChat} onOpenMenu={() => setMobileMenuOpen(true)} />
        ) : (
          <EmptyState onNew={newChat} onOpenMenu={() => setMobileMenuOpen(true)} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ onNew, onOpenMenu }: { onNew: () => void; onOpenMenu: () => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="lg:hidden border-b border-border/40 px-4 py-3 flex items-center gap-3 backdrop-blur-xl bg-background/60">
        <button onClick={onOpenMenu} className="p-2 hover:bg-muted rounded-lg">
          <Plus className="h-5 w-5"/>
        </button>
        <div className="font-semibold">Nova Chat</div>
      </div>
      <div className="flex-1 grid place-items-center p-8">
        <div className="text-center max-w-md">
          <Nova size={180} />
          <h2 className="text-2xl font-bold mt-4">Hi! I'm Nova.</h2>
          <p className="text-muted-foreground mt-1">Ask me anything — in English, Bangla, or Banglish. I'll explain step-by-step.</p>
          <button onClick={onNew} className="mt-5 rounded-full gradient-hero px-6 py-3 font-semibold text-primary-foreground shadow-glow">
            Start a chat
          </button>
        </div>
      </div>
    </div>
  );
}

type SaveFn = (args: { data: { thread_id: string; role: "user"|"assistant"; content: string } }) => Promise<unknown>;
type GetMsgsFn = (args: { data: { threadId: string } }) => Promise<{ messages: { role: string; content: string; id: string }[] }>;
type AwardFn = (args: { data: { amount: number; reason: string } }) => Promise<unknown>;

function ChatWindow({ threadId, getMsgs, save, award, onNewChat, onOpenMenu }: { threadId: string; getMsgs: GetMsgsFn; save: SaveFn; award: AwardFn; onNewChat: () => void; onOpenMenu: () => void }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["msgs", threadId],
    queryFn: () => getMsgs({ data: { threadId } }),
  });

  const initialMessages: UIMessage[] = (data?.messages ?? []).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    parts: [{ type: "text", text: m.content }],
  }));

  const [input, setInput] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: async (): Promise<Record<string, string>> => {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    onFinish: async ({ message }) => {
      const text = message.parts.map(p => p.type === "text" ? p.text : "").join("");
      if (text) {
        await save({ data: { thread_id: threadId, role: "assistant", content: text } });
        await award({ data: { amount: 2, reason: "Chat with Nova" } });
        qc.invalidateQueries({ queryKey: ["profile"] });
        qc.invalidateQueries({ queryKey: ["xp"] });
        qc.invalidateQueries({ queryKey: ["badges"] });
        qc.invalidateQueries({ queryKey: ["threads"] });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to get reply from Nova. Please check your Gemini API key / quota.");
    },
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, status]);
  useEffect(() => { taRef.current?.focus(); }, [threadId, status]);

  async function send() {
    const text = input.trim();
    if (!text || status === "submitted" || status === "streaming") return;
    setInput("");
    await save({ data: { thread_id: threadId, role: "user", content: text } });
    sendMessage({ text });
  }

  if (isLoading) return <div className="h-full grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>;

  const isBusy = status === "submitted" || status === "streaming";

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b border-border/40 px-4 md:px-6 py-3 flex items-center justify-between backdrop-blur-xl bg-background/60">
        <div className="flex items-center gap-3">
          <button onClick={onOpenMenu} className="lg:hidden p-2 hover:bg-muted rounded-lg -ml-2">
            <Plus className="h-5 w-5"/>
          </button>
          <Nova size={40} float={false} glow={false} />
          <div>
            <div className="font-semibold">Nova</div>
            <div className="text-xs text-muted-foreground">Your AI tutor</div>
          </div>
        </div>
        
        {/* Mobile new chat button */}
        <button onClick={onNewChat} className="md:hidden flex items-center gap-2 rounded-lg gradient-hero px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
          <Plus className="h-3.5 w-3.5"/> New
        </button>
      </div>

      <div className="flex-1 overflow-auto px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <Nova size={120}/>
              <p className="mt-3">Ask me anything to get started!</p>
            </div>
          )}
          {messages.map(m => {
            const text = m.parts.map(p => p.type === "text" ? p.text : "").join("");
            return (
              <div key={m.id} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "assistant" && <div className="shrink-0"><Nova size={36} float={false} glow={false}/></div>}
                <div className={cn(
                  "max-w-[80%] rounded-2xl",
                  m.role === "user"
                    ? "gradient-hero text-primary-foreground px-4 py-2.5 shadow-glow"
                    : "px-1 py-1 prose prose-sm dark:prose-invert max-w-none"
                )}>
                  {m.role === "user"
                    ? <p className="whitespace-pre-wrap">{text}</p>
                    : <ReactMarkdown>{text}</ReactMarkdown>}
                </div>
              </div>
            );
          })}
          {isBusy && (
            <div className="flex gap-3 items-center">
              <Nova size={36} float={false}/>
              <span className="shimmer-text text-sm font-medium">Nova is thinking...</span>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-border/40 p-4 backdrop-blur-xl bg-background/60">
        <div className="max-w-3xl mx-auto glass rounded-2xl p-2 flex items-end gap-2">
          <textarea
            ref={taRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask Nova anything... (English, Bangla, Banglish)"
            rows={1}
            className="flex-1 resize-none bg-transparent px-3 py-2 outline-none text-sm max-h-32"
          />
          <button onClick={send} disabled={!input.trim() || isBusy}
            className="h-10 w-10 rounded-xl gradient-hero grid place-items-center text-primary-foreground shadow-glow disabled:opacity-50">
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
          </button>
        </div>
      </div>
    </div>
  );
}
