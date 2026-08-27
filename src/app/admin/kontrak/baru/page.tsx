import { listMajikanOptions, listStandbyWorkersOptions } from "@/server/kontrak";
import { KontrakForm } from "@/components/admin/kontrak-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Buat Kontrak — Restu Bunda",
  description: "Form kontrak: tanggal mulai, durasi bulan (min. 3 + pratinjau endDate), agreedSalary, placementFee, warrantyDays, maxReplacements, additionalClauses.",
};

/**
 * Halaman Buat Kontrak — Task 18 (Fase 3)
 * Menampilkan form sesuai PRD §5.3 #4.
 * Guard role sudah di layout admin (requireAdmin) + proxy.ts.
 */
export default async function KontrakBaruPage() {
  const [majikanOptions, workerOptions] = await Promise.all([listMajikanOptions(), listStandbyWorkersOptions()]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight text-[#26221B] sm:text-[28px]">Buat Kontrak</h1>
        <p className="max-w-[720px] text-sm leading-relaxed text-[#6F675A]">
          Lengkapi tanggal mulai, durasi (minimal 3 bulan) dengan pratinjau tanggal selesai otomatis, gaji disepakati, biaya
          penempatan, masa garansi (default 90 hari), kuota tukar (default 2), dan klausul tambahan bila ada. Draft kontrak akan
          diberi nomor SPK; rilis SPK resmi (penempatan pekerja & invoice DRAFT) diproses pada langkah berikutnya.
        </p>
      </div>

      <div className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 shadow-sm sm:p-6">
        <KontrakForm majikanOptions={majikanOptions} workerOptions={workerOptions} />
      </div>
    </div>
  );
}
