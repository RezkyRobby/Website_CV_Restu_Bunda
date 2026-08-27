import Link from "next/link";
import { listWorkersAdmin } from "@/server/workers";
import { workerCategoryLabels, workerStatusLabels } from "@/messages/labels";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daftar Pekerja — Restu Bunda",
  description: "Kelola data pekerja dan registrasikan kandidat baru.",
};

export default async function PekerjaListPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const params = await searchParams;
  const workers = await listWorkersAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-tight text-[#26221B] sm:text-[28px]">Pekerja</h1>
          <p className="max-w-[560px] text-sm leading-relaxed text-[#6F675A]">
            Kelola dossier pekerja. Data sensitif tidak tampil di katalog publik; akses dokumen via proxy bertanda tangan dengan watermark.
          </p>
        </div>
        <Link
          href="/admin/pekerja/baru"
          className="inline-flex min-h-[44px] items-center rounded-full bg-[#064E3B] px-6 text-sm font-medium text-white hover:bg-[#05382B]"
        >
          + Registrasi Pekerja
        </Link>
      </div>

      {params.created && (
        <div role="status" className="rounded-[12px] border border-[#DCEDE6] bg-[#EEF6F1] px-4 py-3 text-sm text-[#064E3B]">
          Pekerja berhasil diregistrasi. ID: <span className="font-mono text-xs">{params.created}</span>
        </div>
      )}

      {workers.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-[#E3D5BC] bg-white px-6 py-10 text-center">
          <p className="text-sm font-medium text-[#26221B]">Belum ada pekerja</p>
          <p className="mt-1 text-sm text-[#6F675A]">Mulai registrasi pekerja baru untuk mengisi katalog.</p>
          <Link
            href="/admin/pekerja/baru"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-[#064E3B] px-6 text-sm font-medium text-white"
          >
            Registrasi Pekerja Baru
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-[#E3D5BC] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E3D5BC] bg-[#F8F7F4] text-xs uppercase tracking-wide text-[#6F675A]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Keahlian</th>
                  <th className="px-4 py-3 font-semibold">Gaji Harapan</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id} className="border-b border-[#F0E8D8] last:border-0 hover:bg-[#FFFBF0]">
                    <td className="px-4 py-3">
                      <Link href={`/admin/pekerja/${w.id}`} className="font-medium text-[#064E3B] hover:underline">
                        {w.fullName}
                      </Link>
                      <p className="text-xs text-[#6F675A]">@{w.nickname} · NIK {w.nik.slice(0, 4)}•••• {w.nik.slice(-4)}</p>
                    </td>
                    <td className="px-4 py-3 text-[#26221B]">{workerCategoryLabels[w.category as never] ?? w.category}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-[#E3D5BC] bg-[#F8E7C9] px-2.5 py-1 text-xs font-medium text-[#6F675A]">
                        {workerStatusLabels[w.status as never] ?? w.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6F675A]">
                      {w.skills.map((s) => s.skill.name).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-[#26221B]">
                      Rp {Number(w.expectedSalary).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
