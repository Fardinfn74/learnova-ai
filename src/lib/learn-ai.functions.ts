import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/lib/auth-middleware";
import { z } from "zod";
import { Output } from "ai";
import { generateTextWithFailover } from "./ai-gateway";
import { truncateMaterial } from "./ai-budget";
import { NOVA_TASK_SYSTEM } from "./nova-prompts";

const QuizSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correct_index: z.number().int().min(0).max(3),
    explanation: z.string(),
  })).min(3).max(15),
});

// ===== QUIZ =====

export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    topic: z.string().min(2).max(200),
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
    count: z.number().int().min(3).max(10).default(5),
    language: z.enum(["english", "bangla", "banglish"]).default("english"),
  }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const lang =
      data.language === "bangla" ? "Bangla" : data.language === "banglish" ? "Banglish" : "English";

    const { experimental_output: output } = await generateTextWithFailover({
      tier: "fast",
      budget: "quiz",
      system: NOVA_TASK_SYSTEM,
      experimental_output: Output.object({ schema: QuizSchema }),
      prompt: `${data.count} MCQs, ${data.difficulty}, topic: "${data.topic}". Lang: ${lang}. 4 options, correct_index 0-3, 1-line explanation each.`,
    });

    const { data: quiz, error } = await supabase.from("quizzes").insert({
      user_id: userId,
      topic: data.topic,
      difficulty: data.difficulty,
      language: data.language,
      questions: output.questions,
    }).select("*").single();
    if (error) throw error;
    return quiz;
  });

export const getQuiz = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: q, error } = await supabase.from("quizzes").select("*").eq("id", data.id).eq("user_id", userId).single();
    if (error) throw error;
    return q;
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
  .inputValidator((d) => z.object({
    quiz_id: z.string().uuid(),
    answers: z.array(z.number().int().min(0).max(3)),
  }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: q } = await supabase.from("quizzes").select("questions").eq("id", data.quiz_id).eq("user_id", userId).single();
    if (!q) throw new Error("Quiz not found");
    const questions = q.questions as { correct_index: number }[];
    let score = 0;
    questions.forEach((qq, i) => { if (qq.correct_index === data.answers[i]) score++; });
    const { data: attempt, error } = await supabase.from("quiz_attempts").insert({
      user_id: userId, quiz_id: data.quiz_id, score, total: questions.length, answers: data.answers,
    }).select("*").single();
    if (error) throw error;
    return { attempt, score, total: questions.length };
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
  .inputValidator((d) => z.object({
    text: z.string().min(50).max(20000),
    language: z.enum(["english", "bangla", "banglish"]).default("english"),
  }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const lang =
      data.language === "bangla" ? "Bangla" : data.language === "banglish" ? "Banglish" : "English";
    const material = truncateMaterial(data.text, 10_000);

    const { experimental_output: output } = await generateTextWithFailover({
      tier: "fast",
      budget: "summary",
      system: NOVA_TASK_SYSTEM,
      experimental_output: Output.object({ schema: SummarySchema }),
      prompt: `Summarize for a student (${lang}): title, 4-6 sentence summary, 5-8 key points, 6-10 flashcards.

MATERIAL:
"""${material}"""`,
    });

    const { data: note, error } = await supabase.from("notes").insert({
      user_id: userId,
      title: output.title,
      source_text: material,
      summary: output.summary + "\n\n**Key points:**\n" + output.key_points.map(p => "- " + p).join("\n"),
      flashcards: output.flashcards,
    }).select("*").single();
    if (error) throw error;
    return note;
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
    if (error) throw error;
    return n;
  });

// ===== DRAW TO LEARN (VISION) =====

export const analyzeDrawing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    image: z.string(),
    prompt: z.string().optional(),
    language: z.enum(["english", "bangla", "banglish"]).default("english"),
  }).parse(d))
  .handler(async ({ data }) => {
    const langInstr = data.language === "bangla" ? "বাংলায় উত্তর দিন।"
      : data.language === "banglish" ? "Reply in Banglish."
      : "Reply in English.";

    let base64Data = data.image;
    if (base64Data.startsWith("data:image")) {
      base64Data = base64Data.split(",")[1];
    }
    const imageBuffer = Buffer.from(base64Data, "base64");

    const defaultPrompt = "Math: solve step-by-step. Diagram: explain clearly. Unclear: ask for a clearer drawing.";
    const finalPrompt = `${data.prompt || defaultPrompt} (${langInstr})`;

    const { text } = await generateTextWithFailover({
      vision: true,
      tier: "quality",
      budget: "draw",
      system: NOVA_TASK_SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: finalPrompt },
            { type: "image", image: imageBuffer },
          ],
        },
      ],
    });

    return text;
  });

// ===== PAPER TO PODCAST =====

const PodcastSchema = z.object({
  title: z.string(),
  segments: z.array(z.object({
    speaker: z.enum(["host", "nova"]),
    text: z.string()
  })).min(4).max(14)
});

export const generatePodcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    text: z.string().min(50).max(30000),
    language: z.enum(["english", "bangla", "banglish"]).default("english"),
  }).parse(d))
  .handler(async ({ data }) => {
    const lang =
      data.language === "bangla" ? "Bangla" : data.language === "banglish" ? "Banglish" : "English";
    const material = truncateMaterial(data.text, 12_000);

    const { experimental_output: output } = await generateTextWithFailover({
      tier: "quality",
      budget: "podcast",
      system: NOVA_TASK_SYSTEM,
      experimental_output: Output.object({ schema: PodcastSchema }),
      prompt: `2-speaker podcast (${lang}): "host" (student) + "nova" (tutor). Natural, educational, 8-12 segments.

TEXT:
"""${material}"""`,
    });

    return output;
  });

// ===== STUDY ROOM BOT =====

export const triggerNovaInRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    roomId: z.string().uuid()
  }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase } = context;

    const { data: messages } = await (supabase.from as any)("study_messages")
      .select("content, is_nova")
      .eq("room_id", data.roomId)
      .order("created_at", { ascending: false })
      .limit(6);

    if (!messages) return;

    const ordered = (messages as any[]).reverse();
    const conversation = ordered
      .map((m: any, i: number) => {
        const label = m.is_nova ? "Nova" : "Student";
        const raw = String(m.content || "");
        const text =
          i < ordered.length - 2 && raw.length > 240 ? `${raw.slice(0, 240)}…` : raw;
        return `${label}: ${text}`;
      })
      .join("\n");

    const { text } = await generateTextWithFailover({
      tier: "fast",
      budget: "room",
      system: NOVA_TASK_SYSTEM,
      prompt: `Study room — reply as Nova in 2-4 helpful sentences. No greeting if ongoing.

${conversation}

Nova:`,
    });

    await (supabase.from as any)("study_messages").insert({
      room_id: data.roomId,
      content: text,
      is_nova: true,
      user_id: context.userId
    });

    return true;
  });

// ===== BRAIN BATTLES =====

export const createBattleQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
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
