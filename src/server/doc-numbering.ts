// Service penomoran dokumen — PRD §7.6 & AGENTS.md Aturan 5.
//
// Format: {PREFIX}/{YYYY}/{NNNN} — contoh SPK/2026/0001, CLM/2026/0001, INV/2026/0001.
// Sequence reset per tahun (berdasarkan zona Asia/Makassar, bukan jam server),
// dan digenerate DI DALAM transaksi database dengan row lock (SELECT ... FOR UPDATE)
// agar bebas race condition saat dua CS merilis dokumen bersamaan.

import { Prisma } from "@/generated/prisma/client";

export const DOCUMENT_PREFIXES = {
  SPK: "SPK",
  CLM: "CLM",
  INV: "INV",
} as const;

export type DocumentPrefixKey = keyof typeof DOCUMENT_PREFIXES;

const SEQUENCE_LENGTH = 4;

/**
 * Subset transaksi Prisma yang dibutuhkan service penomoran.
 * Kompatibel dengan Prisma.TransactionClient (structural), sekaligus cukup
 * sempit untuk mudah di-mock pada unit test.
 */
export type DocumentTransaction = {
  documentSequence: {
    upsert(args: Prisma.DocumentSequenceUpsertArgs): Promise<{ id: string }>;
    update(args: Prisma.DocumentSequenceUpdateArgs): Promise<unknown>;
  };
  $queryRaw(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: unknown[]
  ): Promise<unknown>;
};

/** Format angka menjadi 4 digit, mis. 1 → "0001". */
function padSequence(value: number): string {
  return String(value).padStart(SEQUENCE_LENGTH, "0");
}

/**
 * Tahun kalender dalam zona Asia/Makassar (UTC+8, WITA).
 * Prisma mengirim DateTime sebagai UTC; angka tahun dihitung manual
 * agar tidak bergantung pada timezone jam server.
 */
export function currentYearMakassar(now: Date = new Date()): number {
  const makassarOffsetMs = 8 * 60 * 60 * 1000;
  return new Date(now.getTime() + makassarOffsetMs).getUTCFullYear();
}

/** Alias kompatibilitas — delegasi ke zona Makassar. */
export const currentYearJakarta = currentYearMakassar;

/**
 * Menghasilkan nomor dokumen berikutnya untuk prefix tertentu di dalam
 * transaksi. Row yang sama dikunci (`FOR UPDATE`) sehingga dua panggilan
 * paralel tidak mungkin mendapat nomor yang sama.
 *
 * Wajib dipanggil dari dalam transaksi Prisma (`prisma.$transaction(async (tx) => ...)`).
 */
export async function generateDocumentNumber(
  tx: DocumentTransaction,
  prefix: DocumentPrefixKey,
  now: Date = new Date()
): Promise<string> {
  const year = currentYearMakassar(now);

  // Ambil baris counter untuk (prefix, year). WHERE ... FOR UPDATE mengunci
  // baris bila sudah ada; `upsert` + callback mengamankan baris baru.
  const sequence = await tx.documentSequence.upsert({
    where: { prefix_year: { prefix, year } },
    update: {},
    create: { prefix, year },
  });

  // Baca ulang dengan lock eksplisit. Di Postgres, `FOR UPDATE` mengunci baris
  // yang dipilih sehingga transaksi lain harus menunggu hingga commit.
  const locked = (await tx.$queryRaw`SELECT id, last_value FROM document_sequences WHERE id = ${sequence.id} FOR UPDATE`) as
    Array<{ id: string; last_value: number }>;

  const currentValue = locked[0]?.last_value ?? 0;
  const nextValue = currentValue + 1;

  await tx.documentSequence.update({
    where: { id: sequence.id },
    data: { lastValue: nextValue },
  });

  return `${DOCUMENT_PREFIXES[prefix]}/${year}/${padSequence(nextValue)}`;
}
