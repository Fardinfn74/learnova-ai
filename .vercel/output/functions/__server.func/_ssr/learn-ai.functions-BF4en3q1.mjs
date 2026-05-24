import { c as createServerRpc } from "./createServerRpc-wV0Vk4NU.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-JBvrN22J.mjs";
import { o as output_exports } from "../_libs/ai.mjs";
import { g as generateTextWithFailover, N as NOVA_TASK_SYSTEM, t as truncateMaterial } from "./nova-prompts-B6aBf0d7.mjs";
import { a as createServerFn } from "./index.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { m as objectType, e as arrayType, t as stringType, k as numberType, i as enumType } from "../_libs/zod.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/ai-sdk__gateway.mjs";
import "../_libs/ai-sdk__provider-utils.mjs";
import "../_libs/ai-sdk__provider.mjs";
import "../_libs/eventsource-parser.mjs";
import "../_libs/@vercel/oidc.mjs";
import "path";
import "fs";
import "os";
import "../_libs/opentelemetry__api.mjs";
import "../_libs/ai-sdk__google.mjs";
import "../_libs/ai-sdk__groq.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
const QuizSchema = objectType({
  questions: arrayType(objectType({
    question: stringType(),
    options: arrayType(stringType()).length(4),
    correct_index: numberType().int().min(0).max(3),
    explanation: stringType()
  })).min(3).max(15)
});
const generateQuiz_createServerFn_handler = createServerRpc({
  id: "bdae223da88f48a2748f77243bd92b86bdbdee720498aef131ffbd6f795c85b7",
  name: "generateQuiz",
  filename: "src/lib/learn-ai.functions.ts"
}, (opts) => generateQuiz.__executeServer(opts));
const generateQuiz = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  topic: stringType().min(2).max(200),
  difficulty: enumType(["easy", "medium", "hard"]).default("medium"),
  count: numberType().int().min(3).max(10).default(5),
  language: enumType(["english", "bangla", "banglish"]).default("english")
}).parse(d)).handler(generateQuiz_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const lang = data.language === "bangla" ? "Bangla" : data.language === "banglish" ? "Banglish" : "English";
  const {
    experimental_output: output
  } = await generateTextWithFailover({
    tier: "fast",
    budget: "quiz",
    system: NOVA_TASK_SYSTEM,
    experimental_output: output_exports.object({
      schema: QuizSchema
    }),
    prompt: `${data.count} MCQs, ${data.difficulty}, topic: "${data.topic}". Lang: ${lang}. 4 options, correct_index 0-3, 1-line explanation each.`
  });
  const {
    data: quiz,
    error
  } = await supabase.from("quizzes").insert({
    user_id: userId,
    topic: data.topic,
    difficulty: data.difficulty,
    language: data.language,
    questions: output.questions
  }).select("*").single();
  if (error) throw error;
  return quiz;
});
const getQuiz_createServerFn_handler = createServerRpc({
  id: "8633c3504b8395fb6f321efe7c6b82121f8635edb929510ee62f65a6a0b3d097",
  name: "getQuiz",
  filename: "src/lib/learn-ai.functions.ts"
}, (opts) => getQuiz.__executeServer(opts));
const getQuiz = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(getQuiz_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: q,
    error
  } = await supabase.from("quizzes").select("*").eq("id", data.id).eq("user_id", userId).single();
  if (error) throw error;
  return q;
});
const listQuizzes_createServerFn_handler = createServerRpc({
  id: "1b2b7191b91c3ff789bd5a616b7e024a46aeaff6d0658c1531356036b7b09f53",
  name: "listQuizzes",
  filename: "src/lib/learn-ai.functions.ts"
}, (opts) => listQuizzes.__executeServer(opts));
const listQuizzes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listQuizzes_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data
  } = await supabase.from("quizzes").select("id,topic,difficulty,language,created_at").eq("user_id", userId).order("created_at", {
    ascending: false
  }).limit(20);
  return data ?? [];
});
const submitQuiz_createServerFn_handler = createServerRpc({
  id: "ea84f326f490e76c4a356ae32318f7662447176cdaa95486e841462d0382705b",
  name: "submitQuiz",
  filename: "src/lib/learn-ai.functions.ts"
}, (opts) => submitQuiz.__executeServer(opts));
const submitQuiz = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  quiz_id: stringType().uuid(),
  answers: arrayType(numberType().int().min(0).max(3))
}).parse(d)).handler(submitQuiz_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: q
  } = await supabase.from("quizzes").select("questions").eq("id", data.quiz_id).eq("user_id", userId).single();
  if (!q) throw new Error("Quiz not found");
  const questions = q.questions;
  let score = 0;
  questions.forEach((qq, i) => {
    if (qq.correct_index === data.answers[i]) score++;
  });
  const {
    data: attempt,
    error
  } = await supabase.from("quiz_attempts").insert({
    user_id: userId,
    quiz_id: data.quiz_id,
    score,
    total: questions.length,
    answers: data.answers
  }).select("*").single();
  if (error) throw error;
  return {
    attempt,
    score,
    total: questions.length
  };
});
const SummarySchema = objectType({
  title: stringType(),
  summary: stringType(),
  key_points: arrayType(stringType()).min(3).max(10),
  flashcards: arrayType(objectType({
    question: stringType(),
    answer: stringType()
  })).min(3).max(12)
});
const summarizeNote_createServerFn_handler = createServerRpc({
  id: "75329c7c4ff75e07d1d0909733fee351e9eb0d4cdb102b525bf105748123298f",
  name: "summarizeNote",
  filename: "src/lib/learn-ai.functions.ts"
}, (opts) => summarizeNote.__executeServer(opts));
const summarizeNote = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  text: stringType().min(50).max(2e4),
  language: enumType(["english", "bangla", "banglish"]).default("english")
}).parse(d)).handler(summarizeNote_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const lang = data.language === "bangla" ? "Bangla" : data.language === "banglish" ? "Banglish" : "English";
  const material = truncateMaterial(data.text, 1e4);
  const {
    experimental_output: output
  } = await generateTextWithFailover({
    tier: "fast",
    budget: "summary",
    system: NOVA_TASK_SYSTEM,
    experimental_output: output_exports.object({
      schema: SummarySchema
    }),
    prompt: `Summarize for a student (${lang}): title, 4-6 sentence summary, 5-8 key points, 6-10 flashcards.

MATERIAL:
"""${material}"""`
  });
  const {
    data: note,
    error
  } = await supabase.from("notes").insert({
    user_id: userId,
    title: output.title,
    source_text: material,
    summary: output.summary + "\n\n**Key points:**\n" + output.key_points.map((p) => "- " + p).join("\n"),
    flashcards: output.flashcards
  }).select("*").single();
  if (error) throw error;
  return note;
});
const listNotes_createServerFn_handler = createServerRpc({
  id: "5a1ebc07180d8b151113c01624cc0dcef24d1cd78c558785d46e545bcf84c640",
  name: "listNotes",
  filename: "src/lib/learn-ai.functions.ts"
}, (opts) => listNotes.__executeServer(opts));
const listNotes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listNotes_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data
  } = await supabase.from("notes").select("id,title,created_at").eq("user_id", userId).order("created_at", {
    ascending: false
  }).limit(30);
  return data ?? [];
});
const getNote_createServerFn_handler = createServerRpc({
  id: "473c9cddf91b27ff2460c184dffca1676fad003867f4633c5b577f33e3952999",
  name: "getNote",
  filename: "src/lib/learn-ai.functions.ts"
}, (opts) => getNote.__executeServer(opts));
const getNote = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(getNote_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: n,
    error
  } = await supabase.from("notes").select("*").eq("id", data.id).eq("user_id", userId).single();
  if (error) throw error;
  return n;
});
const analyzeDrawing_createServerFn_handler = createServerRpc({
  id: "65750bfb5c27df3558a9c4f33ff513fb15364ec4647ca3e23b63df3037bfb15c",
  name: "analyzeDrawing",
  filename: "src/lib/learn-ai.functions.ts"
}, (opts) => analyzeDrawing.__executeServer(opts));
const analyzeDrawing = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  image: stringType(),
  prompt: stringType().optional(),
  language: enumType(["english", "bangla", "banglish"]).default("english")
}).parse(d)).handler(analyzeDrawing_createServerFn_handler, async ({
  data
}) => {
  const langInstr = data.language === "bangla" ? "বাংলায় উত্তর দিন।" : data.language === "banglish" ? "Reply in Banglish." : "Reply in English.";
  let base64Data = data.image;
  if (base64Data.startsWith("data:image")) {
    base64Data = base64Data.split(",")[1];
  }
  const imageBuffer = Buffer.from(base64Data, "base64");
  const defaultPrompt = "Math: solve step-by-step. Diagram: explain clearly. Unclear: ask for a clearer drawing.";
  const finalPrompt = `${data.prompt || defaultPrompt} (${langInstr})`;
  const {
    text
  } = await generateTextWithFailover({
    vision: true,
    tier: "quality",
    budget: "draw",
    system: NOVA_TASK_SYSTEM,
    messages: [{
      role: "user",
      content: [{
        type: "text",
        text: finalPrompt
      }, {
        type: "image",
        image: imageBuffer
      }]
    }]
  });
  return text;
});
const PodcastSchema = objectType({
  title: stringType(),
  segments: arrayType(objectType({
    speaker: enumType(["host", "nova"]),
    text: stringType()
  })).min(4).max(14)
});
const generatePodcast_createServerFn_handler = createServerRpc({
  id: "25f70043a9c51486d23c5082abc8d71fd8cb4f7fcab680b9388e48a2b95c8f9c",
  name: "generatePodcast",
  filename: "src/lib/learn-ai.functions.ts"
}, (opts) => generatePodcast.__executeServer(opts));
const generatePodcast = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  text: stringType().min(50).max(3e4),
  language: enumType(["english", "bangla", "banglish"]).default("english")
}).parse(d)).handler(generatePodcast_createServerFn_handler, async ({
  data
}) => {
  const lang = data.language === "bangla" ? "Bangla" : data.language === "banglish" ? "Banglish" : "English";
  const material = truncateMaterial(data.text, 12e3);
  const {
    experimental_output: output
  } = await generateTextWithFailover({
    tier: "quality",
    budget: "podcast",
    system: NOVA_TASK_SYSTEM,
    experimental_output: output_exports.object({
      schema: PodcastSchema
    }),
    prompt: `2-speaker podcast (${lang}): "host" (student) + "nova" (tutor). Natural, educational, 8-12 segments.

TEXT:
"""${material}"""`
  });
  return output;
});
const triggerNovaInRoom_createServerFn_handler = createServerRpc({
  id: "f0a5ad3ea41e0981f2316f12f6513cbc0fdddd4dde839319874118bd8f02f913",
  name: "triggerNovaInRoom",
  filename: "src/lib/learn-ai.functions.ts"
}, (opts) => triggerNovaInRoom.__executeServer(opts));
const triggerNovaInRoom = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  roomId: stringType().uuid()
}).parse(d)).handler(triggerNovaInRoom_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: messages
  } = await supabase.from("study_messages").select("content, is_nova").eq("room_id", data.roomId).order("created_at", {
    ascending: false
  }).limit(6);
  if (!messages) return;
  const ordered = messages.reverse();
  const conversation = ordered.map((m, i) => {
    const label = m.is_nova ? "Nova" : "Student";
    const raw = String(m.content || "");
    const text2 = i < ordered.length - 2 && raw.length > 240 ? `${raw.slice(0, 240)}…` : raw;
    return `${label}: ${text2}`;
  }).join("\n");
  const {
    text
  } = await generateTextWithFailover({
    tier: "fast",
    budget: "room",
    system: NOVA_TASK_SYSTEM,
    prompt: `Study room — reply as Nova in 2-4 helpful sentences. No greeting if ongoing.

${conversation}

Nova:`
  });
  await supabase.from("study_messages").insert({
    room_id: data.roomId,
    content: text,
    is_nova: true,
    user_id: context.userId
  });
  return true;
});
const createBattleQuestions_createServerFn_handler = createServerRpc({
  id: "e35bddc95802986bc149006002b212091611bf1e7f9de561056e931f56864d9e",
  name: "createBattleQuestions",
  filename: "src/lib/learn-ai.functions.ts"
}, (opts) => createBattleQuestions.__executeServer(opts));
const createBattleQuestions = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  topic: stringType().min(2).max(100)
}).parse(d)).handler(createBattleQuestions_createServerFn_handler, async ({
  data
}) => {
  const {
    experimental_output: output
  } = await generateTextWithFailover({
    tier: "fast",
    budget: "battle",
    system: NOVA_TASK_SYSTEM,
    experimental_output: output_exports.object({
      schema: QuizSchema
    }),
    prompt: `5-question battle quiz on "${data.topic}". 4 options each, correct_index 0-3, brief explanation.`
  });
  return output.questions;
});
export {
  analyzeDrawing_createServerFn_handler,
  createBattleQuestions_createServerFn_handler,
  generatePodcast_createServerFn_handler,
  generateQuiz_createServerFn_handler,
  getNote_createServerFn_handler,
  getQuiz_createServerFn_handler,
  listNotes_createServerFn_handler,
  listQuizzes_createServerFn_handler,
  submitQuiz_createServerFn_handler,
  summarizeNote_createServerFn_handler,
  triggerNovaInRoom_createServerFn_handler
};
