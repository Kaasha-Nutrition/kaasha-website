"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Stagger delay: 1, 2 or 3 -> adds .d1/.d2/.d3 for a slight transition-delay. */
  delay?: 1 | 2 | 3;
  /** Any other host-element props (id, onSubmit, noValidate, …) pass straight through. */
  [key: string]: unknown;
}

/**
 * Client-side re-implementation of the vanilla-JS IntersectionObserver
 * "reveal on scroll" effect from the original static build. Wrap any
 * section child in <Reveal> to fade/slide it in once it enters the
 * viewport; it degrades gracefully (renders visible) without JS.
 */
export default function Reveal({ children, as: Tag = "div", className = "", style, delay, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const delayClass = delay ? ` d${delay}` : "";
  const cls = `reveal${visible ? " in" : ""}${delayClass}${className ? " " + className : ""}`;

  const Comp = Tag as ElementType;
  return (
    <Comp ref={ref} className={cls} style={style} {...rest}>
      {children}
    </Comp>
  );
}
