import { getActiveSkills } from "@/server/workers";
import { WorkerForm } from "@/components/admin/worker-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Registrasi Pekerja Baru — Restu Bunda",
  description: "Form registrasi pekerja 6 langkah dengan validasi dua lapis.",
};

/**
 * Halaman Registrasi Pekerja — PRD §5.3 #2 & Task 13
 * Guard role ditangani di layout admin (requireAdmin) + proxy.ts.
 * Langkah: Identitas → Keahlian → Dokumen/MCU → Riwayat → Gaji → Consent.
 */
export default async function PekerjaBaruPage() {
  const skills = await getActiveSkills();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight text-[#26221B] sm:text-[28px]">Registrasi Pekerja Baru</h1>
        <p className="max-w-[640px] text-sm leading-relaxed text-[#6F675A]">
          Lengkapi 6 langkah berikut. Validasi berjalan di sisi klien (React Hook Form) dan diulang di server (Zod) sebelum data disimpan. Dokumen sensitif wajib JPG/PNG; tanpa persetujuan UU PDP form tidak dapat disimpan.
        </p>
      </div>

      <WorkerForm skills={skills} />
    </div>
  );
}
