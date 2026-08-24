// Konfigurasi Prisma CLI (Prisma 7 tidak lagi membaca .env secara otomatis).
// File ini memuat variabel lingkungan dari .env agar perintah seperti
// `npx prisma migrate dev` dan `npx prisma db seed` menemukan DATABASE_URL.

import "dotenv/config";

import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Dipakai Prisma CLI (migrate, db, studio). Untuk Neon, migrasi wajib
    // lewat koneksi langsung (DIRECT_URL, tanpa PgBouncer) — bukan pooler.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
