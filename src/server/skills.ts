// Server logic Skill — PRD §7.2 & Task 15
// Master data vocabulary terkontrol; CRUD hanya Super Admin.

import { prisma } from "@/lib/prisma";

/** Semua skill terurut nama — dipakai halaman pengaturan (admin melihat semua, termasuk nonaktif). */
export async function listSkillsAdmin() {
  return prisma.skill.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: { id: true, name: true, isActive: true },
  });
}

/** Hitung pemakaian skill (jumlah pekerja tertaut) — untuk konfirmasi nonaktifkan. */
export async function skillUsageCount(skillId: string): Promise<number> {
  return prisma.workerSkill.count({ where: { skillId } });
}
