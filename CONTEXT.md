# CV Restu Bunda Mariyati — Platform Penempatan Tenaga Kerja

Platform agensi penempatan pekerja rumah tangga: katalog publik tersanitasi, portal majikan, dan backoffice operasional (CS & Super Admin).

## Language

### Orang & Peran

**Majikan**:
Pihak yang memakai jasa penempatan dan memiliki akun `CLIENT` di portal.
_Avoid_: customer, pembeli, user (untuk konteks bisnis)

**Pekerja**:
Individu yang didata lengkap (dossier) dan ditempatkan ke majikan.
_Avoid_: karyawan, pegawai, ART (ART adalah salah satu kategori, bukan sinonim)

**Kandidat**:
Pekerja berstatus `STANDBY` yang tampil di katalog publik.
_Avoid_: calon pekerja, profil standby

**CS**:
Staf operasional yang mengelola dossier, kontrak, dan tiket klaim.
_Avoid_: admin (dipakai umum, ambigu dengan Super Admin)

### Profil & Dokumen

**Dossier**:
Berkas digital lengkap satu pekerja: identitas, medis (MCU), riwayat kerja, dokumen legal.
_Avoid_: profil (profil = subset ringkas)

**Sanitized Profile**:
Profil ringkas tanpa data sensitif (NIK, alamat lengkap, dokumen) untuk katalog publik.
_Avoid_: profil publik, profil singkat

**SPK**:
Surat Perjanjian Kerja — dokumen kontrak bermaterai yang mengikat majikan dan agensi; satu SPK per kontrak, bernomor unik.
_Avoid_: kontrak kerja (longgar), agreement

**Invoice / Kuitansi**:
Dokumen pembayaran penempatan; lahir otomatis `DRAFT` saat SPK dirilis, dikonfirmasi `PAID` oleh Super Admin.
_Avoid_: tagihan (untuk dokumen resmi), receipt

### Kontrak & Garansi

**Penempatan (Placement)**:
Proses memasangkan pekerja ke majikan melalui kontrak aktif; pekerja berubah `PLACED`.
_Avoid_: deal, booking (booking = tahap pra-kontrak via WhatsApp)

**Booking**:
Permintaan awal calon majikan via WhatsApp sebelum ada akun/kontrak.
_Avoid_: order, reservasi

**Garansi**:
Periode hak klaim penukaran majikan, berjalan paralel sejak `startDate` kontrak; tidak reset oleh penukaran dalam kontrak yang sama.
_Avoid_: masa guarantee, warranty period

**Kuota Tukar**:
Jumlah penukaran yang masih boleh dilakukan (`maxReplacements` − `replacementsUsed`).
_Avoid_: saldo garansi, jatah

**Klaim Garansi (Tiket)**:
Pengajuan komplain/penukaran pekerja oleh majikan; punya siklus status `PENDING → IN_REVIEW → CANDIDATES_OFFERED → RESOLVED/REJECTED`.
_Avoid_: komplain (subset), refund

**Tawaran Pengganti (ReplacementOffer)**:
Kandidat pengganti yang ditawarkan CS pada sebuah klaim; respons majikan ACCEPTED/REJECTED.
_Avoid_: dispatch (dispatch adalah aksi menawarkan), usulan

**Replacement**:
Penukaran pekerja di tengah kontrak: kontrak lama `TERMINATED`, kuota tukar berkurang, dibuat draft kontrak baru untuk pekerja pengganti.
_Avoid_: mutasi, transfer

**Renewal**:
Perpanjangan kontrak sebagai kontrak BARU (nomor SPK baru); kontrak lama `COMPLETED`; terhubung via `renewedFromContractId`.
_Avoid_: perpanjangan kontrak lama (bukan extension di dokumen sama)

### Operasional

**Match Score**:
Skor kecocokan 0–100 antara kriteria majikan dan kandidat (kategori sebagai gerbang keras, sisanya berbobot).
_Avoid_: rating (rating = evaluasi kinerja), persen cocok

**Evaluasi Bulanan**:
Rating 1–5 oleh majikan atas kinerja pekerja per bulan kontrak.
_Avoid_: review, testimoni (testimoni = entri manual Super Admin untuk landing page)

**Testimoni**:
Entri manual Super Admin untuk slider landing page, bersumber bebas (evaluasi/chat); tanpa relasi ke akun.
_Avoid_: ulasan klien otomatis

**Blacklist**:
Status pekerja yang dilarang ditempatkan; hanya Super Admin.
_Avoid_: banned, blokir

**Soft Delete & Purge**:
Soft delete menandai `deletedAt`; purge menghapus permanen record + asset Cloudinary (retensi 2 tahun tanpa aktivitas), dieksekusi job harian dan dicatat di ActivityLog.
_Avoid_: hard delete (istilah UI saja), hapus (ambigu)

**Job Harian**:
Satu automation Vercel Cron (09:00 WITA) yang menjalankan: email H-30/H-14/H-7, transisi status kontrak, auto-complete, dan purge retensi.
_Avoid_: cron email (hanya subset)
