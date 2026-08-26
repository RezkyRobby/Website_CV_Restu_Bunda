import { LinkButton } from "@/components/ui/button";

/**
 * Band CTA akhir & Footer — DESIGN.md §5.10
 * Band penuh Emerald Ink: headline putih, tombol inversi (fill putih, teks Emerald).
 * Footer di band yang sama.
 */
export function CtaBand() {
  return (
    <section className="bg-[#064E3B]">
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[28px] font-semibold leading-tight text-white sm:text-[36px]">
            Siap menemukan tenaga yang tepat untuk rumah Anda?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80">
            Konsultasikan kebutuhan Anda hari ini. Tim CS kami siap membantu mencocokkan kandidat
            yang sesuai — resmi, terverifikasi, dan bergaransi.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton
              href={whatsappHref(
                "Halo, saya ingin berkonsultasi mengenai penempatan pekerja di CV Restu Bunda Mariyati.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="!bg-white !text-[#064E3B] hover:!bg-[#F3EAD8] !border-white"
            >
              Konsultasi via WhatsApp
            </LinkButton>
            <LinkButton
              href="#katalog-preview"
              variant="secondary"
              className="!border-white !text-white hover:!bg-white/10"
            >
              Lihat Kandidat
            </LinkButton>
          </div>
        </div>

        {/* Footer di band yang sama */}
        <footer className="mt-14 border-t border-white/15 pt-8">
          <div className="grid gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-white">CV Restu Bunda Mariyati</p>
              <p className="mt-2 leading-relaxed text-white/70">
                Agensi penempatan tenaga kerja rumah tangga yang resmi dan terpercaya. Melayani
                Baby Sitter, ART, Perawat Lansia, dan Supir.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white">Navigasi</p>
              <ul className="mt-2 space-y-1.5 text-white/70">
                <li>
                  <a href="#layanan" className="hover:text-white hover:underline">
                    Layanan
                  </a>
                </li>
                <li>
                  <a href="#cara-kerja" className="hover:text-white hover:underline">
                    Cara Kerja
                  </a>
                </li>
                <li>
                  <a href="#keamanan" className="hover:text-white hover:underline">
                    Keamanan
                  </a>
                </li>
                <li>
                  <a href="/katalog" className="hover:text-white hover:underline">
                    Katalog Kandidat
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white">Legalitas</p>
              <p className="mt-2 leading-relaxed text-white/70">
                Dokumen SPK bermaterai Rp10.000. Seluruh proses penempatan mengikuti prosedur resmi
                dan ketentuan yang berlaku.
              </p>
              <p className="mt-4 text-xs leading-relaxed text-white/50">
                © {new Date().getFullYear()} CV Restu Bunda Mariyati. Hak cipta dilindungi.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}

function whatsappHref(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6280000000000";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
