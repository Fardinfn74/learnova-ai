// Runs student C code through Wandbox (a public sandbox) from the SERVER, so we can rate-limit it,
// cap the input, and award XP only for programs that really compiled and exited cleanly.
export type RunResult = { ok: boolean; stdout: string; stderr: string; compilerError: string };

export const MAX_SOURCE_CHARS = 8_000;

export async function runCSource(source: string, fetchImpl: typeof fetch = fetch): Promise<RunResult> {
  if (!source.trim()) throw new Error("Write some code first.");
  if (source.length > MAX_SOURCE_CHARS) throw new Error(`Code is too long (max ${MAX_SOURCE_CHARS} characters).`);
  const res = await fetchImpl("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ compiler: "gcc-head", code: source, save: false }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error("The code runner is busy. Please try again in a moment.");
  const d = (await res.json()) as Record<string, string | undefined>;
  const compilerError = d.compiler_error ?? "";
  const stderr = d.program_error ?? "";
  const stdout = d.program_output ?? d.program_message ?? "";
  const status = d.status ?? "0";
  return { ok: !compilerError && !stderr && status === "0", stdout: stdout.slice(0, 8_000), stderr: stderr.slice(0, 4_000), compilerError: compilerError.slice(0, 4_000) };
}
