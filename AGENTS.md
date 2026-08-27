# AGENTS.md — Platform CV Restu Bunda Mariyati

Panduan kerja untuk AI agent yang membangun dan memodifikasi proyek ini. Sumber kebenaran kebutuhan: `PRD.md`. Sumber kebenaran istilah domain: `CONTEXT.md`.

## Bahasa

Seluruh komunikasi, komentar kode, commit message, teks UI, konten email, dan isi dokumen PDF ditulis dalam **Bahasa Indonesia formal**. Nama variabel, fungsi, dan komponen tetap bahasa Inggris.

## Sumber Kebenaran & Urutan Baca

1. `PRD.md` — spesifikasi fitur, skema database, alur bisnis, lampiran teknis.
2. `CONTEXT.md` — glosarium domain. Gunakan istilah di sana persis: **Majikan** (bukan customer), **Kandidat** (pekerja `STANDBY` di katalog publik), **Kuota Tukar** (`maxReplacements` − `replacementsUsed`), **Renewal** (kontrak baru via `renewedFromContractId`, bukan extension). Istilah yang salah akan menyesatkan pembaca kode berikutnya.
3. `DESIGN.md` — sumber kebenaran desain visual (warna, tipografi, ilustrasi). **Tersedia dan disetujui** — halaman publik wajib mengikuti token di file ini. Halaman internal (portal, admin) boleh pakai komponen shadcn/ui standar.
4. `AGENTS.md` (file ini) — aturan main pengerjaan.

## Tech Stack (Wajib)

Next.js 16 App Router · React 19 · Tailwind CSS 4 · shadcn/ui · Motion (`motion/react`) 13.x · PostgreSQL (Supabase/Neon) · Prisma 7 · Better-Auth 1.x · Cloudinary · Nodemailer (Gmail SMTP) · Zod + React Hook Form · @react-pdf/renderer · Vercel.

Jangan menambah library baru tanpa justifikasi; PRD sudah memilih stack ini. Angka versi di atas adalah target major; versi persisnya mengikuti `package.json`. Runtime wajib Node.js ≥ 22.12 (syarat Prisma 7; Vercel sudah default Node 22).

## Aturan Non-Negotiable

Pelanggaran aturan ini adalah bug meskipun fitur jalan:

1. **Data sensitif tidak pernah keluar lewat URL mentah.** KTP, KK, MCU, SKCK hanya diakses via Route Handler proxy `/api/documents/[workerId]/[type]` yang memvalidasi sesi + kepemilikan kontrak, lalu meneruskan signed delivery URL Cloudinary dengan text-overlay watermark dinamis. Dokumen sensitif wajib JPG/PNG maks 5 MB (tanpa PDF) agar satu pipeline watermark seragam; foto profil JPG/PNG maks 2 MB.
2. **RBAC ditegakkan di middleware dan di setiap Route Handler / Server Action.** `CLIENT` hanya melihat data kontrak miliknya sendiri. `CS` tanpa akses finansial utuh (lihat invoice, tapi bukan laporan omzet). Hapus permanen (purge) hanya Super Admin.
3. **Zona waktu Asia/Makassar untuk semua logika tanggal**: garansi, H-30/H-14/H-7, `EXPIRING_SOON`, auto-`COMPLETED`, purge. Cron berjalan UTC (01:00 UTC = 09:00 WITA); konversi terjadi di kode, bukan diasumsikan dari jam server.
4. **Satu Daily Automation Job**, tiga tugas berurutan: email pengingat (flag per milestone, query kondisional *catch-up* tanpa duplikasi), transisi status kontrak + pekerja kembali `STANDBY`, purge retensi 2 tahun (hapus record + asset Cloudinary, satu `ActivityLog` `PURGE_WORKER` per pekerja). Setiap eksekusi mencatat satu baris `JobRun`.
5. **Penomoran dokumen** `{PREFIX}/{YYYY}/{NNNN}` (`SPK/2026/0001`, `CLM/2026/0001`, `INV/2026/0001`): sequence reset per tahun, digenerate **di dalam transaksi database** dengan counter + lock agar bebas race condition antar CS.
6. **Semua operasi tulis multi-tabel dalam transaksi Prisma** — contoh: rilis SPK (kontrak + status pekerja + invoice DRAFT + nomor SPK), replacement ACCEPTED (terminate kontrak lama + kuota tukar + draft kontrak baru).
7. **Consent UU PDP**: form registrasi pekerja menolak disimpan tanpa `dataConsentAt` terisi.
8. **Materai fisik**: SPK PDF menyediakan area materai Rp10.000; versi digital yang diunduh majikan bukan pengganti keabsahan hukum. Arsip hasil cetak-materai masuk `spkStampedUrl`.

## Keputusan Bisnis yang Mudah Tertukar

Ini kesalahan implementasi yang paling mungkin terjadi; pegang spesifikasinya:

| Topik | Keputusan |
|---|---|
| Akun Majikan | Dibuat oleh **CS saat deal** (cek existing by email/telepon dulu, dipakai ulang antar kontrak; akun baru dapat email invite set-password). Tidak ada self-register CLIENT. |
| Garansi | Berjalan paralel sejak `startDate` (`startDate + warrantyDays`). Penukaran dalam kontrak sama **tidak me-reset** garansi. |
| Replacement | Kontrak lama → `TERMINATED`, `replacementsUsed` +1, sistem membuat draft kontrak pengganti (prefill dari `replacementCriteria` klaim), CS finalisasi lalu rilis SPK baru. Menutup klaim otomatis membatalkan offer `PENDING` lain pada klaim itu. |
| Klaim | Maks **satu klaim aktif** per kontrak. Klaim otomatis `REJECTED` bila kuota habis atau garansi sudah lewat. |
| Renewal | Kontrak **baru** dengan nomor SPK baru; kontrak lama `COMPLETED`; flag notifikasi kontrak baru mulai fresh `false`; isi `renewedFromContractId`. |
| Invoice | Lahir otomatis `DRAFT` saat SPK dirilis (nominal dari `placementFee`; type `REPLACEMENT_FEE` bila biaya penukaran). Konfirmasi `PAID` hanya Super Admin. Kuitansi PDF tersedia setelah `PAID`. |
| Testimoni | Entri manual Super Admin, tanpa FK ke User/Evaluasi; hanya `isPublished` tampil di landing. |
| Match Score | Deterministik berbobot sesuai Lampiran A PRD. Kategori = gerbang keras (hard gate). Hasil diurutkan menurun, tanpa cutoff minimum. |
| Statistik landing | Dihitung real-time dari DB (kontrak `ACTIVE`+`COMPLETED`, pekerja `STANDBY`) dengan nilai minimum fallback. |
| Status enum di UI | Ditampilkan lewat satu kamus label terpusat (`STANDBY` → "Siap Tugas"), jangan hardcode string label per komponen. |

## Konvensi Proyek

### Struktur Direktori

```
src/
├── app/
│   ├── (public)/          # Landing, katalog, profil perusahaan
│   ├── (client)/          # Portal majikan (login CLIENT)
│   ├── (admin)/           # Dashboard operasional (CS & SUPER_ADMIN)
│   └── api/               # Route handlers (proxy dokumen, cron, webhooks)
├── components/
│   ├── ui/                # Komponen shadcn/ui
│   └── ...                # Komponen fitur
├── lib/                   # Auth, db client, cloudinary, mailer, util
├── server/                # Logic bisnis (matching engine, contract service, dll)
└── messages/              # Kamus label status enum terpusat
prisma/schema.prisma       # Blueprint lengkap di PRD §7
tests/                     # Unit test matching & SPK generator, test RBAC
e2e/                       # E2E alur klaim garansi (PRD §8.5)
```

Sesuaikan nama folder saat implementasi nyata, pertahankan pemisahan route group per role dan logic bisnis di luar komponen UI.

### Pola Wajib

- **Validasi dua lapis**: skema Zod dipakai React Hook Form (klien) dan di Server Action / Route Handler (server). Satu skema, dua tempat.
- **Server Component secara default**; `"use client"` hanya untuk interaksi atau animasi.
- **Animasi** hanya properti `transform`/`opacity`, token durasi `fast/base/slow` (150/250/400 ms, ease-out) sesuai PRD §6.1, scroll-triggered pakai `whileInView` + `once: true`, dibungkus `MotionConfig` + `LazyMotion` (target bundle ≤ 5 kb) dan menghormati `prefers-reduced-motion`. Animasi tidak boleh menunda render konten di bawah elemen LCP.
- **Query email cron**: kondisi *"endDate ≤ hari ini + X hari DAN flag masih false"* supaya kontrak yang terlewat diproses esok hari (catch-up) tanpa duplikasi.
- **Seeder Super Admin**: idempoten, membaca env `SEED_SUPER_ADMIN_EMAIL`/`SEED_SUPER_ADMIN_PASSWORD`, sign-up via API Better-Auth agar hash password sesuai aturannya, lalu set role `SUPER_ADMIN`.

### Environment Variables

Daftar lengkap di Lampiran C PRD. Semua var baru wajib didokumentasikan di `.env.example` dengan placeholder, tanpa nilai asli. `CRON_SECRET` wajib divalidasi di route cron.

## Definition of Done per Fitur

Fitur dianggap selesai bila semua cek lolos:

1. Mengikuti blueprint skema Prisma PRD §7; perubahan skema butuh alasan eksplisit dan dicatat.
2. Operasi multi-tabel berjalan dalam transaksi.
3. RBAC teruji: `CLIENT` tidak bisa akses data majikan lain; `CS` tidak bisa akses endpoint finansial utuh; rute admin menolak role salah.
4. Data sensitif tidak muncul di response API publik maupun payload client component.
5. Label enum lewat kamus terpusat; teks UI Bahasa Indonesia formal.
6. Mobile-first (teruji di 375px, tap target ≥ 44px).
7. Unit test untuk logic deterministik: match score per komponen, struktur pasal PDF SPK. E2E untuk alur klaim garansi.
8. `npm run build`, lint, dan seluruh test hijau.
9. ActivityLog tercatat untuk aksi yang dispesifikkan PRD (ubah gaji, batalkan kontrak, blacklist, purge).

## Aturan Kerja Per Run

- Satu run mengerjakan **satu task** dari daftar Urutan Pengerjaan. Selesaikan sampai lolos verifikasi dan ter-commit, lalu berhenti, laporkan, dan tunggu run berikutnya.
- Sebelum mulai, baca ulang `PRD.md` pada fase terkait dan cek struktur repo aktual (atau `PROJECT_STRUCTURE.md` bila sudah dibuat) agar tidak bekerja dari asumsi usang.
- Task selesai ditandai mengubah `[ ]` menjadi `[x]` di daftar Urutan Pengerjaan.
- Fase berikutnya baru dikerjakan setelah fase sebelumnya tuntas; urutan dalam fase juga tidak boleh dilompati: skema → migrasi → seed → API/server logic → UI → test.

### Verifikasi Sebelum Commit

Jalankan berurutan, semua harus lolos:

1. `npx tsc --noEmit` — tanpa error type.
2. `npm run lint`
3. `npm run build` — boleh dilewati hanya untuk task parsial yang memang belum bisa di-build.

Task gagal berarti tidak di-commit: laporkan error dan langkah yang sudah dicoba, lalu tunggu arahan.

### Format Commit

Pesan Bahasa Indonesia imperatif dengan prefix:

| Tipe | Prefix | Contoh |
|---|---|---|
| Setup/tooling | `chore:` | `chore: inisialisasi Next.js 16 dan Tailwind CSS 4` |
| Skema/migrasi | `feat(db):` | `feat(db): tambah model Worker, Contract, WarrantyClaim sesuai PRD §7` |
| Halaman publik | `feat(public):` | `feat(public): buat katalog kandidat tersanitasi dengan filter pintar` |
| Portal majikan | `feat(client):` | `feat(client): buat dashboard majikan dan countdown masa kontrak` |
| Dashboard admin | `feat(admin):` | `feat(admin): buat form multi-step registrasi pekerja` |
| API/actions | `feat(api):` | `feat(api): tambah proxy dokumen /api/documents/[workerId]/[type]` |
| Modifikasi umum | `feat:` | `feat: tambahkan validasi dataConsentAt pada registrasi pekerja` |
| Testing | `test:` | `test: unit test match score per komponen Lampiran A` |
| Deploy | `deploy:` | `deploy: konfigurasi Vercel Cron Daily Automation Job` |

`git add -A` dan `git commit -m "..."` dieksekusi dua perintah terpisah, tanpa `&&`.

### Laporan Akhir Run

Setelah commit berhasil (konfirmasi via `git log -1 --oneline`):

```
OK Task X selesai — [nama task]
- Commit: [hash]
- Verifikasi: TS OK | Lint OK | Build OK/SKIP
- File diubah: [daftar file]
- Task selanjutnya: [task Y]
```

Bila gagal, jangan commit:

```
X Task X gagal — [nama task]
- Error: [detail error]
- Sudah dicoba: [langkah yang sudah ditempuh]
```

## Urutan Pengerjaan (Fase PRD §10)

Progress tracker lintas sesi: ubah `[ ]` menjadi `[x]` setiap task selesai.

### Fase 1 — Foundation & Public (Hari 1–5)
- [x] 1. Inisialisasi proyek Next.js 16 App Router + React 19 + TypeScript strict + Tailwind CSS 4 + ESLint, ikuti Struktur Direktori
- [x] 2. Setup PostgreSQL (Supabase/Neon), Prisma 7, `.env.example` lengkap sesuai Lampiran C
- [x] 3. Tulis skema Prisma lengkap PRD §7 (semua model dan enum)
- [x] 4. Migrasi awal + service penomoran dokumen `{PREFIX}/{YYYY}/{NNNN}` transaksional (counter + lock)
- [x] 5. Setup Better-Auth 3 role (CLIENT, CS, SUPER_ADMIN) + middleware proteksi rute per role
- [x] 6. Seeder idempoten Super Admin via API Better-Auth + seed 12 skill Lampiran B
- [x] 7. Integrasi Cloudinary (upload, validasi tipe/ukuran, signed delivery URL + overlay watermark) dan Nodemailer Gmail SMTP
- [x] 8. Motion foundation (`MotionConfig` + `LazyMotion` + token fast/base/slow) dan kamus label enum terpusat di `src/messages/`
- [x] 9. Landing page: hero, statistik real-time dengan fallback, slider testimoni `isPublished` (DESIGN.md tersedia — siap dikerjakan)
- [x] 10. Katalog publik tersanitasi + filter (kategori, toleransi hewan, kesediaan luar kota) + CTA WhatsApp booking
- [x] 11. Profil perusahaan, legalitas, dan prosedur penempatan resmi

### Fase 2 — Worker Core CRUD (Hari 6–10)
- [x] 12. Shell dashboard admin + guard role CS/SUPER_ADMIN + ringkasan metrik (pekerja standby, kontrak aktif)
- [ ] 13. Form registrasi pekerja multi-step (identitas → keahlian → dokumen/MCU → riwayat majikan → standar gaji → consent) dengan Zod dua lapis
- [ ] 14. Upload Cloudinary dari form (dokumen sensitif JPG/PNG maks 5 MB, foto profil maks 2 MB) + relasi skills + WorkerExperience
- [ ] 15. CRUD master Skill oleh Super Admin (aktif/nonaktif)
- [ ] 16. Smart Matching Engine Lampiran A (hard gate kategori + 6 komponen berbobot) + unit test per komponen skor

### Fase 3 — Contract & Client Portal (Hari 11–15)
- [ ] 17. Alur deal CS: cek/buat akun majikan by email/telepon + email invite set-password untuk akun baru
- [ ] 18. Form kontrak: tanggal mulai, durasi bulan (min. 3 + pratinjau endDate), agreedSalary, placementFee, warrantyDays (default 90), maxReplacements (default 2), additional clauses
- [ ] 19. Rilis SPK dalam satu transaksi: nomor SPK + contract + worker PLACED + Payment DRAFT otomatis
- [ ] 20. Generator PDF SPK (@react-pdf/renderer): struktur pasal, pasal pembayaran mencantumkan placementFee, area materai Rp10.000 + unit test struktur pasal
- [ ] 21. Route Handler proxy `/api/documents/[workerId]/[type]` (validasi sesi + kepemilikan kontrak + signed URL watermark dinamis)
- [ ] 22. Portal Majikan: dashboard widget (pekerja aktif, countdown kontrak, kuota tukar) dengan motion stagger
- [ ] 23. Dossier secure di portal + unduh salinan SPK digital dan kuitansi PDF pasca PAID
- [ ] 24. Log pembayaran gaji mandiri + evaluasi bulanan rating 1–5 (unique contractId + periodMonth)

### Fase 4 — Warranty & Automations (Hari 16–18)
- [ ] 25. Form klaim garansi portal (alasan + replacementCriteria) dengan gate: kuota habis atau garansi lewat → REJECTED otomatis; maks satu klaim aktif per kontrak
- [ ] 26. Kelola tiket klaim admin: PENDING → IN_REVIEW → CANDIDATES_OFFERED, dispatch 2–3 kandidat via Smart Matching
- [ ] 27. Respons offer majikan: ACCEPTED memicu transaksi replacement (kontrak TERMINATED + replacementsUsed + draft kontrak prefill criteria); RESOLVED/REJECTED membatalkan offer PENDING lain
- [ ] 28. Finalisasi kontrak pengganti oleh CS + rilis SPK baru (invoice REPLACEMENT_FEE bila ada biaya)
- [ ] 29. Flow renewal: kontrak baru dengan flag fresh + renewedFromContractId, kontrak lama COMPLETED
- [ ] 30. Daily Automation Job (cron 01:00 UTC, logika Asia/Makassar): email H-30/H-14/H-7 catch-up, transisi EXPIRING_SOON/COMPLETED + pekerja STANDBY, purge retensi 2 tahun + ActivityLog PURGE_WORKER, pencatatan JobRun + alert dashboard
- [ ] 31. E2E test alur klaim garansi PRD §8.5

### Fase 5 — Security Audit & Launch (Hari 19–20)
- [ ] 32. Audit kebocoran URL mentah dan payload sensitif (katalog publik, response API, client components)
- [ ] 33. Test RBAC menyeluruh: CLIENT antar-majikan, CS endpoint finansial utuh, rute admin dengan role salah
- [ ] 34. Panel audit trail Super Admin + blacklist + hard delete terkunci Super Admin + hak penghapusan UU PDP
- [ ] 35. Audit `prefers-reduced-motion` dan performa animasi; Lighthouse ≥ 90; uji 375px dengan tap target ≥ 44px
- [ ] 36. Deploy Vercel (cron + env produksi) + verifikasi JobRun pertama sukses

## Konvensi Coding

- **File/route** kebab-case (`spk-generator`, `form-klaim`), **komponen** PascalCase (`WorkerCard`), **fungsi/variabel** camelCase (`generateMatchScore`, `isExpiringSoon`).
- TypeScript strict, tanpa `any` — pakai tipe hasil generate Prisma.
- Error handling: API route/Server Action wajib try-catch dengan pesan error Bahasa Indonesia; toast `sonner` untuk operasi CRUD; loading skeleton dan empty state untuk semua data fetching.

## Perintah Umum

```bash
npx tsc --noEmit     # cek type (wajib sebelum commit)
npm run dev          # development server
npm run build        # production build
npm run lint         # eslint
npm test             # unit test
npx prisma migrate dev    # migrasi lokal
npx prisma db seed        # bootstrap super admin + skill awal (Lampiran B)
```

Perintah final menyesuaikan `package.json` yang benar-benar ada di repo; jangan mengarano.
test
npx prisma migrate dev    # migrasi lokal
npx prisma db seed        # bootstrap super admin + skill awal (Lampiran B)
```

Perintah final menyesuaikan `package.json` yang benar-benar ada di repo; jangan mengarano.
test
npx prisma migrate dev    # migrasi lokal
npx prisma db seed        # bootstrap super admin + skill awal (Lampiran B)
```

Perintah final menyesuaikan `package.json` yang benar-benar ada di repo; jangan mengarano.
