// Server Actions Kontrak — PRD §5.3 #4 & AGENTS.md Task 18
// Form kontrak: tanggal mulai, durasi (min. 3 + pratinjau endDate), agreedSalary,
// placementFee, warrantyDays (default 90), maxReplacements (default 2), additionalClauses.
// Task 18: SIMPAN DRAFT KONTRAK (belum rilis SPK). Rilis SPK ditangani Task 19 (transaksi + invoice).
// RBAC: CS & SUPER_ADMIN. Validasi dua lapis (Zod sejajar dengan lib/validators/kontrak.ts).

"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kontrakSchema, calcEndDate, parseRupiah } from "@/lib/validators/kontrak";
import { generateDocumentNumber } from "@/server/doc-numbering";
import { validateKontrakRef } from "@/server/kontrak";

async function requireAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Sesi tidak valid. Silakan login kembali.");
  const role = (session.user as { role?: string }).role;
  if (role !== "CS" && role !== "SUPER_ADMIN") {
    throw new Error("Akses ditolak. Hanya CS dan Super Admin yang dapat membuat kontrak.");
  }
  return session.user as { id: string; email: string; name: string; role: string };
}

export type CreateKontrakResult =
  | { ok: true; contractId: string; contractNumber: string; endDate: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function toNumberOrDefault(v: FormDataEntryValue | null, fallback: number): number {
  if (v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function createKontrakAction(formData: FormData): Promise<CreateKontrakResult> {
  try {
    const admin = await requireAdminSession();

    const raw = {
      clientId: String(formData.get("clientId") ?? "").trim(),
      workerId: String(formData.get("workerId") ?? "").trim(),
      startDate: String(formData.get("startDate") ?? "").trim(),
      durationMonths: formData.get("durationMonths"),
      agreedSalary: String(formData.get("agreedSalary") ?? "").trim(),
      placementFee: String(formData.get("placementFee") ?? "").trim(),
      warrantyDays: formData.get("warrantyDays"),
      maxReplacements: formData.get("maxReplacements"),
      additionalClauses: String(formData.get("additionalClauses") ?? ""),
    };

    // Normalisasi numerik: FormData mengirim string; coerce di Zod butuh value proper.
    const normalized = {
      ...raw,
      durationMonths: toNumberOrDefault(raw.durationMonths as FormDataEntryValue | null, Number.NaN),
      warrantyDays: toNumberOrDefault(raw.warrantyDays as FormDataEntryValue | null, 90),
      maxReplacements: toNumberOrDefault(raw.maxReplacements as FormDataEntryValue | null, 2),
    };

    const parsed = kontrakSchema.safeParse(normalized);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "_");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Data kontrak tidak valid.", fieldErrors };
    }

    const data = parsed.data;

    // Validasi referensi: client & worker
    const refCheck = await validateKontrakRef(data.clientId, data.workerId);
    if (!refCheck.ok) {
      return { ok: false, error: refCheck.error };
    }

    const agreedSalaryNum = parseRupiah(data.agreedSalary);
    const placementFeeNum = parseRupiah(data.placementFee);
    if (agreedSalaryNum === null || placementFeeNum === null) {
      return { ok: false, error: "Nominal gaji atau biaya penempatan tidak valid." };
    }

    const endDateStr = calcEndDate(data.startDate, data.durationMonths);
    if (!endDateStr) return { ok: false, error: "Gagal menghitung tanggal selesai." };
    const startDate = new Date(data.startDate + "T00:00:00");
    const endDate = new Date(endDateStr + "T00:00:00");

    // Simpan draft kontrak. Nomor SPK dibuat sekarang (agar tetap unik + draft terlihat di daftar).
    // Rilis SPK sebenarnya (worker PLACED + invoice DRAFT) ditangani Task 19 secara transaksional.
    // Di Task 18, kontrak dibuat berstatus ACTIVE; transisi worker/invoice menyusul Task 19.
    const result = await prisma.$transaction(async (tx) => {
      const contractNumber = await generateDocumentNumber(tx as never, "SPK");

      const created = await tx.contract.create({
        data: {
          contractNumber,
          clientId: data.clientId,
          workerId: data.workerId,
          startDate,
          endDate,
          agreedSalary: agreedSalaryNum,
          placementFee: placementFeeNum,
          warrantyDays: data.warrantyDays ?? 90,
          maxReplacements: data.maxReplacements ?? 2,
          additionalClauses: data.additionalClauses ?? null,
          // status default ACTIVE; SPK URL diisi Task 19 saat PDF digenerate
        },
        select: { id: true, contractNumber: true },
      });

      // Audit trail
      await tx.activityLog.create({
        data: {
          userId: admin.id,
          userRole: admin.role as never,
          action: "CREATE_CONTRACT_DRAFT",
          entityType: "Contract",
          entityId: created.id,
          details: {
            contractNumber: created.contractNumber,
            clientId: data.clientId,
            workerId: data.workerId,
            startDate: data.startDate,
            endDate: endDateStr,
            agreedSalary: agreedSalaryNum,
            placementFee: placementFeeNum,
            warrantyDays: data.warrantyDays,
            maxReplacements: data.maxReplacements,
            hasAdditionalClauses: Boolean(data.additionalClauses),
          },
        },
      });

      return { id: created.id, contractNumber: created.contractNumber, endDate: endDateStr };
    });

    revalidatePath("/admin/kontrak");

    return { ok: true, contractId: result.id, contractNumber: result.contractNumber, endDate: result.endDate };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal membuat kontrak.";
    // Prisma unique / FK error → pesan ramah
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return { ok: false, error: "Nomor kontrak bentrok. Silakan coba lagi." };
    }
    return { ok: false, error: msg };
  }
}
