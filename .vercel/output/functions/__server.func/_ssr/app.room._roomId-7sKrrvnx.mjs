import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { s as supabase } from "./client-CuGaxAnF.mjs";
import { R as Route$1, u as useAuth } from "./router-DDX2tWq5.mjs";
import { u as useServerFn } from "./createSsrRpc-CbfToRDd.mjs";
import { t as triggerNovaInRoom } from "./learn-ai.functions-zm31doCp.mjs";
import { N as Nova } from "./Nova-CLOa5n3E.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/seroval.mjs";
import { f as LoaderCircle, x as Users, u as Trash2, h as LogOut, w as User, S as Send } from "../_libs/lucide-react.mjs";
import { M as Markdown } from "../_libs/react-markdown.mjs";
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
import "../_libs/tanstack__react-query.mjs";
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
function RoomPage() {
  const {
    roomId
  } = Route$1.useParams();
  const nav = useNavigate();
  const {
    user
  } = useAuth();
  const triggerNova = useServerFn(triggerNovaInRoom);
  const [room, setRoom] = reactExports.useState(null);
  const [messages, setMessages] = reactExports.useState([]);
  const [profiles, setProfiles] = reactExports.useState({});
  const [input, setInput] = reactExports.useState("");
  const [sending, setSending] = reactExports.useState(false);
  const scrollRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    fetchRoomAndMessages();
    const channel = supabase.channel(`room:${roomId}`).on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "study_messages",
      filter: `room_id=eq.${roomId}`
    }, (payload) => {
      const newMsg = payload.new;
      setMessages((prev) => [...prev, newMsg]);
      if (newMsg.user_id) {
        supabase.from("profiles").select("display_name").eq("id", newMsg.user_id).single().then(({
          data
        }) => {
          if (data) setProfiles((p) => ({
            ...p,
            [newMsg.user_id]: data.display_name || "Student"
          }));
        });
      }
    }).on("postgres_changes", {
      event: "DELETE",
      schema: "public",
      table: "study_rooms",
      filter: `id=eq.${roomId}`
    }, () => {
      if (user && room && user.id !== room.host_id) {
        nav({
          to: "/app/rooms"
        });
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user, room?.host_id]);
  reactExports.useEffect(() => {
    return () => {
      if (user && room && user.id === room.host_id) {
        supabase.from("study_rooms").delete().eq("id", roomId).then();
      }
    };
  }, [user, room, roomId]);
  reactExports.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  const fetchRoomAndMessages = async () => {
    const [{
      data: r
    }, {
      data: m
    }] = await Promise.all([supabase.from("study_rooms").select("*").eq("id", roomId).single(), supabase.from("study_messages").select("*").eq("room_id", roomId).order("created_at", {
      ascending: true
    })]);
    if (r) setRoom(r);
    if (m) {
      setMessages(m);
      const userIds = Array.from(new Set(m.map((msg) => msg.user_id).filter(Boolean)));
      if (userIds.length > 0) {
        const {
          data: pData
        } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
        if (pData) {
          const pMap = {};
          pData.forEach((p) => pMap[p.id] = p.display_name || "Student");
          setProfiles((p) => ({
            ...p,
            ...pMap
          }));
        }
      }
    }
  };
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const {
      error
    } = await supabase.from("study_messages").insert({
      room_id: roomId,
      user_id: user.id,
      content: text,
      is_nova: false
    });
    if (!error && text.toLowerCase().includes("@nova")) {
      try {
        await triggerNova({
          data: {
            roomId
          }
        });
      } catch (err) {
        console.error("Failed to trigger Nova", err);
      }
    }
    setSending(false);
  };
  const endRoom = async () => {
    if (!room || !user || room.host_id !== user.id) return;
    await supabase.from("study_rooms").delete().eq("id", roomId);
    nav({
      to: "/app/rooms"
    });
  };
  const leaveRoom = () => {
    nav({
      to: "/app/rooms"
    });
  };
  if (!room) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center h-[50vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin text-primary h-8 w-8" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto flex flex-col h-[calc(100vh-60px)] md:h-screen p-4 md:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-t-2xl p-4 border-b border-border/40 shrink-0 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 grid place-items-center text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-lg leading-tight", children: room.topic }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
            "Live Study Room",
            room.code && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[10px] tracking-wider uppercase border border-primary/20", children: [
              "Code: ",
              room.code
            ] })
          ] })
        ] })
      ] }),
      user?.id === room.host_id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: endRoom, className: "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
        " End Room"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: leaveRoom, className: "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted hover:bg-muted-foreground/20 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }),
        " Leave Room"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: scrollRef, className: "flex-1 glass border-y-0 overflow-y-auto p-4 space-y-4", children: [
      messages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-muted-foreground mt-10", children: "Say hi to start the study session! Tag @Nova if you need an AI tutor to explain something." }),
      messages.map((msg, i) => {
        const isMe = msg.user_id === user?.id;
        const isNova = msg.is_nova;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex gap-3 max-w-[85%]", isMe ? "ml-auto flex-row-reverse" : ""), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 mt-1", children: isNova ? /* @__PURE__ */ jsxRuntimeExports.jsx(Nova, { size: 32, float: false, glow: true }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("h-8 w-8 rounded-full grid place-items-center text-white text-xs", isMe ? "bg-primary" : "bg-muted-foreground"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("p-3 rounded-2xl text-sm", isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : isNova ? "glass border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)] rounded-tl-sm" : "bg-muted rounded-tl-sm"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] opacity-70 mb-1 font-semibold tracking-wider uppercase", children: isNova ? "Nova" : isMe ? "You" : profiles[msg.user_id] || "Student" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("prose prose-sm max-w-none", isMe ? "text-primary-foreground prose-invert" : "dark:prose-invert"), children: isNova ? /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: msg.content }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap m-0", children: msg.content }) })
          ] })
        ] }, msg.id);
      })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-b-2xl p-3 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: sendMessage, className: "relative flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Type a message... (Tag @Nova for AI help)", className: "w-full bg-background border border-border/50 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary/50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !input.trim() || sending, className: "absolute right-2 h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center hover:scale-105 transition disabled:opacity-50", children: sending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 ml-0.5" }) })
    ] }) })
  ] });
}
export {
  RoomPage as component
};
