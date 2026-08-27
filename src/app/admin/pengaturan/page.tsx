import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pengaturan — Restu Bunda",
  description: "Pengaturan operasional: master keahlian dan konfigurasi lain.",
};

/** Hub pengaturan — Task 15: tautan ke master Skill. */
export default function PengaturanPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight text-[#26221B] sm:text-[28px]">Pengaturan</h1>
        <p className="max-w-[640px] text-sm leading-relaxed text-[#6F675A]">
          Kelola data master operasional. Saat ini tersedia pengelolaan keahlian (vocabulary terkontrol) untuk form registrasi pekerja.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/pengaturan/keahlian"
          className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 hover:bg-[#FFFBF0]"
        >
          <p className="text-sm font-semibold text-[#26221B]">Master Keahlian</p>
          <p className="mt-1 text-sm leading-relaxed text-[#6F675A]">
            Tambah, ubah, dan aktif/nonaktif keahlian. Hanya Super Admin.
          </p>
          <span className="mt-3 inline-flex min-h-[44px] items-center rounded-full bg-[#064E3B] px-5 text-sm font-medium text-white">
            Buka
          </span>
        </Link>
      </div>
    </div>
  );
}
