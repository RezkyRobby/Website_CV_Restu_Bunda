// Kamus role pengguna (PRD §7.1) — dipakai proxy, guard halaman, dan Server Actions.
// Nilai harus sinkron dengan enum UserRole di prisma/schema.prisma.

import type { UserRole as PrismaUserRole } from "@/generated/prisma/enums";

export const UserRole = {
  CLIENT: "CLIENT",
  CS: "CS",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const satisfies Record<string, PrismaUserRole>;

export type UserRoleKey = (typeof UserRole)[keyof typeof UserRole];

/** Role yang diizinkan mengakses kawasan admin (CS & SUPER_ADMIN). */
export const ADMIN_ROLES: readonly UserRoleKey[] = [UserRole.CS, UserRole.SUPER_ADMIN];

export function isAdminRole(role: string | undefined | null): boolean {
  return role === UserRole.CS || role === UserRole.SUPER_ADMIN;
}
