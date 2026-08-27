// Validasi dua lapis untuk registrasi pekerja — PRD §5.3 #2, AGENTS.md Aturan 7
// Satu skema Zod dipakai di klien (React Hook Form) dan server (Server Action).
// Urutan langkah: Identitas → Keahlian → Dokumen/MCU → Riwayat Majikan → Standar Gaji → Consent

import { z } from "zod";

// ============================================================
// Enum helpers — sinkron dengan prisma/schema.prisma
// ============================================================

export const religionValues = ["ISLAM", "KRISTEN", "KATOLIK", "HINDU", "BUDDHA", "KONGHUCU"] as const;
export type ReligionValue = (typeof religionValues)[number];

export const maritalStatusValues = ["BELUM_MENIKAH", "MENIKAH", "CERAI_HIDUP", "CERAI_MATI"] as const;
export type MaritalStatusValue = (typeof maritalStatusValues)[number];

export const workerCategoryValues = ["BABY_SITTER", "ART", "PERAWAT_LANSIA", "SUPIR"] as const;
export type WorkerCategoryValue = (typeof workerCategoryValues)[number];

// ============================================================
// File validation — PRD: foto profil JPG/PNG maks 2 MB, dokumen sensitif JPG/PNG maks 5 MB
// ============================================================

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const MAX_SENSITIVE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/jpg"] as const;
const ALLOWED_EXT = ["jpg", "jpeg", "png"] as const;

function getExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop() ?? "").toLowerCase() : "";
}

function validateFile(file: File, maxBytes: number): string | null {
  if (!file || typeof file.name !== "string") return "Berkas tidak valid.";
  const mimeOk = (ALLOWED_MIME as readonly string[]).includes(file.type.toLowerCase());
  const extOk = (ALLOWED_EXT as readonly string[]).includes(getExtension(file.name));
  if (!mimeOk || !extOk) return "Berkas harus berformat JPG atau PNG.";
  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return `Ukuran berkas melebihi batas ${maxMb} MB.`;
  }
  if (file.size === 0) return "Berkas tidak boleh kosong.";
  return null;
}

function fileSchema(maxBytes: number, label: string, required: boolean) {
  return z
    .instanceof(File)
    .nullable()
    .superRefine((file, ctx) => {
      if (!file) {
        if (required) {
          ctx.addIssue({ code: "custom", message: `${label} wajib diunggah.` });
        }
        return;
      }
      const err = validateFile(file, maxBytes);
      if (err) ctx.addIssue({ code: "custom", message: `${label}: ${err}` });
    });
}

// ============================================================
// Skema per langkah
// ============================================================

// Langkah 1 — Identitas + Wali
export const step1Schema = z.object({
  nik: z
    .string()
    .trim()
    .regex(/^\d{16}$/, "NIK harus 16 digit angka.")
    .describe("NIK pekerja"),
  noKk: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\d{16}$/.test(v), "No. KK harus 16 digit angka bila diisi."),
  fullName: z.string().trim().min(3, "Nama lengkap minimal 3 karakter.").max(100, "Nama lengkap maksimal 100 karakter."),
  nickname: z.string().trim().min(2, "Nama panggilan minimal 2 karakter.").max(50, "Nama panggilan maksimal 50 karakter."),
  birthDate: z
    .string()
    .min(1, "Tanggal lahir wajib diisi.")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Tanggal lahir tidak valid.")
    .refine((v) => {
      const d = new Date(v);
      const now = new Date();
      // umur minimal 17 tahun
      const age = now.getFullYear() - d.getFullYear() - (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
      return age >= 17 && age <= 70;
    }, "Usia pekerja harus 17–70 tahun."),
  religion: z.enum(religionValues, { message: "Agama wajib dipilih." }),
  maritalStatus: z.enum(maritalStatusValues, { message: "Status pernikahan wajib dipilih." }),
  ethnicity: z.string().trim().min(2, "Suku minimal 2 karakter.").max(50, "Suku maksimal 50 karakter."),
  domicileAddress: z.string().trim().min(10, "Alamat domisili minimal 10 karakter.").max(500, "Alamat domisili maksimal 500 karakter."),
  guarantorName: z.string().trim().min(3, "Nama wali minimal 3 karakter.").max(100, "Nama wali maksimal 100 karakter."),
  guarantorPhone: z
    .string()
    .trim()
    .min(8, "Nomor telepon wali minimal 8 digit.")
    .max(20, "Nomor telepon wali maksimal 20 digit.")
    .regex(/^[0-9+\-\s()]+$/, "Nomor telepon wali hanya boleh angka, +, -, spasi, dan tanda kurung."),
  guarantorRelation: z.string().trim().max(50, "Hubungan wali maksimal 50 karakter.").optional().or(z.literal("")),
});

// Langkah 2 — Keahlian
export const step2Schema = z.object({
  category: z.enum(workerCategoryValues, { message: "Kategori layanan wajib dipilih." }),
  skillIds: z.array(z.string().cuid("ID keahlian tidak valid.")).min(1, "Pilih minimal 1 keahlian.").max(12, "Maksimal 12 keahlian."),
  stayIn: z.boolean(),
  petTolerance: z.boolean(),
  willingOutOfCity: z.boolean(),
  trainingCertificates: z
    .array(
      z.object({
        name: z.string().trim().min(2, "Nama sertifikat minimal 2 karakter.").max(100, "Nama sertifikat maksimal 100 karakter."),
        url: z.string().trim().url("URL sertifikat tidak valid.").or(z.literal("")).optional(),
      })
    )
    .max(10, "Maksimal 10 sertifikat.")
    .optional()
    .default([]),
});

// Langkah 3 — Dokumen & MCU
export const step3Schema = z.object({
  photoProfile: fileSchema(MAX_PHOTO_BYTES, "Foto profil", true),
  ktpDocument: fileSchema(MAX_SENSITIVE_BYTES, "KTP", true),
  mcuReport: fileSchema(MAX_SENSITIVE_BYTES, "Laporan MCU", false),
  skckDocument: fileSchema(MAX_SENSITIVE_BYTES, "Dokumen SKCK", false),
  skckVerified: z.boolean(),
});

// Langkah 4 — Riwayat majikan
export const workerExperienceItemSchema = z
  .object({
    employerLocation: z.string().trim().min(2, "Lokasi majikan minimal 2 karakter.").max(100, "Lokasi majikan maksimal 100 karakter."),
    position: z.string().trim().min(2, "Posisi minimal 2 karakter.").max(100, "Posisi maksimal 100 karakter."),
    startDate: z.string().min(1, "Tanggal mulai wajib diisi.").refine((v) => !Number.isNaN(Date.parse(v)), "Tanggal mulai tidak valid."),
    endDate: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || !Number.isNaN(Date.parse(v ?? "")), "Tanggal selesai tidak valid."),
    reasonForLeaving: z.string().trim().min(3, "Alasan berhenti minimal 3 karakter.").max(300, "Alasan berhenti maksimal 300 karakter."),
  })
  .superRefine((data, ctx) => {
    if (data.endDate) {
      const s = new Date(data.startDate);
      const e = new Date(data.endDate);
      if (e < s) {
        ctx.addIssue({ code: "custom", message: "Tanggal selesai tidak boleh sebelum tanggal mulai.", path: ["endDate"] });
      }
      if (e > new Date()) {
        ctx.addIssue({ code: "custom", message: "Tanggal selesai tidak boleh di masa depan.", path: ["endDate"] });
      }
    }
    const s = new Date(data.startDate);
    if (s > new Date()) {
      ctx.addIssue({ code: "custom", message: "Tanggal mulai tidak boleh di masa depan.", path: ["startDate"] });
    }
  });

export const step4Schema = z.object({
  experiences: z.array(workerExperienceItemSchema).max(20, "Maksimal 20 riwayat.").default([]),
});

// Langkah 5 — Standar gaji
export const step5Schema = z.object({
  expectedSalary: z
    .string()
    .trim()
    .min(1, "Gaji harapan wajib diisi.")
    .refine((v) => {
      const n = Number(v.replace(/[.,\s]/g, ""));
      return !Number.isNaN(n) && n >= 500_000 && n <= 50_000_000;
    }, "Gaji harapan harus Rp500.000 – Rp50.000.000."),
});

// Langkah 6 — Consent UU PDP (AGENTS.md Aturan 7)
export const step6Schema = z.object({
  dataConsent: z.literal(true, { message: "Persetujuan pemrosesan data wajib dicentang (UU PDP)." }),
});

// ============================================================
// Gabungan — untuk validasi akhir di server
// ============================================================

export const workerRegistrationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema);

export type WorkerRegistrationInput = z.infer<typeof workerRegistrationSchema>;
export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type Step4Input = z.infer<typeof step4Schema>;
export type Step5Input = z.infer<typeof step5Schema>;
export type Step6Input = z.infer<typeof step6Schema>;

// Helper parse gaji string → number IDR
export function parseSalaryRupiah(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, "");
  return Number(cleaned);
}

// Validasi gabungan untuk server action (menerima FormData + JSON)
export function validateWorkerRegistration(data: unknown) {
  return workerRegistrationSchema.safeParse(data);
}
