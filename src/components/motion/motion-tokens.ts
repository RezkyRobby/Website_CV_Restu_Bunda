/**
 * Token durasi & easing terpusat — DESIGN.md §6 / PRD §6.1
 * Hanya transform + opacity yang boleh dianimasikan.
 */

export const motionTokens = {
  duration: {
    fast: 0.15,
    base: 0.25,
    slow: 0.4,
  },
  ease: {
    out: [0, 0, 0.2, 1] as const,
  },
} as const;

/**
 * Variants umum yang dipakai lintas halaman publik/portal/admin.
 * Semua variants hanya memakai transform + opacity.
 */
export const motionVariants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  staggerContainer: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08 },
    },
  },
} as const;
