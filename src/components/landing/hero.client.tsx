"use client";

import { m } from "motion/react";
import { LinkButton } from "@/components/ui/button";
import { motionTokens } from "@/components/motion/motion-tokens";

function whatsappHref(message: string): string {
  // NEXT_PUBLIC_ tidak tersedia di build statis tanpa env — fallback aman
  return `https://wa.me/6280000000000?text=${encodeURIComponent(message)}`;
}

/**
 * Hero dengan stagger entrance — PRD §6.1 / DESIGN.md §6
 * Hanya transform + opacity, durasi fast/base/slow, Client Component.
 */
export function HeroClient() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 lg:py-16">
      <m.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <m.p
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: motionTokens.duration.slow, ease: motionTokens.ease.out }}
          className="mb-3 inline-flex rounded-[var(--radius-pill)] bg-[#DCEDE6] px-3 py-1 text-xs font-medium tracking-wide text-[#064E3B]"
        >
          Agensi Penempatan Resmi
        </m.p>
        <m.h1
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: motionTokens.duration.slow, ease: motionTokens.ease.out }}
          className="text-[clamp(32px,5vw,52px)] font-semibold leading-[1.1] tracking-tight text-[#26221B]"
        >
          Tenaga terpercaya untuk rumah yang tenang.
        </m.h1>
        <m.p
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: motionTokens.duration.slow, ease: motionTokens.ease.out }}
          className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-[#6F675A]"
        >
          Kami membantu Majikan menemukan kandidat terverifikasi — dengan SKCK, MCU, dan perjanjian
          SPK bermaterai. Proses resmi, transparan, dan bergaransi penukaran.
        </m.p>
        <m.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.out }}
          className="mt-7 flex flex-wrap gap-3"
        >
          <LinkButton
            href={whatsappHref(
              "Halo, saya ingin berkonsultasi mengenai penempatan pekerja di CV Restu Bunda Mariyati.",
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Konsultasi via WhatsApp
          </LinkButton>
          <LinkButton href="#katalog-preview" variant="secondary">
            Lihat Kandidat
          </LinkButton>
        </m.div>
        <m.ul
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: motionTokens.duration.base, ease: motionTokens.ease.out }}
          className="mt-6 flex flex-wrap gap-2 text-xs text-[#6F675A]"
        >
          <li className="rounded-full bg-white px-3 py-1.5 ring-1 ring-[#E3D5BC]">SKCK Terverifikasi</li>
          <li className="rounded-full bg-white px-3 py-1.5 ring-1 ring-[#E3D5BC]">MCU Lengkap</li>
          <li className="rounded-full bg-white px-3 py-1.5 ring-1 ring-[#E3D5BC]">SPK Bermaterai</li>
          <li className="rounded-full bg-white px-3 py-1.5 ring-1 ring-[#E3D5BC]">Garansi Penukaran</li>
        </m.ul>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motionTokens.duration.slow, ease: motionTokens.ease.out, delay: 0.25 }}
        className="mt-8 lg:mt-0"
      >
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
      </m.div>
    </section>
  );
}
