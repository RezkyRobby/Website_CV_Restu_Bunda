// Server logic Kontrak — PRD §5.3 #4 & Task 18
// Form kontrak: tanggal mulai, durasi bulan (min. 3 + pratinjau endDate),
// agreedSalary, placementFee, warrantyDays (default 90), maxReplacements (default 2),
// additionalClauses. Perhitungan endDate memakai logika zona netral (tanggal murni).

import { prisma } from "@/lib/prisma";
import { calcEndDate } from "@/lib/validators/kontrak";

// ============================================================
// Tipe ringkas
// ============================================================

export type KontrakSummary = {
  id: string;
  contractNumber: string;
  clientId: string;
  workerId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  agreedSalary: unknown;
  placementFee: unknown;
  warrantyDays: number;
  maxReplacements: number;
  additionalClauses: string | null;
  createdAt: Date;
  client: { id: string; name: string; email: string };
  worker: { id: string; fullName: string; nickname: string; category: string; status: string };
};

// ============================================================
// List kontrak — dipakai halaman admin/kontrak
// ============================================================

export async function listKontrak(): Promise<KontrakSummary[]> {
  return prisma.contract.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, name: true, email: true } },
      worker: { select: { id: true, fullName: true, nickname: true, category: true, status: true } },
    },
  }) as Promise<KontrakSummary[]>;
}

/** Opsi Majikan (CLIENT) untuk select — id, nama, email */
export async function listMajikanOptions() {
  return prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, phone: true },
  });
}

/** Opsi Pekerja STANDBY untuk select — hanya yang siap ditempatkan */
export async function listStandbyWorkersOptions() {
  return prisma.worker.findMany({
    where: { status: "STANDBY", deletedAt: null },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, nickname: true, category: true, expectedSalary: true },
  });
}

/** Detail satu kontrak */
export async function getKontrakDetail(contractId: string) {
  return prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true, address: true } },
      worker: { select: { id: true, fullName: true, nickname: true, category: true, status: true } },
    },
  });
}

// ============================================================
// Helper endDate — dipakai server & diekspor untuk test
// ============================================================

export { calcEndDate };

/**
 * Validasi bisnis sebelum persist:
 * - Majikan exists + role CLIENT
 * - Pekerja exists + status STANDBY
 * - Durasi min 3
 */
export async function validateKontrakRef(
  clientId: string,
  workerId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const [client, worker] = await Promise.all([
    prisma.user.findFirst({ where: { id: clientId, role: "CLIENT" }, select: { id: true } }),
    prisma.worker.findFirst({ where: { id: workerId, deletedAt: null }, select: { id: true, status: true } }),
  ]);

  if (!client) return { ok: false, error: "Majikan tidak ditemukan atau bukan role CLIENT." };
  if (!worker) return { ok: false, error: "Pekerja tidak ditemukan." };
  if (worker.status !== "STANDBY") return { ok: false, error: `Pekerja tidak siap ditempatkan (status: ${worker.status}). Hanya STANDBY yang dapat dikontrak.` };
  return { ok: true };
}
