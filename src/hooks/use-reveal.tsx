import { useEffect, useRef } from "react";

/**
 * Adds a class once the element scrolls into view (one-shot).
 * Default reveal class pairs with .reveal in styles.css.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(opts?: {
  threshold?: number;
  rootMargin?: string;
  className?: string;
}) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cls = opts?.className ?? "is-visible";
    if (typeof IntersectionObserver === "undefined") { el.classList.add(cls); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { el.classList.add(cls); io.unobserve(e.target); }
      }
    }, { threshold: opts?.threshold ?? 0.15, rootMargin: opts?.rootMargin ?? "0px 0px -40px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [opts?.threshold, opts?.rootMargin, opts?.className]);
  return ref;
}

/** Reveal wrapper component for quick use. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useReveal<HTMLDivElement>();
  // @ts-expect-error dynamic tag
  return <Tag ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${className}`}>{children}</Tag>;
}
