import { describe, expect, it, vi } from "vitest";
import { MockLanguageModelV3 } from "ai/test";
import { simulateReadableStream } from "ai";
import { streamAcrossChain } from "../ai-gateway";

const okModel = (chunks: string[]) =>
  new MockLanguageModelV3({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: "stream-start", warnings: [] },
          { type: "text-start", id: "1" },
          ...chunks.map((delta) => ({ type: "text-delta" as const, id: "1", delta })),
          { type: "text-end", id: "1" },
          { type: "finish", finishReason: { unified: "stop", raw: "stop" }, usage: { inputTokens: { total: 1 }, outputTokens: { total: 1 } } },
        ] as any,
      }),
    }),
  });

const failing = (status: number, message = "boom") =>
  new MockLanguageModelV3({
    doStream: async () => {
      throw Object.assign(new Error(message), { statusCode: status });
    },
  });

async function collect(gen: AsyncGenerator<string>) {
  let out = "";
  for await (const c of gen) out += c;
  return out;
}

describe("streamAcrossChain", () => {
  it("streams tokens from the first healthy provider", async () => {
    const r = await streamAcrossChain([{ id: "a", model: okModel(["Hel", "lo"]) }], { prompt: "hi" });
    expect(r.modelId).toBe("a");
    expect(await collect(r.stream)).toBe("Hello");
  });

  it("fails over when the first provider is rate limited (429)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const r = await streamAcrossChain(
      [{ id: "groq", model: failing(429, "rate limit") }, { id: "gemini", model: okModel(["from gemini"]) }],
      { prompt: "hi" },
    );
    expect(r.modelId).toBe("gemini");
    expect(await collect(r.stream)).toBe("from gemini");
  });

  it("fails over on a 503 and on an empty stream", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const r = await streamAcrossChain(
      [{ id: "down", model: failing(503) }, { id: "empty", model: okModel([]) }, { id: "ok", model: okModel(["fine"]) }],
      { prompt: "hi" },
    );
    expect(r.modelId).toBe("ok");
  });

  it("does NOT fail over on a non-retryable error (e.g. bad request)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(
      streamAcrossChain([{ id: "a", model: failing(400, "invalid prompt") }, { id: "b", model: okModel(["x"]) }], { prompt: "hi" }),
    ).rejects.toThrow(/invalid prompt/);
  });

  it("throws the last error when every provider fails", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(
      streamAcrossChain([{ id: "a", model: failing(429) }, { id: "b", model: failing(503, "overloaded") }], { prompt: "hi" }),
    ).rejects.toThrow(/overloaded/);
  });

  it("throws a clear error when no keys are configured", async () => {
    await expect(streamAcrossChain([], { prompt: "hi" })).rejects.toThrow(/Missing AI keys/);
  });
});
