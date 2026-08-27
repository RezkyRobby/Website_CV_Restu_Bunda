// Server logic Majikan — PRD §5.4 #1 & AGENTS.md § Keputusan Bisnis
// Akun CLIENT dibuat oleh CS saat deal: cek existing by email/telepon terlebih
// dahulu — satu akun dipakai ulang untuk semua kontrak majikan tersebut; bila baru,
// sistem kirim email undangan set-password (invite flow via reset-password).

import { prisma } from "@/lib/prisma";
import { normalizeEmail, normalizePhone } from "@/lib/validators/majikan";

// ============================================================
// Tipe ringkas — sanitasi untuk response publik (tanpa password)
// ============================================================

export type MajikanSummary = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: Date;
};

// ============================================================
// Lookup — cek existing by email/telepon ( dipakai ulang antar kontrak )
// ============================================================

/**
 * Mencari akun Majikan (role CLIENT) berdasarkan email atau telepon.
 * Prioritas: email bila diisi; fallback telepon. Dipakai CS saat deal untuk
 * memastikan satu akun Majikan dipakai ulang pada semua kontraknya.
 */
export async function findMajikanByEmailOrPhone(opts: {
  email?: string;
  phone?: string;
}): Promise<MajikanSummary | null> {
  const email = opts.email ? normalizeEmail(opts.email) : "";
  const phone = opts.phone ? normalizePhone(opts.phone) : "";

  if (!email && !phone) return null;

  // Query terpisah agar index unique termanfaatkan; email lebih selektif.
  if (email) {
    const byEmail = await prisma.user.findFirst({
      where: { email, role: "CLIENT" },
      select: { id: true, name: true, email: true, phone: true, address: true, createdAt: true },
    });
    if (byEmail) return byEmail;
  }

  if (phone) {
    const byPhone = await prisma.user.findFirst({
      where: { phone, role: "CLIENT" },
      select: { id: true, name: true, email: true, phone: true, address: true, createdAt: true },
    });
    if (byPhone) return byPhone;
  }

  return null;
}

/**
 * Daftar ringkas semua Majikan (CLIENT) — dipakai halaman daftar.
 */
export async function listMajikan(): Promise<MajikanSummary[]> {
  return prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, phone: true, address: true, createdAt: true },
  });
}

/**
 * Detail satu Majikan beserta jumlah kontrak (untuk halaman detail ke depan).
 */
export async function getMajikanDetail(majikanId: string) {
  return prisma.user.findFirst({
    where: { id: majikanId, role: "CLIENT" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      createdAt: true,
      _count: { select: { contractsAsClient: true } },
    },
  });
}
