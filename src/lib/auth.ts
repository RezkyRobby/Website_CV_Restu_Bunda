// Konfigurasi Better-Auth — PRD §7.1 & AGENTS.md (Task 5).
// Role: CLIENT, CS, SUPER_ADMIN. Akun CLIENT dibuat oleh CS saat deal.
// Tabel user/session/account/verification didefinisikan di prisma/schema.prisma.

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  appName: "CV Restu Bunda Mariyati",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  // Autentikasi email/password. Sign-up publik dinonaktifkan:
  // akun CLIENT hanya dibuat oleh CS (via API), CS/SUPER_ADMIN via seeder.
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
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
