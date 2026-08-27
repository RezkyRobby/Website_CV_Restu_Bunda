// Server Actions registrasi pekerja — Task 13
// RBAC ditegakkan di tiap handler (AGENTS.md aturan 2) + validasi dua lapis Zod.
// Semua penulisan multi-tabel berjalan dalam satu transaksi Prisma.

"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  parseSalaryRupiah,
} from "@/lib/validators/worker";
import { uploadWorkerFile } from "@/server/workers";
import { validateSensitiveDocument, validatePhotoProfile } from "@/lib/cloudinary";

// helper sesi admin
async function requireAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Sesi tidak valid. Silakan login kembali.");
  const role = (session.user as { role?: string }).role;
  if (role !== "CS" && role !== "SUPER_ADMIN") throw new Error("Akses ditolak. Hanya CS dan Super Admin.");
  return session.user as { id: string; email: string; name: string; role: string };
}

function toFileOrNull(v: FormDataEntryValue | null): File | null {
  if (!v || typeof v === "string") return null;
  // File dengan size 0 dianggap tidak ada (input kosong)
  if ((v as File).size === 0) return null;
  return v as File;
}

export type CreateWorkerResult =
  | { ok: true; workerId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function createWorkerAction(formData: FormData): Promise<CreateWorkerResult> {
  try {
    const admin = await requireAdminSession();

    // Payload JSON berisi field non-file (dikirim klien sebagai string JSON)
    const payloadRaw = formData.get("payload");
    if (!payloadRaw || typeof payloadRaw !== "string") {
      return { ok: false, error: "Data formulir tidak lengkap." };
    }

    let payload: unknown;
    try {
      payload = JSON.parse(payloadRaw);
    } catch {
      return { ok: false, error: "Format data tidak valid." };
    }

    const data = payload as Record<string, unknown>;

    // Ambil file dari FormData
    const photoProfile = toFileOrNull(formData.get("photoProfile"));
    const ktpDocument = toFileOrNull(formData.get("ktpDocument"));
    const mcuReport = toFileOrNull(formData.get("mcuReport"));
    const skckDocument = toFileOrNull(formData.get("skckDocument"));

    // Validasi per langkah (dua lapis — server side)
    const s1 = step1Schema.safeParse(data);
    if (!s1.success) return { ok: false, error: s1.error.issues[0]?.message ?? "Data identitas tidak valid." };

    const s2 = step2Schema.safeParse(data);
    if (!s2.success) return { ok: false, error: s2.error.issues[0]?.message ?? "Data keahlian tidak valid." };

    const s3Payload = {
      photoProfile,
      ktpDocument,
      mcuReport,
      skckDocument,
      skckVerified: Boolean(data.skckVerified),
    };
    const s3 = step3Schema.safeParse(s3Payload);
    if (!s3.success) return { ok: false, error: s3.error.issues[0]?.message ?? "Dokumen tidak valid." };

    // Validasi file manual tambahan (pesan Bahasa Indonesia formal)
    if (photoProfile) {
      const err = validatePhotoProfile({ size: photoProfile.size, type: photoProfile.type, name: photoProfile.name });
      if (err) return { ok: false, error: err };
    }
    if (ktpDocument) {
      const err = validateSensitiveDocument({ size: ktpDocument.size, type: ktpDocument.type, name: ktpDocument.name });
      if (err) return { ok: false, error: `KTP: ${err}` };
    }
    if (mcuReport) {
      const err = validateSensitiveDocument({ size: mcuReport.size, type: mcuReport.type, name: mcuReport.name });
      if (err) return { ok: false, error: `MCU: ${err}` };
    }
    if (skckDocument) {
      const err = validateSensitiveDocument({ size: skckDocument.size, type: skckDocument.type, name: skckDocument.name });
      if (err) return { ok: false, error: `SKCK: ${err}` };
    }

    const s4 = step4Schema.safeParse({ experiences: data.experiences ?? [] });
    if (!s4.success) return { ok: false, error: s4.error.issues[0]?.message ?? "Riwayat majikan tidak valid." };

    const s5 = step5Schema.safeParse({ expectedSalary: String(data.expectedSalary ?? "") });
    if (!s5.success) return { ok: false, error: s5.error.issues[0]?.message ?? "Standar gaji tidak valid." };

    const s6 = step6Schema.safeParse({ dataConsent: data.dataConsent });
    if (!s6.success) return { ok: false, error: s6.error.issues[0]?.message ?? "Persetujuan wajib dicentang." };

    // Guard dataConsentAt wajib
    if (data.dataConsent !== true) {
      return { ok: false, error: "Persetujuan pemrosesan data wajib dicentang (UU PDP)." };
    }

    // Upload ke Cloudinary — sebelum transaksi DB
    const photoUrl = photoProfile ? await uploadWorkerFile(photoProfile, "photo") : "";
    const ktpUrl = ktpDocument ? await uploadWorkerFile(ktpDocument, "ktp") : "";
    const mcuUrl = mcuReport ? await uploadWorkerFile(mcuReport, "mcu") : null;
    const skckUrl = skckDocument ? await uploadWorkerFile(skckDocument, "skck") : null;

    const expectedSalaryNum = parseSalaryRupiah(String(data.expectedSalary));
    const trainingCerts = Array.isArray(data.trainingCertificates) ? data.trainingCertificates : [];
    const experiences = Array.isArray(data.experiences) ? (data.experiences as Array<Record<string, string>>) : [];
    const skillIds = Array.isArray(data.skillIds) ? (data.skillIds as string[]) : [];

    // Pastikan skillIds valid & aktif
    if (skillIds.length > 0) {
      const found = await prisma.skill.findMany({ where: { id: { in: skillIds }, isActive: true }, select: { id: true } });
      if (found.length !== skillIds.length) {
        return { ok: false, error: "Terdapat keahlian yang tidak valid atau tidak aktif." };
      }
    }

    // Cek NIK duplikat lebih awal (pesan ramah)
    const existingNik = await prisma.worker.findUnique({ where: { nik: s1.data.nik } });
    if (existingNik) {
      return { ok: false, error: "NIK sudah terdaftar. Periksa kembali data pekerja." };
    }

    const birthDate = new Date(s1.data.birthDate);

    // Transaksi multi-tabel: worker + skills + experiences + ActivityLog
    const worker = await prisma.$transaction(async (tx) => {
      const w = await tx.worker.create({
        data: {
          nik: s1.data.nik,
          noKk: s1.data.noKk || null,
          fullName: s1.data.fullName,
          nickname: s1.data.nickname,
          birthDate,
          religion: s1.data.religion as never,
          maritalStatus: s1.data.maritalStatus as never,
          ethnicity: s1.data.ethnicity,
          domicileAddress: s1.data.domicileAddress,
          category: s2.data.category as never,
          status: "STANDBY",
          stayIn: s2.data.stayIn,
          expectedSalary: expectedSalaryNum,
          petTolerance: s2.data.petTolerance,
          willingOutOfCity: s2.data.willingOutOfCity,
          photoProfileUrl: photoUrl,
          ktpDocumentUrl: ktpUrl,
          mcuReportUrl: mcuUrl,
          skckVerified: Boolean(data.skckVerified),
          skckDocumentUrl: skckUrl,
          trainingCertificates: trainingCerts.length > 0 ? trainingCerts : undefined,
          guarantorName: s1.data.guarantorName,
          guarantorPhone: s1.data.guarantorPhone,
          guarantorRelation: s1.data.guarantorRelation || null,
          dataConsentAt: new Date(),
        },
      });

      if (skillIds.length > 0) {
        await tx.workerSkill.createMany({
          data: skillIds.map((skillId) => ({ workerId: w.id, skillId })),
        });
      }

      for (const exp of experiences) {
        await tx.workerExperience.create({
          data: {
            workerId: w.id,
            employerLocation: exp.employerLocation,
            position: exp.position,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            reasonForLeaving: exp.reasonForLeaving,
          },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: admin.id,
          userRole: admin.role as never,
          action: "CREATE_WORKER",
          entityType: "Worker",
          entityId: w.id,
          details: { nik: w.nik, fullName: w.fullName },
        },
      });

      return w;
    });

    return { ok: true, workerId: worker.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan sistem.";
    // Tangani unique constraint NIK
    if (msg.includes("Unique constraint") || msg.includes("nik")) {
      return { ok: false, error: "NIK sudah terdaftar." };
    }
    return { ok: false, error: msg };
  }
}
