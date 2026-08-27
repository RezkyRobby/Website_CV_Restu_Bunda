import Link from "next/link";
import { listKontrak } from "@/server/kontrak";
import { contractStatusLabels } from "@/messages/labels";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kontrak — Restu Bunda",
  description: "Daftar kontrak penempatan (SPK) — tanggal mulai, durasi, gaji, biaya penempatan, garansi, dan kuota tukar.",
};

function formatTanggal(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Makassar" }).format(
    new Date(d),
  );
}

function formatRupiah(v: unknown) {
  const n = Number(v ?? 0);
  return `Rp ${n.toLocaleString("id-ID")}`;
}

/**
 * Halaman daftar Kontrak — Task 18 (Fase 3)
 * Menampilkan draft/aktif kontrak sebagai hasil form Task 18.
 * Rilis SPK penuh (transaksi worker PLACED + invoice) menyusul Task 19.
 */
export default async function KontrakListPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const params = await searchParams;
  const daftar = await listKontrak();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-tight text-[#26221B] sm:text-[28px]">Kontrak</h1>
          <p className="max-w-[640px] text-sm leading-relaxed text-[#6F675A]">
            Kelola kontrak penempatan. Form pembuatan mencakup tanggal mulai, durasi bulan (min. 3 + pratinjau tanggal selesai), gaji,
            biaya penempatan, masa garansi (default 90 hari), kuota tukar (default 2), dan klausul tambahan.
          </p>
        </div>
        <Link
          href="/admin/kontrak/baru"
          className="inline-flex min-h-[44px] items-center rounded-full bg-[#064E3B] px-6 text-sm font-medium text-white hover:bg-[#05382B]"
        >
          + Buat Kontrak
        </Link>
      </div>

      {params.created && (
        <div role="status" className="rounded-[12px] border border-[#DCEDE6] bg-[#EEF6F1] px-4 py-3 text-sm text-[#064E3B]">
          Kontrak berhasil dibuat. ID: <span className="font-mono text-xs">{params.created}</span>
        </div>
      )}

      {daftar.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-[#E3D5BC] bg-white px-6 py-10 text-center">
          <p className="text-sm font-medium text-[#26221B]">Belum ada kontrak</p>
          <p className="mt-1 text-sm text-[#6F675A]">Buat kontrak baru untuk memulai penempatan pekerja ke Majikan.</p>
          <Link
            href="/admin/kontrak/baru"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-[#064E3B] px-6 text-sm font-medium text-white"
          >
            Buat Kontrak Pertama
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-[#E3D5BC] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E3D5BC] bg-[#F8F7F4] text-xs uppercase tracking-wide text-[#6F675A]">
                <tr>
                  <th className="px-4 py-3 font-semibold">No. SPK</th>
                  <th className="px-4 py-3 font-semibold">Majikan</th>
                  <th className="px-4 py-3 font-semibold">Pekerja</th>
                  <th className="px-4 py-3 font-semibold">Periode</th>
                  <th className="px-4 py-3 font-semibold">Nominal</th>
                  <th className="px-4 py-3 font-semibold">Garansi</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {daftar.map((k) => (
                  <tr key={k.id} className="border-b border-[#F0E8D8] last:border-0 hover:bg-[#FFFBF0]">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-[#064E3B]">{k.contractNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#26221B]">{k.client.name}</p>
                      <p className="text-xs text-[#6F675A]">{k.client.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#26221B]">{k.worker.fullName}</p>
                      <p className="text-xs text-[#6F675A]">
                        @{k.worker.nickname} · {k.worker.category} · {k.worker.status}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-[#26221B]">
                      <span className="tabular-nums">
                        {formatTanggal(k.startDate)} → {formatTanggal(k.endDate)}
                      </span>
                      <span className="block text-[11px] text-[#6F675A]">
                        {Math.max(1, Math.round((new Date(k.endDate).getTime() - new Date(k.startDate).getTime()) / (30 * 24 * 60 * 60 * 1000)))} bulan
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-[#26221B]">
                      <span className="block tabular-nums">Gaji {formatRupiah(k.agreedSalary)}</span>
                      <span className="block tabular-nums text-[#6F675A]">Fee {formatRupiah(k.placementFee)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#26221B]">{k.warrantyDays} hari</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-[#E3D5BC] bg-[#F8E7C9] px-2.5 py-1 text-xs font-medium text-[#6F675A]">
                        {(contractStatusLabels as Record<string, string>)[k.status] ?? k.status}
                      </span>
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
