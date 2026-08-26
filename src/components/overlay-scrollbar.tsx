"use client";

import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import type { ReactNode } from "react";
import { useScrollbarProximity } from "./overlay-scrollbar-proximity";

/**
 * Wrapper scrollbar overlay — lebih lebar, thumb lebih pendek, benar-benar hilang saat
 * kursor di konten dan hanya muncul saat mendekat ke tepi scrollbar (proximity).
 */
export function OverlayScrollbar({ children }: { children: ReactNode }) {
  const proximityRef = useScrollbarProximity(48);

  return (
    <div ref={proximityRef} className="scroll-root" style={{ height: "100vh" }}>
      <OverlayScrollbarsComponent
        defer
        options={{
          scrollbars: {
            theme: "os-theme-dark",
            autoHide: "leave",
            autoHideDelay: 200,
            autoHideSuspend: false,
            clickScroll: true,
          },
          overflow: { x: "hidden" },
        }}
        style={{ height: "100%" }}
      >
        {children}
      </OverlayScrollbarsComponent>
    </div>
  );
}
