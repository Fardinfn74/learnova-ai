import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/lib/auth-middleware";
import { z } from "zod";
import { Output } from "ai";
import { generateTextWithFailover } from "./ai-gateway";
import { truncateMaterial } from "./ai-budget";
import { NOVA_GAME_HELPER_SYSTEM, NOVA_TASK_SYSTEM } from "./nova-prompts";
import { assertSafe, enforce, type PolicyName } from "./guard.server";
import { admin, adminConfigured, adminRpc, grantXp, userRpc } from "./db.server";
import { filterByAgreement, stripKeys, verifierPrompt, type QuizQuestion } from "./quiz-verify";
import { runCSource } from "./code-run.server";
import { sampleTranscript } from "./video-moderation";

type Ctx = { userId: string; isAnonymous: boolean };
const guard = (ctx: Ctx, policy: PolicyName) => enforce(ctx.userId, ctx.isAnonymous, policy);
const LANG = z.enum(["english", "bangla", "banglish"]).default("english");
const langName = (l: string) => (l === "bangla" ? "Bangla" : l === "banglish" ? "Banglish" : "English");

const QuizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correct_index: z.number().int().min(0).max(3),
        explanation: z.string(),
      }),
    )
    .min(3)
    .max(15),
});

/** Independent answer pass; failures degrade gracefully to "unverified". */
async function verifyQuestions(questions: QuizQuestion[]) {
  if (process.env.QUIZ_VERIFY === "false") return { kept: questions, dropped: 0, verified: false };
  try {
    const { experimental_output: out } = await generateTextWithFailover({
      tier: "fast",
      budget: "quiz",
      system: NOVA_TASK_SYSTEM,
      experimental_output: Output.object({
        schema: z.object({ answers: z.array(z.object({ index: z.number().int(), choice: z.number().int().min(0).max(3) })) }),
      }),
      prompt: verifierPrompt(questions),
    });
    return filterByAgreement(questions, out.answers);
  } catch (e) {
    console.warn("[quiz-verify] skipped:", e instanceof Error ? e.message : e);
    return { kept: questions, dropped: 0, verified: false };
  }
}

async function writeQuizKey(supabase: any, quizId: string, key: QuizQuestion[]) {
  if (adminConfigured()) {
    const { error } = await admin().from("quiz_answer_keys").insert({ quiz_id: quizId, key });
    if (error) throw new Error("Could not save the quiz. Please try again.");
    return true;
  }
  console.warn("[quiz] SUPABASE_SERVICE_ROLE_KEY missing: answer keys stored with questions (dev only)");
  await supabase.from("quizzes").update({ questions: key }).eq("id", quizId);
  return false;
}

// ===== QUIZ =====

export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      topic: z.string().min(2).max(200),
      difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
      count: z.number().int().min(3).max(10).default(5),
      language: LANG,
      /** Learn Tube: build the quiz from exactly what the teacher said in this video. */
      videoId: z.string().uuid().optional(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await guard(context, "quiz");
    assertSafe(data.topic);

    let material = "";
    if (data.videoId) {
      // RLS decides whether this learner may see the video at all; only then do we read its transcript.
      const { data: vid } = await supabase.from("videos" as never).select("id").eq("id", data.videoId).maybeSingle();
      if (!vid) throw new Error("Video not found");
      const { data: tr } = await admin().from("video_transcripts").select("body").eq("video_id", data.videoId).maybeSingle();
      material = sampleTranscript((tr as { body?: string } | null)?.body ?? "", 9000);
    }

    const { experimental_output: output } = await generateTextWithFailover({
      tier: "fast",
      budget: "quiz",
      system: NOVA_TASK_SYSTEM,
      experimental_output: Output.object({ schema: QuizSchema }),
      prompt: `${data.count} MCQs, ${data.difficulty}. Language: ${langName(data.language)}. 4 options, correct_index 0-3, 1-line explanation each.${material ? " Base EVERY question only on the lesson transcript in <material>." : ""}\n<topic>${data.topic}</topic>${material ? `\n<material>${material}</material>` : ""}`,
    });

    const { kept, dropped, verified } = await verifyQuestions(output.questions);

    const { data: quiz, error } = await supabase
      .from("quizzes")
      .insert({
        user_id: userId,
        topic: data.topic,
        difficulty: data.difficulty,
        language: data.language,
        questions: stripKeys(kept) as never,
      })
      .select("*")
      .single();
    if (error) throw new Error("Could not save the quiz. Please try again.");
    await writeQuizKey(supabase, quiz.id, kept);
    return { ...quiz, questions: stripKeys(kept), verification: { verified, dropped } };
  });

export const getQuiz = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: q, error } = await supabase.from("quizzes").select("*").eq("id", data.id).eq("user_id", userId).single();
    if (error) throw new Error("Quiz not found");
    return { ...q, questions: stripKeys(q.questions as never) };
  });

export const listQuizzes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("quizzes").select("id,topic,difficulty,language,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20);
    return data ?? [];
  });

export const submitQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ quiz_id: z.string().uuid(), answers: z.array(z.number().int().min(0).max(3)).min(1).max(15) }).parse(d))
  .handler(async ({ context, data }) => {
    const r = await userRpc<{ attempt_id: string; score: number; total: number; awarded: number; answer_key: QuizQuestion[] }>(
      context.supabase, "submit_quiz_attempt", { p_quiz_id: data.quiz_id, p_answers: data.answers },
    );
    return { score: r.score, total: r.total, awarded: r.awarded, answerKey: r.answer_key };
  });

// ===== SUMMARIZER =====

const SummarySchema = z.object({
  title: z.string(),
  summary: z.string(),
  key_points: z.array(z.string()).min(3).max(10),
  flashcards: z.array(z.object({ question: z.string(), answer: z.string() })).min(3).max(12),
});

export const summarizeNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ text: z.string().min(50).max(20000), language: LANG }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await guard(context, "summarize");
    assertSafe(data.text);
    const material = truncateMaterial(data.text, 10_000);

    const { experimental_output: output } = await generateTextWithFailover({
      tier: "fast",
      budget: "summary",
      system: NOVA_TASK_SYSTEM,
      experimental_output: Output.object({ schema: SummarySchema }),
      prompt: `Summarize for a student (${langName(data.language)}): title, 4-6 sentence summary, 5-8 key points, 6-10 flashcards.\n\n<material>${material}</material>`,
    });

    const { data: note, error } = await supabase
      .from("notes")
      .insert({
        user_id: userId,
        title: output.title,
        source_text: material,
        summary: output.summary + "\n\n**Key points:**\n" + output.key_points.map((p: string) => "- " + p).join("\n"),
        flashcards: output.flashcards,
      })
      .select("*")
      .single();
    if (error) throw new Error("Could not save your note. Please try again.");
    const xp = await grantXp(userId, "summarize_notes", note.id);
    return { ...note, xp_awarded: xp };
  });

export const listNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("notes").select("id,title,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30);
    return data ?? [];
  });

export const getNote = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: n, error } = await supabase.from("notes").select("*").eq("id", data.id).eq("user_id", userId).single();
    if (error) throw new Error("Note not found");
    return n;
  });

// ===== DRAW TO LEARN (VISION) =====

const MAX_IMAGE_CHARS = 2_800_000; // ≈ 2 MB of base64
const IMAGE_RE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

export const analyzeDrawing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      image: z.string().max(MAX_IMAGE_CHARS).regex(IMAGE_RE, "Unsupported image"),
      prompt: z.string().max(500).optional(),
      language: LANG,
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await guard(context, "draw");
    if (data.prompt) assertSafe(data.prompt);
    const langInstr = data.language === "bangla" ? "বাংলায় উত্তর দিন।" : data.language === "banglish" ? "Reply in Banglish." : "Reply in English.";
    const imageBuffer = Buffer.from(data.image.split(",")[1], "base64");
    const defaultPrompt = "Math: solve step-by-step. Diagram: explain clearly. Unclear: ask for a clearer drawing.";

    const { text } = await generateTextWithFailover({
      vision: true,
      tier: "quality",
      budget: "draw",
      system: NOVA_TASK_SYSTEM,
      messages: [{ role: "user", content: [{ type: "text", text: `${data.prompt || defaultPrompt} (${langInstr})` }, { type: "image", image: imageBuffer }] }],
    });
    const xp = await grantXp(context.userId, "draw_analysis", null);
    return { text, xp_awarded: xp };
  });

// ===== PAPER TO PODCAST =====

const PodcastSchema = z.object({
  title: z.string(),
  segments: z.array(z.object({ speaker: z.enum(["host", "nova"]), text: z.string() })).min(4).max(14),
});

export const generatePodcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ text: z.string().min(50).max(30000), language: LANG }).parse(d))
  .handler(async ({ context, data }) => {
    await guard(context, "podcast");
    assertSafe(data.text);
    const material = truncateMaterial(data.text, 12_000);
    const { experimental_output: output } = await generateTextWithFailover({
      tier: "quality",
      budget: "podcast",
      system: NOVA_TASK_SYSTEM,
      experimental_output: Output.object({ schema: PodcastSchema }),
      prompt: `2-speaker podcast (${langName(data.language)}): "host" (student) + "nova" (tutor). Natural, educational, 8-12 segments.\n\n<material>${material}</material>`,
    });
    const xp = await grantXp(context.userId, "podcast", null);
    return { ...output, xp_awarded: xp };
  });

// ===== STUDY ROOMS =====

export const createRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ topic: z.string().min(2).max(120) }).parse(d))
  .handler(async ({ context, data }) => {
    await guard(context, "room_join");
    assertSafe(data.topic);
    return userRpc<{ id: string; code: string }>(context.supabase, "create_study_room", { p_topic: data.topic });
  });

export const joinRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ code: z.string().min(4).max(12) }).parse(d))
  .handler(async ({ context, data }) => {
    await guard(context, "room_join");
    return { id: await userRpc<string>(context.supabase, "join_study_room", { p_code: data.code }) };
  });

export const sendRoomMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ roomId: z.string().uuid(), content: z.string().trim().min(1).max(2000) }).parse(d))
  .handler(async ({ context, data }) => {
    await guard(context, "room_message");
    assertSafe(data.content);
    const member = await userRpc<boolean>(context.supabase, "is_room_member", { p_room: data.roomId });
    if (!member) throw new Error("Room not found");
    const { error } = await admin().from("study_messages").insert({ room_id: data.roomId, user_id: context.userId, content: data.content, is_nova: false });
    if (error) throw new Error("Could not send your message.");
    return true;
  });

export const triggerNovaInRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ roomId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    await guard(context, "nova_room");
    const member = await userRpc<boolean>(supabase, "is_room_member", { p_room: data.roomId });
    if (!member) throw new Error("Room not found");

    const { data: messages } = await supabase
      .from("study_messages").select("content, is_nova, user_id").eq("room_id", data.roomId)
      .order("created_at", { ascending: false }).limit(6);
    const ordered = (messages ?? []).slice().reverse();
    const lastHuman = [...ordered].reverse().find((m) => !m.is_nova);
    // Nova only answers when someone actually called her.
    if (!lastHuman || !/@nova\b/i.test(lastHuman.content)) return false;

    const conversation = ordered
      .map((m, i) => {
        const raw = String(m.content || "");
        const text = i < ordered.length - 2 && raw.length > 240 ? `${raw.slice(0, 240)}…` : raw;
        return `${m.is_nova ? "Nova" : "Student"}: ${text}`;
      })
      .join("\n");
    assertSafe(conversation);

    const { text } = await generateTextWithFailover({
      tier: "fast",
      budget: "room",
      system: NOVA_TASK_SYSTEM,
      prompt: `Study room — reply as Nova in 2-4 helpful sentences. No greeting if ongoing.\n\n<student_message>\n${conversation}\n</student_message>\n\nNova:`,
    });
    // Nova's messages have no user_id; only the server (service role) can write them.
    const { error } = await admin().from("study_messages").insert({ room_id: data.roomId, content: text, is_nova: true, user_id: null });
    if (error) throw new Error("Nova could not reply.");
    return true;
  });

// ===== BRAIN BATTLES =====

export const createBattle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ topic: z.string().min(2).max(100) }).parse(d))
  .handler(async ({ context, data }) => {
    await guard(context, "battle");
    assertSafe(data.topic);
    const { experimental_output: output } = await generateTextWithFailover({
      tier: "fast",
      budget: "battle",
      system: NOVA_TASK_SYSTEM,
      experimental_output: Output.object({ schema: QuizSchema }),
      prompt: `5-question battle quiz. 4 options each, correct_index 0-3, brief explanation.\n<topic>${data.topic}</topic>`,
    });
    const { kept } = await verifyQuestions(output.questions);
    const id = await adminRpc<string>("create_battle_server", { p_user: context.userId, p_topic: data.topic, p_questions: kept });
    return { id };
  });

// ===== KIDS' GAME HELPER (real AI, replaces the old keyword matcher) =====

export const askGameHelper = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ game: z.string().max(60), question: z.string().min(1).max(200), language: LANG }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await guard(context, "game_help");
    assertSafe(data.question);
    const { text } = await generateTextWithFailover({
      tier: "fast",
      budget: "room",
      system: NOVA_GAME_HELPER_SYSTEM,
      prompt: `Game: ${data.game}. Language: ${langName(data.language)}.\n<student_message>${data.question}</student_message>`,
    });
    return text;
  });

// ===== CODE LAB =====

export const runCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ source: z.string().max(8000), isStarter: z.boolean().default(false) }).parse(d))
  .handler(async ({ context, data }) => {
    await guard(context, "code_run");
    const r = await runCSource(data.source);
    let xp = 0;
    if (r.ok && !data.isStarter) {
      const ref = hashSource(data.source);
      xp = await grantXp(context.userId, "code_run_ok", ref);
    }
    return { ...r, xp_awarded: xp };
  });

/** Small stable hash so re-running identical code never farms XP. */
function hashSource(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}

export const explainCodeError = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ source: z.string().max(8000), error: z.string().max(4000), language: LANG }).parse(d))
  .handler(async ({ context, data }) => {
    await guard(context, "code_help");
    const { text } = await generateTextWithFailover({
      tier: "fast",
      budget: "room",
      system: NOVA_TASK_SYSTEM,
      prompt: `A student wrote C code and got an error. Explain what went wrong and how to fix it in 3-5 short, encouraging sentences (${langName(data.language)}). Show the corrected line if helpful.\n<code>${data.source}</code>\n<student_message>${data.error}</student_message>`,
    });
    return text;
  });

export const createBattleQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { topic: string }) => z.object({
    topic: z.string().min(2).max(100),
  }).parse(d))
  .handler(async ({ data }) => {
    const { experimental_output: output } = await generateTextWithFailover({
      tier: "fast",
      budget: "battle",
      system: NOVA_TASK_SYSTEM,
      experimental_output: Output.object({ schema: QuizSchema }),
      prompt: `5-question battle quiz on "${data.topic}". 4 options each, correct_index 0-3, brief explanation.`,
    });

    return output.questions;
  });
