// Server Actions CRUD Skill — Task 15
// RBAC: hanya SUPER_ADMIN (AGENTS.md aturan 2). Validasi Zod dua lapis + ActivityLog.

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createSkillSchema,
  updateSkillSchema,
  toggleSkillSchema,
} from "@/lib/validators/skill";

async function requireSuperAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Sesi tidak valid. Silakan login kembali.");
  const role = (session.user as { role?: string }).role;
  if (role !== "SUPER_ADMIN") throw new Error("Akses ditolak. Hanya Super Admin yang dapat mengelola master keahlian.");
  return session.user as { id: string; email: string; name: string; role: string };
}

export type SkillActionResult = { ok: true } | { ok: false; error: string };

export async function createSkillAction(formData: FormData): Promise<SkillActionResult> {
  try {
    const admin = await requireSuperAdmin();
    const parsed = createSkillSchema.safeParse({ name: String(formData.get("name") ?? "") });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    const name = parsed.data.name;
    const existing = await prisma.skill.findUnique({ where: { name } });
    if (existing) return { ok: false, error: "Nama keahlian sudah terdaftar." };

    const skill = await prisma.skill.create({ data: { name } });
    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        userRole: admin.role as never,
        action: "CREATE_SKILL",
        entityType: "Skill",
        entityId: skill.id,
        details: { name: skill.name },
      },
    });
    revalidatePath("/admin/pengaturan/keahlian");
    revalidatePath("/admin/pekerja/baru");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal membuat keahlian.";
    if (msg.includes("Unique constraint")) return { ok: false, error: "Nama keahlian sudah terdaftar." };
    return { ok: false, error: msg };
  }
}

export async function updateSkillAction(formData: FormData): Promise<SkillActionResult> {
  try {
    const admin = await requireSuperAdmin();
    const parsed = updateSkillSchema.safeParse({
      id: String(formData.get("id") ?? ""),
      name: String(formData.get("name") ?? ""),
      isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on",
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    const skill = await prisma.skill.findUnique({ where: { id: parsed.data.id } });
    if (!skill) return { ok: false, error: "Keahlian tidak ditemukan." };

    const duplicate = await prisma.skill.findFirst({
      where: { name: parsed.data.name, NOT: { id: parsed.data.id } },
    });
    if (duplicate) return { ok: false, error: "Nama keahlian sudah dipakai keahlian lain." };

    await prisma.skill.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name, isActive: parsed.data.isActive },
    });
    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        userRole: admin.role as never,
        action: "UPDATE_SKILL",
        entityType: "Skill",
        entityId: parsed.data.id,
        details: { name: parsed.data.name, isActive: parsed.data.isActive },
      },
    });
    revalidatePath("/admin/pengaturan/keahlian");
    revalidatePath("/admin/pekerja/baru");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal memperbarui keahlian." };
  }
}

export async function toggleSkillAction(formData: FormData): Promise<SkillActionResult> {
  try {
    const admin = await requireSuperAdmin();
    const parsed = toggleSkillSchema.safeParse({
      id: String(formData.get("id") ?? ""),
      isActive: formData.get("isActive") === "true",
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

    const skill = await prisma.skill.findUnique({ where: { id: parsed.data.id } });
    if (!skill) return { ok: false, error: "Keahlian tidak ditemukan." };

    await prisma.skill.update({ where: { id: parsed.data.id }, data: { isActive: parsed.data.isActive } });
    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        userRole: admin.role as never,
        action: "TOGGLE_SKILL",
        entityType: "Skill",
        entityId: skill.id,
        details: { name: skill.name, isActive: parsed.data.isActive },
      },
    });
    revalidatePath("/admin/pengaturan/keahlian");
    revalidatePath("/admin/pekerja/baru");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal mengubah status keahlian." };
  }
}
