// Fast, dependency-free text safety rules shared by server code and tests.
// This is the first line of defence; the LLM system prompt and (for videos) the model-based
// classifier in src/lib/video-moderation.ts are the second.

const MOD_PATTERNS: Array<[string, RegExp]> = [
  ["csam", /\b(child|minor|underage|loli|shota)\b.*\b(sex|porn|nude|nudes|naked|erotic)\b|\b(sex|porn|nude|erotic)\b.*\b(child|minor|underage|kid|kids)\b/i],
  ["sexual", /\b(porn|pornography|xxx|nsfw|blowjob|handjob|hentai|sex\s+video|nudes?)\b/i],
  ["weapons", /\bhow\s+(to|do\s+i)\s+(make|build|synthes(is|ize)|manufacture)\s+(a\s+)?(bomb|explosive|ied|pipe\s*bomb|nerve\s*agent|sarin|ricin|anthrax|nuclear\s+(bomb|weapon)|bioweapon|chemical\s+weapon)/i],
  [
    "self_harm",
    new RegExp(
      [
        String.raw`\b(kill|hurt|harm|cut)\s+myself\b`,
        String.raw`\b(end\s+my\s+life|want\s+to\s+die|wanna\s+die|commit\s+suicide|going\s+to\s+suicide)\b`,
        String.raw`\bi\s*(am|'m|m)?\s*(feeling\s+)?suicidal\b`,
        String.raw`\b(how\s+to|best\s+way\s+to|easiest\s+way\s+to)\s+(kill\s+myself|commit\s+suicide|end\s+my\s+life|hang\s+myself|overdose)`,
        "আত্মহত্যা\\s*(করতে|করব|করবো)",
        "মরে\\s*যেতে\\s*চাই|মরতে\\s*চাই|বাঁচতে\\s*চাই\\s*না|নিজেকে\\s*শেষ\\s*করে",
      ].join("|"),
      "i",
    ),
  ],
  ["malware", /\bwrite\s+(me\s+)?(a\s+)?(ransomware|keylogger|trojan|rootkit|botnet|stealer|rat\b)/i],
  ["prompt_injection", /(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above|your)\s+(instructions|prompts|rules)|reveal\s+(your\s+)?(system\s+)?prompt|you\s+are\s+now\s+(dan|developer\s+mode)/i],
];

export function moderate(text: string): { ok: boolean; category?: string } {
  if (!text) return { ok: true };
  for (const [cat, re] of MOD_PATTERNS) {
    if (re.test(text)) return { ok: false, category: cat };
  }
  return { ok: true };
}

export const SAFETY_REPLIES = {
  self_harm: {
    en: "I'm really glad you told me, and I'm sorry things feel this heavy. You deserve support from a real person right now: please talk to a parent, a teacher, or another adult you trust, or call 999 (Bangladesh emergency) if you're in danger. I'm here to keep you company too. 💙",
    bn: "তুমি আমাকে বলেছ বলে আমি খুশি, আর তুমি এত কষ্টে আছ জেনে আমার খারাপ লাগছে। এখনই কোনো আপনজনের সাহায্য নাও: বাবা-মা, শিক্ষক বা বিশ্বাসী কোনো বড় মানুষকে বলো। বিপদে থাকলে ৯৯৯-এ কল করো। আমি তোমার পাশে আছি। 💙",
  },
} as const;

const BANGLISH_WORDS = ["ami", "tumi", "apni", "kemon", "achen", "achi", "koro", "korbo", "bolchi", "bolo", "kivabe", "keno", "hobe", "theke", "amar", "tomar", "bujhi", "bujhlam", "porte", "shikhte"];

/** Bangla script, or at least two distinct Banglish words (single letters like "o"/"r" no longer count). */
export function detectBangla(text: string): boolean {
  if (/[\u0980-\u09FF]/.test(text)) return true;
  const words = new Set(text.toLowerCase().match(/[a-z]+/g) ?? []);
  let hits = 0;
  for (const w of BANGLISH_WORDS) if (words.has(w)) hits++;
  return hits >= 2;
}
