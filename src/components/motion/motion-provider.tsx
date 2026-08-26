"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// LazyMotion memuat fitur animasi secara dinamis agar bundle awal ≤ 5 kb (PRD §6.1)
const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

type MotionProviderProps = {
  children: ReactNode;
};

/**
 * Provider animasi global — membungkus seluruh aplikasi.
 * - LazyMotion: code-split fitur Motion
 * - MotionConfig: token durasi terpusat + menghormati prefers-reduced-motion
 * PRD §6.1 — hanya properti transform/opacity, durasi fast/base/slow.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig
        // Token durasi DESIGN.md §6 / PRD §6.1
        transition={{
          duration: 0.25,
          ease: [0, 0, 0.2, 1],
        }}
        reducedMotion="user"
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
