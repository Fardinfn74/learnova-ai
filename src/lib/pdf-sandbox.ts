/**
 * Sandboxed PDF text extraction — runs entirely in the user's browser.
 * - Hard caps on file size + pages
 * - Only extracts plain text; embedded JS, forms, attachments are ignored
 * - Strips control chars; output is treated as DATA, never as instructions
 */
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PAGES = 50;
const MAX_CHARS = 80_000;

export async function extractPdfText(file: File, onProgress?: (pct: number) => void): Promise<string> {
  if (!file) throw new Error("No file");
  if (!/pdf/i.test(file.type) && !/\.pdf$/i.test(file.name)) throw new Error("Please upload a PDF file");
  if (file.size > MAX_BYTES) throw new Error("PDF too large (max 10 MB)");

  // Dynamic import keeps it out of the main bundle.
  const pdfjs = await import("pdfjs-dist");
  // Use a same-origin worker via Vite ?url import to avoid loading remote scripts.
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = workerUrl;

  const buf = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buf),
    disableAutoFetch: true,
    isEvalSupported: false, // disable eval'd JS in PDFs
    isOffscreenCanvasSupported: false,
  } as Parameters<typeof pdfjs.getDocument>[0]);
  const doc = await loadingTask.promise;
  const pages = Math.min(doc.numPages, MAX_PAGES);
  let out = "";
  for (let i = 1; i <= pages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it: unknown) => (typeof (it as { str?: string }).str === "string" ? (it as { str: string }).str : ""))
      .join(" ");
    out += pageText + "\n\n";
    onProgress?.(Math.round((i / pages) * 100));
    if (out.length > MAX_CHARS) { out = out.slice(0, MAX_CHARS); break; }
  }
  // Strip control chars (keep newline + tab)
  out = out.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ");
  return out.trim();
}

export const PDF_LIMITS = { MAX_BYTES, MAX_PAGES, MAX_CHARS };
