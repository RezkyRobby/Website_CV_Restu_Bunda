import { LinkButton } from "@/components/ui/button";

/**
 * Hero landing — DESIGN.md §5.4
 * Split dua kolom desktop, stack mobile. Tanpa overlay gelap berat.
 */
export function Hero() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 lg:py-16">
      {/* Kiri: copy + CTA */}
      <div>
        <p className="mb-3 inline-flex rounded-[var(--radius-pill)] bg-[#DCEDE6] px-3 py-1 text-xs font-medium tracking-wide text-[#064E3B]">
          Agensi Penempatan Resmi
        </p>
        <h1 className="text-[clamp(32px,5vw,52px)] font-semibold leading-[1.1] tracking-tight text-[#26221B]">
          Tenaga terpercaya untuk rumah yang tenang.
        </h1>
        <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-[#6F675A]">
          Kami membantu Majikan menemukan kandidat terverifikasi — dengan SKCK, MCU, dan
          perjanjian SPK bermaterai. Proses resmi, transparan, dan bergaransi penukaran.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <LinkButton
            href={whatsappHref("Halo, saya ingin berkonsultasi mengenai penempatan pekerja di CV Restu Bunda Mariyati.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Konsultasi via WhatsApp
          </LinkButton>
          <LinkButton href="#katalog-preview" variant="secondary">
            Lihat Kandidat
          </LinkButton>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2 text-xs text-[#6F675A]">
          <li className="rounded-full bg-white px-3 py-1.5 ring-1 ring-[#E3D5BC]">SKCK Terverifikasi</li>
          <li className="rounded-full bg-white px-3 py-1.5 ring-1 ring-[#E3D5BC]">MCU Lengkap</li>
          <li className="rounded-full bg-white px-3 py-1.5 ring-1 ring-[#E3D5BC]">SPK Bermaterai</li>
          <li className="rounded-full bg-white px-3 py-1.5 ring-1 ring-[#E3D5BC]">Garansi Penukaran</li>
        </ul>
      </div>

      {/* Kanan: visual — placeholder ilustratif (tanpa foto asli tanpa consent) */}
      <div className="mt-8 lg:mt-0">
        <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-2">
          <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-[12px] bg-gradient-to-br from-[#DCEDE6] to-[#F3EAD8] px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-[#064E3B] text-2xl text-white">
              ♡
            </div>
            <p className="mt-4 max-w-[32ch] text-sm font-medium text-[#26221B]">
              Foto suasana keluarga & pengasuh
            </p>
            <p className="mt-1 max-w-[36ch] text-xs leading-relaxed text-[#6F675A]">
              Visual hero menampilkan keluarga Indonesia dalam suasana rumah yang hangat — cahaya
              natural, tone hangat. Ganti dengan foto asli setelah consent tercatat.
            </p>
          </div>
          {/* Kartu kecil overlay — kesan produk */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-[12px] border border-[#E3D5BC] bg-white px-4 py-3 shadow-sm sm:left-6 sm:right-6">
            <div>
              <p className="text-xs font-medium text-[#6F675A]">Penempatan bulan ini</p>
              <p className="text-sm font-semibold text-[#064E3B]">Terjadwal & terverifikasi</p>
            </div>
            <span className="rounded-full bg-[#DCEDE6] px-3 py-1 text-xs font-medium text-[#064E3B]">
              Aktif
            </span>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-[#6F675A]">
          Seluruh kandidat di katalog telah melalui verifikasi dokumen & wawancara.
        </p>
      </div>
    </section>
  );
}

function whatsappHref(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281355702680";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
