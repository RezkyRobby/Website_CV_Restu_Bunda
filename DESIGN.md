# DESIGN.md — Sumber Kebenaran Desain Visual
## Platform CV Restu Bunda Mariyati

> **Tema:** light · hangat · resmi-terpercaya
> **Arah referensi:** struktur naratif landing ala care.com/senior-care (hero janji nilai → layanan → cara kerja → verifikasi → testimoni → FAQ → CTA), dengan disiplin satu warna aksi ala Mercury.
> **Status:** Disetujui sebagai basis token. Perubahan warna/font wajib dicatat di bagian Riwayat.

---

## 1. Brand Overview

Platform ini menjual **kepercayaan**: majikan menitipkan orang asing ke dalam rumahnya. Seluruh keputusan visual melayani tiga kesan berikut, sesuai urutan prioritas:

1. **Resmi & terpercaya** — seperti lembaga penempatan yang legal dan bermaterai, bukan startup yang playful.
2. **Hangat & kekeluargaan** — nuansa "rumah", bukan korporat dingin.
3. **Tenang & tertata** — animasi halus, ruang lega, satu warna aksi; tidak ada elemen yang berteriak.

**Disiplin utama:** *Emerald Ink adalah satu-satunya warna kromatik untuk aksi.* Hijau hanya dipakai pada tombol primer, link aktif, momen konversi, dan band brand. Warna lain di halaman hanyalah netral hangat (champagne/sand/ink) plus warna status yang fungsional. Melanggar disiplin ini = bug desain.

---

## 2. Tokens — Colors

| Nama | Hex | Token | Peran |
|------|-----|-------|-------|
| Champagne Canvas | `#F8E7C9` | `--color-champagne-canvas` | Kanvas halaman publik; band section selang-seling; footer |
| Card Surface | `#FFFFFF` | `--color-card-surface` | Permukaan kartu, form, tabel — naik satu tingkat dari kanvas |
| Warm Sand | `#F3EAD8` | `--color-warm-sand` | Isi tombol sekunder, latar input, hover baris tabel |
| Hairline Border | `#E3D5BC` | `--color-hairline-border` | Divider & border tipis kartu putih di atas champagne |
| Deep Ink | `#26221B` | `--color-deep-ink` | Teks utama, ikon — cokelat tinta hangat, bukan abu dingin |
| Muted Ink | `#6F675A` | `--color-muted-ink` | Teks sekunder, helper text, placeholder |
| Emerald Ink | `#064E3B` | `--color-emerald-ink` | **Warna aksi & brand**: tombol primer, link, band hero/footer, fokus |
| Emerald Deep | `#05382B` | `--color-emerald-deep` | Hover/active tombol & link primer |
| Emerald Soft | `#DCEDE6` | `--color-emerald-soft` | Latar badge sukses/terverifikasi, highlight lembut |
| Pure White | `#FFFFFF` | `--color-pure-white` | Teks & ikon di atas Emerald Ink |

### Warna Status (fungsional — pasangan teks/latar)

Wajib lewat kamus label enum terpusat (`src/messages/`); dilarang hardcode per komponen.

| Makna | Teks | Latar Badge | Token |
|-------|------|-------------|-------|
| Sukses / Aktif / `STANDBY` / `ACTIVE` / `PAID` | `#064E3B` | `#DCEDE6` | `--color-status-success` / `-bg` |
| Menunggu / `PENDING` / `IN_REVIEW` / `EXPIRING_SOON` / `INTERVIEW` | `#8A4B08` | `#FBEEDC` | `--color-status-warning` / `-bg` |
| Gagal / `REJECTED` / `TERMINATED` / `BLACKLIST` | `#9C2020` | `#FAE7E6` | `--color-status-danger` / `-bg` |
| Informasi / `ON_LEAVE` / `DRAFT` | `#1E4FBF` | `#E8EFFC` | `--color-status-info` / `-bg` |
| Netral / `COMPLETED` / `RESOLVED` | `#57534E` | `#F0EEE9` | `--color-status-neutral` / `-bg` |

### Kontras (sudah diverifikasi)

| Kombinasi | Rasio | Level WCAG |
|---|---|---|
| Emerald Ink di atas Champagne | ≈ 7.9 : 1 | AAA (teks normal) |
| Putih di atas Emerald Ink (tombol) | ≈ 9.6 : 1 | AAA |
| Deep Ink di atas Putih/Champagne | > 12 : 1 | AAA |
| Muted Ink di atas Putih | ≈ 5.5 : 1 | AA |

Aturan: aksen champagne/sand **tidak boleh** dipakai sebagai warna teks kecil di atas putih.

---

## 3. Tokens — Typography

Satu keluarga font: **Plus Jakarta Sans** (Google Fonts, dimuat via `next/font/google`, subset latin). Karakternya modern-resmi dan nyaman untuk teks Bahasa Indonesia. Dilarang menambah keluarga lain tanpa alasan tercatat.

### Skala Type

| Role | Ukuran | Line Height | Weight | Token |
|------|--------|-------------|--------|-------|
| caption | 12px | 1.35 | 500 | `--text-caption` |
| body-sm | 14px | 1.45 | 400 | `--text-body-sm` |
| body | 16px | 1.55 | 400 | `--text-body` |
| body-lg | 18px | 1.5 | 400 | `--text-body-lg` |
| subheading | 21px | 1.35 | 500 | `--text-subheading` |
| heading-sm | 24px | 1.25 | 600 | `--text-heading-sm` |
| heading | 32px | 1.2 | 600 | `--text-heading` |
| heading-lg | 42px | 1.15 | 600 | `--text-heading-lg` |
| display | clamp(36px → 56px) responsif | 1.1 | 600 | `--text-display` |

Catatan:
- Heading maksimal weight **600** — tidak ada 700+. "Tegas tanpa berteriak."
- Semua angka dinamis (countdown kontrak, statistik, nominal rupiah, nomor dokumen) memakai `font-variant-numeric: tabular-nums`.
- Base UI = 14–16px. Teks lebih kecil dari 12px dilarang.

---

## 4. Tokens — Spacing & Shapes

Base unit **4px**. Density **spacious** di publik, **compact** di admin.

| Spacing | 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 72 · 96 |

| Radius | Nilai | Dipakai untuk |
|--------|-------|---------------|
| pill | 32px (`--radius-pill`) | Tombol, nav item, tag/filter chip, badge |
| card | 16px (`--radius-card`) | Kartu, panel, modal |
| input | 12px (`--radius-input`) | Input & select form (portal/admin) |
| default | 8px | Elemen struktural kecil |

| Layout | Nilai |
|--------|-------|
| Page max-width | 1200px |
| Section gap desktop | 72px vertikal |
| Section gap mobile (375px) | 40–48px vertikal |
| Card padding | 24px (mobile) / 32px (desktop) |
| Tap target minimum | **44 × 44px** (non-negotiable, NFR §9) |

---

## 5. Komponen Kunci

### 5.1 Primary Button — Emerald (aksi utama)

Fill `#064E3B`, teks putih 16px weight 500, radius pill, tinggi 44–48px, padding horizontal 24px. Tanpa border, tanpa shadow. Hover → `#05382B` (transisi `fast`). Dipakai untuk **satu aksi primer per konteks**: "Booking via WhatsApp", "Lihat Kandidat", "Rilis SPK". Ikon WhatsApp putih di sisi kiri teks untuk CTA booking.

### 5.2 Secondary Button — Outline Emerald

Latar transparan, border 1px `#064E3B`, teks Emerald 16px weight 500, radius pill, tinggi 44px. Untuk aksi kedua ("Pelajari Prosedur", "Unduh SPK"). Varian ketiga: fill Warm Sand + teks Deep Ink untuk aksi tersier/tabel.

### 5.3 Navigation Bar

Transparan mengambang di atas hero → saat scroll menjadi latar champagne `backdrop-blur(8px)` + border bawah hairline. Logo kiri, nav link tengah (teks Deep Ink, item aktif Emerald + underline offset), kanan: link "Masuk" + Primary Button "Konsultasi via WA". Mobile: logo + hamburger; menu drawer slide dari kanan (`base`).

### 5.4 Hero Landing

Split dua kolom desktop, stack mobile. Kiri: eyebrow kecil Emerald ("Agensi Penempatan Resmi"), display headline, body-lg Muted Ink, dua CTA (Primary WA + Secondary katalog). Kanan: foto suasana keluarga/pengasuh Indonesia, radius card, tanpa overlay gelap berat. Di bawah hero: **strip statistik** 3 angka besar (kontrak selesai, kandidat siap tugas, tahun pengalaman) — angka Emerald, label Muted Ink, count-up saat masuk viewport, fallback nilai minimum saat DB kosong (PRD §5.1).

### 5.5 Kartu Kandidat (Katalog)

Foto potret **3:4** di atas (radius atas card, objek cover, cerah), badan kartu putih padding 20px: nama panggilan (subheading), "usia · suku" (body-sm Muted), maksimal 3 chip keahlian (Warm Sand, radius pill, body-sm), deretan **Badge Verifikasi** (SKCK/MCU — lihat 5.6), lalu Primary Button full-width "Booking via WhatsApp" (≥44px) yang membuka wa.me dengan template pesan nama panggilan + id kandidat. Hover lift -4px (`fast`). Kartu **tidak boleh** merender NIK, alamat, atau URL dokumen mentah.

### 5.6 Badge Verifikasi & Badge Status

Verifikasi: ikon centang + teks "SKCK ✓" / "MCU ✓" — Emerald Soft background, teks Emerald, radius pill, caption. Belum verifikasi: netral abu "Belum Ada". Badge status enum (pekerja/kontrak/klaim/invoice) selalu dari pasangan warna status §2 + label dari kamus terpusat.

### 5.7 Kartu Widget Portal Majikan

Kartu putih radius card, judul caption uppercase Muted Ink, **angka besar** (heading-lg, tabular-nums): sisa hari kontrak, kuota tukar tersisa, gaji bulan ini. Countdown kontrak adalah elemen paling menonjol di dashboard. Sisa ≤ 30 hari: angka berubah warna-warning + badge "Segera Berakhir".

### 5.8 Slider Testimoni

Kartu tunggal besar (maks 720px) di band champagne: foto bulat 56px, clientName + clientOrigin, rating bintang Emerald, kutipan body-lg italic ringan. Crossfade antar-slide (`AnimatePresence mode="wait"`), dot navigation pill, autoplay 6 detik, pause saat hover/fokus. Hanya testimoni `isPublished`.

### 5.9 Accordion FAQ

Border-top hairline antar item, ikon chevron rotasi 180° (`base`), konten expand hanya opacity+height-mask via transform-safe pattern. Dipakai untuk menjawab garansi, prosedur penempatan, legalitas.

### 5.10 Band CTA Akhir & Footer

Band penuh Emerald Ink: headline putih, satu Primary Button varian inversi (fill putih, teks Emerald). Footer di band yang sama: kolom navigasi putih/opasitas 70%, disclaimer legalitas CV caption. Halaman publik ditutup band ini — bukan footer putih datar.

### 5.11 Pola Admin & Portal (internal)

Netral: kanvas **putih**, sidebar Warm Sand/Surface dengan item aktif Emerald Soft, tabel zebra halus Warm Sand, semua badge status dari §2. Champagne **tidak dipakai** di area admin agar data padat tetap netral. Skeleton shimmer abu hangat `#EFEAE0`. Fokus keyboard: ring 2px Emerald offset 2px di seluruh aplikasi.

---

## 6. Motion Rules (merujuk PRD §6.1 — ringkas)

| Token | Durasi | Easing | Pakai untuk |
|---|---|---|---|
| `fast` | 150 ms | ease-out | hover lift, tap, toggle |
| `base` | 250 ms | ease-out | fade-in konten, toast, modal, drawer |
| `slow` | 400 ms | ease-out | entrance hero, reveal scroll |

Wajib: hanya `transform` + `opacity`; scroll-triggered pakai `whileInView` + `once: true`; komponen animasi = Client Component; `MotionConfig` + `LazyMotion` + komponen `m` (bundle ≤ 5 kb); hormati `prefers-reduced-motion`; animasi tidak boleh menunda render LCP (foto hero `priority`, tanpa entrance delay). Dilarang: spring bouncy, parallax, animasi width/height/margin/top/left.

---

## 7. Do's and Don'ts

### Do
- Gunakan Emerald Ink hanya untuk aksi primer/link/band brand — bukan dekorasi acak.
- Pisahkan permukaan lewat **perbedaan nilai** (putih di atas champagne) + border hairline — bukan drop shadow.
- Pill radius untuk semua kontrol interaktif publik (tombol, chip, nav).
- Body 16px weight 400 line-height 1.55 sebagai baseline keterbacaan.
- Jaga ritme vertikal lega (section gap 72px desktop) — kelapasan ruang merusak kesan premium.
- Selalu render label enum lewat kamus terpusat dengan pasangan warna status §2.
- Foto manusia cerah dan hangat; wajah jelas; konsistensi tone antar foto katalog.

### Don't
- Jangan menambah warna kromatik baru di luar palet §2 (larang biru/oranye dekoratif; status enum adalah pengecualian fungsional).
- Jangan pakai drop shadow besar/glow — pemisahan cukup nilai + hairline.
- Jangan pakai weight 700+ untuk heading.
- Jangan pakai champagne/sand sebagai warna teks di atas latar terang (kontras gagal).
- Jangan biarkan tap target < 44px karena styling.
- Jangan tirukan elemen Care.com mentah (logo, ilustrasi, copy) — referensi hanya arah layout & mood.
- Jangan taruh foto kandidat asli tanpa rekam consent (UU PDP); gunakan placeholder bergaya (siluet Emerald Soft + ikon) saat kosong.

---

## 8. Surfaces

| Level | Nama | Nilai | Tujuan |
|-------|------|-------|--------|
| 0 | Champagne Canvas | `#F8E7C9` | Latar dasar halaman publik, band section genap, footer |
| 0' | White Canvas | `#FFFFFF` | Latar halaman portal & admin, band section ganjil publik |
| 1 | Card Surface | `#FFFFFF` di publik / `#FFFFFF` di internal | Kartu, panel, form container |
| 2 | Warm Sand | `#F3EAD8` | Kontrol sekunder, input fill, hover state |

Publik berselang-seling: band putih ↔ band champagne untuk ritme; hero dan CTA akhir memakai band Emerald.

---

## 9. Elevation

Tanpa drop shadow. Pemisahan permukaan murni lewat kontras nilai (putih vs champagne) + border hairline `#E3D5BC`. Satu-satunya "kedalaman": overlay scrim netral (Deep Ink opasitas 40%) untuk modal/drawer. Flat = tenang = resmi.

---

## 10. Imagery

- **Hero & section publik:** fotografi manusia hangat — keluarga, pengasuh-bayi, perawat-lansia — suasana rumah Indonesia, cahaya natural, tone sedikit hangat. Tanpa filter dramatis, tanpa overlay gelap berat.
- **Kartu kandidat:** potret 3:4, latar rapi, ekspresi ramah. Foto asli hanya dengan consent tercatat (`dataConsentAt`); placeholder generik untuk kosong.
- **Legalitas:** scan dokumen/legalitas CV ditampilkan sebagai kartu dokumen bergaya (ikon + nama file), bukan embed gambar kasar.
- **Ikon:** Lucide, stroke 2px, warna mengikuti teks konteks. Ikon WhatsApp boleh glyph resmi monokrom putih/emerald.
- **Ilustrasi:** minim; jika perlu, gaya garis sederhana satu warna Emerald. Tidak ada ilustrasi 3D/klipart.
- Semua gambar melewati Cloudinary (auto WebP/AVIF, ukuran responsif).

---

## 11. Layout

Mobile-first 375px. Konten max-width 1200px. Urutan landing: Hero (Emerald aksen + foto) → Strip Statistik → Layanan Unggulan (grid 2×2 kartu putih) → Cara Kerja / Prosedur Penempatan (4 langkah bernomor Emerald) → Keamanan & Verifikasi (SKCK/MCU/SPK bermaterai — kartu ikon) → Katalog Preview (3 kartu kandidat + link "Lihat Semua") → Testimoni (band champagne) → FAQ → Band CTA Akhir (Emerald). Navigasi top-bar overlay hero. Tanpa sidebar di publik; sidebar hanya di admin.

---

## 12. Agent Prompt Guide

**Referensi warna cepat**
- Kanvas: `#F8E7C9` · Kartu: `#FFFFFF` · Aksi/brand: `#064E3B`
- Teks utama: `#26221B` · Teks redup: `#6F675A` · Border: `#E3D5BC`
- Status: success `#064E3B/#DCEDE6` · warning `#8A4B08/#FBEEDC` · danger `#9C2020/#FAE7E6` · info `#1E4FBF/#E8EFFC` · neutral `#57534E/#F0EEE9`

**Contoh prompt komponen**

1. *Kartu kandidat:* kartu putih radius 16px, foto 3:4 atas, padding 20px; nama 21px/600 Deep Ink; meta 14px Muted Ink; 3 chip Warm Sand pill; badge SKCK/MCU Emerald Soft; tombol Emerald pill full-width tinggi 48px "Booking via WhatsApp".
2. *Tombol primer:* fill `#064E3B`, teks putih 16px/500, radius 32px, tinggi 48px, hover `#05382B`, transisi 150ms ease-out, tanpa shadow.
3. *Widget countdown:* kartu putih 16px radius padding 24px; label caption uppercase `#6F675A`; angka 42px/600 tabular-nums `#064E3B`; bila ≤30 hari angka `#8A4B08` + badge warning "Segera Berakhir".
4. *Band CTA akhir:* section full-width `#064E3B`, heading 32px putih center, tombol fill putih teks Emerald pill, padding vertikal 72px.
5. *Badge status:* pill caption 500; ambil pasangan teks/latar dari kamus status; label dari `src/messages/`, jangan hardcode.

---

## 13. Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-champagne-canvas: #F8E7C9;
  --color-card-surface: #FFFFFF;
  --color-warm-sand: #F3EAD8;
  --color-hairline-border: #E3D5BC;
  --color-deep-ink: #26221B;
  --color-muted-ink: #6F675A;
  --color-emerald-ink: #064E3B;
  --color-emerald-deep: #05382B;
  --color-emerald-soft: #DCEDE6;
  --color-pure-white: #FFFFFF;

  /* Status */
  --status-success-fg: #064E3B;  --status-success-bg: #DCEDE6;
  --status-warning-fg: #8A4B08;  --status-warning-bg: #FBEEDC;
  --status-danger-fg:  #9C2020;  --status-danger-bg:  #FAE7E6;
  --status-info-fg:    #1E4FBF;  --status-info-bg:    #E8EFFC;
  --status-neutral-fg: #57534E;  --status-neutral-bg: #F0EEE9;

  /* Typography */
  --font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;

  /* Spacing & Layout */
  --page-max-width: 1200px;
  --section-gap-desktop: 72px;
  --section-gap-mobile: 48px;
  --tap-target-min: 44px;

  /* Radius */
  --radius-pill: 32px;
  --radius-card: 16px;
  --radius-input: 12px;

  /* Motion (PRD §6.1) */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

### Tailwind v4 (`@theme`)

```css
@import "tailwindcss";

@theme {
  --color-champagne: #F8E7C9;
  --color-card: #FFFFFF;
  --color-sand: #F3EAD8;
  --color-hairline: #E3D5BC;
  --color-ink: #26221B;
  --color-muted: #6F675A;
  --color-emerald-brand: #064E3B;   /* catatan: beda dari default emerald Tailwind */
  --color-emerald-deep: #05382B;
  --color-emerald-soft: #DCEDE6;

  --color-success-fg: #064E3B;  --color-success-bg: #DCEDE6;
  --color-warning-fg: #8A4B08;  --color-warning-bg: #FBEEDC;
  --color-danger-fg:  #9C2020;  --color-danger-bg:  #FAE7E6;
  --color-info-fg:    #1E4FBF;  --color-info-bg:    #E8EFFC;
  --color-neutral-fg: #57534E;  --color-neutral-bg: #F0EEE9;

  --font-sans: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;

  --radius-pill: 32px;
  --radius-card: 16px;
  --radius-input: 12px;

  --ease-brand: cubic-bezier(0, 0, 0.2, 1);
}

/* Pemetaan variabel shadcn/ui (mode terang saja di v1) */
:root {
  --background: var(--color-champagne-canvas);
  --card: var(--color-card-surface);
  --primary: var(--color-emerald-ink);
  --primary-foreground: var(--color-pure-white);
  --secondary: var(--color-warm-sand);
  --secondary-foreground: var(--color-deep-ink);
  --muted: var(--color-warm-sand);
  --muted-foreground: var(--color-muted-ink);
  --accent: var(--color-emerald-soft);
  --accent-foreground: var(--color-emerald-deep);
  --destructive: var(--status-danger-fg);
  --border: var(--color-hairline-border);
  --input: var(--color-hairline-border);
  --ring: var(--color-emerald-ink);
  --foreground: var(--color-deep-ink);
}
```

> Admin/portal memakai override lokal: `--background: var(--color-card-surface)` pada layout `(admin)` dan `(client)` agar kanvas tetap putih netral.

---

## Riwayat Keputusan

| Tanggal | Keputusan | Alasan |
|---|---|---|
| 2026-08-23 | Palet Emerald Ink `#064E3B` + Champagne `#F8E7C9`, tema light | Kontras AAA; hangat-resmi sesuai bisnis penempatan pekerja rumah tangga |
| 2026-08-23 | Struktur dokumen mengadopsi format style-reference (token → komponen → do/don't → quick start) | Mudah dikonsumsi agent & developer |
| 2026-08-23 | Referensi arah: care.com/senior-care (struktur), disiplin satu-aksi-color ala Mercury | Relevansi domain + restraint visual |
