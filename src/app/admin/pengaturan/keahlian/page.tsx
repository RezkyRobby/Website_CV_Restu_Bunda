import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { listSkillsAdmin } from "@/server/skills";
import { SkillManager } from "./skill-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Master Keahlian — Restu Bunda",
  description: "CRUD master keahlian (vocabulary terkontrol) — hanya Super Admin. Aktif/nonaktif.",
};

/** Halaman master Skill — Task 15: list + CRUD (aktif/nonaktif). Guard SUPER_ADMIN. */
export default async function KeahlianPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string })?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  const skills = await listSkillsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-tight text-[#26221B] sm:text-[28px]">Master Keahlian</h1>
          <p className="max-w-[640px] text-sm leading-relaxed text-[#6F675A]">
            Vocabulary terkontrol untuk form registrasi pekerja. Menonaktifkan keahlian tidak menghapus relasi yang sudah ada; keahlian nonaktif tidak muncul di pilihan form baru (PRD §7.2).
          </p>
          {!isSuperAdmin && (
            <p role="alert" className="mt-2 rounded-[12px] border border-[#F0B8B8] bg-[#FAE7E6] px-4 py-2 text-sm text-[#9C2020]">
              Hanya Super Admin yang dapat mengubah data ini. Anda melihat dalam mode baca saja.
            </p>
          )}
        </div>
        <span className="inline-flex rounded-full border border-[#E3D5BC] bg-[#F8F7F4] px-3 py-1 text-xs font-medium text-[#6F675A]">
          {skills.length} keahlian · {skills.filter((s) => s.isActive).length} aktif
        </span>
      </div>

      <SkillManager skills={skills} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
