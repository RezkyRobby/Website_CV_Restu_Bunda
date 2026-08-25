// Seeder bootstrap — PRD §7.1.
// PLACEHOLDER sementara untuk Task 4 (migrasi awal).
// Implementasi penuh (Super Admin via API Better-Auth + 12 skill Lampiran B)
// dikerjakan pada Task 6. File ini wajib ada karena direferensikan
// `prisma.config.ts` (migrations.seed) agar perintah migrasi tidak gagal.
//
// Seeder ini sengaja tidak melakukan apa pun agar idempoten dan aman
// dijalankan ulang sebelum infrastruktur Better-Auth tersedia.

export async function main(): Promise<void> {
  // Intentionally empty — Task 6 akan menggantikan isi fungsi ini.
}

main()
  .then(() => {
    console.log("Seed selesai (placeholder). Implementasi penuh pada Task 6.");
  })
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  });