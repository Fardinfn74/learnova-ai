import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useChat } from "../_libs/ai-sdk__react.mjs";
import { D as DefaultChatTransport } from "../_libs/ai.mjs";
import { u as useServerFn } from "./createSsrRpc-CbfToRDd.mjs";
import { s as supabase } from "./client-CuGaxAnF.mjs";
import { a as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as awardXp, s as saveMessage, b as getThreadMessages, c as createThread, d as deleteThread, e as listThreads } from "./learnova.functions-Ca7SVHGM.mjs";
import { N as Nova } from "./Nova-CLOa5n3E.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/seroval.mjs";
import { n as Plus, u as Trash2, f as LoaderCircle, S as Send } from "../_libs/lucide-react.mjs";
import { M as Markdown } from "../_libs/react-markdown.mjs";
import "../_libs/throttleit.mjs";
import "../_libs/ai-sdk__gateway.mjs";
import "../_libs/ai-sdk__provider-utils.mjs";
import "../_libs/ai-sdk__provider.mjs";
import "../_libs/eventsource-parser.mjs";
import "../_libs/zod.mjs";
import "../_libs/@vercel/oidc.mjs";
import "path";
import "fs";
import "os";
import "../_libs/opentelemetry__api.mjs";
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
import "./index-B082ds2F.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./auth-middleware-B4tEUqco.mjs";
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
function ChatPage() {
  const qc = useQueryClient();
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);
  const getMsgs = useServerFn(getThreadMessages);
  const save = useServerFn(saveMessage);
  const award = useServerFn(awardXp);
  const {
    data: threads
  } = useQuery({
    queryKey: ["threads"],
    queryFn: () => list()
  });
  const [activeId, setActiveId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (threads && threads.length && !activeId) setActiveId(threads[0].id);
  }, [threads, activeId]);
  async function newChat() {
    const t = await create({
      data: {
        title: "New chat"
      }
    });
    qc.invalidateQueries({
      queryKey: ["threads"]
    });
    setActiveId(t.id);
  }
  async function removeThread(id) {
    await del({
      data: {
        id
      }
    });
    qc.invalidateQueries({
      queryKey: ["threads"]
    });
    if (activeId === id) setActiveId(null);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-screen flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden lg:flex w-72 flex-col border-r border-border/40 bg-sidebar/40 backdrop-blur-xl p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: newChat, className: "flex items-center justify-center gap-2 rounded-xl gradient-hero py-2.5 text-sm font-semibold text-primary-foreground shadow-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New chat"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-1 overflow-auto flex-1", children: [
        threads?.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("group flex items-center gap-1 rounded-lg pr-1", activeId === t.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveId(t.id), className: "flex-1 text-left px-3 py-2 text-sm truncate", children: t.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeThread(t.id), className: "opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }, t.id)),
        !threads?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground p-3", children: "No chats yet. Start one!" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: activeId ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChatWindow, { threadId: activeId, getMsgs, save, award, onNewChat: newChat }, activeId) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { onNew: newChat }) })
  ] });
}
function EmptyState({
  onNew
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full grid place-items-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 180 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mt-4", children: "Hi! I'm Nova." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Ask me anything — in English, Bangla, or Banglish. I'll explain step-by-step." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onNew, className: "mt-5 rounded-full gradient-hero px-6 py-3 font-semibold text-primary-foreground shadow-glow", children: "Start a chat" })
  ] }) });
}
function ChatWindow({
  threadId,
  getMsgs,
  save,
  award,
  onNewChat
}) {
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["msgs", threadId],
    queryFn: () => getMsgs({
      data: {
        threadId
      }
    })
  });
  const initialMessages = (data?.messages ?? []).map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    parts: [{
      type: "text",
      text: m.content
    }]
  }));
  const [input, setInput] = reactExports.useState("");
  const taRef = reactExports.useRef(null);
  const endRef = reactExports.useRef(null);
  const {
    messages,
    sendMessage,
    status
  } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: async () => {
        const {
          data: data2
        } = await supabase.auth.getSession();
        const token = data2.session?.access_token;
        return token ? {
          Authorization: `Bearer ${token}`
        } : {};
      }
    }),
    onFinish: async ({
      message
    }) => {
      const text = message.parts.map((p) => p.type === "text" ? p.text : "").join("");
      if (text) {
        await save({
          data: {
            thread_id: threadId,
            role: "assistant",
            content: text
          }
        });
        await award({
          data: {
            amount: 2,
            reason: "Chat with Nova"
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
        qc.invalidateQueries({
          queryKey: ["threads"]
        });
      }
    },
    onError: (err) => {
      toast.error(err.message || "Failed to get reply from Nova. Please check your Gemini API key / quota.");
    }
  });
  reactExports.useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, status]);
  reactExports.useEffect(() => {
    taRef.current?.focus();
  }, [threadId, status]);
  async function send() {
    const text = input.trim();
    if (!text || status === "submitted" || status === "streaming") return;
    setInput("");
    await save({
      data: {
        thread_id: threadId,
        role: "user",
        content: text
      }
    });
    sendMessage({
      text
    });
  }
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) });
  const isBusy = status === "submitted" || status === "streaming";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-screen flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/40 px-4 md:px-6 py-3 flex items-center justify-between backdrop-blur-xl bg-background/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 40, float: false, glow: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Nova" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Your AI tutor" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onNewChat, className: "md:hidden flex items-center gap-2 rounded-lg gradient-hero px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
        " New"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-auto px-4 md:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto space-y-6", children: [
      messages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-muted-foreground py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 120 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3", children: "Ask me anything to get started!" })
      ] }),
      messages.map((m) => {
        const text = m.parts.map((p) => p.type === "text" ? p.text : "").join("");
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start"), children: [
          m.role === "assistant" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 36, float: false, glow: false }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("max-w-[80%] rounded-2xl", m.role === "user" ? "gradient-hero text-primary-foreground px-4 py-2.5 shadow-glow" : "px-1 py-1 prose prose-sm dark:prose-invert max-w-none"), children: m.role === "user" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: text }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: text }) })
        ] }, m.id);
      }),
      isBusy && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 36, float: false }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shimmer-text text-sm font-medium", children: "Nova is thinking..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: endRef })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/40 p-4 backdrop-blur-xl bg-background/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto glass rounded-2xl p-2 flex items-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { ref: taRef, value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          send();
        }
      }, placeholder: "Ask Nova anything... (English, Bangla, Banglish)", rows: 1, className: "flex-1 resize-none bg-transparent px-3 py-2 outline-none text-sm max-h-32" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: send, disabled: !input.trim() || isBusy, className: "h-10 w-10 rounded-xl gradient-hero grid place-items-center text-primary-foreground shadow-glow disabled:opacity-50", children: isBusy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
    ] }) })
  ] });
}
export {
  ChatPage as component
};
