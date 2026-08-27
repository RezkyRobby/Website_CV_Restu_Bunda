import { listMajikan } from "@/server/majikan";
import { MajikanDealClient } from "./majikan-deal.client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kelola Majikan — Restu Bunda",
  description: "Cek dan buat akun Majikan saat deal (dipakai ulang antar kontrak, invite set-password untuk akun baru).",
};

/**
 * Halaman Majikan — Task 17 (Fase 3)
 * Alur deal CS: cek/buat akun Majikan by email/telepon + email invite set-password untuk akun baru.
 * Tidak ada self-register CLIENT — akun hanya dibuat CS di halaman ini (PRD §5.4 #1).
 * Guard role sudah di layout admin (requireAdmin) + proxy.ts.
 */
export default async function MajikanPage() {
  const daftar = await listMajikan();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight text-[#26221B] sm:text-[28px]">Majikan</h1>
        <p className="max-w-[720px] text-sm leading-relaxed text-[#6F675A]">
          Kelola akun Majikan (role <span className="font-medium text-[#26221B]">CLIENT</span>) saat deal. CS wajib
          cek akun existing by email atau telepon terlebih dahulu — satu akun dipakai ulang untuk semua kontrak
          majikan tersebut. Bila akun baru, sistem otomatis mengirim email undangan pembuatan kata sandi.
        </p>
      </div>

      <MajikanDealClient initialList={daftar} />
    </div>
  );
}
