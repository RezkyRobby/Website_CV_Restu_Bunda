// Validator Kontrak — PRD §5.3 #4 & AGENTS.md Task 18
// Form kontrak: tanggal mulai, durasi bulan (min. 3 + pratinjau endDate),
// agreedSalary, placementFee, warrantyDays (default 90),
// maxReplacements (default 2), additionalClauses.
// Validasi dua lapis: dipakai React Hook Form (klien) dan Server Action (server).

import { z } from "zod";

// ============================================================
// Helper tanggal
// ============================================================

function isValidDateString(v: string): boolean {
  if (!v) return false;
  const d = new Date(v);
  return !Number.isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

/** Menghitung endDate dari startDate + durasi bulan (zona Asia/Makassar tidak memengaruhi tanggal murni). */
export function calcEndDate(startDateStr: string, durationMonths: number): string {
  if (!isValidDateString(startDateStr) || !Number.isFinite(durationMonths) || durationMonths < 1) return "";
  const start = new Date(startDateStr + "T00:00:00");
  const end = addMonths(start, durationMonths);
  // Kontrak berakhir sehari sebelum tanggal yang sama di bulan target agar inklusif.
  // Contoh: mulai 1 Jan durasi 3 bulan → selesai 31 Mar.
  end.setDate(end.getDate() - 1);
  const yyyy = end.getFullYear();
  const mm = String(end.getMonth() + 1).padStart(2, "0");
  const dd = String(end.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Koreksi overflow (mis. 31 Jan + 1 bulan → 3 Mar, seharusnya 28 Feb)
  // Jika hari berubah akibat overflow, mundurkan ke akhir bulan sebelumnya.
  if (d.getDate() !== day) {
    d.setDate(0);
  }
  return d;
}

/** Format tanggal YYYY-MM-DD → DD MMM YYYY (id-ID). */
export function formatTanggalIndo(isoDate: string): string {
  if (!isoDate) return "—";
  const d = new Date(isoDate + "T00:00:00");
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// ============================================================
// Helper rupiah
// ============================================================

export function parseRupiah(value: string): number | null {
  const cleaned = value.replace(/[^0-9]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

export function formatRupiahInput(value: string): string {
  const num = parseRupiah(value);
  if (num === null) return "";
  return num.toLocaleString("id-ID");
}

// ============================================================
// Skema Zod — sumber kebenaran tunggal
// ============================================================

const cuidSchema = z.string().trim().cuid("ID tidak valid.");

const rupiahStringSchema = (label: string, opts?: { min?: number }) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi.`)
    .refine((v) => parseRupiah(v) !== null, `${label} harus berupa angka.`)
    .refine(
      (v) => {
        const n = parseRupiah(v);
        return n !== null && n > 0;
      },
      `${label} harus lebih dari 0.`,
    )
    .refine(
      (v) => {
        if (opts?.min === undefined) return true;
        const n = parseRupiah(v);
        return n !== null && n >= opts.min;
      },
      `${label} minimal Rp ${opts?.min?.toLocaleString("id-ID")}.`,
    );

export const kontrakSchema = z.object({
  clientId: cuidSchema.describe("Majikan"),
  workerId: cuidSchema.describe("Pekerja"),
  startDate: z
    .string()
    .trim()
    .min(1, "Tanggal mulai wajib diisi.")
    .refine(isValidDateString, "Format tanggal mulai tidak valid (YYYY-MM-DD).")
    .refine((v) => {
      const d = new Date(v + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Izinkan hari ini atau masa depan; tolak tanggal lampau > 1 hari (toleransi)
      return d.getTime() >= today.getTime() - 24 * 60 * 60 * 1000;
    }, "Tanggal mulai tidak boleh di masa lalu."),
  durationMonths: z.coerce
    .number({ message: "Durasi wajib diisi." })
    .int("Durasi harus bilangan bulat.")
    .min(3, "Durasi minimal 3 bulan.")
    .max(36, "Durasi maksimal 36 bulan."),
  agreedSalary: rupiahStringSchema("Gaji disepakati"),
  placementFee: rupiahStringSchema("Biaya penempatan"),
  warrantyDays: z.coerce
    .number({ message: "Masa garansi wajib diisi." })
    .int("Masa garansi harus bilangan bulat.")
    .min(0, "Masa garansi minimal 0 hari.")
    .max(365, "Masa garansi maksimal 365 hari.")
    .default(90),
  maxReplacements: z.coerce
    .number({ message: "Kuota tukar wajib diisi." })
    .int("Kuota tukar harus bilangan bulat.")
    .min(0, "Kuota tukar minimal 0.")
    .max(5, "Kuota tukar maksimal 5.")
    .default(2),
  additionalClauses: z
    .string()
    .trim()
    .max(5000, "Klausul tambahan maksimal 5000 karakter.")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type KontrakInput = z.infer<typeof kontrakSchema>;

// Skema untuk preview endDate di server action — sama, tapi tanpa transform tambahan
export type KontrakPreview = {
  startDate: string;
  durationMonths: number;
  endDate: string;
};

export function buildPreview(startDate: string, durationMonths: number): KontrakPreview {
  return {
    startDate,
    durationMonths,
    endDate: calcEndDate(startDate, durationMonths),
  };
}
