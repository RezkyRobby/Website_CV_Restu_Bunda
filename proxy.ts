// Proxy (Next.js 16, pengganti middleware) — proteksi rute per role (Task 5).
// RBAC juga ditegakkan di tiap Route Handler / Server Action (AGENTS.md aturan 2).
//
// Catatan: route group (client)/(admin) tidak tampil di URL, jadi matcher
// dipatok pada prefix jalur yang dipakai halaman-halaman terproteksi:
//   /portal/**  → portal majikan (CLIENT)
//   /admin/**   → dashboard operasional (CS & SUPER_ADMIN)
// Validasi penuh sesi + role dilakukan di sini (database-backed) dan diulang
// pada layout/server component via helper `requireRole`.

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UserRole, isAdminRole, type UserRoleKey } from "@/lib/roles";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Tanpa cookie sesi → belum login → arahkan ke beranda.
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Validasi sesi penuh + role (database-backed).
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const role = session.user.role as UserRoleKey | undefined;

  // Kawasan admin: hanya CS & SUPER_ADMIN.
  if (pathname.startsWith("/admin") && !isAdminRole(role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Kawasan portal majikan: hanya CLIENT.
  if (pathname.startsWith("/portal") && role !== UserRole.CLIENT) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Hanya kawasan terproteksi; "/" dan "/api" dibiarkan tanpa proxy.
  matcher: ["/portal/:path*", "/admin/:path*"],
};