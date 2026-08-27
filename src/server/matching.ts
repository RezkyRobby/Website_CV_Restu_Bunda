/**
 * Smart Matching Engine — PRD Lampiran A
 *
 * Algoritma deterministik berbobot untuk mencocokkan kriteria majikan
 * dengan kandidat (pekerja STANDBY). Kategori bertindak sebagai gerbang
 * keras (hard gate); 6 komponen lain menyumbang bobot skor 0–100.
 *
 * Sumber kebenaran: PRD.md Lampiran A & CONTEXT.md (istilah Match Score).
 * Seluruh skor komponen 0–100; total MatchScore = round(Σ bobot × nilai),
 * diurutkan menurun tanpa cutoff minimum — keputusan final di CS.
 */

import type { WorkerCategory } from "@/generated/prisma/enums";

// ============================================================
// Tipe kriteria (mirror replacementCriteria di WarrantyClaim)
// ============================================================

export type MatchingCriteria = {
  /** Kategori wajib — gerbang keras */
  category: WorkerCategory;
  /** Rentang gaji harapan (IDR). Hanya budgetMax dipakai untuk skor gaji. */
  budgetSalaryMin?: number | null;
  budgetSalaryMax?: number | null;
  /** Sistem kerja yang diharapkan */
  stayIn?: boolean | null;
  /** True bila majikan memelihara hewan dan butuh toleransi */
  petTolerance?: boolean | null;
  /** True bila penempatan boleh di luar kota */
  willingOutOfCity?: boolean | null;
  /** Rentang usia ideal */
  ageMin?: number | null;
  ageMax?: number | null;
  /** Catatan bebas — diabaikan engine */
  notes?: string | null;
};

// ============================================================
// Tipe kandidat minimal untuk scoring (subset Worker + pengalaman)
// ============================================================

export type MatchableWorker = {
  id: string;
  category: WorkerCategory;
  status: string;
  birthDate: Date;
  stayIn: boolean;
  petTolerance: boolean;
  willingOutOfCity: boolean;
  /** Nominal IDR — Decimal Prisma kompatibel via Number() */
  expectedSalary: number | { toNumber(): number } | string;
  deletedAt: Date | null;
  experiences: { position: string }[];
  // Field opsional untuk konteks hasil (tidak memengaruhi skor)
  nickname?: string;
  fullName?: string;
  ethnicity?: string;
  photoProfileUrl?: string;
};

export type ScoreBreakdown = {
  pengalaman: number;
  gaji: number;
  sistemKerja: number;
  usia: number;
  toleransiHewan: number;
  luarKota: number;
};

export type MatchResult = {
  worker: MatchableWorker;
  breakdown: ScoreBreakdown;
  totalScore: number;
};

// ============================================================
// Bobot — harus berjumlah 1.0 (100 %)
// ============================================================

export const WEIGHTS = {
  pengalaman: 0.3,
  gaji: 0.25,
  sistemKerja: 0.15,
  usia: 0.1,
  toleransiHewan: 0.1,
  luarKota: 0.1,
} as const;

// ============================================================
// Helper umum
// ============================================================

/** Normalisasi nominal gaji Prisma (Decimal|string|number) → number */
function toNumberSalary(value: number | { toNumber(): number } | string): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  // Prisma Decimal
  if (value && typeof (value as { toNumber: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

/**
 * Hitung usia kalender (tahun) pada tanggal acuan.
 * Memakai logika yang sama dengan src/server/catalog.ts.
 */
export function calculateAge(birthDate: Date, referenceDate: Date = new Date()): number {
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const m = referenceDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDate.getDate())) age--;
  return Math.max(age, 0);
}

/**
 * Pemetaan posisi pengalaman ke WorkerCategory.
 * Pencocokan case-insensitive berbasis kata kunci; cukup untuk
 * mengenali riwayat relevan tanpa bergantung pada enum ketat di input free-text.
 */
const CATEGORY_KEYWORDS: Record<WorkerCategory, string[]> = {
  BABY_SITTER: ["baby sitter", "babysitter", "baby", "perawatan bayi", "pengasuh bayi", "mpasi", "balita", "batita"],
  ART: [
    "art",
    "asisten rumah tangga",
    "asisten rumah",
    "bersih",
    "memasak",
    "setrika",
    "rumah tangga",
    "housekeeping",
    "harian",
  ],
  PERAWAT_LANSIA: ["perawat lansia", "lansia", "bedridden", "elderly", "geriatri", "perawatan lansia", "caregiver lansia"],
  SUPIR: ["supir", "sopir", "driver", "mengemudi", "mengemudi mobil"],
};

export function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}

/**
 * Menentukan apakah satu pengalaman relevan untuk kategori target.
 * Relevan = position mengandung kata kunci kategori tersebut.
 */
export function isExperienceRelevant(position: string, targetCategory: WorkerCategory): boolean {
  const normalized = normalizeText(position);
  const keywords = CATEGORY_KEYWORDS[targetCategory] ?? [];
  return keywords.some((kw) => normalized.includes(kw));
}

// ============================================================
// Skor per komponen (0–100) — tiap fungsi wajib unit test terpisah
// ============================================================

/**
 * Skor pengalaman relevan: min(jumlah relevan, 2) / 2 × 100
 * → 0 pengalaman = 0, 1 = 50, ≥2 = 100
 */
export function scorePengalamanRelevan(
  experiences: { position: string }[],
  targetCategory: WorkerCategory,
): number {
  const countRelevan = experiences.filter((e) => isExperienceRelevant(e.position, targetCategory)).length;
  const capped = Math.min(countRelevan, 2);
  return (capped / 2) * 100;
}

/**
 * Skor kesesuaian gaji:
 *  expectedSalary ≤ budgetMax → 100
 *  ≤ budgetMax × 1,1 → 50
 *  selain itu 0
 * Bila budgetMax tidak diisi / 0 → 100 (tanpa batas).
 */
export function scoreKesesuaianGaji(
  expectedSalary: number | { toNumber(): number } | string,
  budgetMax: number | null | undefined,
): number {
  if (budgetMax == null || budgetMax <= 0) return 100;
  const salary = toNumberSalary(expectedSalary);
  if (salary <= budgetMax) return 100;
  if (salary <= budgetMax * 1.1) return 50;
  return 0;
}

/**
 * Skor sistem kerja (stayIn):
 *  sama dengan kriteria → 100, beda → 0, kriteria null/undefined → 100
 */
export function scoreSistemKerja(workerStayIn: boolean, criteriaStayIn: boolean | null | undefined): number {
  if (criteriaStayIn == null) return 100;
  return workerStayIn === criteriaStayIn ? 100 : 0;
}

/**
 * Skor rentang usia:
 *  dalam [ageMin, ageMax] → 100
 *  selisih ≤2 tahun dari tepi → 50
 *  selain itu 0
 * Bila ageMin & ageMax keduanya null/undefined → 100.
 * Bila hanya satu sisi terisi, sisi kosong dianggap tak terbatas.
 */
export function scoreRentangUsia(
  birthDate: Date,
  ageMin: number | null | undefined,
  ageMax: number | null | undefined,
  referenceDate: Date = new Date(),
): number {
  if (ageMin == null && ageMax == null) return 100;
  const age = calculateAge(birthDate, referenceDate);

  const min = ageMin ?? -Infinity;
  const max = ageMax ?? Infinity;

  if (age >= min && age <= max) return 100;

  // Selisih dari tepi terdekat
  const distance = age < min ? min - age : age - max;
  if (distance <= 2) return 50;
  return 0;
}

/**
 * Skor toleransi hewan:
 *  bila kriteria membutuhkan (true) → petTolerance ? 100 : 0
 *  bila tidak membutuhkan (false/null/undefined) → 100
 */
export function scoreToleransiHewan(
  workerPetTolerance: boolean,
  criteriaPetTolerance: boolean | null | undefined,
): number {
  if (criteriaPetTolerance !== true) return 100;
  return workerPetTolerance ? 100 : 0;
}

/**
 * Skor kesediaan luar kota — pola identik toleransi hewan.
 */
export function scoreKesediaanLuarKota(
  workerWilling: boolean,
  criteriaWilling: boolean | null | undefined,
): number {
  if (criteriaWilling !== true) return 100;
  return workerWilling ? 100 : 0;
}

// ============================================================
// Agregasi skor total
// ============================================================

/**
 * Hitung breakdown + total MatchScore untuk satu kandidat.
 * Rumus: MatchScore = round(Σ bobot × nilai komponen)
 */
export function calculateMatchScore(
  worker: MatchableWorker,
  criteria: MatchingCriteria,
  referenceDate: Date = new Date(),
): MatchResult {
  const breakdown: ScoreBreakdown = {
    pengalaman: scorePengalamanRelevan(worker.experiences, criteria.category),
    gaji: scoreKesesuaianGaji(worker.expectedSalary, criteria.budgetSalaryMax),
    sistemKerja: scoreSistemKerja(worker.stayIn, criteria.stayIn),
    usia: scoreRentangUsia(worker.birthDate, criteria.ageMin, criteria.ageMax, referenceDate),
    toleransiHewan: scoreToleransiHewan(worker.petTolerance, criteria.petTolerance),
    luarKota: scoreKesediaanLuarKota(worker.willingOutOfCity, criteria.willingOutOfCity),
  };

  const totalScore = Math.round(
    breakdown.pengalaman * WEIGHTS.pengalaman +
      breakdown.gaji * WEIGHTS.gaji +
      breakdown.sistemKerja * WEIGHTS.sistemKerja +
      breakdown.usia * WEIGHTS.usia +
      breakdown.toleransiHewan * WEIGHTS.toleransiHewan +
      breakdown.luarKota * WEIGHTS.luarKota,
  );

  return { worker, breakdown, totalScore };
}

// ============================================================
// Hard gate + ranking
// ============================================================

/**
 * Gerbang keras — kandidat dikeluarkan bila gagal salah satu:
 *  - status ≠ STANDBY
 *  - deletedAt tidak null (soft-deleted)
 *  - category ≠ kriteria.category
 */
export function passesHardGate(worker: MatchableWorker, criteria: MatchingCriteria): boolean {
  if (worker.deletedAt != null) return false;
  if (worker.status !== "STANDBY") return false;
  if (worker.category !== criteria.category) return false;
  return true;
}

/**
 * Filter hard gate + hitung skor + urutkan menurun.
 * Tanpa cutoff minimum — semua yang lolos gate dikembalikan terurut.
 */
export function rankCandidates(
  workers: MatchableWorker[],
  criteria: MatchingCriteria,
  referenceDate: Date = new Date(),
): MatchResult[] {
  const filtered = workers.filter((w) => passesHardGate(w, criteria));
  const scored = filtered.map((w) => calculateMatchScore(w, criteria, referenceDate));
  scored.sort((a, b) => b.totalScore - a.totalScore);
  return scored;
}

// ============================================================
// Query DB — dipakai CS di dashboard operasional
// ============================================================

export type FindMatchingOptions = {
  /** Batasi jumlah hasil teratas (mis. 3 untuk dispatch klaim garansi) */
  limit?: number;
  /** Tanggal acuan untuk kalkulasi usia (default: now) */
  referenceDate?: Date;
};

/**
 * Cari kandidat STANDBY yang cocok dengan kriteria via DB,
 * lalu beri skor dan urutkan. Dipakai di:
 *  - deal baru (CS memilih pekerja)
 *  - dispatch 2–3 kandidat pada tiket klaim garansi (PRD §5.3 #5)
 *
 * Catatan: hanya data kandidat (STANDBY, tidak soft-deleted, kategori cocok)
 * yang diambil. Tidak ada cutoff skor.
 */
export async function findMatchingWorkers(
  criteria: MatchingCriteria,
  options: FindMatchingOptions = {},
): Promise<MatchResult[]> {
  // Lazy import agar modul tetap bisa diimpor di lingkungan test tanpa DATABASE_URL.
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.worker.findMany({
    where: {
      status: "STANDBY",
      deletedAt: null,
      category: criteria.category,
    },
    include: {
      experiences: { select: { position: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Map Prisma Decimal → number secara aman
  const candidates: MatchableWorker[] = rows.map((w) => ({
    id: w.id,
    category: w.category as WorkerCategory,
    status: w.status,
    birthDate: w.birthDate,
    stayIn: w.stayIn,
    petTolerance: w.petTolerance,
    willingOutOfCity: w.willingOutOfCity,
    expectedSalary: w.expectedSalary as unknown as number,
    deletedAt: w.deletedAt,
    experiences: w.experiences,
    nickname: w.nickname,
    fullName: w.fullName,
    ethnicity: w.ethnicity,
    photoProfileUrl: w.photoProfileUrl,
  }));

  const ranked = rankCandidates(candidates, criteria, options.referenceDate);

  if (options.limit != null && options.limit > 0) {
    return ranked.slice(0, options.limit);
  }
  return ranked;
}
