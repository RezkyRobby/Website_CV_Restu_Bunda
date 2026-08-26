import { Navbar } from "@/components/landing/navbar";
import { CtaBand } from "@/components/landing/cta-band";

/**
 * Legalitas — PRD §5.1 #5
 * Informasi legalitas CV, izin usaha, dan keabsahan dokumen SPK.
 */
export default function LegalitasPage() {
  return (
    <main className="min-h-screen bg-[#F8E7C9]">
      <Navbar />

      <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#064E3B]">Legalitas</p>
        <h1 className="mt-2 max-w-3xl text-[32px] font-semibold leading-tight text-[#26221B] sm:text-[40px]">
          Legalitas yang jelas untuk penempatan yang aman.
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#6F675A]">
          Seluruh proses penempatan CV Restu Bunda Mariyati mengacu pada dokumen resmi dan
          perjanjian yang sah. Halaman ini merangkum informasi legalitas perusahaan dan keabsahan
          dokumen penempatan.
        </p>
      </section>

      {/* Kartu dokumen legalitas — DESIGN.md §10: kartu dokumen bergaya (ikon + nama), bukan embed kasar */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <h2 className="text-lg font-semibold text-[#26221B]">Dokumen Legalitas Perusahaan</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6F675A]">
          Dokumen di bawah ini adalah representasi informasi legalitas. Scan atau salinan resmi
          dapat dimintakan melalui CS saat proses penempatan.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Akta Pendirian CV",
              desc: "Dokumen pendirian badan usaha yang menjadi dasar operasional agensi.",
            },
            {
              name: "Nomor Induk Berusaha (NIB)",
              desc: "Tanda daftar usaha yang diterbitkan melalui sistem OSS.",
            },
            {
              name: "Izin Usaha Penempatan",
              desc: "Izin operasional penempatan tenaga kerja sesuai ketentuan yang berlaku.",
            },
          ].map((doc) => (
            <div
              key={doc.name}
              className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-[#DCEDE6] text-[#064E3B]">
                <span aria-hidden>▭</span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[#26221B]">{doc.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6F675A]">{doc.desc}</p>
              <p className="mt-3 inline-flex rounded-full bg-[#F3EAD8] px-2.5 py-1 text-xs text-[#26221B]">
                Tersedia via CS
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SPK & Materai */}
      <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[#26221B]">SPK Bermaterai Rp10.000</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6F675A]">
              Setiap penempatan diterbitkan Surat Perjanjian Kerja (SPK) dengan nomor unik
              berformat <span className="font-medium text-[#26221B]">SPK/YYYY/NNNN</span>. Dokumen
              menyediakan area materai fisik Rp10.000. Versi cetak yang telah dimaterai dan
              ditandatangani para pihak adalah dokumen yang sah secara hukum; salinan digital di
              portal Majikan adalah arsip pra-materai.
            </p>
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#6F675A]">
              <li>Nomor SPK digenerate transaksional agar bebas duplikasi antar CS.</li>
              <li>Pasal pembayaran mencantumkan nominal biaya penempatan secara eksplisit.</li>
              <li>Arsip hasil cetak-materai disimpan di sistem (spkStampedUrl).</li>
            </ul>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[#26221B]">Perlindungan Data Pribadi</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6F675A]">
              Pengumpulan dan pemrosesan data Pekerja tunduk pada persetujuan eksplisit (consent)
              sesuai UU PDP. Form registrasi Pekerja wajib mencentang persetujuan dan mencatat
              waktu persetujuan (<span className="font-medium text-[#26221B]">dataConsentAt</span>);
              tanpa itu data tidak dapat disimpan. Katalog publik hanya menampilkan profil
              tersanitasi tanpa NIK, alamat lengkap, atau URL dokumen mentah.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#6F675A]">
              Dokumen sensitif hanya dapat diakses Majikan pemilik kontrak aktif melalui portal
              dengan watermark dinamis.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mx-auto max-w-[1200px] px-4 pb-10 sm:px-6 lg:pb-14">
        <div className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#26221B]">Catatan</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6F675A]">
            Informasi di halaman ini bersifat informatif. Untuk verifikasi legalitas dan permintaan
            salinan dokumen resmi, silakan hubungi CS melalui WhatsApp. Detail alamat kantor dan
            jadwal kunjungan akan diinformasikan oleh CS.
          </p>
        </div>
      </section>

      <CtaBand />
    </main>
  );
}
