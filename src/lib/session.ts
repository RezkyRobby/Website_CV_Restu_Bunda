// Helper RBAC untuk Server Components / Server Actions / Route Handlers.
// Melengkapi proxy.ts: validasi sesi + role diulang di setiap lapisan
// (AGENTS.md aturan 2 — RBAC ditegakkan di middleware DAN di tiap handler).

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ADMIN_ROLES, isAdminRole, type UserRoleKey } from "@/lib/roles";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRoleKey;
};

/** Mengambil sesi aktif (validasi database) atau null. */
export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
}

/**
 * Memastikan pengguna login. Jika tidak, redirect ke beranda.
 * Mengembalikan data pengguna (termasuk role) untuk dipakai halaman.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as UserRoleKey,
  };
}

/**
 * Memastikan pengguna login DAN memiliki salah satu role yang diizinkan.
 * Jika role tidak cocok, redirect ke beranda (403 di-handle sebagai redirect).
 */
export async function requireRole(allowed: readonly UserRoleKey[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!allowed.includes(user.role)) {
    redirect("/");
  }
  return user;
}

/** Khusus akses admin (CS & SUPER_ADMIN). */
export function requireAdmin() {
  return requireRole(ADMIN_ROLES);
}

export { isAdminRole };
