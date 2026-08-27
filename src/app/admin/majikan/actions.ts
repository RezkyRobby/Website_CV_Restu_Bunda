// Server Actions Majikan — Task 17
// Alur deal CS: cek/buat akun Majikan by email/telepon + email invite set-password
// untuk akun baru (PRD §5.4 #1, §8.3 #3; AGENTS.md § Keputusan Bisnis).
// RBAC ditegakkan di tiap handler; validasi dua lapis (Zod); ActivityLog dicatat.

"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  majikanCreateSchema,
  majikanLookupSchema,
  normalizeEmail,
  normalizePhone,
} from "@/lib/validators/majikan";
import { findMajikanByEmailOrPhone } from "@/server/majikan";

// ============================================================
// Guard
// ============================================================

async function requireAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Sesi tidak valid. Silakan login kembali.");
  const role = (session.user as { role?: string }).role;
  if (role !== "CS" && role !== "SUPER_ADMIN") {
    throw new Error("Akses ditolak. Hanya CS dan Super Admin yang dapat mengelola akun Majikan.");
  }
  return session.user as { id: string; email: string; name: string; role: string };
}

// ============================================================
// Hasil
// ============================================================

export type MajikanLookupResult =
  | { ok: true; found: true; majikan: { id: string; name: string; email: string; phone: string | null; address: string | null } }
  | { ok: true; found: false }
  | { ok: false; error: string };

export type MajikanCreateResult =
  | { ok: true; majikanId: string; inviteSent: boolean; reused: false }
  | { ok: true; majikanId: string; reused: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

// ============================================================
// Lookup — dipakai CS sebelum membuat akun baru
// ============================================================

export async function lookupMajikanAction(formData: FormData): Promise<MajikanLookupResult> {
  try {
    await requireAdminSession();

    const raw = {
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    };

    const parsed = majikanLookupSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Data pencarian tidak valid." };
    }

    const email = parsed.data.email?.trim() ? normalizeEmail(parsed.data.email) : undefined;
    const phone = parsed.data.phone?.trim() ? normalizePhone(parsed.data.phone) : undefined;

    const found = await findMajikanByEmailOrPhone({ email, phone });
    if (!found) return { ok: true, found: false };

    return {
      ok: true,
      found: true,
      majikan: { id: found.id, name: found.name, email: found.email, phone: found.phone, address: found.address },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal mencari akun Majikan.";
    return { ok: false, error: msg };
  }
}

// ============================================================
// Create — cek reuse dulu, bila baru buat + kirim invite
// ============================================================

export async function createMajikanAction(formData: FormData): Promise<MajikanCreateResult> {
  try {
    const admin = await requireAdminSession();

    const raw = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
    };

    const parsed = majikanCreateSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "_");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { ok: false, error: parsed.error.issues[0].message, fieldErrors };
    }

    const name = parsed.data.name.trim();
    const email = normalizeEmail(parsed.data.email);
    const phone = normalizePhone(parsed.data.phone);
    const address = parsed.data.address?.trim() || null;

    // AGENTS.md: cek existing by email/telepon dulu, dipakai ulang antar kontrak.
    const existing = await findMajikanByEmailOrPhone({ email, phone });
    if (existing) {
      return { ok: true, majikanId: existing.id, reused: true };
    }

    // Buat akun CLIENT baru.
    // Strateginya: buat User via Prisma + Account credential dengan password
    // acak sementara, lalu picu invite set-password (requestPasswordReset) agar
    // Majikan menentukan password sendiri. Akun dibuat tanpa mengetahui password-nya.
    // Invite via Better-Auth: verifikasi token ditulis ke tabel Verification,
    // email dikirim lewat sendResetPassword yang dikonfigurasi di lib/auth.ts.
    const tempPassword = `Tmp-${crypto.randomUUID().slice(0, 12)}!A1`;

    // ALLOW_SIGNUP sementara agar signUpEmail tidak diblok oleh disableSignUp.
    const prevAllow = process.env.ALLOW_SIGNUP;
    process.env.ALLOW_SIGNUP = "true";

    let createdUserId: string | null = null;
    try {
      // Gunakan API Better-Auth signUpEmail supaya hashing password sesuai aturan Better-Auth.
      // Import auth dinamis sudah ter-load; cukup panggil api.
      const result = (await (
        auth.api as unknown as {
          signUpEmail: (args: { body: { email: string; password: string; name: string } }) => Promise<unknown>;
        }
      ).signUpEmail({ body: { email, password: tempPassword, name } })) as unknown as
        | { user: { id: string } }
        | { data: { user: { id: string } } };

      const userId =
        (result as { user?: { id: string } }).user?.id ??
        (result as { data?: { user?: { id: string } } }).data?.user?.id ??
        null;

      if (!userId) throw new Error("Gagal membuat akun Majikan: respons tidak mengandung user id.");
      createdUserId = userId;

      // Pastikan role CLIENT + phone/address. Better-Auth default role CLIENT sudah benar,
      // namun phone/address perlu dilengkapi karena additionalFields input:false.
      await prisma.user.update({
        where: { id: userId },
        data: { role: "CLIENT", phone, address },
      });
    } catch (signErr) {
      // Bila signUp gagal karena email duplikat (race), fallback: cek lagi dan reuse.
      const msg = signErr instanceof Error ? signErr.message : String(signErr);
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("exists")) {
        const raced = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
        if (raced) {
          return { ok: true, majikanId: raced.id, reused: true };
        }
      }
      throw signErr;
    } finally {
      if (prevAllow === undefined) delete (process.env as Record<string, string | undefined>).ALLOW_SIGNUP;
      else process.env.ALLOW_SIGNUP = prevAllow;
    }

    if (!createdUserId) throw new Error("Gagal membuat akun Majikan.");

    // ActivityLog — PRD §5.3 #7
    await prisma.activityLog.create({
      data: {
        userId: admin.id,
        userRole: admin.role as never,
        action: "CREATE_CLIENT_ACCOUNT",
        entityType: "User",
        entityId: createdUserId,
        details: { email, phone, name, via: "deal_cs" },
      },
    });

    // Kirim email invite set-password (reset-password flow).
    // Dilakukan setelah commit akun agar tidak menggagalkan pembuatan akun bila SMTP bermasalah.
    let inviteSent = false;
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
      await (
        auth.api as unknown as {
          requestPasswordReset: (args: { body: { email: string; redirectTo: string } }) => Promise<unknown>;
        }
      ).requestPasswordReset({
        body: { email, redirectTo: `${appUrl}/reset-password` },
      });
      inviteSent = true;
    } catch (inviteErr) {
      console.error("[createMajikanAction] Gagal kirim invite set-password:", inviteErr);
      // Tidak dianggap fatal — akun sudah tercipta, CS bisa kirim ulang nanti.
      inviteSent = false;
    }

    revalidatePath("/admin/majikan");
    return { ok: true, majikanId: createdUserId, inviteSent, reused: false };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal membuat akun Majikan.";
    // Pesan ramah untuk unique constraint
    if (msg.toLowerCase().includes("unique") && msg.toLowerCase().includes("phone")) {
      return { ok: false, error: "Nomor telepon sudah terdaftar pada akun Majikan lain." };
    }
    if (msg.toLowerCase().includes("unique") && msg.toLowerCase().includes("email")) {
      return { ok: false, error: "Email sudah terdaftar pada akun lain." };
    }
    return { ok: false, error: msg };
  }
}

// ============================================================
// Kirim ulang invite set-password untuk akun existing
// ============================================================

export async function resendInviteAction(formData: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminSession();
    const emailRaw = String(formData.get("email") ?? "").trim();
    if (!emailRaw) return { ok: false, error: "Email wajib diisi." };

    const email = normalizeEmail(emailRaw);
    const user = await prisma.user.findFirst({ where: { email, role: "CLIENT" }, select: { id: true, email: true } });
    if (!user) return { ok: false, error: "Akun Majikan tidak ditemukan." };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    await (
      auth.api as unknown as {
        requestPasswordReset: (args: { body: { email: string; redirectTo: string } }) => Promise<unknown>;
      }
    ).requestPasswordReset({ body: { email: user.email, redirectTo: `${appUrl}/reset-password` } });

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal mengirim undangan.";
    return { ok: false, error: msg };
  }
}
