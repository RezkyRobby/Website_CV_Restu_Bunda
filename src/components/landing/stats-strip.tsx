import type { LandingStats } from "@/server/landing-stats";

/**
 * Strip statistik — DESIGN.md §5.4
 * 3 angka besar Emerald, label Muted Ink. Fallback bila DB kosong sudah di-handle di server.
 * Count-up sederhana via CSS — tanpa JS berat untuk LCP.
 */
export function StatsStrip({ stats }: { stats: LandingStats }) {
  const items = [
    { value: stats.completedContracts, label: "Kontrak Selesai", suffix: "+" },
    { value: stats.standbyWorkers, label: "Kandidat Siap Tugas", suffix: "" },
    { value: stats.yearsExperience, label: "Tahun Pengalaman", suffix: "+" },
  ];

  return (
    <section className="border-y border-[#E3D5BC] bg-white">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 divide-y divide-[#E3D5BC] px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center px-6 py-8 text-center">
            <p className="tabular-nums text-4xl font-semibold tracking-tight text-[#064E3B] sm:text-[42px]">
              {formatNumber(item.value)}
              <span className="text-[#064E3B]">{item.suffix}</span>
            </p>
            <p className="mt-2 text-sm font-medium text-[#6F675A]">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}
