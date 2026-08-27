// Modul Cloudinary — PRD §5.2/§5.4 & AGENTS.md Aturan 1.
// Menangani upload tervalidasi, signed delivery URL dengan watermark dinamis,
// serta penghapusan asset (purge retensi). Komentar Bahasa Indonesia formal per AGENTS.md.
//
// Aturan validasi:
// - Dokumen sensitif (KTP, KK, MCU, SKCK): wajib JPG/PNG, maks 5 MB — satu pipeline watermark.
// - Foto profil: JPG/PNG, maks 2 MB.

import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

// ============================================================
// Konfigurasi
// ============================================================

let isConfigured = false;

/** Mengambil konfigurasi dari environment dan memvalidasi kehadiran nilai wajib. */
export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return {
    cloudName: cloudName ?? "",
    apiKey: apiKey ?? "",
    apiSecret: apiSecret ?? "",
    isConfigured: Boolean(cloudName && apiKey && apiSecret),
  };
}

/** Apakah kredensial Cloudinary sudah terisi. */
export function isCloudinaryConfigured(): boolean {
  return getCloudinaryConfig().isConfigured;
}

/**
 * Konfigurasi idempoten. Aman dipanggil berulang — hanya mengatur sekali.
 * Melempar error berbahasa Indonesia bila kredensial belum lengkap.
 */
export function configureCloudinary(): void {
  if (isConfigured) return;

  const { cloudName, apiKey, apiSecret, isConfigured: ok } = getCloudinaryConfig();
  if (!ok) {
    throw new Error(
      "Konfigurasi Cloudinary belum lengkap. Isi CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET di file .env."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
}

// ============================================================
// Konstanta validasi
// ============================================================

export const MAX_SENSITIVE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2 MB

export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/jpg"] as const;
export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"] as const;

export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME)[number];

/** Daftar tipe dokumen sensitif yang dilindungi watermark. */
export const SENSITIVE_DOCUMENT_TYPES = ["ktp", "kk", "mcu", "skck"] as const;
export type SensitiveDocumentType = (typeof SENSITIVE_DOCUMENT_TYPES)[number];

/** Semua tipe dokumen yang dipakai di route /api/documents/[workerId]/[type]. */
export const DOCUMENT_TYPES = [...SENSITIVE_DOCUMENT_TYPES, "photo", "spk", "spkStamped"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

// ============================================================
// Helper validasi umum
// ============================================================

export type FileLike = {
  size: number;
  type: string;
  name: string;
};

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop() ?? "").toLowerCase() : "";
}

function isAllowedMime(mime: string): boolean {
  return (ALLOWED_IMAGE_MIME as readonly string[]).includes(mime.toLowerCase());
}

function isAllowedExtension(fileName: string): boolean {
  const ext = getExtension(fileName);
  return (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * Validasi file gambar generik. Mengembalikan pesan error Bahasa Indonesia
 * bila tidak valid, atau null bila valid.
 */
export function validateImageFile(
  file: FileLike,
  maxBytes: number,
  label: string
): string | null {
  if (!isAllowedMime(file.type) || !isAllowedExtension(file.name)) {
    return `${label} harus berformat JPG atau PNG.`;
  }
  if (file.size > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return `Ukuran ${label} melebihi batas ${maxMb} MB.`;
  }
  if (file.size === 0) {
    return `${label} tidak boleh kosong.`;
  }
  return null;
}

/** Validasi dokumen sensitif (KTP/KK/MCU/SKCK): JPG/PNG maks 5 MB. */
export function validateSensitiveDocument(file: FileLike): string | null {
  return validateImageFile(file, MAX_SENSITIVE_BYTES, "Dokumen sensitif");
}

/** Validasi foto profil: JPG/PNG maks 2 MB. */
export function validatePhotoProfile(file: FileLike): string | null {
  return validateImageFile(file, MAX_PHOTO_BYTES, "Foto profil");
}

/** Validasi generik berbasis tipe dokumen. */
export function validateByDocumentType(file: FileLike, type: DocumentType): string | null {
  if ((SENSITIVE_DOCUMENT_TYPES as readonly string[]).includes(type)) {
    return validateSensitiveDocument(file);
  }
  if (type === "photo") {
    return validatePhotoProfile(file);
  }
  // SPK dan turunan berupa PDF di Cloudinary — validasi ringan: ukuran maks 10 MB.
  // Dokumen sensitif pipeline watermark tetap JPG/PNG; SPK tidak masuk pipeline ini.
  if (type === "spk" || type === "spkStamped") {
    if (file.size > 10 * 1024 * 1024) return "Ukuran dokumen SPK melebihi batas 10 MB.";
    if (file.size === 0) return "Dokumen SPK tidak boleh kosong.";
    return null;
  }
  return validateSensitiveDocument(file);
}

// ============================================================
// Skema Zod — dipakai dua lapis (klien via React Hook Form & server)
// Satu skema dipakai di kedua tempat (AGENTS.md — Pola Wajib).
// ============================================================

/**
 * Skema file berbasis objek FileLike (kompatibel browser File maupun mock Node).
 * Dipakai di Server Action / Route Handler yang menerima File dari FormData.
 */
export const fileLikeSchema = z.object({
  size: z.number().min(1, "Berkas tidak boleh kosong."),
  type: z.string().min(1, "Tipe berkas wajib terisi."),
  name: z.string().min(1, "Nama berkas wajib terisi."),
});

export const sensitiveDocumentSchema = fileLikeSchema.superRefine((file, ctx) => {
  const error = validateSensitiveDocument(file);
  if (error) {
    ctx.addIssue({ code: "custom", message: error });
  }
});

export const photoProfileSchema = fileLikeSchema.superRefine((file, ctx) => {
  const error = validatePhotoProfile(file);
  if (error) {
    ctx.addIssue({ code: "custom", message: error });
  }
});

/** Skema generik untuk upload yang memilih validasi berdasarkan tipe. */
export function documentSchemaForType(type: DocumentType) {
  return fileLikeSchema.superRefine((file, ctx) => {
    const error = validateByDocumentType(file, type);
    if (error) ctx.addIssue({ code: "custom", message: error });
  });
}

// ============================================================
// Upload
// ============================================================

export type UploadFolder =
  | "restu-bunda/workers/photo"
  | "restu-bunda/workers/documents"
  | "restu-bunda/spk"
  | "restu-bunda/testimonials"
  | (string & {});

export type UploadOptions = {
  folder?: UploadFolder;
  publicId?: string;
  /** Tag Cloudinary untuk memudahkan purge. */
  tags?: string[];
};

export type CloudinaryUploadResult = {
  publicId: string;
  secureUrl: string;
  bytes: number;
  format: string;
  resourceType: string;
};

/**
 * Mengunggah buffer ke Cloudinary. Buffer diperoleh dari File.arrayBuffer()
 * di Route Handler / Server Action. Mengembalikan publicId dan secureUrl.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  originalFile: FileLike,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  configureCloudinary();

  const mime = originalFile.type || "image/jpeg";
  const base64 = buffer.toString("base64");
  const dataUri = `data:${mime};base64,${base64}`;

  const result = (await cloudinary.uploader.upload(dataUri, {
    folder: options.folder ?? "restu-bunda/workers/documents",
    public_id: options.publicId,
    resource_type: "image",
    tags: options.tags,
    overwrite: false,
  })) as unknown as {
    public_id: string;
    secure_url: string;
    bytes: number;
    format: string;
    resource_type: string;
  };

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    bytes: result.bytes,
    format: result.format,
    resourceType: result.resource_type,
  };
}

/**
 * Helper untuk mengunggah File (Web API File) langsung — membaca arrayBuffer
 * secara internal. Cocok dipakai di Route Handler yang menerima FormData.
 */
export async function uploadFileToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return uploadBufferToCloudinary(
    buffer,
    { size: file.size, type: file.type, name: file.name },
    options
  );
}

// ============================================================
// Signed delivery URL + watermark dinamis
// AGENTS.md Aturan 1: data sensitif tidak pernah keluar lewat URL mentah.
// Proxy /api/documents/[workerId]/[type] memvalidasi sesi + kepemilikan,
// lalu meneruskan signed URL dengan text-overlay watermark.
// ============================================================

/** Format tanggal Indonesia (DD/MM/YYYY) pada zona Asia/Makassar. */
export function formatTanggalMakassar(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Makassar",
  }).format(date);
}

/** Alias kompatibilitas — delegasi ke zona Makassar. */
export const formatTanggalJakarta = formatTanggalMakassar;

/** Teks watermark dinamis sesuai PRD §5.4. */
export function buildWatermarkText(date: Date = new Date()): string {
  return `DOKUMEN RESMI - HANYA UNTUK PENEMPATAN ${formatTanggalMakassar(date)}`;
}

/**
 * Membangun signed delivery URL Cloudinary dengan overlay watermark teks.
 * PublicId adalah identifier Cloudinary tanpa ekstensi (mis. "restu-bunda/workers/documents/ktp_xxx").
 * Teks watermark di-overlay di sudut kanan bawah dengan opacity rendah.
 */
export function buildSignedWatermarkedUrl(
  publicId: string,
  opts: { watermarkText?: string; expiresAt?: number } = {}
): string {
  configureCloudinary();

  const watermarkText = opts.watermarkText ?? buildWatermarkText();

  // Transformasi: overlay teks + penyesuaian kualitas/format otomatis.
  // Cloudinary SDK menangani URL-encoding teks overlay.
  const url = cloudinary.url(publicId, {
    sign_url: true,
    secure: true,
    resource_type: "image",
    type: "upload",
    transformation: [
      {
        overlay: {
          font_family: "Arial",
          font_size: 22,
          font_weight: "bold",
          text: watermarkText,
        },
        color: "#ffffff",
        flags: "layer_apply",
        gravity: "south_east",
        x: 20,
        y: 20,
        opacity: 35,
      },
      {
        quality: "auto",
        fetch_format: "auto",
      },
    ],
    ...(opts.expiresAt ? { expires_at: opts.expiresAt } : {}),
  });

  return url;
}

/**
 * Membangun signed delivery URL generik (tanpa watermark) — untuk dokumen
 * non-sensitif seperti foto profil atau arsip SPK yang sudah bermaterai.
 */
export function buildSignedDeliveryUrl(
  publicId: string,
  transformation?: Record<string, unknown>[]
): string {
  configureCloudinary();

  return cloudinary.url(publicId, {
    sign_url: true,
    secure: true,
    resource_type: "image",
    type: "upload",
    ...(transformation ? { transformation } : {}),
  });
}

// ============================================================
// Penghapusan asset (purge retensi UU PDP)
// ============================================================

/** Menghapus satu asset Cloudinary berdasarkan publicId. */
export async function destroyAsset(publicId: string): Promise<void> {
  configureCloudinary();

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
}

/** Menghapus banyak asset sekaligus — dipakai Daily Automation Job (purge). */
export async function destroyAssets(publicIds: string[]): Promise<void> {
  if (publicIds.length === 0) return;
  configureCloudinary();

  // Hapus paralel dengan batas konkurensi sederhana.
  await Promise.all(publicIds.map((id) => destroyAsset(id)));
}

/**
 * Mengekstrak publicId dari secureUrl Cloudinary.
 * Contoh: https://res.cloudinary.com/demo/image/upload/v1234/restu-bunda/workers/photo/abc.jpg
 *      → restu-bunda/workers/photo/abc
 * Mengembalikan null bila URL tidak dikenali.
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Cari segmen setelah /upload/
    const marker = "/upload/";
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;

    let after = parsed.pathname.slice(idx + marker.length);
    // Hilangkan prefix versi (v123456) bila ada.
    after = after.replace(/^v\d+\//, "");
    // Hilangkan ekstensi file.
    after = after.replace(/\.[^/.]+$/, "");
    // Decode URI (Cloudinary meng-encode karakter khusus).
    return decodeURIComponent(after);
  } catch {
    return null;
  }
}

/** Mengekstrak semua publicId dari daftar URL (mengabaikan yang tidak valid). */
export function extractPublicIdsFromUrls(urls: (string | null | undefined)[]): string[] {
  const ids: string[] = [];
  for (const url of urls) {
    if (!url) continue;
    const id = extractPublicIdFromUrl(url);
    if (id) ids.push(id);
  }
  return ids;
}
