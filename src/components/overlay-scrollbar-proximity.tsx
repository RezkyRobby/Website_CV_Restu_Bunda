"use client";

import { useEffect, useRef } from "react";

/**
 * Deteksi proximity: scrollbar muncul hanya saat kursor mendekat ke tepi kanan/bawah.
 * Tanpa ini, autoHide="leave" muncul saat hover di tengah konten juga.
 */
export function useScrollbarProximity(thresholdPx = 40) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const nearRight = rect.right - e.clientX < thresholdPx;
      const nearBottom = rect.bottom - e.clientY < thresholdPx;
      if (nearRight || nearBottom) el.classList.add("is-near");
      else el.classList.remove("is-near");
    };

    const onLeave = () => el.classList.remove("is-near");

    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [thresholdPx]);

  return ref;
}
