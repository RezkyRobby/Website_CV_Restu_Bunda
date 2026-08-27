// Server logic pekerja — PRD §5.3 #2 & Task 13/14
// Query katalog internal, upload Cloudinary tervalidasi, dan relasi skills + riwayat majikan.

import { prisma } from "@/lib/prisma";
import {
  getCloudinaryConfig,
  uploadFileToCloudinary,
  extractPublicIdsFromUrls,
  destroyAssets,
} from "@/lib/cloudinary";

/** Daftar keahlian aktif untuk dipilih di form (vocabulary terkontrol, PRD §7.2). */
export async function getActiveSkills() {
  return prisma.skill.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

/** Ringkasan pekerja untuk listing admin. */
export async function listWorkersAdmin() {
  return prisma.worker.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nik: true,
      fullName: true,
      nickname: true,
      category: true,
      status: true,
      expectedSalary: true,
      photoProfileUrl: true,
      createdAt: true,
      skills: { select: { skill: { select: { name: true } } } },
    },
  });
}

/** Detail dossier pekerja — dipakai halaman detail admin untuk verifikasi relasi. */
export async function getWorkerDetail(workerId: string) {
  return prisma.worker.findFirst({
    where: { id: workerId, deletedAt: null },
    include: {
      skills: { include: { skill: true } },
      experiences: { orderBy: { startDate: "asc" } },
    },
  });
}

/** Helper: cek Cloudinary siap; jika belum, kembalikan null agar pemanggil fallback. */
export function cloudinaryReady(): boolean {
  return getCloudinaryConfig().isConfigured;
}

/** Upload file pekerja ke Cloudinary dengan folder per tipe. */
export async function uploadWorkerFile(
  file: File,
  type: "photo" | "ktp" | "mcu" | "skck",
): Promise<string> {
  // Fallback bila kredensial belum diisi — simpan placeholder agar alur tetap jalan di dev.
  if (!cloudinaryReady()) {
    return `pending:${type}/${file.name}`;
  }
  const folder =
    type === "photo" ? "restu-bunda/workers/photo" : "restu-bunda/workers/documents";
  const result = await uploadFileToCloudinary(file, {
    folder: folder as "restu-bunda/workers/photo" | "restu-bunda/workers/documents",
    tags: ["worker", type],
  });
  return result.secureUrl;
}

/**
 * Membersihkan arsip yatim di Cloudinary bila transaksi DB gagal.
 * Mengabaikan error agar tidak menutupi error asal.
 */
export async function cleanupUploadedUrls(urls: (string | null)[]): Promise<void> {
  const ids = extractPublicIdsFromUrls(urls);
  // Abaikan placeholder pending:*
  const real = ids.filter((id) => !id.startsWith("pending:"));
  if (real.length === 0) return;
  try {
    await destroyAssets(real);
  } catch {
    // Diam — log bisa ditambah bila diperlukan
  }
}
