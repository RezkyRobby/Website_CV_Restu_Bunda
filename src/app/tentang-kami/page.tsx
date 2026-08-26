import { Navbar } from "@/components/landing/navbar";
import { CtaBand } from "@/components/landing/cta-band";

/**
 * Profil Perusahaan — PRD §5.1 #5
 * Informasi CV, visi-misi, nilai, dan struktur perusahaan.
 * DESIGN.md: kanvas Champagne, kartu putih, Emerald aksi, tap target ≥44px.
 */
export default function TentangKamiPage() {
  return (
    <main className="min-h-screen bg-[#F8E7C9]">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#064E3B]">
          Tentang Kami
        </p>
        <h1 className="mt-2 max-w-3xl text-[32px] font-semibold leading-tight text-[#26221B] sm:text-[40px]">
          CV Restu Bunda Mariyati — pendamping rumah tangga yang resmi dan terpercaya.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#6F675A]">
          Kami adalah agensi penempatan tenaga kerja rumah tangga yang berfokus pada Baby Sitter,
          Asisten Rumah Tangga, Perawat Lansia, dan Supir. Setiap kandidat melalui verifikasi
          dokumen, wawancara, dan pencocokan kriteria Majikan sebelum penempatan.
        </p>
      </section>

      {/* Visi & Misi */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[#26221B]">Visi</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6F675A]">
              Menjadi agensi penempatan tenaga kerja rumah tangga yang paling dipercaya keluarga
              Indonesia — melalui proses yang resmi, transparan, dan berorientasi pada keamanan
              Majikan dan kesejahteraan Pekerja.
            </p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[#26221B]">Misi</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#6F675A]">
              <li>Menyeleksi kandidat secara ketat: verifikasi SKCK, MCU, dan referensi kerja.</li>
              <li>Mencocokkan kandidat dengan kriteria Majikan secara deterministik dan transparan.</li>
              <li>Menerbitkan SPK bermaterai dan mengelola siklus kontrak secara profesional.</li>
              <li>Memberikan garansi penukaran yang jelas dan layanan purna penempatan yang tanggap.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Nilai */}
      <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        <h2 className="text-lg font-semibold text-[#26221B]">Nilai yang Kami Pegang</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Resmi & Terpercaya",
              desc: "Legalitas jelas, SPK bermaterai, dan proses yang dapat dipertanggungjawabkan.",
            },
            {
              title: "Hangat & Kekeluargaan",
              desc: "Pendekatan yang humanis — menempatkan kecocokan karakter dan kenyamanan rumah.",
            },
            {
              title: "Tenang & Tertata",
              desc: "Komunikasi yang terstruktur, jadwal yang jelas, dan dukungan CS yang responsif.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6"
            >
              <h3 className="text-sm font-semibold text-[#26221B]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6F675A]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Struktur & Alamat */}
      <section className="mx-auto max-w-[1200px] px-4 pb-10 sm:px-6 lg:pb-14">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[#26221B]">Struktur Perusahaan</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex justify-between gap-4 border-b border-[#E3D5BC] pb-3">
                <span className="text-[#6F675A]">Pimpinan</span>
                <span className="font-medium text-[#26221B]">CV Restu Bunda Mariyati</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-[#E3D5BC] pb-3">
                <span className="text-[#6F675A]">Operasional</span>
                <span className="font-medium text-[#26221B]">Tim CS Penempatan</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-[#6F675A]">Layanan</span>
                <span className="font-medium text-[#26221B]">Baby Sitter · ART · Lansia · Supir</span>
              </li>
            </ul>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[#26221B]">Alamat Kantor</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6F675A]">
              Kantor operasional CV Restu Bunda Mariyati berlokasi di wilayah layanan penempatan.
              Alamat lengkap, jam operasional, dan kontak WhatsApp tersedia melalui CS setelah
              konsultasi awal. Hubungi kami via WhatsApp untuk informasi alamat dan jadwal kunjungan.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6280000000000"}?text=${encodeURIComponent("Halo CV Restu Bunda Mariyati, saya ingin mengetahui alamat kantor dan jadwal kunjungan.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-pill)] bg-[#064E3B] px-6 text-sm font-medium text-white hover:bg-[#05382B]"
            >
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
