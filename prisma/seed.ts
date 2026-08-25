// Seeder bootstrap — PRD §7.1 & Lampiran B.
//  1) Super Admin idempoten via API Better-Auth (agar hash password sesuai),
//     kemudian role di-set menjadi SUPER_ADMIN.
//  2) Seed 12 skill awal Lampiran B (upsert idempoten).
//
// Dijalankan: npx prisma db seed
// ALLOW_SIGNUP diaktifkan sebelum auth di-load secara dinamis (import statis
// di-hoist lebih dulu oleh ESM, sehingga env harus diset sebelum `await import`).

process.env.ALLOW_SIGNUP = "true";

import { prisma } from "../src/lib/prisma";
import { UserRole } from "../src/lib/roles";

const SEED_SKILLS = [
  "MPASI",
  "Memasak Harian",
  "Setrika Uap",
  "Bersih-bersih Rumah",
  "Perawatan Bayi",
  "Perawatan Lansia",
  "Bedridden Care",
  "Pertolongan Pertama (First Aid)",
  "Menjahit",
  "Mengemudi Mobil",
  "Bahasa Inggris Dasar",
  "Mengurus Hewan Peliharaan",
];

async function seedSuperAdmin(): Promise<void> {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL;
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn("SEED_SUPER_ADMIN_EMAIL / SEED_SUPER_ADMIN_PASSWORD belum diisi — Super Admin dilewati.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Idempoten: pastikan role tetap SUPER_ADMIN meski dijalankan ulang.
    if (existing.role !== UserRole.SUPER_ADMIN) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: UserRole.SUPER_ADMIN },
      });
      console.log(`Super Admin role dipastikan: ${email}`);
    } else {
      console.log(`Super Admin sudah ada: ${email} (skip)`);
    }
    return;
  }

  // Sign-up via API Better-Auth supaya password di-hash sesuai aturannya.
  // Import dinamis: auth.ts baru dievaluasi setelah ALLOW_SIGNUP diset.
  // better-auth 1.7 mengembalikan { user, token } atau throw; bentuk {data,error}
  // ada di versi lama — tangani kedua bentuk supaya TS lolos dan runtime aman.
  const { auth } = await import("../src/lib/auth");
  const result = (await (auth.api as unknown as { signUpEmail: (args: unknown) => Promise<unknown> }).signUpEmail({
    body: { email, password, name: "Super Admin" },
  })) as unknown as
    | { user: { id: string }; token: unknown }
    | { data: { user: { id: string } }; error: null }
    | { data: null; error: { message: string } }
    | { error: { message: string } };

  if (result && typeof result === "object" && "error" in result && (result as { error: unknown }).error) {
    const msg = (result as { error: { message?: string } }).error.message ?? "unknown error";
    throw new Error(`Gagal membuat Super Admin: ${msg}`);
  }

  const created =
    (result as { user?: { id: string } }).user ??
    (result as { data?: { user?: { id: string } } }).data?.user;

  if (!created?.id) {
    throw new Error("Gagal membuat Super Admin: respons signUpEmail tidak mengandung user.id");
  }
  await prisma.user.update({
    where: { id: created.id },
    data: { role: UserRole.SUPER_ADMIN },
  });
  console.log(`Super Admin dibuat & role SUPER_ADMIN: ${email}`);
}

async function seedSkills(): Promise<void> {
  for (const name of SEED_SKILLS) {
    await prisma.skill.upsert({
      where: { name },
      update: {}, // tidak menimpa isActive bila sudah ada
      create: { name },
    });
  }
  console.log(`Skill awal Lampiran B di-seed (${SEED_SKILLS.length} item).`);
}

async function main(): Promise<void> {
  await seedSuperAdmin();
  await seedSkills();
  console.log("Seeder selesai.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });