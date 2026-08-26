import { Navbar } from "@/components/landing/navbar";
import { CtaBand } from "@/components/landing/cta-band";

/**
 * Prosedur Penempatan Resmi — PRD §5.1 #5
 * Alur 4 langkah + detail garansi, renewal, dan tanggung jawab para pihak.
 */

const STEPS = [
  {
    n: "01",
    title: "Konsultasi Kebutuhan",
    desc: "Majikan menyampaikan kriteria: kategori pekerja (Baby Sitter / ART / Perawat Lansia / Supir), preferensi usia, suku, toleransi hewan, kesediaan luar kota, jadwal tinggal, dan ekspektasi gaji. Konsultasi via WhatsApp atau kunjungan ke kantor.",
    detail: "CS mencatat kebutuhan secara terstruktur untuk proses pencocokan.",
  },
  {
    n: "02",
    title: "Pencocokan Kandidat",
    desc: "CS menyaring kandidat berstatus Siap Tugas (STANDBY) sesuai hard gate kategori dan kriteria lainnya. Hasil diurutkan berdasarkan skor kecocokan tanpa cutoff minimum.",
    detail: "Katalog publik dapat dilihat di /katalog; data sensitif tidak ditampilkan.",
  },
  {
    n: "03",
    title: "Wawancara & Kesepakatan",
    desc: "Majikan bertemu kandidat (langsung atau daring), menyepakati gaji, durasi kontrak (min. 3 bulan), biaya penempatan, masa garansi (default 90 hari), dan kuota tukar (default 2).",
    detail: "Tanggal selesai kontrak dipreview otomatis dari durasi bulan. Klausul tambahan dapat dicantumkan.",
  },
  {
    n: "04",
    title: "Rilis SPK & Penempatan",
    desc: "CS merilis SPK: nomor SPK digenerate transaksional, status pekerja menjadi Ditempatkan (PLACED), dan invoice biaya penempatan berstatus DRAFT lahir otomatis. Dokumen dicetak, dimaterai Rp10.000, dan arsipnya disimpan.",
    detail: "Majikan menerima akun portal (dibuat atau dipakai ulang by email/telepon) untuk akses SPK, countdown kontrak, dan kuota tukar.",
  },
] as const;

export default function ProsedurPage() {
  return (
    <main className="min-h-screen bg-[#F8E7C9]">
      <Navbar />

      <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#064E3B]">
          Prosedur Penempatan
        </p>
        <h1 className="mt-2 max-w-3xl text-[32px] font-semibold leading-tight text-[#26221B] sm:text-[40px]">
          Alur yang jelas dari konsultasi hingga penempatan.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#6F675A]">
          Prosedur resmi CV Restu Bunda Mariyati dirancang agar Majikan dan Pekerja memahami hak
          dan kewajiban sejak awal — termasuk garansi penukaran dan perpanjangan kontrak.
        </p>
      </section>

      {/* Timeline 4 langkah */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <ol className="grid gap-4 lg:grid-cols-2">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6 sm:p-8"
            >
              <p className="tabular-nums text-xs font-semibold tracking-widest text-[#064E3B]">
                Langkah {s.n}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[#26221B]">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#6F675A]">{s.desc}</p>
              <p className="mt-3 rounded-[var(--radius-input)] bg-[#F8E7C9]/50 px-3 py-2 text-xs leading-relaxed text-[#6F675A]">
                {s.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Garansi, Renewal, Tanggung jawab */}
      <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6">
            <h3 className="text-sm font-semibold text-[#26221B]">Garansi Penukaran</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6F675A]">
              Garansi berjalan paralel sejak tanggal mulai kontrak (startDate + warrantyDays) dan
              tidak di-reset oleh penukaran dalam kontrak yang sama. Klaim otomatis ditolak bila
              kuota habis atau masa garansi telah lewat. Maksimal satu klaim aktif per kontrak.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6">
            <h3 className="text-sm font-semibold text-[#26221B]">Perpanjangan (Renewal)</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6F675A]">
              Perpanjangan adalah kontrak baru dengan nomor SPK baru; kontrak lama menjadi Selesai
              (COMPLETED). Flag notifikasi kontrak baru mulai fresh, dan relasi dicatat via
              renewedFromContractId. Pengingat H-30 / H-14 / H-7 dikirim otomatis via email.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6">
            <h3 className="text-sm font-semibold text-[#26221B]">Hak & Kewajiban</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6F675A]">
              Majikan mencatat pembayaran gaji dan evaluasi bulanan (rating 1–5) di portal. Agensi
              menjaga kerahasiaan data dan hanya menampilkan profil tersanitasi di katalog publik.
              Dokumen sensitif diakses via portal dengan watermark dinamis.
            </p>
          </div>
        </div>
      </section>

      {/* CTA kecil */}
      <section className="mx-auto max-w-[1200px] px-4 pb-10 sm:px-6 lg:pb-14">
        <div className="flex flex-wrap gap-3">
          <a
            href="/katalog"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-pill)] border border-[#064E3B] bg-white px-6 text-sm font-medium text-[#064E3B] hover:bg-[#DCEDE6]"
          >
            Lihat Katalog Kandidat
          </a>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6280000000000"}?text=${encodeURIComponent("Halo CV Restu Bunda Mariyati, saya ingin bertanya mengenai prosedur penempatan.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-pill)] bg-[#064E3B] px-6 text-sm font-medium text-white hover:bg-[#05382B]"
          >
            Konsultasi via WhatsApp
          </a>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
