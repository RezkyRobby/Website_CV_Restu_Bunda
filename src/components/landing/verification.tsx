"use client";

import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

/**
 * Keamanan & Verifikasi — kartu ikon (DESIGN.md §11)
 */

const ITEMS = [
  {
    title: "SKCK Terverifikasi",
    desc: "Pemeriksaan rekam jejak kepolisian untuk setiap kandidat sebelum masuk katalog.",
  },
  {
    title: "MCU Lengkap",
    desc: "Hasil Medical Check-Up tercatat dan dapat diakses Majikan via portal setelah penempatan.",
  },
  {
    title: "SPK Bermaterai Rp10.000",
    desc: "Perjanjian resmi dengan area materai fisik; arsip cetakan tersimpan sebagai bukti hukum.",
  },
  {
    title: "Garansi Penukaran",
    desc: "Hak penukaran pekerja dalam masa garansi dengan kuota tukar yang transparan di portal.",
  },
];

export function Verification() {
  return (
    <section id="keamanan" className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#064E3B]">
          Keamanan & Verifikasi
        </p>
        <h2 className="mt-2 text-[28px] font-semibold leading-tight text-[#26221B] sm:text-[32px]">
          Kepercayaan dibangun di atas dokumen yang sah.
        </h2>
      </Reveal>

      <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <StaggerItem
            key={item.title}
            className="flex gap-4 rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#DCEDE6] text-[#064E3B]">
              <span aria-hidden>✓</span>
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#26221B]">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#6F675A]">{item.desc}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
