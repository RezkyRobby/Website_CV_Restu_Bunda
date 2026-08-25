// Konfigurasi Vitest — unit test logic deterministik (match score, penomoran dokumen, struktur pasal PDF).
// Mencerminkan path alias `@/` dari tsconfig agar import di src/** berfungsi di lingkungan test.

import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});