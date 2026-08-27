// Singleton PrismaClient dengan driver adapter Neon (wajib di Prisma 7).
// Dipakai ulang antar request untuk menghindari kehabisan koneksi.
//
// Penting untuk Vercel: Next.js menjalankan "collect page data" saat build
// dengan mengimpor semua route (termasuk /api/auth/[...all] -> auth.ts -> prisma.ts).
// Jika DATABASE_URL belum tersedia saat build, modul tidak boleh throw
// agar build tidak gagal. Solusi: fallback placeholder khusus build.

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // Di Vercel, env disuntik saat runtime; saat build (collect page data)
    // env bisa belum ada. Gunakan placeholder agar impor tidak crash.
    // Request sungguhan akan gagal dengan pesan jelas jika env tetap kosong.
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[prisma] DATABASE_URL belum diisi saat build — memakai placeholder agar build tidak gagal. Pastikan DATABASE_URL diisi di Vercel Environment Variables."
      );
      connectionString =
        "postgresql://placeholder:placeholder@localhost:5432/placeholder?sslmode=require";
    } else {
      throw new Error(
        "DATABASE_URL belum diisi. Salin .env.example menjadi .env lalu isi koneksi PostgreSQL."
      );
    }
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
