"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { motionTokens } from "./motion-tokens";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/**
 * Reveal on scroll — hanya transform + opacity, whileInView once: true (PRD §6.1)
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.out,
        delay,
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
};

export function Stagger({ children, className, stagger = 0.08 }: StaggerProps) {
  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{
        duration: motionTokens.duration.base,
        ease: motionTokens.ease.out,
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}
