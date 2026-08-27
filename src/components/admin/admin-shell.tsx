"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { userRoleLabels } from "@/messages/labels";
import type { UserRoleKey } from "@/lib/roles";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  disabled?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/pekerja", label: "Pekerja", icon: "☺" },
  { href: "/admin/majikan", label: "Majikan", icon: "◐" },
  { href: "/admin/kontrak", label: "Kontrak", icon: "▤", disabled: true },
  { href: "/admin/klaim", label: "Klaim Garansi", icon: "◈", disabled: true },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: "⚙" },
];

type AdminShellProps = {
  user: { name: string; email: string; role: UserRoleKey };
  children: React.ReactNode;
};

/**
 * Shell dashboard admin — PRD §5.3 #1 & Task 12
 * Sidebar + topbar, guard sudah di layout (server). Mobile drawer ≥44px tap target.
 * Halaman internal boleh pakai komponen shadcn standar (AGENTS.md).
 */
export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const roleLabel =
    userRoleLabels[user.role as keyof typeof userRoleLabels] ?? user.role;

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#26221B]">
      {/* Topbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E3D5BC] bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={drawerOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
            className="inline-flex size-11 items-center justify-center rounded-[var(--radius-pill)] border border-[#E3D5BC] bg-white text-[#26221B] lg:hidden"
          >
            <span aria-hidden className="text-lg leading-none">
              {drawerOpen ? "✕" : "☰"}
            </span>
          </button>
          <Link href="/admin" className="flex items-center gap-2 no-underline">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#064E3B] text-sm font-semibold text-white">
              RB
            </span>
            <span className="text-sm font-semibold leading-none text-[#26221B]">
              Restu Bunda
              <span className="block text-[11px] font-normal tracking-wide text-[#6F675A]">
                Panel Operasional
              </span>
            </span>
          </Link>
          <span className="hidden items-center gap-2 rounded-full border border-[#E3D5BC] bg-[#F8E7C9] px-3 py-1 text-xs font-medium text-[#6F675A] sm:inline-flex">
            {roleLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-medium leading-none text-[#26221B]">
              {user.name}
            </span>
            <span className="text-xs leading-none text-[#6F675A]">
              {user.email}
            </span>
          </div>
          <div className="flex size-8 items-center justify-center rounded-full bg-[#064E3B] text-xs font-semibold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="ml-1 inline-flex min-h-[44px] items-center rounded-[var(--radius-pill)] border border-[#E3D5BC] bg-white px-4 text-sm font-medium text-[#26221B] transition-colors hover:bg-[#F3EAD8]"
          >
            Keluar
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px]">
        {/* Sidebar desktop */}
        <aside className="hidden w-[260px] shrink-0 border-r border-[#E3D5BC] bg-white lg:block">
          <nav
            aria-label="Navigasi admin"
            className="sticky top-14 flex flex-col gap-1 p-4"
          >
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.disabled ? "#" : item.href}
                  aria-disabled={item.disabled}
                  onClick={(e) => {
                    if (item.disabled) e.preventDefault();
                  }}
                  className={[
                    "flex min-h-[44px] items-center gap-3 rounded-[12px] px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#064E3B] text-white"
                      : "text-[#26221B] hover:bg-[#F8E7C9]",
                    item.disabled ? "cursor-not-allowed opacity-50" : "",
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className="flex size-7 items-center justify-center rounded-full bg-white/10 text-xs"
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.disabled && (
                    <span className="ml-auto text-[11px] font-normal text-[#6F675A]">
                      Segera
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="mt-4 rounded-[12px] border border-[#E3D5BC] bg-[#F8E7C9] p-4">
              <p className="text-xs font-semibold text-[#064E3B]">
                Bantuan Operasional
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#6F675A]">
                Shell Task 12 — metrik real-time pekerja standby & kontrak aktif. Modul lanjutan akan hadir bertahap.
              </p>
            </div>
          </nav>
        </aside>

        {/* Drawer mobile */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setDrawerOpen(false)}
              className="flex-1 bg-[#26221B]/40 backdrop-blur-sm"
            />
            <div className="flex w-[300px] flex-col bg-white shadow-xl">
              <div className="flex h-14 items-center justify-between border-b border-[#E3D5BC] px-4">
                <span className="text-sm font-semibold text-[#26221B]">
                  Menu
                </span>
                <button
                  type="button"
                  aria-label="Tutup menu"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-[#E3D5BC] bg-white"
                >
                  ✕
                </button>
              </div>
              <nav
                aria-label="Navigasi admin seluler"
                className="flex flex-col gap-1 p-4"
              >
                {NAV_ITEMS.map((item) => {
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.disabled ? "#" : item.href}
                      aria-disabled={item.disabled}
                      onClick={(e) => {
                        if (item.disabled) {
                          e.preventDefault();
                          return;
                        }
                        setDrawerOpen(false);
                      }}
                      className={[
                        "flex min-h-[44px] items-center gap-3 rounded-[12px] px-3 text-sm font-medium",
                        active
                          ? "bg-[#064E3B] text-white"
                          : "text-[#26221B] hover:bg-[#F8E7C9]",
                        item.disabled ? "cursor-not-allowed opacity-50" : "",
                      ].join(" ")}
                    >
                      <span aria-hidden>{item.icon}</span>
                      {item.label}
                      {item.disabled && (
                        <span className="ml-auto text-[11px]">Segera</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Konten utama */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
