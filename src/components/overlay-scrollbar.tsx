"use client";

import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import type { ReactNode } from "react";

/**
 * Wrapper scrollbar overlay — mengganti native scrollbar dengan div yang melayang di atas konten.
 * autoHide: "leave" = hilang saat idle, muncul saat hover/scroll (efek tembus pandang).
 */
export function OverlayScrollbar({ children }: { children: ReactNode }) {
  return (
    <OverlayScrollbarsComponent
      defer
      options={{
        scrollbars: {
          theme: "os-theme-dark",
          autoHide: "leave",
          autoHideDelay: 600,
          clickScroll: true,
        },
      }}
      style={{ height: "100vh" }}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
}
