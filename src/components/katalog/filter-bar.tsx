"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { workerCategoryLabels } from "@/messages/labels";
import type { WorkerCategory } from "@/generated/prisma/enums";

const CATEGORIES: { value: WorkerCategory; label: string }[] = [
  { value: "BABY_SITTER", label: workerCategoryLabels.BABY_SITTER },
  { value: "ART", label: workerCategoryLabels.ART },
  { value: "PERAWAT_LANSIA", label: workerCategoryLabels.PERAWAT_LANSIA },
  { value: "SUPIR", label: workerCategoryLabels.SUPIR },
];

/**
 * Filter pintar katalog — PRD §5.1 #3
 * Kategori, toleransi hewan, kesediaan luar kota. Nilai disimpan di searchParams.
 */
export function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();

  const category = params.get("kategori") ?? "";
  const pet = params.get("hewan") ?? "";
  const luarKota = params.get("luarKota") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    router.push(`/katalog?${next.toString()}`, { scroll: false });
  }

  function reset() {
    router.push("/katalog", { scroll: false });
  }

  const hasFilter = category || pet || luarKota;

  return (
    <div className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-end gap-4">
        {/* Kategori */}
        <label className="flex min-w-[180px] flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-[#6F675A]">Kategori</span>
          <select
            value={category}
            onChange={(e) => update("kategori", e.target.value)}
            className="h-11 rounded-[var(--radius-input)] border border-[#E3D5BC] bg-[#F8E7C9]/30 px-3 text-sm text-[#26221B] focus:border-[#064E3B] focus:outline-none"
          >
            <option value="">Semua Kategori</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        {/* Toleransi hewan */}
        <label className="flex min-w-[160px] flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-[#6F675A]">Toleransi Hewan</span>
          <select
            value={pet}
            onChange={(e) => update("hewan", e.target.value)}
            className="h-11 rounded-[var(--radius-input)] border border-[#E3D5BC] bg-[#F8E7C9]/30 px-3 text-sm text-[#26221B] focus:border-[#064E3B] focus:outline-none"
          >
            <option value="">Semua</option>
            <option value="ya">Ya</option>
            <option value="tidak">Tidak</option>
          </select>
        </label>

        {/* Luar kota */}
        <label className="flex min-w-[160px] flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-[#6F675A]">Kesediaan Luar Kota</span>
          <select
            value={luarKota}
            onChange={(e) => update("luarKota", e.target.value)}
            className="h-11 rounded-[var(--radius-input)] border border-[#E3D5BC] bg-[#F8E7C9]/30 px-3 text-sm text-[#26221B] focus:border-[#064E3B] focus:outline-none"
          >
            <option value="">Semua</option>
            <option value="ya">Bersedia</option>
            <option value="tidak">Tidak Bersedia</option>
          </select>
        </label>

        {hasFilter && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-pill)] border border-[#E3D5BC] bg-white px-5 text-sm font-medium text-[#26221B] hover:bg-[#F3EAD8]"
          >
            Reset Filter
          </button>
        )}
      </div>
    </div>
  );
}
