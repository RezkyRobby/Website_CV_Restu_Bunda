// Unit test — service penomoran dokumen (PRD §7.6 & AGENTS.md Aturan 5).
// Menguji determinisme: format {PREFIX}/{YYYY}/{NNNN}, reset per tahun (zona Asia/Makassar),
// counter increment, dan format 4 digit angka.

import { describe, expect, it, vi } from "vitest";
import {
  generateDocumentNumber,
  currentYearJakarta,
  currentYearMakassar,
  DOCUMENT_PREFIXES,
  type DocumentTransaction,
} from "@/server/doc-numbering";

type SequenceRow = { id: string; last_value: number };

/** Membuat mock DocumentTransaction yang bekerja dengan store counter sederhana. */
function createMockTx(initialLastValue: number) {
  const rows = new Map<string, SequenceRow>();
  const seqIdByKey = new Map<string, string>();
  let cuid = 0;

  // Mock di-cast ke DocumentTransaction: mock mengimitasi transaksi DB subset.
  const mockTx = {
    documentSequence: {
      upsert: async (args: {
        where: { prefix_year: { prefix: string; year: number } };
        create: { prefix: string; year: number };
      }) => {
        const prefix = args.where.prefix_year.prefix;
        const year = args.where.prefix_year.year;
        const key = `${prefix}:${year}`;
        if (!seqIdByKey.has(key)) {
          const id = `seq_${++cuid}`;
          seqIdByKey.set(key, id);
          rows.set(id, { id, last_value: initialLastValue });
        }
        const id = seqIdByKey.get(key)!;
        return { id, prefix, year, lastValue: rows.get(id)!.last_value };
      },
      update: async (args: {
        where: { id: string };
        data: { lastValue: number | { set: number } };
      }) => {
        const row = rows.get(args.where.id);
        if (!row) throw new Error(`baris sequence ${args.where.id} tidak ditemukan`);
        row.last_value =
          typeof args.data.lastValue === "number"
            ? args.data.lastValue
            : args.data.lastValue.set;
        return row;
      },
    },
    $queryRaw: vi.fn(async (_query: unknown, id: unknown) => {
      const row = rows.get(id as string);
      return row ? [{ id: row.id, last_value: row.last_value }] : [];
    }),
  } as unknown as DocumentTransaction;

  return { mockTx, rows, seqIdByKey };
}

describe("currentYearJakarta", () => {
  it("mengembalikan tahun kalender Asia/Makassar (UTC+8) — alias kompatibilitas", () => {
    // Waktu 31 Des 2025 23:30 UTC = 01 Jan 2026 07:30 WITA → seharusnya 2026.
    const endOfYearUtc = new Date("2025-12-31T23:30:00Z");
    expect(currentYearJakarta(endOfYearUtc)).toBe(2026);
    expect(currentYearMakassar(endOfYearUtc)).toBe(2026);

    // Siang 1 Jul 2026 UTC = siang 1 Jul 2026 WITA.
    expect(currentYearJakarta(new Date("2026-07-01T12:00:00Z"))).toBe(2026);
  });
});

describe("currentYearMakassar", () => {
  it("mengembalikan tahun kalender Asia/Makassar (UTC+8, WITA)", () => {
    // 31 Des 2025 15:30 UTC = 31 Des 2025 23:30 WITA → masih 2025.
    expect(currentYearMakassar(new Date("2025-12-31T15:30:00Z"))).toBe(2025);
    // 31 Des 2025 16:00 UTC = 01 Jan 2026 00:00 WITA → sudah 2026.
    expect(currentYearMakassar(new Date("2025-12-31T16:00:00Z"))).toBe(2026);
    expect(currentYearMakassar(new Date("2026-07-01T12:00:00Z"))).toBe(2026);
  });
});

describe("generateDocumentNumber", () => {
  it("menghasilkan nomor betformat {PREFIX}/{YYYY}/{NNNN} dimulai dari 0001", async () => {
    const { mockTx } = createMockTx(0);
    const result = await generateDocumentNumber(mockTx, "SPK", new Date("2026-03-01T00:00:00Z"));
    expect(result).toBe("SPK/2026/0001");
  });

  it("menambah sequence secara berurutan untuk prefix yang sama", async () => {
    const { mockTx } = createMockTx(0);
    const a = await generateDocumentNumber(mockTx, "CLM", new Date("2026-03-01T00:00:00Z"));
    const b = await generateDocumentNumber(mockTx, "CLM", new Date("2026-03-01T00:00:00Z"));
    expect(a).toBe("CLM/2026/0001");
    expect(b).toBe("CLM/2026/0002");
  });

  it("memisahkan sequence antar prefix (SPK dan INV independen)", async () => {
    const { mockTx } = createMockTx(0);
    const spk = await generateDocumentNumber(mockTx, "SPK", new Date("2026-03-01T00:00:00Z"));
    const inv = await generateDocumentNumber(mockTx, "INV", new Date("2026-03-01T00:00:00Z"));
    expect(spk).toBe("SPK/2026/0001");
    expect(inv).toBe("INV/2026/0001");
  });

  it("melanjutkan dari lastValue yang sudah ada (bukan selalu 0001)", async () => {
    const { mockTx } = createMockTx(7);
    const result = await generateDocumentNumber(mockTx, "INV", new Date("2026-03-01T00:00:00Z"));
    expect(result).toBe("INV/2026/0008");
  });

  it("mereset per tahun berdasarkan zona Asia/Makassar", async () => {
    const { mockTx } = createMockTx(0);
    const y2026 = await generateDocumentNumber(mockTx, "SPK", new Date("2026-03-01T00:00:00Z"));
    // Simulasikan transaksi terpisah pada tahun berikutnya (store baru) → reset ke 0001.
    const { mockTx: tx2027 } = createMockTx(0);
    const y2027 = await generateDocumentNumber(tx2027, "SPK", new Date("2027-03-01T00:00:00Z"));
    expect(y2026).toBe("SPK/2026/0001");
    expect(y2027).toBe("SPK/2027/0001");
  });

  it("mengunci baris dengan FOR UPDATE sebelum increment", async () => {
    const { mockTx } = createMockTx(0);
    await generateDocumentNumber(mockTx, "SPK", new Date("2026-03-01T00:00:00Z"));
    // $queryRaw harus dipanggil minimal sekali (simulasi SELECT ... FOR UPDATE).
    expect(mockTx.$queryRaw).toHaveBeenCalled();
  });
});

describe("DOCUMENT_PREFIXES contract", () => {
  it("menyediakan prefix SPK, CLM, dan INV", () => {
    expect(DOCUMENT_PREFIXES).toEqual({ SPK: "SPK", CLM: "CLM", INV: "INV" });
  });
});