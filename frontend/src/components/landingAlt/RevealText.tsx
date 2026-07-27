"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./landingAlt.module.css";

gsap.registerPlugin(ScrollTrigger);

const WORD_DURATION = 0.95;
const WORD_STAGGER = 0.06;
const TRIGGER_START = "top 84%";

type RevealTextProps = {
  readonly text: string;
  readonly className?: string;
  readonly delay?: number;
  readonly playOnLoad?: boolean;
};

export function RevealText({
  text,
  className,
  delay = 0,
  playOnLoad = false,
}: RevealTextProps) {
  const hostRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const words = host.querySelectorAll<HTMLElement>(`.${styles.revealInner}`);

    const ctx = gsap.context(() => {
      const motion = {
        yPercent: 120,
        duration: WORD_DURATION,
        ease: "power4.out",
        stagger: WORD_STAGGER,
        delay,
      };

      if (playOnLoad) {
        gsap.from(words, motion);
        return;
      }

      gsap.from(words, {
        ...motion,
        scrollTrigger: { trigger: host, start: TRIGGER_START },
      });
    }, host);

    return () => ctx.revert();
  }, [delay, playOnLoad, text]);

  return (
    <span ref={hostRef} className={className}>
      {text.split(" ").map((word, index) => (
        <span key={`${word}-${index}`} className={styles.revealWord}>
          <span className={styles.revealInner}>{word}</span>
        </span>
      ))}
    </span>
  );
}
