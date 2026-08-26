import { Suspense } from "react";
import { Navbar } from "@/components/landing/navbar";
import { CtaBand } from "@/components/landing/cta-band";
import { FilterBar } from "@/components/katalog/filter-bar";
import { CandidateCard } from "@/components/katalog/candidate-card";
import { getSanitizedCandidates } from "@/server/catalog";
import type { WorkerCategory } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

type SearchParams = {
  kategori?: string;
  hewan?: string;
  luarKota?: string;
};

const VALID_CATEGORIES = new Set<WorkerCategory>([
  "BABY_SITTER",
  "ART",
  "PERAWAT_LANSIA",
  "SUPIR",
]);

function parseFilters(sp: SearchParams) {
  const category = VALID_CATEGORIES.has(sp.kategori as WorkerCategory)
    ? (sp.kategori as WorkerCategory)
    : undefined;
  const petTolerance =
    sp.hewan === "ya" ? true : sp.hewan === "tidak" ? false : undefined;
  const willingOutOfCity =
    sp.luarKota === "ya" ? true : sp.luarKota === "tidak" ? false : undefined;
  return { category, petTolerance, willingOutOfCity };
}

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const candidates = await getSanitizedCandidates(filters);

  return (
    <main className="min-h-screen bg-[#F8E7C9]">
      <Navbar />

      {/* Header */}
      <section className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#064E3B]">
          Katalog Kandidat
        </p>
        <h1 className="mt-2 max-w-2xl text-[30px] font-semibold leading-tight text-[#26221B] sm:text-[36px]">
          Temukan kandidat siap tugas yang sesuai kebutuhan rumah Anda.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6F675A]">
          Profil tersanitasi tanpa data sensitif. Setiap kandidat terverifikasi SKCK & MCU. Tekan
          Booking via WhatsApp untuk terhubung langsung dengan CS.
        </p>
      </section>

      {/* Filter */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Suspense fallback={<div className="h-20 rounded-[var(--radius-card)] bg-white" />}>
          <FilterBar />
        </Suspense>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
        {candidates.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-[#E3D5BC] bg-white px-6 py-16 text-center">
            <p className="text-sm font-medium text-[#26221B]">Belum ada kandidat yang sesuai filter.</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#6F675A]">
              Coba ubah kategori atau filter lainnya. Kandidat baru akan tampil di sini setelah CS
              menambahkan pekerja berstatus Siap Tugas.
            </p>
            <a
              href="/katalog"
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-pill)] bg-[#064E3B] px-6 text-sm font-medium text-white hover:bg-[#05382B]"
            >
              Lihat Semua Kandidat
            </a>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-[#6F675A]">
              Menampilkan <span className="font-semibold text-[#26221B]">{candidates.length}</span>{" "}
              kandidat
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.map((c) => (
                <CandidateCard key={c.id} candidate={c} />
              ))}
            </div>
          </>
        )}
      </section>

      <CtaBand />
    </main>
  );
}
