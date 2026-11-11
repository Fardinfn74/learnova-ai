import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { normalizeMath } from "@/lib/math-text";

/** Markdown with real math typesetting ($x^2$, $$\frac{a}{b}$$, \(…\), \[…\]) — essential for a STEM tutor. */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}>
        {normalizeMath(children ?? "")}
      </ReactMarkdown>
    </div>
  );
}
