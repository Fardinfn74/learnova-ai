import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { generateText, streamText, type LanguageModel } from "ai";
import { AI_BUDGETS, type AiBudgetKey } from "./ai-budget";

/* ── API key pools (comma-separated in .env) ───────────────────────── */

export function parseApiKeys(envValue: string | undefined): string[] {
  return (envValue || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function geminiKeys(): string[] {
  return parseApiKeys(process.env.GEMINI_API_KEY);
}

function groqKeys(): string[] {
  return parseApiKeys(process.env.GROQ_API_KEY);
}

let geminiKeyIndex = 0;
let groqKeyIndex = 0;

export const getGeminiApiKey = (): string | null => {
  const keys = geminiKeys();
  if (!keys.length) return null;
  const key = keys[geminiKeyIndex % keys.length];
  geminiKeyIndex = (geminiKeyIndex + 1) % keys.length;
  return key;
};

export const getGroqApiKey = (): string | null => {
  const keys = groqKeys();
  if (!keys.length) return null;
  const key = keys[groqKeyIndex % keys.length];
  groqKeyIndex = (groqKeyIndex + 1) % keys.length;
  return key;
};

export function hasAnyAiKey(): boolean {
  return geminiKeys().length > 0 || groqKeys().length > 0;
}

/* ── Retryable errors / HTTP statuses ─────────────────────────────── */

const RETRYABLE_HTTP = new Set([429, 403, 500, 502, 503]);

const RETRYABLE_MSG =
  /429|quota|rate.?limit|RESOURCE_EXHAUSTED|overloaded|capacity|insufficient|too many requests/i;

export function isRetryableError(error: unknown): boolean {
  if (error != null && typeof error === "object") {
    const status =
      "status" in error && typeof (error as { status: unknown }).status === "number"
        ? (error as { status: number }).status
        : "statusCode" in error && typeof (error as { statusCode: unknown }).statusCode === "number"
          ? (error as { statusCode: number }).statusCode
          : null;
    if (status != null && RETRYABLE_HTTP.has(status)) return true;
  }
  const msg = error instanceof Error ? error.message : String(error);
  return RETRYABLE_MSG.test(msg);
}

/* ── Key-rotating fetch ─────────────────────────────────────────────── */

let rotationCounter = 0;

function createRotatingFetch(
  getAllKeys: () => string[],
  applyKey: (init: RequestInit | undefined, key: string) => RequestInit | undefined,
  patchUrl?: (url: string, key: string) => string,
): typeof fetch {
  return async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const keys = getAllKeys();
    const maxAttempts = Math.max(keys.length, 1);

    let currentUrl =
      typeof url === "string"
        ? url
        : url instanceof URL
          ? url.toString()
          : (url as Request).url;
    let currentInit = init;

    // start from a different key each request so load spreads across the whole pool
    const offset = keys.length > 1 ? rotationCounter++ % keys.length : 0;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const key = keys.length ? keys[(attempt + offset) % keys.length] : "";
      if (key) {
        currentUrl = patchUrl ? patchUrl(currentUrl, key) : currentUrl;
        currentInit = applyKey(currentInit, key);
      }

      const response = await fetch(currentUrl, currentInit);
      if (response.ok || !RETRYABLE_HTTP.has(response.status)) {
        return response;
      }
      if (attempt === maxAttempts - 1) return response;
      await response.text().catch(() => {});
    }

    return fetch(currentUrl, currentInit);
  };
}

function replaceGeminiKeyInUrl(url: string, newKey: string): string {
  try {
    const u = new URL(url);
    if (u.searchParams.has("key")) {
      u.searchParams.set("key", newKey);
      return u.toString();
    }
  } catch {
    /* ignore */
  }
  return url;
}

function replaceGeminiKeyInHeaders(
  headers: HeadersInit | undefined,
  newKey: string,
): Record<string, string> | undefined {
  if (!headers) return undefined;
  const h = new Headers(headers);
  if (h.has("x-goog-api-key")) h.set("x-goog-api-key", newKey);
  const out: Record<string, string> = {};
  h.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

const geminiFetch = createRotatingFetch(
  geminiKeys,
  (init, key) => ({
    ...init,
    headers: replaceGeminiKeyInHeaders(init?.headers, key),
  }),
  replaceGeminiKeyInUrl,
);

const groqFetch = createRotatingFetch(groqKeys, (init, key) => {
  const h = new Headers(init?.headers);
  h.set("Authorization", `Bearer ${key}`);
  const out: Record<string, string> = {};
  h.forEach((v, k) => {
    out[k] = v;
  });
  return { ...init, headers: out };
});

/* ── Provider factories ───────────────────────────────────────────── */

export const createGeminiProvider = (apiKey: string) =>
  createGoogleGenerativeAI({
    apiKey,
    fetch: geminiFetch,
  });

export const createGroqProvider = (apiKey: string) =>
  createGroq({
    apiKey,
    fetch: groqFetch,
  });

/* ── Model chains (Groq first by default — spreads load & saves Gemini quota) ── */

export type ModelTier = "fast" | "quality";

export type ModelCandidate = {
  id: string;
  model: LanguageModel;
};

function preferGroqFirst(): boolean {
  return process.env.AI_PREFER_GROQ !== "false";
}

export function getTextModelChain(tier: ModelTier = "quality"): ModelCandidate[] {
  const chain: ModelCandidate[] = [];
  const groq = groqKeys();
  const gemini = geminiKeys();

  const pushGroq = (modelId: string) => {
    if (!groq.length) return;
    const key = groq[0];
    chain.push({ id: `groq:${modelId}`, model: createGroqProvider(key)(modelId) });
  };

  const pushGemini = () => {
    if (!gemini.length) return;
    chain.push({
      id: "gemini:gemini-2.5-flash",
      model: createGeminiProvider(gemini[0])("gemini-2.5-flash"),
    });
  };

  const order = preferGroqFirst()
    ? (["groq", "gemini"] as const)
    : (["gemini", "groq"] as const);

  for (const provider of order) {
    if (provider === "groq") {
      if (tier === "fast") {
        pushGroq("llama-3.1-8b-instant");
        pushGroq("llama-3.3-70b-versatile");
      } else {
        pushGroq("llama-3.3-70b-versatile");
      }
    } else {
      pushGemini();
    }
  }

  return chain;
}

export function getVisionModelChain(): ModelCandidate[] {
  const gemini = geminiKeys();
  if (!gemini.length) return [];
  return [
    {
      id: "gemini:gemini-2.5-flash",
      model: createGeminiProvider(gemini[0])("gemini-2.5-flash"),
    },
  ];
}

export type MessageLike = {
  role?: string;
  content?: string;
  parts?: Array<{ type?: string; text?: string }>;
};

function extractMessageText(m: MessageLike): string {
  if (typeof m.content === "string") return m.content;
  if (Array.isArray(m.parts)) {
    return m.parts.map((p) => (p?.type === "text" ? p.text || "" : "")).join("");
  }
  return "";
}

function withMessageText<T extends MessageLike>(m: T, text: string): T {
  if (Array.isArray(m.parts) && m.parts.length > 0) {
    const parts = m.parts.map((p, i) =>
      p?.type === "text" && i === 0 ? { ...p, text } : p,
    );
    return { ...m, content: text, parts };
  }
  return { ...m, content: text, parts: [{ type: "text", text }] };
}

/**
 * Keep recent turns at full length; shorten older turns to save input tokens
 * while preserving conversation flow.
 */
export function compressConversationHistory<T extends MessageLike>(
  messages: T[],
  budget: AiBudgetKey = "chat",
): T[] {
  const cfg = AI_BUDGETS[budget];
  const maxMessages = cfg.maxHistoryMessages ?? 12;
  const fullRecentTurns = cfg.fullRecentTurns ?? 4;
  const olderChars = cfg.olderMessageChars ?? 600;

  const sliced = messages.length > maxMessages ? messages.slice(-maxMessages) : [...messages];
  const fullFromIndex = Math.max(0, sliced.length - fullRecentTurns);

  return sliced.map((m, i) => {
    if (i >= fullFromIndex) return m;
    const text = extractMessageText(m);
    if (text.length <= olderChars) return m;
    return withMessageText(m, `${text.slice(0, olderChars)}…`);
  });
}

/** @deprecated Use compressConversationHistory */
export function trimConversationMessages<T extends MessageLike>(
  messages: T[],
  maxMessages = 14,
): T[] {
  if (messages.length <= maxMessages) return messages;
  return messages.slice(-maxMessages);
}

type GenerateTextParams = Parameters<typeof generateText>[0];

export async function generateTextWithFailover(
  options: Omit<GenerateTextParams, "model"> & {
    tier?: ModelTier;
    vision?: boolean;
    budget?: AiBudgetKey;
  },
): Promise<Awaited<ReturnType<typeof generateText>>> {
  const { tier = "quality", vision = false, budget, ...rest } = options;
  const chain = vision ? getVisionModelChain() : getTextModelChain(tier);
  const caps = budget ? AI_BUDGETS[budget] : undefined;

  const request = {
    ...rest,
    ...(caps?.maxOutputTokens != null ? { maxOutputTokens: caps.maxOutputTokens } : {}),
    ...(caps?.temperature != null ? { temperature: caps.temperature } : {}),
  };

  if (!chain.length) {
    throw new Error(
      vision
        ? "Missing GEMINI_API_KEY (required for image/drawing analysis)"
        : "Missing AI keys — set GROQ_API_KEY and/or GEMINI_API_KEY in .env",
    );
  }

  let lastError: unknown;
  for (const { id, model } of chain) {
    try {
      return await generateText({ ...request, model } as GenerateTextParams);
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[ai-gateway] ${id} failed:`, msg);
      if (!isRetryableError(error)) throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All AI providers failed");
}

/* ── Streaming with provider failover ─────────────────────────────── */

type StreamTextParams = Parameters<typeof streamText>[0];

export type StreamStart = {
  modelId: string;
  /** Text deltas. Throws if the provider fails AFTER the first token (cannot fail over mid-answer). */
  stream: AsyncGenerator<string, void, void>;
};

/**
 * Tries each candidate until one produces its first token, then streams the rest from that one.
 * A provider that errors (429 / quota / 5xx) or returns nothing before the first token is skipped.
 */
export async function streamAcrossChain(
  chain: ModelCandidate[],
  request: Omit<StreamTextParams, "model">,
): Promise<StreamStart> {
  if (!chain.length) {
    throw new Error("Missing AI keys — set GROQ_API_KEY and/or GEMINI_API_KEY in .env");
  }
  let lastError: unknown;
  for (const { id, model } of chain) {
    const result = streamText({ ...request, model, maxRetries: 0, onError: () => {} } as StreamTextParams);
    const parts = result.fullStream[Symbol.asyncIterator]();
    try {
      let first: string | null = null;
      while (first === null) {
        const next = await parts.next();
        if (next.done) throw new Error("empty response from provider");
        const part = next.value;
        if (part.type === "error") throw part.error instanceof Error ? part.error : new Error(String(part.error));
        if (part.type === "text-delta" && part.text) first = part.text;
      }
      const firstChunk = first;
      async function* rest(): AsyncGenerator<string, void, void> {
        yield firstChunk;
        while (true) {
          const next = await parts.next();
          if (next.done) return;
          const part = next.value;
          if (part.type === "error") throw part.error instanceof Error ? part.error : new Error(String(part.error));
          if (part.type === "text-delta" && part.text) yield part.text;
        }
      }
      return { modelId: id, stream: rest() };
    } catch (error) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[ai-gateway] ${id} failed before first token:`, msg);
      if (!isRetryableError(error) && !/empty response/.test(msg)) throw error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("All AI providers failed");
}

export async function streamTextWithFailover(
  options: Omit<StreamTextParams, "model"> & { tier?: ModelTier; budget?: AiBudgetKey },
): Promise<StreamStart> {
  const { tier = "quality", budget, ...rest } = options;
  const caps = budget ? AI_BUDGETS[budget] : undefined;
  return streamAcrossChain(getTextModelChain(tier), {
    ...rest,
    ...(caps?.maxOutputTokens != null ? { maxOutputTokens: caps.maxOutputTokens } : {}),
    ...(caps?.temperature != null ? { temperature: caps.temperature } : {}),
  });
}
