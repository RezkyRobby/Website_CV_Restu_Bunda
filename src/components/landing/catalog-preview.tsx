"use client";

import { LinkButton } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

/**
 * Preview katalog — 3 kartu kandidat placeholder (data sensitif tidak dirender di landing).
 * Link "Lihat Semua" mengarah ke /katalog (Task 10).
 */
export function CatalogPreview() {
  return (
    <section id="katalog-preview" className="bg-white">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#064E3B]">
              Katalog Kandidat
            </p>
            <h2 className="mt-2 text-[28px] font-semibold leading-tight text-[#26221B] sm:text-[32px]">
              Kandidat siap tugas, terverifikasi.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6F675A]">
              Profil tersanitasi tanpa data sensitif. Booking via WhatsApp langsung terhubung ke CS.
            </p>
          </div>
          <a
            href="/katalog"
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius-pill)] border border-[#064E3B] px-6 text-sm font-medium text-[#064E3B] hover:bg-[#DCEDE6]"
          >
            Lihat Semua
          </a>
        </Reveal>

        <Stagger className="mt-8 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <StaggerItem
              key={i}
              className="overflow-hidden rounded-[var(--radius-card)] border border-[#E3D5BC] bg-[#F8E7C9]/30"
            >
              <div className="flex aspect-[3/4] items-center justify-center bg-[#DCEDE6] text-[#064E3B]">
                <span className="text-sm font-medium">Foto Kandidat {i} — 3:4</span>
              </div>
              <div className="bg-white p-5">
                <p className="text-[18px] font-semibold text-[#26221B]">Kandidat {i}</p>
                <p className="mt-1 text-sm text-[#6F675A]">Usia 28 · Suku Jawa</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#F3EAD8] px-2.5 py-1 text-xs text-[#26221B]">
                    Perawatan Bayi
                  </span>
                  <span className="rounded-full bg-[#F3EAD8] px-2.5 py-1 text-xs text-[#26221B]">
                    Memasak
                  </span>
                </div>
                <div className="mt-3 flex gap-1.5">
                  <span className="rounded-full bg-[#DCEDE6] px-2.5 py-1 text-xs font-medium text-[#064E3B]">
                    SKCK ✓
                  </span>
                  <span className="rounded-full bg-[#DCEDE6] px-2.5 py-1 text-xs font-medium text-[#064E3B]">
                    MCU ✓
                  </span>
                </div>
                <div className="mt-4">
                  <LinkButton
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6281355702680"}?text=${encodeURIComponent(`Halo, saya tertarik dengan kandidat ${i}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="md"
                    className="w-full"
                  >
                    Booking via WhatsApp
                  </LinkButton>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
