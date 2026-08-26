"use client";

import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

/**
 * Layanan unggulan — grid 2×2 kartu putih (DESIGN.md §5.11 layout)
 * Reveal on scroll + stagger — hanya transform/opacity, once: true (PRD §6.1)
 */

const SERVICES = [
  {
    title: "Baby Sitter",
    desc: "Pendampingan bayi & balita dengan standar kebersihan dan kedisiplinan terukur.",
    icon: "◐",
  },
  {
    title: "Asisten Rumah Tangga",
    desc: "Pengelolaan rumah harian yang rapi, cekatan, dan menghormati privasi keluarga.",
    icon: "⬡",
  },
  {
    title: "Perawat Lansia",
    desc: "Pendampingan lansia yang sabar, terlatih, dan siap tinggal bersama keluarga.",
    icon: "♡",
  },
  {
    title: "Supir Pribadi",
    desc: "Layanan supir terverifikasi untuk mobilitas keluarga yang aman dan tepat waktu.",
    icon: "⬔",
  },
];

export function Services() {
  return (
    <section id="layanan" className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#064E3B]">
          Layanan Unggulan
        </p>
        <h2 className="mt-2 text-[28px] font-semibold leading-tight text-[#26221B] sm:text-[32px]">
          Kebutuhan rumah tangga, kami siapkan kandidatnya.
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#6F675A]">
          Setiap kategori melewati proses seleksi dan pencocokan kriteria Majikan secara
          terstruktur sebelum penempatan.
        </p>
      </Reveal>

      <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <StaggerItem
            key={s.title}
            className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-[#DCEDE6] text-[#064E3B]">
              <span aria-hidden className="text-lg">
                {s.icon}
              </span>
            </div>
            <h3 className="mt-4 text-[18px] font-semibold text-[#26221B]">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6F675A]">{s.desc}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
