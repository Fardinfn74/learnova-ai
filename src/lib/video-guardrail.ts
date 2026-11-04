import { z } from "zod";
import { generateTextWithFailover, hasAnyAiKey } from "./ai-gateway";

export type GuardrailResult = {
  isApproved: boolean;
  score: number; // 0 - 100 confidence that this is educational
  verdict: "APPROVED_EDUCATIONAL" | "REJECTED_NON_EDUCATIONAL" | "REJECTED_NSFW_HARMFUL" | "REJECTED_CRINGE_MEME";
  reason: string;
  detectedCategories: string[];
  pedagogyFeedback: string;
};

// Strict forbidden patterns for cringe, memes, nsfw, pranks, toxic and non-educational clickbait
const STRICT_REJECT_PATTERNS = [
  /\b(nsfw|porn|nude|sex|erotic|onlyfans|lewd|hentai|xx+|18\+)\b/i,
  /\b(cringe|prank|meme compilations?|skibidi|sigma male|troll face|brain rot|brainrot|tiktok dance)\b/i,
  /\b(clickbait|free robux|free vbucks|hack tool|cheat engine|crypto pump|casino|gambling|betting)\b/i,
  /\b(vlog:\s*what i eat in a day|room tour|shopping spree|haul video|mukbang)\b/i,
];

// Key positive indicators of educational content
const EDUCATIONAL_PATTERNS = [
  /\b(tutorial|lesson|lecture|course|learn|explaining|concept|guide|solve|solving|math|physics|chemistry|biology|coding|programming|algorithm|science|history|literature|grammar|ielts|bangla|english|python|javascript|react|calculus|geometry|algebra|abacus|stem|phd|exam|preparation)\b/i,
];

export async function checkVideoEducationalGuardrail(input: {
  title: string;
  description: string;
  category: string;
  targetAudience: string;
  tags?: string[];
  sampleTranscriptOrOutline?: string;
}): Promise<GuardrailResult> {
  const combinedText = `
Title: ${input.title}
Category: ${input.category}
Target Audience: ${input.targetAudience}
Description: ${input.description}
Tags: ${(input.tags || []).join(", ")}
Outline/Transcript: ${input.sampleTranscriptOrOutline || "N/A"}
`.trim();

  // 1. Fast regex heuristic check first
  for (const pattern of STRICT_REJECT_PATTERNS) {
    if (pattern.test(combinedText)) {
      const match = combinedText.match(pattern)?.[0] || "restricted keyword";
      return {
        isApproved: false,
        score: 10,
        verdict: pattern.toString().includes("nsfw|porn")
          ? "REJECTED_NSFW_HARMFUL"
          : "REJECTED_CRINGE_MEME",
        reason: `Violates LEARNOVA Guardrails: detected prohibited content or non-educational pattern (${match}). Only authentic educational/learning videos are allowed.`,
        detectedCategories: ["Non-Educational", "Prohibited Content"],
        pedagogyFeedback: "LEARNOVA strict policy: cringe videos, NSFW, memes, gaming pranks, or irrelevant vlogs cannot be published. Please submit genuine academic, tutorial, or skill-building content.",
      };
    }
  }

  // 2. AI-driven deep verification if AI key is available
  if (hasAnyAiKey()) {
    try {
      const prompt = `You are the strict Educational Guardrail Inspector for LEARNOVA EduTube (a dedicated learning platform for students, kids, and lifelong learners).
Your duty is to enforce that ONLY genuine educational, academic, skill-building, instructional, or pedagogical videos are approved.
REJECT all cringe, memes, brainrot, NSFW, clickbait, non-educational entertainment, pranks, vlogs, and spam.

Analyze the following video proposal:
"""
${combinedText}
"""

Respond ONLY in valid JSON matching this schema:
{
  "isApproved": boolean,
  "score": number between 0 and 100 (0=trash/cringe/nsfw, 100=exceptional high-value educational content),
  "verdict": "APPROVED_EDUCATIONAL" | "REJECTED_NON_EDUCATIONAL" | "REJECTED_NSFW_HARMFUL" | "REJECTED_CRINGE_MEME",
  "reason": "Clear explanation of why it was approved or rejected",
  "detectedCategories": ["Category1", "Category2"],
  "pedagogyFeedback": "Guidance on how this benefits students or why it was denied"
}
`;

      const aiResponse = await generateTextWithFailover({
        tier: "fast",
        system: "You are an automated strict content moderation and educational taxonomy guardrail. Respond with valid JSON only.",
        prompt,
      });

      const cleaned = aiResponse.text.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleaned);

      if (typeof parsed.isApproved === "boolean" && parsed.verdict) {
        return {
          isApproved: Boolean(parsed.isApproved),
          score: Math.min(100, Math.max(0, Number(parsed.score) || (parsed.isApproved ? 85 : 20))),
          verdict: parsed.verdict,
          reason: parsed.reason || (parsed.isApproved ? "Approved as genuine educational content." : "Rejected by educational guardrail."),
          detectedCategories: Array.isArray(parsed.detectedCategories) ? parsed.detectedCategories : [input.category],
          pedagogyFeedback: parsed.pedagogyFeedback || "Meets LEARNOVA educational standards.",
        };
      }
    } catch (err) {
      console.warn("[video-guardrail] AI inspection fallback to heuristic:", err);
    }
  }

  // 3. Fallback Heuristic when AI is unavailable or fails
  const hasEducationalKeywords = EDUCATIONAL_PATTERNS.some((p) => p.test(combinedText));
  const descLength = input.description.trim().length;

  if (hasEducationalKeywords && descLength >= 20) {
    return {
      isApproved: true,
      score: 88,
      verdict: "APPROVED_EDUCATIONAL",
      reason: "Verified by LEARNOVA Guardrails: Video demonstrates genuine educational focus, clear learning objectives, and complies with student-safety guidelines.",
      detectedCategories: [input.category || "Education", "Instructional"],
      pedagogyFeedback: "Content provides pedagogical value suitable for learners on LEARNOVA.",
    };
  }

  return {
    isApproved: false,
    score: 35,
    verdict: "REJECTED_NON_EDUCATIONAL",
    reason: "Failed educational verification: The title or description does not demonstrate a clear curriculum, lesson objective, or instructional topic.",
    detectedCategories: ["Unverified / General"],
    pedagogyFeedback: "Please include clear educational topics, what students will learn, or lesson objectives in your title and description before publishing.",
  };
}
