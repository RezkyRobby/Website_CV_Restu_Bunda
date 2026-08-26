"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/reveal";

type FaqItem = {
  q: string;
  a: string;
};

const FAQS: FaqItem[] = [
  {
    q: "Berapa lama masa garansi penukaran pekerja?",
    a: "Masa garansi berjalan sejak tanggal mulai kontrak sesuai nilai warrantyDays (default 90 hari) dan tidak di-reset oleh penukaran di dalam kontrak yang sama. Selama garansi berlaku dan kuota tukar masih tersedia, Majikan dapat mengajukan klaim penukaran.",
  },
  {
    q: "Bagaimana proses penukaran pekerja?",
    a: "Majikan mengajukan klaim garansi via portal dengan alasan dan kriteria pengganti. CS meninjau klaim, menawarkan 2–3 kandidat pengganti, dan bila Majikan menerima salah satu, kontrak lama dihentikan dan draft kontrak baru dibuat untuk kandidat pengganti.",
  },
  {
    q: "Apakah SPK digital sudah sah secara hukum?",
    a: "SPK digital yang diunduh dari portal adalah salinan arsip. Dokumen resmi yang sah adalah versi cetak bermaterai Rp10.000 yang ditandatangani para pihak dan arsipnya disimpan oleh CV Restu Bunda Mariyati.",
  },
  {
    q: "Apakah data pekerja aman?",
    a: "Katalog publik hanya menampilkan profil tersanitasi (tanpa NIK, alamat lengkap, atau dokumen mentah). Dokumen sensitif hanya dapat diakses Majikan pemilik kontrak aktif via portal dengan watermark dinamis.",
  },
  {
    q: "Bagaimana cara memesan kandidat?",
    a: "Tekan tombol Booking via WhatsApp pada kartu kandidat di katalog. Pesan WhatsApp akan terisi otomatis dengan nama dan ID kandidat, lalu CS akan membantu proses selanjutnya.",
  },
];

/**
 * Accordion FAQ — DESIGN.md §5.9
 * Border-top hairline antar item, chevron rotasi 180° (base 250ms), hanya transform/opacity.
 */
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#064E3B]">
          Pertanyaan Umum
        </p>
        <h2 className="mt-2 text-[28px] font-semibold leading-tight text-[#26221B] sm:text-[32px]">
          Jawaban untuk hal yang paling sering ditanyakan.
        </h2>
      </Reveal>

      <div className="mt-8 divide-y divide-[#E3D5BC] border-y border-[#E3D5BC]">
        {FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={item.q} className="py-1">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="text-[15px] font-medium text-[#26221B]">{item.q}</span>
                <span
                  aria-hidden
                  className={[
                    "flex size-8 shrink-0 items-center justify-center rounded-full border border-[#E3D5BC] bg-white text-[#26221B] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)]",
                    isOpen ? "rotate-180" : "rotate-0",
                  ].join(" ")}
                >
                  ⌄
                </span>
              </button>
              <div
                className={[
                  "grid transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                ].join(" ")}
              >
                <div className="overflow-hidden">
                  <p className="pb-4 text-sm leading-relaxed text-[#6F675A]">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
