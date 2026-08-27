// Konfigurasi Better-Auth — PRD §7.1 & AGENTS.md (Task 5).
// Role: CLIENT, CS, SUPER_ADMIN. Akun CLIENT dibuat oleh CS saat deal.
// Tabel user/session/account/verification didefinisikan di prisma/schema.prisma.

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { sendInviteSetPasswordEmail } from "@/lib/mailer";

export const auth = betterAuth({
  appName: "CV Restu Bunda Mariyati",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  // Autentikasi email/password. Sign-up publik dinonaktifkan secara default:
  // akun CLIENT hanya dibuat oleh CS (via API), CS/SUPER_ADMIN via seeder.
  // Seeder bootstrap mengaktifkan sementara dengan env ALLOW_SIGNUP=true.
  emailAndPassword: {
    enabled: true,
    disableSignUp: process.env.ALLOW_SIGNUP !== "true",
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Invite set-password untuk akun Majikan baru (PRD §5.4 #1 — Task 17):
    // CS membuat akun CLIENT; email undangan berisi tautan reset-password
    // agar Majikan bisa menetapkan kata sandi sendiri (tanpa CS mengetahui password).
    sendResetPassword: async ({ user, url }) => {
      // Better-Auth sudah membentuk url reset-nya sendiri; teruskan sebagai inviteUrl.
      // Bila SMTP belum dikonfigurasi, jangan lempar agar pembuatan akun tetap berhasil.
      try {
        await sendInviteSetPasswordEmail({
          to: user.email,
          clientName: (user as { name?: string }).name ?? user.email,
          inviteUrl: url,
        });
      } catch (err) {
        console.error("[auth.sendResetPassword] Gagal mengirim email undangan:", err);
      }
    },
  },

  user: {
    modelName: "User",
    additionalFields: {
      // Role server-owned: hanya diubah lewat aplikasi, bukan input user.
      role: {
        type: "string",
        required: true,
        defaultValue: "CLIENT",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: false,
      },
      address: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },

  session: {
    modelName: "Session",
  },

  account: {
    modelName: "Account",
  },

  // Memastikan cookie sesi diterapkan pada Server Actions (Next.js).
  plugins: [nextCookies()],

  // Nonaktifkan telemetry.
  telemetry: {
    enabled: false,
  },
});
