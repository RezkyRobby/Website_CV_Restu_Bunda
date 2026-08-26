"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import type { PublishedTestimonial } from "@/server/landing-stats";

type Props = {
  testimonials: PublishedTestimonial[];
};

/**
 * Slider testimoni — DESIGN.md §5.8
 * Kartu tunggal besar (maks 720px) di band champagne: foto bulat 56px, rating Emerald,
 * crossfade via opacity, dot navigation pill, autoplay 6 detik, pause saat hover/fokus.
 * Hanya testimoni isPublished (sudah difilter di server).
 */
export function TestimonialSlider({ testimonials }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const hasItems = testimonials.length > 0;

  useEffect(() => {
    if (!hasItems || paused || testimonials.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [hasItems, paused, testimonials.length]);

  if (!hasItems) {
    return (
      <section id="testimoni" className="bg-[#F8E7C9]">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#064E3B]">Testimoni</p>
          <h2 className="mt-2 text-[28px] font-semibold text-[#26221B] sm:text-[32px]">
            Cerita Majikan yang telah mempercayakan rumahnya kepada kami.
          </h2>
          <div className="mx-auto mt-8 max-w-[720px] rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-8 text-center">
            <p className="text-sm leading-relaxed text-[#6F675A]">
              Testimoni akan tampil di sini setelah Super Admin menerbitkan testimoni di dashboard.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const current = testimonials[index];

  return (
    <section
      id="testimoni"
      className="bg-[#F8E7C9]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#064E3B]">Testimoni</p>
        <h2 className="mt-2 max-w-2xl text-[28px] font-semibold leading-tight text-[#26221B] sm:text-[32px]">
          Cerita Majikan yang telah mempercayakan rumahnya kepada kami.
        </h2>

        <div className="mx-auto mt-8 max-w-[720px]">
          <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <m.div
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
              >
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DCEDE6] text-[#064E3B]">
                  {current.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={current.photoUrl}
                      alt={`Foto ${current.clientName}`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold">
                      {initials(current.clientName)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#26221B]">{current.clientName}</p>
                  <p className="text-xs text-[#6F675A]">{current.clientOrigin}</p>
                </div>
                <div className="ml-auto flex items-center gap-0.5 text-[#064E3B]" aria-label={`Rating ${current.rating} dari 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} aria-hidden className={i < current.rating ? "opacity-100" : "opacity-25"}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <blockquote className="mt-5 text-[17px] italic leading-relaxed text-[#26221B]">
                “{current.content}”
              </blockquote>
              </m.div>
            </AnimatePresence>
          </div>

          {/* Dot navigation pill */}
          <div className="mt-6 flex items-center justify-center gap-2" role="tablist" aria-label="Navigasi testimoni">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Testimoni ${i + 1} dari ${testimonials.length}`}
                onClick={() => setIndex(i)}
                className={[
                  "h-2 rounded-full transition-all duration-[var(--duration-base)]",
                  i === index ? "w-8 bg-[#064E3B]" : "w-2 bg-[#E3D5BC] hover:bg-[#6F675A]/30",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}
