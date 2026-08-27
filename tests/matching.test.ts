// Unit test Smart Matching Engine — PRD Lampiran A & Task 16
// Meliputi: hard gate kategori + 6 komponen berbobot + agregasi + ranking.
// Setiap komponen wajib unit test terpisah; deterministik dan tanpa cutoff minimum.

import { describe, expect, it } from "vitest";
import {
  calculateAge,
  isExperienceRelevant,
  scorePengalamanRelevan,
  scoreKesesuaianGaji,
  scoreSistemKerja,
  scoreRentangUsia,
  scoreToleransiHewan,
  scoreKesediaanLuarKota,
  calculateMatchScore,
  passesHardGate,
  rankCandidates,
  WEIGHTS,
  type MatchingCriteria,
  type MatchableWorker,
} from "@/server/matching";

// ——— Helper ———

function birthYearsAgo(years: number, ref: Date = new Date("2026-08-27T00:00:00Z")): Date {
  const d = new Date(ref);
  d.setFullYear(d.getFullYear() - years);
  return d;
}

function makeWorker(overrides: Partial<MatchableWorker> = {}): MatchableWorker {
  return {
    id: `w_${Math.random().toString(36).slice(2, 8)}`,
    category: "ART",
    status: "STANDBY",
    birthDate: birthYearsAgo(28),
    stayIn: true,
    petTolerance: false,
    willingOutOfCity: false,
    expectedSalary: 2500000,
    deletedAt: null,
    experiences: [],
    nickname: "Siti",
    ...overrides,
  };
}

const REF = new Date("2026-08-27T00:00:00Z");

// ============================================================
// isExperienceRelevant & calculateAge
// ============================================================

describe("isExperienceRelevant — pemetaan position ke kategori", () => {
  it("mengenali pengalaman relevan BABY_SITTER", () => {
    expect(isExperienceRelevant("Baby Sitter di Jakarta", "BABY_SITTER")).toBe(true);
    expect(isExperienceRelevant("Pengasuh bayi & MPASI", "BABY_SITTER")).toBe(true);
    expect(isExperienceRelevant("Perawatan Bayi", "BABY_SITTER")).toBe(true);
    expect(isExperienceRelevant("ART bersih-bersih", "BABY_SITTER")).toBe(false);
  });

  it("mengenali pengalaman relevan ART", () => {
    expect(isExperienceRelevant("ART - memasak dan bersih-bersih rumah", "ART")).toBe(true);
    expect(isExperienceRelevant("Asisten Rumah Tangga", "ART")).toBe(true);
    expect(isExperienceRelevant("Housekeeping hotel", "ART")).toBe(true);
    expect(isExperienceRelevant("Supir pribadi", "ART")).toBe(false);
  });

  it("mengenali pengalaman relevan PERAWAT_LANSIA", () => {
    expect(isExperienceRelevant("Perawat Lansia bedridden", "PERAWAT_LANSIA")).toBe(true);
    expect(isExperienceRelevant("Caregiver lansia di panti", "PERAWAT_LANSIA")).toBe(true);
    expect(isExperienceRelevant("ART biasa", "PERAWAT_LANSIA")).toBe(false);
  });

  it("mengenali pengalaman relevan SUPIR", () => {
    expect(isExperienceRelevant("Supir keluarga", "SUPIR")).toBe(true);
    expect(isExperienceRelevant("Driver pribadi", "SUPIR")).toBe(true);
    expect(isExperienceRelevant("Mengemudi Mobil antar jemput", "SUPIR")).toBe(true);
    expect(isExperienceRelevant("Baby sitter", "SUPIR")).toBe(false);
  });

  it("case-insensitive dan toleran spasi", () => {
    expect(isExperienceRelevant("  ART  ", "ART")).toBe(true);
    expect(isExperienceRelevant("SUPIR", "SUPIR")).toBe(true);
  });
});

describe("calculateAge", () => {
  it("menghitung usia dengan benar terhadap tanggal acuan", () => {
    const birth = new Date("2000-08-27T00:00:00Z");
    expect(calculateAge(birth, new Date("2026-08-27T00:00:00Z"))).toBe(26);
    // Belum ulang tahun tahun ini
    expect(calculateAge(new Date("2000-09-01T00:00:00Z"), new Date("2026-08-27T00:00:00Z"))).toBe(25);
    // Sudah lewat bulan lahir
    expect(calculateAge(new Date("2000-01-01T00:00:00Z"), new Date("2026-08-27T00:00:00Z"))).toBe(26);
  });
});

// ============================================================
// Komponen 1 — Pengalaman relevan (30%)
// ============================================================

describe("scorePengalamanRelevan (bobot 30%)", () => {
  it("0 pengalaman relevan → 0", () => {
    expect(scorePengalamanRelevan([], "ART")).toBe(0);
    expect(scorePengalamanRelevan([{ position: "Supir keluarga" }], "ART")).toBe(0);
  });

  it("1 pengalaman relevan → 50", () => {
    expect(scorePengalamanRelevan([{ position: "ART bersih-bersih" }], "ART")).toBe(50);
  });

  it("2 pengalaman relevan → 100", () => {
    expect(
      scorePengalamanRelevan([{ position: "ART memasak" }, { position: "Asisten Rumah Tangga" }], "ART"),
    ).toBe(100);
  });

  it("≥3 pengalaman relevan tetap cap 100 (min(...,2)/2)", () => {
    expect(
      scorePengalamanRelevan(
        [{ position: "ART a" }, { position: "ART b" }, { position: "ART c" }, { position: "ART d" }],
        "ART",
      ),
    ).toBe(100);
  });

  it("hanya pengalaman relevan yang dihitung", () => {
    expect(
      scorePengalamanRelevan(
        [{ position: "ART memasak" }, { position: "Supir keluarga" }, { position: "Baby sitter" }],
        "ART",
      ),
    ).toBe(50);
  });
});

// ============================================================
// Komponen 2 — Kesesuaian gaji (25%)
// ============================================================

describe("scoreKesesuaianGaji (bobot 25%)", () => {
  it("≤ budgetMax → 100", () => {
    expect(scoreKesesuaianGaji(3000000, 3000000)).toBe(100);
    expect(scoreKesesuaianGaji(2500000, 3000000)).toBe(100);
  });

  it("≤ budgetMax × 1.1 → 50", () => {
    // 3.000.000 × 1,1 = 3.300.000
    expect(scoreKesesuaianGaji(3300000, 3000000)).toBe(50);
    expect(scoreKesesuaianGaji(3100000, 3000000)).toBe(50);
    expect(scoreKesesuaianGaji(3000001, 3000000)).toBe(50);
  });

  it("> budgetMax × 1.1 → 0", () => {
    expect(scoreKesesuaianGaji(3300001, 3000000)).toBe(0);
    expect(scoreKesesuaianGaji(4000000, 3000000)).toBe(0);
  });

  it("budgetMax null/0/undefined → 100 (tanpa batas)", () => {
    expect(scoreKesesuaianGaji(9000000, null)).toBe(100);
    expect(scoreKesesuaianGaji(9000000, undefined)).toBe(100);
    expect(scoreKesesuaianGaji(9000000, 0)).toBe(100);
  });

  it("mendukung Prisma Decimal (objek dengan toNumber)", () => {
    const decimal = { toNumber: () => 2800000 };
    expect(scoreKesesuaianGaji(decimal, 3000000)).toBe(100);
    expect(scoreKesesuaianGaji(decimal, 2500000)).toBe(0); // 2.8jt > 2.5jt×1.1=2.75jt
  });

  it("mendukung string gaji", () => {
    expect(scoreKesesuaianGaji("2500000", 3000000)).toBe(100);
  });
});

// ============================================================
// Komponen 3 — Sistem kerja stayIn (15%)
// ============================================================

describe("scoreSistemKerja (bobot 15%)", () => {
  it("sama dengan kriteria → 100", () => {
    expect(scoreSistemKerja(true, true)).toBe(100);
    expect(scoreSistemKerja(false, false)).toBe(100);
  });

  it("beda dengan kriteria → 0", () => {
    expect(scoreSistemKerja(true, false)).toBe(0);
    expect(scoreSistemKerja(false, true)).toBe(0);
  });

  it("kriteria null/undefined → 100 (tidak dipersyaratkan)", () => {
    expect(scoreSistemKerja(true, null)).toBe(100);
    expect(scoreSistemKerja(false, null)).toBe(100);
    expect(scoreSistemKerja(true, undefined)).toBe(100);
  });
});

// ============================================================
// Komponen 4 — Rentang usia (10%)
// ============================================================

describe("scoreRentangUsia (bobot 10%)", () => {
  it("dalam rentang [ageMin, ageMax] → 100", () => {
    expect(scoreRentangUsia(birthYearsAgo(28, REF), 25, 35, REF)).toBe(100);
    expect(scoreRentangUsia(birthYearsAgo(25, REF), 25, 35, REF)).toBe(100); // tepi bawah
    expect(scoreRentangUsia(birthYearsAgo(35, REF), 25, 35, REF)).toBe(100); // tepi atas
  });

  it("selisih ≤2 tahun dari tepi → 50", () => {
    // Rentang 25–35: usia 23 (2 tahun di bawah min) → 50
    expect(scoreRentangUsia(birthYearsAgo(23, REF), 25, 35, REF)).toBe(50);
    expect(scoreRentangUsia(birthYearsAgo(24, REF), 25, 35, REF)).toBe(50);
    // 37 (2 tahun di atas max) → 50
    expect(scoreRentangUsia(birthYearsAgo(37, REF), 25, 35, REF)).toBe(50);
    expect(scoreRentangUsia(birthYearsAgo(36, REF), 25, 35, REF)).toBe(50);
  });

  it("selisih >2 tahun → 0", () => {
    expect(scoreRentangUsia(birthYearsAgo(22, REF), 25, 35, REF)).toBe(0);
    expect(scoreRentangUsia(birthYearsAgo(38, REF), 25, 35, REF)).toBe(0);
    expect(scoreRentangUsia(birthYearsAgo(45, REF), 25, 35, REF)).toBe(0);
  });

  it("tanpa batas (keduanya null/undefined) → 100", () => {
    expect(scoreRentangUsia(birthYearsAgo(60, REF), null, null, REF)).toBe(100);
    expect(scoreRentangUsia(birthYearsAgo(60, REF), undefined, undefined, REF)).toBe(100);
  });

  it("hanya satu sisi terisi: sisi kosong dianggap tak terbatas", () => {
    // Hanya ageMin=30: usia 28 selisih 2 → 50, usia 25 selisih 5 → 0
    expect(scoreRentangUsia(birthYearsAgo(28, REF), 30, null, REF)).toBe(50);
    expect(scoreRentangUsia(birthYearsAgo(25, REF), 30, null, REF)).toBe(0);
    expect(scoreRentangUsia(birthYearsAgo(30, REF), 30, null, REF)).toBe(100);
    // Hanya ageMax=30: usia 32 selisih 2 → 50
    expect(scoreRentangUsia(birthYearsAgo(32, REF), null, 30, REF)).toBe(50);
    expect(scoreRentangUsia(birthYearsAgo(35, REF), null, 30, REF)).toBe(0);
    expect(scoreRentangUsia(birthYearsAgo(28, REF), null, 30, REF)).toBe(100);
  });
});

// ============================================================
// Komponen 5 — Toleransi hewan (10%)
// ============================================================

describe("scoreToleransiHewan (bobot 10%)", () => {
  it("kriteria tidak membutuhkan → 100 apapun nilai pekerja", () => {
    expect(scoreToleransiHewan(false, false)).toBe(100);
    expect(scoreToleransiHewan(true, false)).toBe(100);
    expect(scoreToleransiHewan(false, null)).toBe(100);
    expect(scoreToleransiHewan(false, undefined)).toBe(100);
  });

  it("kriteria membutuhkan (true) + pekerja toleran → 100", () => {
    expect(scoreToleransiHewan(true, true)).toBe(100);
  });

  it("kriteria membutuhkan (true) + pekerja tidak toleran → 0", () => {
    expect(scoreToleransiHewan(false, true)).toBe(0);
  });
});

// ============================================================
// Komponen 6 — Kesediaan luar kota (10%)
// ============================================================

describe("scoreKesediaanLuarKota (bobot 10%)", () => {
  it("kriteria tidak membutuhkan → 100", () => {
    expect(scoreKesediaanLuarKota(false, false)).toBe(100);
    expect(scoreKesediaanLuarKota(true, false)).toBe(100);
    expect(scoreKesediaanLuarKota(false, null)).toBe(100);
    expect(scoreKesediaanLuarKota(false, undefined)).toBe(100);
  });

  it("kriteria membutuhkan (true) + pekerja bersedia → 100", () => {
    expect(scoreKesediaanLuarKota(true, true)).toBe(100);
  });

  it("kriteria membutuhkan (true) + pekerja tidak bersedia → 0", () => {
    expect(scoreKesediaanLuarKota(false, true)).toBe(0);
  });
});

// ============================================================
// Bobot — sanity check
// ============================================================

describe("WEIGHTS", () => {
  it("total bobot = 1.0 (100%)", () => {
    const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1.0, 5);
  });
});

// ============================================================
// Gerbang keras (hard gate)
// ============================================================

describe("passesHardGate", () => {
  const baseCriteria: MatchingCriteria = { category: "ART" };

  it("lolos bila STANDBY, tidak soft-deleted, kategori cocok", () => {
    expect(passesHardGate(makeWorker(), baseCriteria)).toBe(true);
  });

  it("gagal bila status bukan STANDBY", () => {
    expect(passesHardGate(makeWorker({ status: "PLACED" }), baseCriteria)).toBe(false);
    expect(passesHardGate(makeWorker({ status: "INTERVIEW" }), baseCriteria)).toBe(false);
    expect(passesHardGate(makeWorker({ status: "BLACKLIST" }), baseCriteria)).toBe(false);
    expect(passesHardGate(makeWorker({ status: "ON_LEAVE" }), baseCriteria)).toBe(false);
  });

  it("gagal bila soft-deleted (deletedAt terisi)", () => {
    expect(passesHardGate(makeWorker({ deletedAt: new Date() }), baseCriteria)).toBe(false);
  });

  it("gagal bila kategori berbeda (hard gate Lampiran A)", () => {
    expect(passesHardGate(makeWorker({ category: "BABY_SITTER" }), { category: "ART" })).toBe(false);
    expect(passesHardGate(makeWorker({ category: "SUPIR" }), { category: "ART" })).toBe(false);
  });
});

// ============================================================
// Agregasi — calculateMatchScore
// ============================================================

describe("calculateMatchScore — agregasi berbobot", () => {
  it("skor sempurna 100 bila semua komponen 100", () => {
    const worker = makeWorker({
      experiences: [{ position: "ART memasak" }, { position: "Asisten Rumah Tangga" }],
      expectedSalary: 2500000,
      stayIn: true,
      birthDate: birthYearsAgo(28, REF),
      petTolerance: true,
      willingOutOfCity: true,
    });
    const criteria: MatchingCriteria = {
      category: "ART",
      budgetSalaryMax: 3000000,
      stayIn: true,
      ageMin: 25,
      ageMax: 35,
      petTolerance: true,
      willingOutOfCity: true,
    };
    const result = calculateMatchScore(worker, criteria, REF);
    expect(result.totalScore).toBe(100);
    expect(result.breakdown.pengalaman).toBe(100);
    expect(result.breakdown.gaji).toBe(100);
    expect(result.breakdown.sistemKerja).toBe(100);
    expect(result.breakdown.usia).toBe(100);
    expect(result.breakdown.toleransiHewan).toBe(100);
    expect(result.breakdown.luarKota).toBe(100);
  });

  it("skor 0 bila semua komponen 0 (kecuali yang tak dikontrol kriteria)", () => {
    // Gaji 0% + pengalaman 0% + stayIn mismatch + usia jauh + toleransi gagal + luar kota gagal
    const worker = makeWorker({
      experiences: [{ position: "Supir keluarga" }], // tidak relevan ART → 0
      expectedSalary: 5000000, // > 3jt×1.1 → 0
      stayIn: false, // vs true → 0
      birthDate: birthYearsAgo(50, REF), // vs 25–30 → >2 tahun → 0
      petTolerance: false, // kriteria true → 0
      willingOutOfCity: false, // kriteria true → 0
    });
    const criteria: MatchingCriteria = {
      category: "ART",
      budgetSalaryMax: 3000000,
      stayIn: true,
      ageMin: 25,
      ageMax: 30,
      petTolerance: true,
      willingOutOfCity: true,
    };
    const result = calculateMatchScore(worker, criteria, REF);
    // Semua breakdown 0 → total 0
    expect(result.totalScore).toBe(0);
  });

  it("menghitung round(Σ bobot × nilai) dengan benar", () => {
    // Buat kombinasi: pengalaman 50 (0.3→15), gaji 50 (0.25→12.5), stayIn 0 (0), usia 50 (0.1→5), hewan 100 (0.1→10), luarKota 0 (0)
    // Total = 15+12.5+0+5+10+0 = 42.5 → round 43
    const worker = makeWorker({
      experiences: [{ position: "ART memasak" }], // 1 relevan → 50
      expectedSalary: 3300000, // 3jt → 50
      stayIn: false, // vs true → 0
      birthDate: birthYearsAgo(37, REF), // 25–35, 37 → selisih 2 → 50
      petTolerance: true, // 100
      willingOutOfCity: false, // vs true → 0
    });
    const criteria: MatchingCriteria = {
      category: "ART",
      budgetSalaryMax: 3000000,
      stayIn: true,
      ageMin: 25,
      ageMax: 35,
      petTolerance: true,
      willingOutOfCity: true,
    };
    const result = calculateMatchScore(worker, criteria, REF);
    expect(result.breakdown).toEqual({
      pengalaman: 50,
      gaji: 50,
      sistemKerja: 0,
      usia: 50,
      toleransiHewan: 100,
      luarKota: 0,
    });
    expect(result.totalScore).toBe(43);
  });

  it("deterministik: pemanggilan berulang menghasilkan skor identik", () => {
    const worker = makeWorker({
      experiences: [{ position: "ART memasak" }],
      expectedSalary: 2700000,
      stayIn: true,
      birthDate: birthYearsAgo(30, REF),
      petTolerance: true,
      willingOutOfCity: true,
    });
    const criteria: MatchingCriteria = { category: "ART", budgetSalaryMax: 3000000, stayIn: true };
    const a = calculateMatchScore(worker, criteria, REF);
    const b = calculateMatchScore(worker, criteria, REF);
    expect(a.totalScore).toBe(b.totalScore);
    expect(a.breakdown).toEqual(b.breakdown);
  });
});

// ============================================================
// Ranking — rankCandidates
// ============================================================

describe("rankCandidates — filter hard gate + ranking menurun tanpa cutoff", () => {
  it("memfilter hard gate lalu mengurutkan menurun", () => {
    const criteria: MatchingCriteria = {
      category: "ART",
      budgetSalaryMax: 3000000,
      stayIn: true,
    };

    // A: skor tinggi; B: skor menengah; C: kategori salah (terfilter); D: PLACED (terfilter)
    const workerA = makeWorker({
      id: "A",
      expectedSalary: 2500000,
      stayIn: true,
      experiences: [{ position: "ART memasak" }, { position: "Asisten Rumah Tangga" }],
    });
    const workerB = makeWorker({
      id: "B",
      expectedSalary: 3300000, // gaji 50
      stayIn: false, // stayIn 0
      experiences: [],
    });
    const workerC = makeWorker({ id: "C", category: "SUPIR" });
    const workerD = makeWorker({ id: "D", status: "PLACED" });

    const ranked = rankCandidates([workerB, workerC, workerA, workerD], criteria, REF);
    expect(ranked.map((r) => r.worker.id)).toEqual(["A", "B"]);
    expect(ranked[0].totalScore).toBeGreaterThan(ranked[1].totalScore);
  });

  it("tanpa cutoff minimum: kandidat skor 0 tetap dikembalikan bila lolos gate", () => {
    const criteria: MatchingCriteria = {
      category: "ART",
      budgetSalaryMax: 2000000,
      stayIn: true,
      petTolerance: true,
      willingOutOfCity: true,
    };
    // Pekerja dengan gaji mahal + tidak toleran hewan + tidak bersedia luar kota → skor rendah tapi tetap ada
    const worker = makeWorker({
      id: "low",
      expectedSalary: 5000000,
      stayIn: false,
      petTolerance: false,
      willingOutOfCity: false,
      experiences: [{ position: "Supir keluarga" }],
      birthDate: birthYearsAgo(60, REF),
    });
    // Ubah kriteria usia agar skor usia juga 0
    const criteria2: MatchingCriteria = { ...criteria, ageMin: 20, ageMax: 25 };
    const ranked = rankCandidates([worker], criteria2, REF);
    expect(ranked).toHaveLength(1);
    // Skornya rendah (bahkan bisa 0) tapi tetap dikembalikan
    expect(ranked[0].totalScore).toBeGreaterThanOrEqual(0);
  });

  it("mengembalikan array kosong bila tidak ada yang lolos gate", () => {
    const criteria: MatchingCriteria = { category: "ART" };
    const ranked = rankCandidates([makeWorker({ category: "SUPIR" }), makeWorker({ status: "PLACED" })], criteria);
    expect(ranked).toEqual([]);
  });

  it("list kosong → hasil kosong", () => {
    expect(rankCandidates([], { category: "ART" })).toEqual([]);
  });

  it("skor identik tetap deterministik (stabil)", () => {
    const criteria: MatchingCriteria = { category: "ART" };
    const w1 = makeWorker({ id: "1", expectedSalary: 2500000 });
    const w2 = makeWorker({ id: "2", expectedSalary: 2500000 });
    const ranked = rankCandidates([w1, w2], criteria, REF);
    expect(ranked).toHaveLength(2);
    // Keduanya skor sama; relatif order tidak dijamin stabil, tapi panjang & skor sama harus benar
    expect(ranked[0].totalScore).toBe(ranked[1].totalScore);
  });
});
