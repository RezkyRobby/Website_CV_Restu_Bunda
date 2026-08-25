// Membersihkan seluruh data uji dari database — jalankan: npx tsx scripts/reset-db.ts
// Dipakai untuk menguji seeder dari keadaan kosong. JANGAN dijalankan di produksi.
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const SQL = `
DELETE FROM accounts;
DELETE FROM sessions;
DELETE FROM verifications;
DELETE FROM activity_logs;
DELETE FROM worker_evaluations;
DELETE FROM replacement_offers;
DELETE FROM warranty_claims;
DELETE FROM salary_logs;
DELETE FROM payments;
DELETE FROM contracts;
DELETE FROM worker_skills;
DELETE FROM worker_experiences;
DELETE FROM workers;
DELETE FROM skills;
DELETE FROM users;
DELETE FROM document_sequences;
`;

async function main(): Promise<void> {
  await prisma.$executeRawUnsafe(SQL);
  console.log("Database uji telah dibersihkan.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });