import { prisma } from "@/lib/prisma";

/**
 * Statistik real-time untuk landing page — PRD §5.1
 * - completedContracts: kontrak ACTIVE + COMPLETED
 * - standbyWorkers: pekerja STANDBY (kandidat katalog publik)
 * Nilai minimum fallback agar landing tidak tampak kosong saat awal launching.
 */
export const LANDING_FALLBACK = {
  completedContracts: 120,
  standbyWorkers: 24,
  yearsExperience: 12,
} as const;

export type LandingStats = {
  completedContracts: number;
  standbyWorkers: number;
  yearsExperience: number;
};

export async function getLandingStats(): Promise<LandingStats> {
  try {
    const [completedContracts, standbyWorkers] = await Promise.all([
      prisma.contract.count({
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
      }),
      prisma.worker.count({
        where: { status: "STANDBY", deletedAt: null },
      }),
    ]);

    return {
      completedContracts: Math.max(completedContracts, LANDING_FALLBACK.completedContracts),
      standbyWorkers: Math.max(standbyWorkers, LANDING_FALLBACK.standbyWorkers),
      yearsExperience: LANDING_FALLBACK.yearsExperience,
    };
  } catch {
    return { ...LANDING_FALLBACK };
  }
}

export type PublishedTestimonial = {
  id: string;
  clientName: string;
  clientOrigin: string;
  photoUrl: string | null;
  rating: number;
  content: string;
};

export async function getPublishedTestimonials(): Promise<PublishedTestimonial[]> {
  try {
    const rows = await prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clientName: true,
        clientOrigin: true,
        photoUrl: true,
        rating: true,
        content: true,
      },
    });
    return rows;
  } catch {
    return [];
  }
}
