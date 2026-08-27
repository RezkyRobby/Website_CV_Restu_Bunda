import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Dashboard Operasional — Restu Bunda",
  description: "Panel operasional untuk CS dan Super Admin.",
};

export const dynamic = "force-dynamic";

/**
 * Layout kawasan admin — guard RBAC server-side (AGENTS.md aturan 2).
 * Melengkapi proxy.ts: validasi sesi + role diulang di Server Component.
 * Hanya CS & SUPER_ADMIN yang lolos; selain itu redirect ke beranda.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return <AdminShell user={user}>{children}</AdminShell>;
}
