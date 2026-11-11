/** LLMs often write math as \( … \) and \[ … \]; remark-math wants $…$ and $$…$$. */
export function normalizeMath(text: string): string {
  return text
    .replace(/\\\[([\s\S]+?)\\\]/g, (_m, inner) => `\n$$${inner.trim()}$$\n`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_m, inner) => `$${inner.trim()}$`);
}
