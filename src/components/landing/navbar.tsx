"use client";

import { useState } from "react";
import { LinkButton } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#layanan", label: "Layanan" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#keamanan", label: "Keamanan" },
  { href: "#testimoni", label: "Testimoni" },
];

/**
 * Navigation bar — DESIGN.md §5.3
 * Transparan di atas hero → saat scroll menjadi champagne blur + hairline.
 * Mobile: hamburger → drawer slide dari kanan.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E3D5BC] bg-[#F8E7C9]/90 backdrop-blur-[8px]">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-4 sm:px-6">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 no-underline">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#064E3B] text-sm font-semibold text-white">
            RB
          </span>
          <span className="text-sm font-semibold leading-none text-[#26221B]">
            Restu Bunda
            <span className="block text-[11px] font-normal tracking-wide text-[#6F675A]">
              CV Mariyati
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Navigasi utama">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#26221B] underline-offset-4 hover:text-[#064E3B] hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA kanan */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/login"
            className="text-sm font-medium text-[#26221B] hover:text-[#064E3B]"
          >
            Masuk
          </a>
          <LinkButton
            href={whatsappHref("Halo, saya ingin berkonsultasi mengenai penempatan pekerja.")}
            target="_blank"
            rel="noopener noreferrer"
            size="md"
          >
            Konsultasi via WA
          </LinkButton>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-11 items-center justify-center rounded-[var(--radius-pill)] border border-[#E3D5BC] bg-white text-[#26221B] md:hidden"
        >
          <span aria-hidden className="text-lg leading-none">
            {open ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-[#E3D5BC] bg-[#F8E7C9] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navigasi seluler">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius-input)] px-3 py-3 text-sm font-medium text-[#26221B] hover:bg-white"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-[#E3D5BC] pt-4">
              <a
                href="/login"
                className="rounded-[var(--radius-pill)] border border-[#064E3B] px-6 py-3 text-center text-sm font-medium text-[#064E3B]"
              >
                Masuk
              </a>
              <LinkButton
                href={whatsappHref("Halo, saya ingin berkonsultasi mengenai penempatan pekerja.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Konsultasi via WA
              </LinkButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function whatsappHref(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6280000000000";
  // Fallback nomor placeholder bila env belum diisi — tetap membuka wa.me
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
