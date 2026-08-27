import { prisma } from "@/lib/prisma";

/**
 * Ringkasan metrik Dashboard Operasional — PRD §5.3 #1 & Task 12
 * - pekerja standby (kandidat STANDBY)
 * - kontrak aktif
 * - kontrak segera berakhir (EXPIRING_SOON)
 * - tiket klaim mendesak (PENDING / IN_REVIEW)
 * - status eksekusi Daily Automation Job terakhir
 *
 * Semua query aman terhadap DB kosong — fallback 0 / null.
 */
export type AdminMetrics = {
  workersStandby: number;
  workersTotal: number;
  contractsActive: number;
  contractsExpiringSoon: number;
  pendingClaims: number;
  lastJobRun: {
    id: string;
    jobKey: string;
    status: string;
    startedAt: Date;
    finishedAt: Date | null;
    durationMs: number | null;
    errorMessage: string | null;
  } | null;
  recentFailures: number;
  expiringContractsPreview: Array<{
    id: string;
    contractNumber: string;
    endDate: Date;
    clientName: string;
    workerName: string;
  }>;
  pendingClaimsPreview: Array<{
    id: string;
    claimNumber: string;
    status: string;
    contractNumber: string;
    clientName: string;
    createdAt: Date;
  }>;
};

export async function getAdminMetrics(): Promise<AdminMetrics> {
  try {
    const [
      workersStandby,
      workersTotal,
      contractsActive,
      contractsExpiringSoon,
      pendingClaims,
      lastJobRun,
      lastThreeRuns,
      expiringContractsPreview,
      pendingClaimsPreview,
    ] = await Promise.all([
      prisma.worker.count({
        where: { status: "STANDBY", deletedAt: null },
      }),
      prisma.worker.count({ where: { deletedAt: null } }),
      prisma.contract.count({ where: { status: "ACTIVE" } }),
      prisma.contract.count({ where: { status: "EXPIRING_SOON" } }),
      prisma.warrantyClaim.count({
        where: { status: { in: ["PENDING", "IN_REVIEW"] } },
      }),
      prisma.jobRun.findFirst({
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          jobKey: true,
          status: true,
          startedAt: true,
          finishedAt: true,
          durationMs: true,
          errorMessage: true,
        },
      }),
      prisma.jobRun.findMany({
        orderBy: { startedAt: "desc" },
        take: 3,
        select: { status: true },
      }),
      prisma.contract.findMany({
        where: { status: "EXPIRING_SOON" },
        orderBy: { endDate: "asc" },
        take: 5,
        select: {
          id: true,
          contractNumber: true,
          endDate: true,
          client: { select: { name: true } },
          worker: { select: { nickname: true, fullName: true } },
        },
      }),
      prisma.warrantyClaim.findMany({
        where: { status: { in: ["PENDING", "IN_REVIEW"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          claimNumber: true,
          status: true,
          createdAt: true,
          contract: { select: { contractNumber: true } },
          client: { select: { name: true } },
        },
      }),
    ]);

    // Hitung berapa run terakhir yang FAILED berturut-turut dari yang terbaru
    let recentFailures = 0;
    for (const run of lastThreeRuns) {
      if (run.status === "FAILED") recentFailures += 1;
      else break;
    }

    return {
      workersStandby,
      workersTotal,
      contractsActive,
      contractsExpiringSoon,
      pendingClaims,
      lastJobRun,
      recentFailures,
      expiringContractsPreview: expiringContractsPreview.map((c) => ({
        id: c.id,
        contractNumber: c.contractNumber,
        endDate: c.endDate,
        clientName: c.client.name,
        workerName: c.worker.nickname || c.worker.fullName,
      })),
      pendingClaimsPreview: pendingClaimsPreview.map((cl) => ({
        id: cl.id,
        claimNumber: cl.claimNumber,
        status: cl.status,
        contractNumber: cl.contract.contractNumber,
        clientName: cl.client.name,
        createdAt: cl.createdAt,
      })),
    };
  } catch {
    return {
      workersStandby: 0,
      workersTotal: 0,
      contractsActive: 0,
      contractsExpiringSoon: 0,
      pendingClaims: 0,
      lastJobRun: null,
      recentFailures: 0,
      expiringContractsPreview: [],
      pendingClaimsPreview: [],
    };
  }
}
