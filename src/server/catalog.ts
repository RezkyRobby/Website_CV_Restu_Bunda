import { prisma } from "@/lib/prisma";
import type { WorkerCategory } from "@/generated/prisma/enums";

/**
 * Katalog publik tersanitasi — PRD §5.1 #2 + §5.1 #3
 * Hanya pekerja STANDBY, tanpa soft-deleted, tanpa data sensitif (NIK, alamat, dokumen mentah).
 */

export type CatalogFilters = {
  category?: WorkerCategory;
  petTolerance?: boolean;
  willingOutOfCity?: boolean;
};

export type SanitizedCandidate = {
  id: string;
  nickname: string;
  birthDate: Date;
  ethnicity: string;
  category: WorkerCategory;
  petTolerance: boolean;
  willingOutOfCity: boolean;
  photoProfileUrl: string;
  skckVerified: boolean;
  mcuReportUrl: string | null;
  skills: { id: string; name: string }[];
};

function buildWhere(filters: CatalogFilters) {
  return {
    status: "STANDBY" as const,
    deletedAt: null,
    ...(filters.category ? { category: filters.category } : {}),
    ...(typeof filters.petTolerance === "boolean" ? { petTolerance: filters.petTolerance } : {}),
    ...(typeof filters.willingOutOfCity === "boolean"
      ? { willingOutOfCity: filters.willingOutOfCity }
      : {}),
  };
}

export async function getSanitizedCandidates(
  filters: CatalogFilters,
): Promise<SanitizedCandidate[]> {
  try {
    const rows = await prisma.worker.findMany({
      where: buildWhere(filters),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nickname: true,
        birthDate: true,
        ethnicity: true,
        category: true,
        petTolerance: true,
        willingOutOfCity: true,
        photoProfileUrl: true,
        skckVerified: true,
        mcuReportUrl: true,
        skills: {
          select: { skill: { select: { id: true, name: true } } },
          take: 3,
        },
      },
    });

    return rows.map((w) => ({
      id: w.id,
      nickname: w.nickname,
      birthDate: w.birthDate,
      ethnicity: w.ethnicity,
      category: w.category,
      petTolerance: w.petTolerance,
      willingOutOfCity: w.willingOutOfCity,
      photoProfileUrl: w.photoProfileUrl,
      skckVerified: w.skckVerified,
      mcuReportUrl: w.mcuReportUrl,
      skills: w.skills.map((ws) => ws.skill),
    }));
  } catch {
    return [];
  }
}

export function calculateAge(birthDate: Date): number {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
  return Math.max(age, 0);
}

export function whatsappBookingHref(candidate: { nickname: string; id: string }): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6280000000000";
  const message = `Halo CV Restu Bunda Mariyati, saya tertarik memesan kandidat ${candidate.nickname} (ID: ${candidate.id}). Mohon info selengkapnya.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
