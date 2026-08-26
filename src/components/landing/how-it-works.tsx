/**
 * Cara kerja / Prosedur penempatan — 4 langkah bernomor Emerald (DESIGN.md §11)
 */

const STEPS = [
  {
    n: "01",
    title: "Konsultasi Kebutuhan",
    desc: "Sampaikan kriteria pekerja, jadwal, dan preferensi rumah tangga via WhatsApp atau kunjungan.",
  },
  {
    n: "02",
    title: "Pencocokan Kandidat",
    desc: "CS mencocokkan kandidat STANDBY sesuai kategori, domisili, dan toleransi hewan.",
  },
  {
    n: "03",
    title: "Wawancara & Kesepakatan",
    desc: "Majikan bertemu kandidat, menyepakati gaji, durasi kontrak, dan biaya penempatan.",
  },
  {
    n: "04",
    title: "Rilis SPK & Penempatan",
    desc: "SPK bermaterai diterbitkan, status pekerja menjadi PLACED, dan penempatan dimulai.",
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="bg-white">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#064E3B]">
          Cara Kerja
        </p>
        <h2 className="mt-2 max-w-2xl text-[28px] font-semibold leading-tight text-[#26221B] sm:text-[32px]">
          Empat langkah jelas dari konsultasi hingga penempatan.
        </h2>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="rounded-[var(--radius-card)] border border-[#E3D5BC] bg-[#F8E7C9]/40 p-6"
            >
              <p className="tabular-nums text-sm font-semibold tracking-wide text-[#064E3B]">
                {s.n}
              </p>
              <h3 className="mt-2 text-[16px] font-semibold text-[#26221B]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6F675A]">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
