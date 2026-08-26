/**
 * Kamus label enum terpusat — Bahasa Indonesia formal.
 * Sumber: CONTEXT.md + AGENTS.md § Keputusan Bisnis
 * JANGAN hardcode label enum di komponen — selalu lewat kamus ini.
 */

import type {
  ContractStatus,
  JobRunStatus,
  MaritalStatus,
  PaymentStatus,
  PaymentType,
  Religion,
  ReplacementOfferStatus,
  UserRole,
  WarrantyClaimStatus,
  WorkerCategory,
  WorkerStatus,
} from "@/generated/prisma/enums";

// ── Peran ──────────────────────────────────────────────────
export const userRoleLabels: Record<UserRole, string> = {
  CLIENT: "Majikan",
  CS: "CS",
  SUPER_ADMIN: "Super Admin",
};

// ── Pekerja ────────────────────────────────────────────────
export const workerStatusLabels: Record<WorkerStatus, string> = {
  STANDBY: "Siap Tugas",
  INTERVIEW: "Wawancara",
  PLACED: "Ditempatkan",
  ON_LEAVE: "Cuti",
  BLACKLIST: "Daftar Hitam",
};

export const workerCategoryLabels: Record<WorkerCategory, string> = {
  BABY_SITTER: "Baby Sitter",
  ART: "Asisten Rumah Tangga",
  PERAWAT_LANSIA: "Perawat Lansia",
  SUPIR: "Supir",
};

export const religionLabels: Record<Religion, string> = {
  ISLAM: "Islam",
  KRISTEN: "Kristen",
  KATOLIK: "Katolik",
  HINDU: "Hindu",
  BUDDHA: "Buddha",
  KONGHUCU: "Konghucu",
};

export const maritalStatusLabels: Record<MaritalStatus, string> = {
  BELUM_MENIKAH: "Belum Menikah",
  MENIKAH: "Menikah",
  CERAI_HIDUP: "Cerai Hidup",
  CERAI_MATI: "Cerai Mati",
};

// ── Kontrak & Garansi ──────────────────────────────────────
export const contractStatusLabels: Record<ContractStatus, string> = {
  ACTIVE: "Aktif",
  EXPIRING_SOON: "Segera Berakhir",
  COMPLETED: "Selesai",
  TERMINATED: "Dihentikan",
};

export const warrantyClaimStatusLabels: Record<WarrantyClaimStatus, string> = {
  PENDING: "Menunggu",
  IN_REVIEW: "Ditinjau",
  CANDIDATES_OFFERED: "Kandidat Ditawarkan",
  RESOLVED: "Selesai",
  REJECTED: "Ditolak",
};

export const replacementOfferStatusLabels: Record<ReplacementOfferStatus, string> = {
  PENDING: "Menunggu",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
};

// ── Keuangan ───────────────────────────────────────────────
export const paymentTypeLabels: Record<PaymentType, string> = {
  PLACEMENT_FEE: "Biaya Penempatan",
  REPLACEMENT_FEE: "Biaya Penukaran",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  DRAFT: "Menunggu Konfirmasi",
  PAID: "Lunas",
};

// ── Job ────────────────────────────────────────────────────
export const jobRunStatusLabels: Record<JobRunStatus, string> = {
  RUNNING: "Berjalan",
  SUCCESS: "Berhasil",
  FAILED: "Gagal",
};

// ── Helper generik ─────────────────────────────────────────
/**
 * Ambil label atau fallback ke nilai mentah bila belum terdaftar.
 */
export function getLabel<T extends string>(
  dict: Record<string, string>,
  value: T,
): string {
  return dict[value] ?? value;
}
