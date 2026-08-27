# Product Requirement Document (PRD)

## Sistem Manajemen & Platform Penempatan Tenaga Kerja — CV Restu Bunda Mariyati

---

## 1. Executive Summary

Proyek ini bertujuan untuk membangun **Sistem Manajemen dan Platform Penempatan Tenaga Kerja Digital** untuk CV Restu Bunda Mariyati. Platform ini akan menjadi pusat ekosistem digital perusahaan yang mengintegrasikan website profil publik berkonversi tinggi, Portal Majikan (Klien) untuk transparansi layanan, serta Dashboard Operasional (Backoffice) untuk staf CS dan pimpinan. Dikembangkan menggunakan teknologi modern (Next.js 16, Tailwind CSS 4, Prisma, PostgreSQL, Better-Auth) agar responsif, aman, dan mudah dikelola. Sistem ini akan mendigitalisasi alur kerja agensi, mulai dari registrasi *dossier* pekerja, pencocokan cerdas (*smart matching*), penerbitan SPK (Surat Perjanjian Kerja) otomatis, hingga pelacakan masa garansi dan pengingat kontrak.

---

## 2. Latar Belakang

CV Restu Bunda Mariyati bergerak di bidang penyediaan jasa tenaga kerja rumah tangga, khususnya *baby sitter*, asisten rumah tangga (ART), dan perawat lansia. Dalam operasional sehari-hari, terdapat beberapa tantangan yang sering dihadapi:
- Pencatatan dokumen pekerja (KTP, sertifikat, hasil MCU) dan pencocokan dengan kriteria majikan masih dilakukan secara manual, yang rentan terhadap *human error* dan lambat.
- Majikan (klien) sering kali kehilangan dokumen fisik SPK atau kuitansi, serta kesulitan melacak sisa masa garansi penukaran pekerja.
- Staf operasional sering melewatkan momentum perpanjangan kontrak karena tidak ada sistem pengingat otomatis saat masa kontrak pekerja hampir habis.

Oleh karena itu, diperlukan sebuah platform terintegrasi yang tidak hanya memperkuat identitas perusahaan di dunia digital untuk menarik calon klien, tetapi juga mengotomatisasi proses bisnis di belakang layar untuk menjamin efisiensi dan keamanan data identitas.

---

## 3. Tujuan

1. Menyediakan platform informasi dan katalog kandidat terverifikasi (tanpa mengekspos data privat) untuk menarik calon majikan secara *online*.
2. Memudahkan staf operasional dalam mengelola data pekerja (*dossier*), riwayat medis (MCU), dan siklus status pekerja.
3. Mengotomatisasi pembuatan dokumen legal (SPK digital) berdasarkan kesepakatan majikan dan pekerja.
4. Memberikan transparansi penuh kepada majikan melalui portal mandiri (dokumen SPK, masa kontrak, sisa garansi).
5. Mendigitalisasi alur komplain dan penukaran pekerja (klaim garansi) dengan sistem *ticketing* yang terukur.
6. Meningkatkan angka retensi klien melalui notifikasi perpanjangan kontrak otomatis (H-30, H-14, H-7) via email.

---

## 4. Target Pengguna

| Pengguna | Kebutuhan |
|---|---|
| **Calon Majikan (Publik)** | Mencari informasi layanan, melihat profil ringkas kandidat pekerja yang *standby*, dan berkonsultasi via WhatsApp. |
| **Klien / Majikan (User)** | Melihat data lengkap pekerja yang bertugas, mengunduh SPK, mengecek sisa garansi, mengajukan penukaran pekerja, mencatat log gaji. |
| **CS / Staf Operasional** | Menginput data pekerja baru, melakukan *smart matching*, merilis SPK, menindaklanjuti tiket klaim garansi dari majikan. |
| **Super Admin (Owner)** | Memantau aktivitas seluruh staf (Audit Log), melihat laporan omzet/finansial, mem-*blacklist* pekerja bermasalah, mengelola akun CS. |

---

## 5. Fitur & Fungsionalitas

### 5.1 Modul Public (Tanpa Login)

| No | Fitur | Deskripsi |
|---|---|---|
| 1 | **Landing Page / Beranda** | Hero section, statistik penempatan, *value proposition* jaminan keamanan, layanan unggulan, slider testimoni klien (dikelola via dashboard Super Admin). Statistik dihitung real-time dari database (jumlah kontrak `ACTIVE`+`COMPLETED`, jumlah pekerja `STANDBY`) dengan nilai minimum fallback agar landing tidak tampak kosong saat awal launching. |
| 2 | **Katalog Pekerja (Sanitized)** | Grid kandidat berstatus `STANDBY`. Menampilkan data aman: nama panggilan, usia, suku, keahlian, status SKCK/MCU. |
| 3 | **Pencarian & Filter Pintar** | Filter kandidat berdasarkan Kategori (Baby Sitter, ART, Lansia), toleransi hewan peliharaan, dan kesediaan luar kota. |
| 4 | **Direct WhatsApp Booking** | Tombol *CTA* pada tiap profil pekerja yang langsung membuka WhatsApp dengan *template* pesan *booking* kandidat terkait. Nomor tujuan dari env `NEXT_PUBLIC_WHATSAPP_NUMBER` (format internasional `628xx`); pesan memuat nama panggilan + id kandidat. |
| 5 | **Profil Perusahaan & Legalitas** | Halaman informasi legalitas CV, struktur perusahaan, alamat kantor, dan prosedur penempatan resmi. |

### 5.2 Modul Portal Majikan — Client Area (Login `CLIENT`)

| No | Fitur | Deskripsi |
|---|---|---|
| 1 | **Dashboard Majikan** | Menampilkan pekerja yang sedang aktif bertugas, widget hitung mundur sisa kontrak, dan status kuota garansi. |
| 2 | **Dossier Pekerja (Secure)** | Melihat data diri lengkap pekerja aktif, unduh salinan MCU, KTP (dengan otomatis *watermark*), dan sertifikat pelatihan. |
| 3 | **Pusat Dokumen (Kontrak)** | Daftar riwayat SPK. Majikan dapat mengunduh **salinan digital SPK** (arsip pra-materai, `spkDocumentUrl`) dan kuitansi pembayaran penempatan format PDF (tersedia setelah invoice dikonfirmasi `PAID`). Dokumen resmi berlaku pada versi cetak bermaterai yang diarsipkan agensi. |
| 4 | **Pengajuan Klaim Garansi** | Form 1-klik untuk mengajukan komplain atau penukaran pekerja (pilih alasan, input kriteria pengganti). |
| 5 | **Log Pembayaran Gaji** | Modul pencatatan mandiri (tanggal & nominal) untuk gaji bulanan pekerja sebagai buku kas digital majikan. |
| 6 | **Evaluasi Kinerja Bulanan** | Memberikan *rating* (1-5 bintang) terkait kedisiplinan, kebersihan, dan sikap pekerja. |

### 5.3 Modul Admin & Operasional (Login `CS` & `SUPER_ADMIN`)

| No | Fitur | Deskripsi |
|---|---|---|
| 1 | **Dashboard Operasional** | Ringkasan metrik (pekerja *standby*, kontrak aktif), *alert* kontrak akan habis, daftar tiket klaim mendesak, serta status eksekusi **Daily Automation Job** terakhir (waktu sukses / peringatan bila gagal berturut-turut). |
| 2 | **Form Registrasi Pekerja (Multi-step)** | CRUD Pekerja terstruktur (Identitas → Keahlian → Upload Dokumen/MCU → Riwayat Majikan → Standar Gaji → Consent). Spesifikasi upload: foto profil JPG/PNG maks 2 MB; dokumen sensitif (KTP, MCU, SKCK) **wajib JPG/PNG** (tanpa PDF) maks 5 MB — agar seluruh dokumen melewati satu pipeline *watermark* overlay Cloudinary yang seragam. Validasi ganda sisi klien (React Hook Form) dan server (Zod) sebelum unggah ke Cloudinary. Langkah Consent: checkbox persetujuan pemrosesan data pribadi wajib dicentang; waktu persetujuan direkam (`dataConsentAt`) — tanpa itu form tidak dapat disimpan. |
| 3 | **Smart Matching Engine** | Filter pencarian internal berdasar kriteria ketat majikan untuk menemukan *match score* tertinggi. Algoritma deterministik berbobot — lihat **Lampiran A** — dan wajib unit test. |
| 4 | **Auto-SPK Generator** | Form input: majikan, pekerja, tanggal mulai, **durasi dalam bulan (min. 3, dengan pratinjau tanggal selesai otomatis)**, gaji disepakati, **biaya penempatan (`placementFee`)**, masa garansi (hari, default 90), kuota tukar (default 2), dan *Additional Clauses*. Saat SPK dirilis: PDF digenerate (pasal pembayaran mencantumkan nominal biaya penempatan, menyediakan **area materai fisik Rp10.000**; dokumen dicetak, dimaterai fisik oleh CS, lalu arsip hasil cetakan disimpan ke Cloudinary), status pekerja → `PLACED`, invoice `PLACEMENT_FEE` berstatus `DRAFT` lahir otomatis dari `placementFee`, dan akun majikan dibuat/dipakai ulang (lihat 5.4 #1). |
| 5 | **Kelola Tiket Garansi & Dispatch** | Review keluhan majikan, ubah status tiket, dan tawarkan 2-3 profil pekerja pengganti ke Portal Majikan yang bersangkutan. |
| 6 | **Manajemen Siklus Kontrak** | Melihat seluruh kontrak berjalan, memantau *flag* pengiriman email H-30/H-14/H-7, proses perpanjangan kontrak. |
| 7 | **Audit Trail & Role Management** | (Khusus Super Admin) CRUD akun CS, melihat *log* aktivitas (siapa mengubah data apa), dan fitur *Hard Delete* / *Blacklist*. |
| 8 | **Kelola Testimoni & Konfirmasi Invoice** | (Khusus Super Admin) CRUD testimoni landing page (*publish*/*unpublish*), serta konfirmasi status invoice `DRAFT` → `PAID`. |

### 5.4 Modul Autentikasi & Automasi

| No | Fitur | Deskripsi |
|---|---|---|
| 1 | **Login & Role Management** | Autentikasi email/password via Better-Auth (Role: `CLIENT`, `CS`, `SUPER_ADMIN`). Proteksi rute via Next.js Middleware. **Akun `CLIENT` dibuat oleh CS** saat deal (bukan self-register): CS wajib cek akun existing by email/telepon terlebih dahulu — satu akun dipakai ulang untuk semua kontrak majikan tsb.; jika baru, sistem kirim email undangan *set-password* (invite flow Better-Auth). |
| 2 | **Dynamic Watermarking** | Dokumen sensitif (KTP/MCU/SKCK) **tidak pernah diekspos URL mentahnya ke browser**. Akses selalu via Route Handler proxy (`/api/documents/[workerId]/[type]`) yang memvalidasi sesi + kepemilikan kontrak, lalu meneruskan *signed delivery URL* Cloudinary dengan *text-overlay* dinamis *"DOKUMEN RESMI - HANYA UNTUK PENEMPATAN [tanggal]"*. |
| 3 | **Daily Automation Job** | Satu Vercel Cron harian (01:00 UTC = 09:00 WITA; **semua logika tanggal memakai zona Asia/Makassar**) menjalankan tiga tugas berurutan: (a) **Email pengingat** H-30/H-14/H-7 via Nodemailer — query kondisional *"endDate ≤ hari ini + X hari DAN flag masih false"* sehingga kontrak yang terlewat tetap diproses esok hari (*catch-up*) tanpa duplikasi; (b) **Transisi status kontrak**: `ACTIVE → EXPIRING_SOON` saat sisa ≤ 30 hari; `→ COMPLETED` saat melewati `endDate`, dan pekerja dikembalikan ke `STANDBY`; (c) **Purge retensi UU PDP**: pekerja *soft-deleted* > 2 tahun tanpa kontrak aktif dihapus permanen beserta asset Cloudinary-nya, satu entri `ActivityLog` (`PURGE_WORKER`) per pekerja; kontrak/SPK tidak tersentuh (retensi 5 tahun). Setiap eksekusi dicatat ke tabel `JobRun` (waktu mulai/selesai, status, durasi, error bila ada); Dashboard Operasional menampilkan timestamp eksekusi terakhir dan memunculkan *alert* bila job gagal > 2 hari berturut-turut. |
| 4 | **Keandalan Automasi** | Flag pengiriman (`isH30Notified`, dst.) tersimpan di database sehingga satu kontrak hanya memicu satu email per milestone — anti-SPAM walau cron gagal/berjalan ganda. |

---

## 6. Tech Stack

> **Catatan desain visual:** gaya tampilan (warna brand, tipografi, ilustrasi landing page) **bukan bagian PRD ini**. Visual dispesifikasikan terpisah di **`DESIGN.md`** (sumber kebenaran desain, bisa digenerate via Stitch atau Figma → diekspor ke DESIGN.md). Backlog Fase 1 perlu penyerahan `DESIGN.md` sebelum pengerjaan halaman publik.

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | SSR, API Routes, Server Actions, front-end terpadu |
| **Front-end Library** | React 19 | UI interaktif |
| **CSS Framework** | Tailwind CSS 4 | Utility-first, responsif, *mobile-first styling* |
| **UI Components** | shadcn/ui | Komponen aksesibel & kustomizable (Radix Primitives) |
| **UI Animation** | Motion (Framer Motion) 13.x | Animasi deklaratif (fade/slide/stagger), kompatibel React 19 & App Router; mendukung `useReducedMotion` untuk aksesibilitas. Detail spesifikasi di sub-bab 6.1. |
| **Database** | PostgreSQL | Database relasional (hosted on Supabase/Neon) |
| **ORM** | Prisma 7 | Type-safe database access & schema migration |
| **Autentikasi** | Better-Auth 1.x | Manajemen sesi, keamanan *cookie*, role-based access |
| **Image/File Storage** | Cloudinary | Storage gambar teroptimasi, dukungan transformasi & *watermark* |
| **Email Service** | Nodemailer + Gmail SMTP | Pengiriman notifikasi tagihan dan pengingat kontrak otomatis |
| **Form Validation** | Zod + React Hook Form | Validasi input form *multi-step* dari sisi klien & server |
| **PDF Generation** | @react-pdf/renderer | Pembuatan SPK & Invoice format PDF dari data dinamis |
| **Deployment** | Vercel | Hosting global, CI/CD otomatis, Vercel Cron |

### 6.1 Spesifikasi UI Motion (Motion / Framer Motion)

Seluruh animasi antarmuka menggunakan **Motion** (`motion/react`, penerus resmi Framer Motion). Gaya yang dipakai adalah *subtle & profesional*: fade/slide halus, *hover lift* tipis, tanpa spring bouncy atau parallax dramatis — sesuai citra agensi resmi.

**Motion Tokens (durasi & easing):**

| Token | Durasi | Easing | Penggunaan |
|---|---|---|---|
| `fast` | 150 ms | ease-out | Micro-interaction: hover lift, tap feedback, toggle |
| `base` | 250 ms | ease-out | Transisi standar: fade-in konten, toast, modal/drawer |
| `slow` | 400 ms | ease-out | Entrance animation: hero, section reveal saat scroll |

**Aturan Teknis Wajib:**
1. Hanya animasikan properti `transform` dan `opacity` (GPU-accelerated). Dilarang menganimasikan properti layout (`width`, `height`, `top`, `left`, `margin`).
2. Animasi scroll-triggered memakai `whileInView` dengan opsi `once: true` agar tidak berulang saat scroll naik-turun.
3. Komponen animasi wajib Client Component (`"use client"`) — komponen Server Component tetap tanpa animasi.
4. Untuk optimasi bundle pada halaman publik, gunakan `LazyMotion` + komponen `m` (target bundle awal ≤ 5 kb).

**Spesifikasi Motion per Modul:**

| Modul | Titik Animasi | Implementasi |
|---|---|---|
| **Public — Landing Page** | Hero fade-in-up staggered (judul → subjudul → CTA), statistik penempatan count-up saat masuk viewport, crossfade slider testimoni | Variants + `staggerChildren`, `AnimateNumber`/`useInView`, `AnimatePresence mode="wait"` |
| **Public — Katalog Pekerja** | Kartu kandidat muncul staggered saat load/filter, hover lift tipis (-4px) pada kartu, transisi hasil filter crossfade | Grid variants stagger, `whileHover={{ y: -4 }}`, `AnimatePresence` + `layout` |
| **Portal Majikan** | Widget dashboard fade-in berurutan, transisi antar halaman 200ms, form klaim garansi slide antar-step, toast notifikasi slide-in dari atas | Stagger widgets, template.tsx Next.js, `AnimatePresence mode="wait"` per step, motion div toast |
| **Admin Dashboard** | Form registrasi pekerja multi-step slide horizontal, skeleton loading shimmer, modal/drawer scale+fade 150ms, collapse sidebar | `AnimatePresence mode="popLayout"` + arah slide dinamis, CSS/motion shimmer, modal via Radix + motion, `layout` prop sidebar |

---

## 7. Struktur Database (Prisma Schema Blueprint)

### 7.1 Model — Users & Auth
User
├── id (String, CUID)
├── email (String, unique)
├── name (String)
├── role (Enum: CLIENT, CS, SUPER_ADMIN)
├── phone (String, unique, nullable)
├── address (Text, nullable)
├── createdAt (DateTime)
└── updatedAt (DateTime)

Session, Account, Verification
└── (Standar bawaan Better-Auth tables)

**Bootstrap akun Super Admin pertama:**
- Melalui **Seeder** (bukan insert DB manual) yang memanfaatkan API Better-Auth untuk *sign-up* — password di-hash sesuai aturan Better-Auth, sehingga login berfungsi normal.
- Prompt interaktif membaca email/password dari env `SEED_SUPER_ADMIN_EMAIL` + `SEED_SUPER_ADMIN_PASSWORD`, lalu mengatur role menjadi `SUPER_ADMIN`.
- Idempoten: jika seeder dijalankan ulang, tidak menimbulkan konflik/duplikasi.

### 7.2 Model — Pekerja & Riwayat
Worker
├── id (String, CUID)
├── nik (String, unique)
├── noKk (String, nullable)
├── fullName (String)
├── nickname (String)
├── birthDate (DateTime)
├── religion (Enum: ISLAM, KRISTEN, dll)
├── maritalStatus (Enum: BELUM_MENIKAH, MENIKAH, dll)
├── ethnicity (String)                — suku (tampil di katalog publik)
├── domicileAddress (Text)            — privat, tidak masuk katalog
├── category (Enum: BABY_SITTER, ART, PERAWAT_LANSIA, SUPIR)
├── status (Enum: STANDBY, INTERVIEW, PLACED, ON_LEAVE, BLACKLIST)
├── skills (Relasi many-to-many → Skill)   — vocabulary terkontrol, bukan free-text array
├── stayIn (Boolean)
├── expectedSalary (Decimal(12,2))    — Mata uang IDR
├── petTolerance (Boolean, default false)
├── willingOutOfCity (Boolean, default false)
├── photoProfileUrl (String)
├── ktpDocumentUrl (String)           — JPG/PNG saja (pipeline watermark)
├── mcuReportUrl (String, nullable)   — JPG/PNG saja; file laporan kesehatan
├── skckVerified (Boolean, default false)
├── skckDocumentUrl (String, nullable)
├── trainingCertificates (Json?, nullable) — [{ name, url }]
├── guarantorName (String)            — Nama wali darurat
├── guarantorPhone (String)           — Wajib
├── guarantorRelation (String, nullable)
├── dataConsentAt (DateTime?, nullable) — Wajib terisi saat registrasi (UU PDP)
├── createdAt (DateTime)
└── deletedAt (DateTime, nullable)    — Soft delete

Skill (master data, CRUD oleh Super Admin)
├── id (String, CUID)
├── name (String, unique)
└── isActive (Boolean)

WorkerSkill (join table)
├── workerId (FK → Worker)
└── skillId (FK → Skill)
    — Primary key komposit (workerId, skillId)

WorkerExperience
├── id (String, CUID)
├── workerId (FK → Worker)
├── employerLocation (String)
├── position (String)
├── startDate (DateTime)
├── endDate (DateTime, nullable)
├── reasonForLeaving (String)
└── createdAt (DateTime)

### 7.3 Model — Kontrak & Garansi
Contract
├── id (String, CUID)
├── contractNumber (String, unique)
├── clientId (FK → User)
├── workerId (FK → Worker)
├── startDate (DateTime)
├── endDate (DateTime)
├── status (Enum: ACTIVE, EXPIRING_SOON, COMPLETED, TERMINATED)
├── agreedSalary (Decimal(12,2))     — Mata uang IDR
├── warrantyDays (Int)               — Default 90 hari
├── maxReplacements (Int)            — Kuota tukar (misal: 2 kali)
├── replacementsUsed (Int)
├── spkDocumentUrl (String, nullable)  — PDF kontrak pra-materai (arsip); cetakan fisik dimaterai CS
├── spkStampedUrl (String, nullable)   — PDF hasil cetak-materai yang diarsipkan ke Cloudinary
├── isH30Notified (Boolean)
├── isH14Notified (Boolean)
├── isH7Notified (Boolean)
├── renewedFromContractId (String, nullable, FK → Contract) — Jejak audit kontrak perpanjangan
└── createdAt (DateTime)
    — Semantik garansi: berjalan PARALEL sejak startDate (startDate + warrantyDays),
      TIDAK reset saat terjadi penukaran dalam kontrak yang sama;
      kontrak hasil replacement adalah kontrak baru dengan garansinya sendiri.

WarrantyClaim (Tiket Komplain)
├── id (String, CUID)
├── claimNumber (String, unique)
├── contractId (FK → Contract)
├── clientId (FK → User)
├── reason (String)                  — Kategori keluhan
├── detailedComplaint (Text)
├── replacementCriteria (Json)       — { category, budgetSalaryMin, budgetSalaryMax,
│                                        stayIn, petTolerance, willingOutOfCity,
│                                        ageMin, ageMax, notes }
│                                      Dipakai sebagai input Smart Matching dan prefill
│                                      draft kontrak pengganti.
├── status (Enum: PENDING, IN_REVIEW, CANDIDATES_OFFERED, RESOLVED, REJECTED)
└── createdAt (DateTime)

ReplacementOffer
├── id (String, CUID)
├── claimId (FK → WarrantyClaim)
├── workerId (FK → Worker)           — Kandidat pengganti yang ditawarkan
├── status (Enum: PENDING, ACCEPTED, REJECTED)
└── createdAt (DateTime)
    — Menutup klaim (RESOLVED/REJECTED) otomatis membatalkan semua offer
      berstatus PENDING pada klaim tersebut. Tidak ada auto-expire di v1.

### 7.4 Model — Klien Loggers & Audit
SalaryLog
├── id (String, CUID)
├── contractId (FK → Contract)
├── paymentDate (DateTime)
├── amount (Decimal(12,2))           — Mata uang IDR
└── createdAt (DateTime)

ActivityLog (Audit Trail)
├── id (String, CUID)
├── userId (FK → User)
├── userRole (Enum)
├── action (String)                  — "CREATE_CONTRACT", "DELETE_WORKER"
├── entityType (String)
├── entityId (String)
├── details (Json)
└── createdAt (DateTime)

### 7.5 Model — Evaluasi, Keuangan & Testimoni
WorkerEvaluation
├── id (String, CUID)
├── contractId (FK → Contract)
├── clientId (FK → User)
├── workerId (FK → Worker)
├── periodMonth (DateTime)           — Periode evaluasi (bulan)
├── ratingDiscipline (Int)           — 1-5
├── ratingCleanliness (Int)          — 1-5
├── ratingAttitude (Int)             — 1-5
├── comment (Text, nullable)
└── createdAt (DateTime)
    — Unique constraint: (contractId, periodMonth) — 1 evaluasi per kontrak per bulan

Payment (Invoice / Kuitansi)
├── id (String, CUID)
├── invoiceNumber (String, unique)
├── contractId (FK → Contract)
├── amount (Decimal(12,2))           — Mata uang IDR
├── type (Enum: PLACEMENT_FEE, REPLACEMENT_FEE)
├── status (Enum: DRAFT, PAID)
├── paymentDate (DateTime, nullable)
├── method (String, nullable)
├── receiptUrl (String, nullable)    — PDF kuitansi hasil generate
├── confirmedById (FK → User, nullable) — Super Admin yang konfirmasi PAID
└── createdAt (DateTime)
    — Aturan: otomatis dibuat berstatus DRAFT saat SPK dirilis;
      hanya Super Admin dapat konfirmasi menjadi PAID

Testimonial
├── id (String, CUID)
├── clientName (String)
├── clientOrigin (String)
├── photoUrl (String, nullable)
├── rating (Int)                     — 1-5
├── content (Text)
├── isPublished (Boolean)            — Default false; hanya yang published tampil di landing page
└── createdAt (DateTime)
    — Entri MANUAL oleh Super Admin (disalin dari evaluasi bintang / chat);
      TIDAK ada fitur submit testimoni oleh klien; tanpa FK ke User/Evaluasi;
      evaluasi bulanan hanya menjadi sumber bahan, tidak tersinkron otomatis.

---

### 7.6 Konvensi Penomoran Dokumen

Format seragam `{PREFIX}/{YYYY}/{NNNN}` — contoh: `SPK/2026/0001`, `CLM/2026/0001`, `INV/2026/0001`.
Sequence reset per tahun, digenerate di dalam transaksi database

### 7.7 Model — Job Run

JobRun (pemonitor eksekusi Daily Automation Job)
├── id (String, CUID)
├── jobKey (String)                   — "DAILY_AUTOMATION"
├── startedAt (DateTime)
├── finishedAt (DateTime, nullable)
├── status (Enum: RUNNING, SUCCESS, FAILED)
├── durationMs (Int, nullable)
├── errorMessage (Text, nullable)
└── createdAt (DateTime)
    — Satu baris per eksekusi cron; dibaca Dashboard Operasional untuk
      menampilkan timestamp terakhir & memunculkan alert bila gagal > 2 hari beruntun. (counter + lock)
agar bebas race condition saat dua CS merilis dokumen bersamaan.

---

## 8. User Flow

### 8.1 Calon Majikan (Public)
1. Buka Beranda → Jelajahi Layanan & Profil Legalitas Agensi.
2. Buka Katalog Pekerja → Terapkan Filter (misal: Baby Sitter / Bersedia Luar Kota).
3. Lihat Detail Profil Sanitized (tanpa membuka NIK & Alamat Lengkap).
4. Klik "Booking via WA" → Terbuka chat WhatsApp CS otomatis dengan id/nama kandidat yang dipilih.

### 8.2 Klien / Majikan Aktif (Portal Login)
1. Login Portal → Masuk ke Dashboard Utama.
2. Pantau widget Pekerja Aktif, sisa durasi kontrak kerja, dan kuota sisa garansi penukaran.
3. Unduh berkas SPK Digital atau Kuitansi Penempatan format PDF.
4. Jika Terjadi Ketidakcocokan:
   - Klik "Ajukan Penukaran" → Isi formulir klaim dan kriteria kandidat baru.
   - Menerima tawaran profil pengganti dari CS → Konfirmasi Setuju / Tolak di portal.
5. Catat pembayaran gaji bulanan dan berikan review performa pekerja.

### 8.3 CS / Staf Operasional
1. Login Dashboard Admin → Cek notifikasi kontrak H-30/H-14 untuk follow-up majikan.
2. Input Data Pekerja Baru → Isi data diri, upload berkas KTP & MCU ke Cloudinary → Set status `STANDBY`.
3. Proses Deal Baru → Jalankan Smart Matching → Buka form Kontrak → Cek/buat akun Majikan (by email/telepon; akun baru menerima email undangan set-password) → Generate Auto-SPK → Status pekerja `PLACED`, invoice `PLACEMENT_FEE` DRAFT otomatis terbit.
4. Tindak Lanjut Tiket Klaim Garansi → Cek kronologi keluhan → Kirim tawaran kandidat pengganti ke portal majikan.

### 8.4 Super Admin (Owner)
1. Login Dashboard Super Admin → Pantau ringkasan omzet dan performa penempatan bulanan.
2. Kelola Akses CS → Buat/Nonaktifkan akun CS.
3. Tindakan Khusus → Eksekusi Hard Delete atau tetapkan status `BLACKLIST` untuk pekerja indisipliner.
4. Audit Trail → Pantau seluruh riwayat manipulasi data dan log aktivitas sistem.

### 8.5 Alur Klaim Garansi & Replacement (End-to-End)

**Transisi status tiket klaim (`WarrantyClaim`):**
1. Majikan mengajukan klaim → status `PENDING`.
2. CS mereview keluhan → status `IN_REVIEW`.
3. CS menawarkan 2–3 kandidat pengganti (membuat `ReplacementOffer`) → status `CANDIDATES_OFFERED`.
4. Majikan merespons tawaran di portal:
   - **ACCEPTED** → lanjut ke proses replacement (di bawah).
   - **REJECTED** → CS dapat menawarkan kandidat lain, atau menutup klaim dengan status `RESOLVED` / `REJECTED`.

**Saat tawaran pengganti ACCEPTED (semi-otomatis):**
1. Otomatis oleh sistem: kontrak lama → `TERMINATED`; `replacementsUsed` bertambah 1; draft kontrak pengganti dibuat (prefill dari `replacementCriteria` klaim).
2. Manual oleh CS: pekerja lama ditinjau lalu dikembalikan ke `STANDBY` (opsi `BLACKLIST` bila masalah disiplin); CS finalisasi draft kontrak pengganti (durasi, gaji, biaya penukaran bila ada, clauses) dan rilis SPK baru — pekerja pengganti → `PLACED`, invoice `REPLACEMENT_FEE` DRAFT terbit bila ada biaya. Aturan **materai fisik** dan **satu klaim aktif per kontrak** berlaku sama seperti SPK/klaim reguler.
3. Klaim ditutup `RESOLVED`; semua offer `PENDING` lain pada klaim otomatis dibatalkan.

**Edge case — kuota tukar habis:**
- Jika klaim diajukan saat `replacementsUsed ≥ maxReplacements` atau masa garansi telah berakhir, klaim otomatis berstatus `REJECTED` dan majikan menerima notifikasi penjelasan.

**Edge case — klaim ganda:**
- Maksimal **satu klaim aktif** (`PENDING`/`IN_REVIEW`/`CANDIDATES_OFFERED`) per kontrak; pengajuan baru ditolak hingga klaim berjalan ditutup. Kebijakan ini dirancang agar bisa direlaksasi (klaim paralel) di versi berikutnya tanpa mengubah skema data.

### 8.6 Alur Perpanjangan Kontrak (Renewal)

1. Sistem mengirim email pengingat otomatis H-30 / H-14 / H-7 sebelum `endDate` kontrak aktif.
2. CS melakukan follow-up majikan; jika sepakat perpanjang:
   - Kontrak lama berubah status menjadi `COMPLETED`.
   - Dibuat **kontrak baru** dengan nomor kontrak/SPK baru, durasi dan gaji sesuai kesepakatan terbaru.
   - Flag notifikasi (`isH30Notified`, `isH14Notified`, `isH7Notified`) pada kontrak baru otomatis *fresh* (`false`) karena siklus pengingat dimulai ulang.
   - Field `renewedFromContractId` pada kontrak baru diisi id kontrak lama sebagai jejak audit retensi.
3. Jika majikan tidak memperpanjang: kontrak berubah `COMPLETED` pada `endDate`, pekerja dikembalikan ke `STANDBY`.

---

## 9. Non-Functional Requirements

| Aspek | Spesifikasi |
|---|---|
| **Responsivitas & UI** | Wajib *Mobile-First* (optimal di layar 375px), tap target minimal 44px, estetika rapi dan elegan. |
| **Keamanan Data (UU PDP)** | KTP, KK, SKCK tidak diekspos ke API publik. Terdapat lapisan *watermark* dinamis pada saat *render*. |
| **Performa** | Lighthouse score ≥ 90 (Performance, Accessibility, SEO). Image dikonversi otomatis ke WebP/AVIF via Cloudinary. |
| **Privasi Role Berjenjang** | CS tidak dapat melihat log finansial utuh agensi; fitur hapus permanen dikunci mutlak hanya untuk Super Admin. |
| **Automasi Email** | Keandalan Vercel Cron Job yang terekam pada database untuk mencegah duplikasi pengiriman email SPAM. |
| **UI Motion & Aksesibilitas** | Seluruh animasi wajib menghormati preferensi `prefers-reduced-motion` (dimatikan/disederhanakan via `MotionConfig` atau `useReducedMotion`). Hanya properti `transform`/`opacity` yang dianimasikan. Animasi tidak boleh mengubah ukuran tap target 44px dan tidak boleh menunda render konten di bawah elemen LCP (jaga FCP < 1.2s). |
| **Kualitas & Testing** | Unit test untuk perhitungan *match score* (Smart Matching) dan struktur pasal PDF (SPK Generator); E2E test alur klaim garansi end-to-end (sub-bab 8.5); test RBAC memastikan `CS` tidak dapat mengakses endpoint finansial dan `CLIENT` hanya melihat data kontrak miliknya sendiri. |
| **Zona Waktu** | Seluruh logika bisnis berbasis tanggal (garansi, H-30/H-14/H-7, EXPIRING_SOON, auto-COMPLETED, purge) dihitung pada zona **Asia/Makassar**, meski cron berjalan di UTC. |
| **Bahasa Antarmuka** | Seluruh UI, email, dan dokumen PDF (SPK/kuitansi) berbahasa Indonesia formal. Label status enum ditampilkan lewat satu kamus label terpusat (mis. `STANDBY` → "Siap Tugas"). |

---

## 9.5 Kepatuhan UU PDP (Perlindungan Data Pribadi)

| Aspek | Kebijakan |
|---|---|
| **Consent Pekerja** | Saat registrasi *dossier*, pekerja wajib memberikan persetujuan digital (*checkbox* + rekam waktu) atas pengumpulan & pemrosesan data pribadi spesifik: KTP, KK, data medis (MCU), dan foto profil. Tanpa consent, form tidak dapat disimpan. |
| **Minimalisasi Data** | Data sensitif (NIK, KK, MCU) hanya tampil pada role yang berhak (`CLIENT` pemilik kontrak, `CS`, `SUPER_ADMIN`) dan selalu melalui lapisan *watermark*. Katalog publik hanya menampilkan data tersanitasi. |
| **Retensi Data** | Dokumen kontrak & SPK disimpan minimal 5 tahun sesuai kebutuhan legal. Data pekerja non-aktif (*soft delete*, `deletedAt` terisi) di-*purge* permanen oleh **Daily Automation Job** setelah 2 tahun tanpa aktivitas penempatan — hapus record + asset Cloudinary, dicatat sebagai `ActivityLog` action `PURGE_WORKER`. Kontrak/SPK tidak ikut dihapus. |
| **Hak Penghapusan** | Atas permintaan resmi pekerja, Super Admin mengeksekusi penghapusan data pribadi (anonimisasi profil + *purge* dokumen), dengan pengecualian dokumen yang wajib disimpan untuk kewajiban hukum. Setiap eksekusi tercatat di `ActivityLog`. |
| **Kontrol Akses Teknis** | RBAC berjenjang ditegakkan di level *Route Handlers* & middleware: `CS` tanpa akses finansial utuh, `CLIENT` hanya data kontrak miliknya sendiri. |

---

## 10. Timeline & Milestone

| Fase | Kegiatan | Durasi |
|---|---|---|
| **Fase 1: Foundation & Public** | Setup repo, database schema, Better-Auth (3 Roles), Landing Page, & Katalog Tersanitasi. | 5 hari |
| **Fase 2: Worker Core CRUD** | Dashboard Admin, *Multi-step form* input pekerja, integrasi Cloudinary, *Smart Matching engine*. | 5 hari |
| **Fase 3: Contract & Client Portal** | Generator SPK PDF, Portal Majikan mandiri, visualisasi *countdown* garansi, pencatat log gaji. | 5 hari |
| **Fase 4: Warranty & Automations** | Sistem *ticketing* penukaran pekerja, *dispatcher* kandidat, Setup Vercel Cron & Nodemailer (H-30). | 3 hari |
| **Fase 5: Security Audit & Launch** | Implementasi *watermark* dinamis, *testing routing* RBAC, unit test smart matching & SPK generator, E2E test alur klaim garansi, optimalisasi performa, Deployment Vercel. | 2 hari |
| **Total** | | **20 hari** |

**Penempatan Pekerjaan UI Motion per Fase:**
- **Fase 1**: Motion tokens (sub-bab 6.1), setup `MotionConfig` + `LazyMotion`, animasi Landing Page & Katalog (hero staggered, count-up statistik, kartu katalog stagger + hover lift).
- **Fase 3**: Motion Portal Majikan (widget fade-in berurutan, transisi antar halaman, slide antar-step form klaim garansi).
- **Fase 4**: Motion Admin Dashboard (slide multi-step form registrasi, skeleton shimmer, modal/drawer, collapse sidebar).
- **Fase 5**: Audit aksesibilitas motion (`prefers-reduced-motion`) dan audit performa animasi sebagai bagian dari optimalisasi Lighthouse ≥ 90.

---

## 11. Kriteria Keberhasilan (Success Metrics)

- Halaman profil publik dan katalog tenaga kerja dapat diakses dengan cepat (FCP < 1.2s) dari *smartphone*.
- Form registrasi pekerja multi-tahap dapat menyimpan data berelasi sempurna ke PostgreSQL beserta gambar KTP/MCU ke Cloudinary.
- **Sistem berhasil men-generate dokumen SPK digital berformat PDF berdasarkan input data pekerja dan klien.**
- **Majikan dapat login, melihat *dashboard* pekerja aktif, dan secara mandiri mengirim tiket klaim garansi tanpa chat manual.**
- **Vercel Cron Job berhasil mendeteksi kontrak yang habis dalam 30 hari dan mengirim *template* Nodemailer otomatis tanpa intervensi manusia.**
- Super Admin dapat melihat secara presisi *audit log* apabila ada staf yang mengubah data gaji atau membatalkan kontrak.

**Metrik Bisnis:**
- Jumlah penempatan baru per bulan (target awal: tumbuh konsisten dari baseline bulan pertama operasional).
- Tingkat klaim garansi ≤ 20% dari kontrak aktif — indikator kualitas *smart matching*.
- Retensi perpanjangan kontrak ≥ 50% — diukur dari proporsi kontrak baru yang memiliki `renewedFromContractId`.

---

## 12. Risks & Mitigation

| Risiko | Mitigasi |
|---|---|
| **Kebocoran Data Kependudukan (KTP/KK)** | Implementasi *dynamic watermarking*, proteksi ketat via *Route Handlers* Next.js, hanya majikan bersangkutan yang bisa akses dokumen. |
| **Materai Fisik** | SPK digenerate sebagai PDF bermaterai **fisik**: dokumen dicetak, area materai ditandai, dimaterai & ditandatangani oleh CS sebagai wakil agensi, lalu hasil cetakan diarsipkan ke Cloudinary (`spkStampedUrl`). Versi PDF digital yang diunduh majikan bukan pengganti keabsahan hukum. |
| **Kapasitas / Limit Pengiriman Email** | *Rate limiting* pada fitur reset password; integrasi status flag pengiriman di database (`isH30Notified`) agar satu tiket hanya memicu satu email. |
| **Perubahan Kesepakatan SPK Manual** | Menyediakan fitur *Additional Clauses* berupa teks kustom sebelum PDF di-*generate*. |
| **Akses Nakal Staf Internal** | Menerapkan modul *Activity Log* yang mencatat IP, role, dan stempel waktu (yang tak bisa dihapus oleh CS). |

---

## 13. Glossary

| Istilah | Definisi |
|---|---|
| **Dossier** | Kumpulan rekam jejak digital lengkap dari seorang pekerja (profil, sejarah medis, riwayat kerja). |
| **SPK** | Surat Perjanjian Kerja — dokumen kontrak bermaterai yang mengikat majikan dan pihak agensi. |
| **MCU** | *Medical Check-Up* — uji kesehatan resmi untuk membuktikan pekerja bebas dari penyakit menular/kronis. |
| **RBAC** | *Role-Based Access Control* — pembatasan akses data berdasarkan peran (*Client, CS, Super Admin*). |
| **Watermark** | Cap/tulisan transparan pada sebuah gambar digital untuk mencegah penyalahgunaan dokumen. |
| **Smart Matching** | Proses pemfilteran terstruktur dari *database* pekerja berdasarkan rentang kebutuhan klien. |
| **Renewal** | Perpanjangan kontrak yang dieksekusi sebagai kontrak baru dengan nomor SPK baru; kontrak lama berstatus `COMPLETED` dan terhubung via `renewedFromContractId`. |
| **Invoice / Kuitansi** | Dokumen pembayaran penempatan yang dibuat otomatis berstatus `DRAFT` saat SPK dirilis dan dikonfirmasi `PAID` oleh Super Admin. |
| **Garansi** | Periode hak klaim penukaran sejak `startDate` kontrak; berjalan paralel dan tidak reset oleh penukaran dalam kontrak yang sama. |
| **Kuota Tukar** | Sisa hak penukaran: `maxReplacements` − `replacementsUsed`. |
| **Klaim Garansi** | Tiket komplain/pengajuan penukaran (`WarrantyClaim`) dengan siklus status PENDING → IN_REVIEW → CANDIDATES_OFFERED → RESOLVED/REJECTED. |
| **Replacement** | Penukaran pekerja di tengah kontrak: kontrak lama `TERMINATED`, dibuat draft kontrak baru untuk pekerja pengganti. |
| **Match Score** | Skor kecocokan 0–100 antara kriteria majikan dan kandidat (Lampiran A). |
| **Kandidat** | Pekerja berstatus `STANDBY` yang tampil di katalog publik tersanitasi. |
| **INTERVIEW** | Status pekerja saat proses booking via WhatsApp sedang berjalan; diatur manual oleh CS. |
| **ON_LEAVE** | Status pekerja cuti dengan kontrak masih aktif. |
| **Purge** | Penghapusan permanen data pekerja + asset Cloudinary oleh Daily Automation Job sesuai kebijakan retensi. |

---

## 14. Lampiran

### Lampiran A — Algoritma Match Score (Smart Matching)

Gerbang keras (hard gate) — kandidat keluar dari hasil bila gagal:
- `status = STANDBY` DAN `deletedAt IS NULL`
- `category` = kategori yang diminta kriteria

Skor komponen (0–100 tiap komponen, lalu diboboti):

| Komponen | Bobot | Aturan deterministik |
|---|---|---|
| Pengalaman relevan | 30 % | `min(jumlah WorkerExperience relevan kategori, 2) / 2 × 100` (relevan = `position` terpetakan ke kategori) |
| Kesesuaian gaji | 25 % | `expectedSalary ≤ budgetMax` → 100; `≤ budgetMax × 1,1` → 50; selain itu 0 |
| Sistem kerja (stayIn) | 15 % | Sama dengan kriteria → 100, beda → 0 |
| Rentang usia | 10 % | Dalam `[ageMin, ageMax]` → 100; selisih ≤ 2 tahun dari tepi rentang → 50; selain itu 0 |
| Toleransi hewan | 10 % | Jika kriteria membutuhkan: `petTolerance` ? 100 : 0; jika tidak: 100 |
| Kesediaan luar kota | 10 % | Pola sama dengan toleransi hewan |

`MatchScore = round(Σ bobot × nilai)`. Hasil diurutkan menurun, tanpa cutoff minimum
(keputusan final tetap di CS). Setiap komponen wajib unit test terpisah.

### Lampiran B — Seed Data Skill Awal

MPASI, Memasak Harian, Setrika Uap, Bersih-bersih Rumah, Perawatan Bayi,
Perawatan Lansia, Bedridden Care, Pertolongan Pertama (First Aid), Menjahit,
Mengemudi Mobil, Bahasa Inggris Dasar, Mengurus Hewan Peliharaan.
(Daftar hanya titik awal; CRUD oleh Super Admin.)

### Lampiran C — Environment Variables

`DATABASE_URL`, `DIRECT_URL` (bila pakai connection pooling),
`BETTER_AUTH_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER`,
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `CRON_SECRET`,
`SEED_SUPER_ADMIN_EMAIL`, `SEED_SUPER_ADMIN_PASSWORD`.   — dipakai seeder bootstrap admin (lihat 7.1)

---

*Dokumen ini disusun sebagai panduan teknis dan strategis pengembangan platform digital CV Restu Bunda Mariyati.*