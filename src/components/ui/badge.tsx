import type { ReactNode } from "react";
import { statusToneClasses, type StatusTone } from "@/messages/status-styles";

type BadgeProps = {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
};

/**
 * Badge status pill — DESIGN.md §5.6
 * Pill caption 500, pasangan warna dari kamus status, label dari kamus terpusat.
 */
export function Badge({ tone, children, className }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium leading-none",
        statusToneClasses[tone],
        className ?? "",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
