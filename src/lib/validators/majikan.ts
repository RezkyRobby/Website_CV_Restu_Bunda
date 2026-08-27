// Validator Majikan (CLIENT) — PRD §5.4 #1 & AGENTS.md § Keputusan Bisnis
// Akun Majikan dibuat oleh CS saat deal (cek existing by email/telepon dulu,
// dipakai ulang antar kontrak; akun baru dapat email invite set-password).
// Validasi dua lapis: dipakai React Hook Form (klien) dan Server Action (server).

import { z } from "zod";

// ============================================================
// Helper
// ============================================================

// Email wajib format valid, lowercase normalisasi di server.
// Telepon: format internasional 62xxxx atau 08xxxx, 9–15 digit setelah normalisasi.
const emailSchema = z
  .string()
  .trim()
  .min(1, "Email wajib diisi.")
  .email("Format email tidak valid.")
  .max(254, "Email terlalu panjang.")
  .transform((v) => v.toLowerCase());

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Nomor telepon wajib diisi.")
  .regex(/^[0-9+\-\s()]+$/, "Nomor telepon hanya boleh berisi angka, +, -, dan spasi.")
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .refine((v) => {
    const digits = v.replace(/^\+/, "");
    return digits.length >= 9 && digits.length <= 15;
  }, "Nomor telepon harus 9–15 digit.");

// ============================================================
// Lookup — cek existing by email/telepon sebelum buat baru
// ============================================================

export const majikanLookupSchema = z
  .object({
    email: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v.toLowerCase().trim() : ""))
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Format email tidak valid."),
    phone: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v.replace(/[\s()-]/g, "").trim() : "")),
  })
  .refine((data) => Boolean(data.email || data.phone), {
    message: "Isi email atau nomor telepon untuk mencari akun Majikan.",
    path: ["email"],
  });

export type MajikanLookupInput = z.infer<typeof majikanLookupSchema>;

// ============================================================
// Create — buat akun Majikan baru (dipakai ulang antar kontrak)
// ============================================================

export const majikanCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama Majikan minimal 2 karakter.")
    .max(100, "Nama Majikan maksimal 100 karakter."),
  email: emailSchema,
  phone: phoneSchema,
  address: z
    .string()
    .trim()
    .max(500, "Alamat maksimal 500 karakter.")
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type MajikanCreateInput = z.infer<typeof majikanCreateSchema>;

// Normalisasi telepon untuk penyimpanan: hilangkan spasi/dash, pertahankan + bila ada.
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s()-]/g, "").trim();
}

// Normalisasi email untuk query: lowercase trim.
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
