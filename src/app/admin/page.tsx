import Link from "next/link";
import { getAdminMetrics } from "@/server/admin-metrics";
import { MetricCard } from "@/components/admin/metric-card";
import { Badge } from "@/components/ui/badge";
import {
  jobRunStatusLabels,
  warrantyClaimStatusLabels,
} from "@/messages/labels";
import {
  warrantyClaimStatusTone,
  statusToneClasses,
} from "@/messages/status-styles";
import type { JobRunStatus, WarrantyClaimStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

/**
 * Dashboard Operasional — PRD §5.3 #1 & Task 12
 * Ringkasan metrik (pekerja standby, kontrak aktif), alert kontrak akan habis,
 * daftar tiket klaim mendesak, serta status JobRun terakhir.
 * Guard role ditangani di layout (requireAdmin) + proxy.ts.
 */
export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics();

  const showJobAlert = metrics.recentFailures >= 2;
  const isCritical = metrics.recentFailures > 2;

  return (
    <div className="flex flex-col gap-6">
      {/* Judul */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight text-[#26221B] sm:text-[28px]">
          Dashboard Operasional
        </h1>
        <p className="max-w-[640px] text-sm leading-relaxed text-[#6F675A]">
          Ringkasan operasional harian. Kelola pekerja, pantau kontrak yang
          segera berakhir, dan tindak lanjuti tiket klaim garansi.
        </p>
      </div>

      {/* Alert JobRun gagal berturut-turut */}
      {showJobAlert && metrics.lastJobRun && (
        <div
          role="alert"
          className={[
            "rounded-[16px] border px-4 py-4 sm:px-5",
            isCritical
              ? "border-[#F0B8B8] bg-[#FAE7E6] text-[#9C2020]"
              : "border-[#F3D9A8] bg-[#FBEEDC] text-[#8A4B08]",
          ].join(" ")}
        >
          <p className="text-sm font-semibold">
            {isCritical
              ? "Peringatan: Daily Automation Job gagal 3 hari berturut-turut"
              : "Perhatian: Daily Automation Job gagal pada eksekusi terakhir"}
          </p>
          <p className="mt-1 text-sm leading-relaxed opacity-90">
            Eksekusi terakhir {formatWib(metrics.lastJobRun.startedAt)} — status{" "}
            <strong>
              {
                jobRunStatusLabels[
                  metrics.lastJobRun.status as JobRunStatus
                ]
              }
            </strong>
            {metrics.lastJobRun.errorMessage
              ? ` — ${metrics.lastJobRun.errorMessage}`
              : ""}
            . Periksa log server dan jadwal cron (01:00 UTC / 08:00 WIB).
          </p>
        </div>
      )}

      {/* Grid metrik utama */}
      <section aria-label="Ringkasan metrik">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Pekerja Siap Tugas"
            value={metrics.workersStandby}
            hint={
              metrics.workersTotal > 0
                ? `Dari ${metrics.workersTotal} pekerja terdaftar`
                : "Kandidat STANDBY tampil di katalog publik"
            }
            tone="success"
          />
          <MetricCard
            label="Kontrak Aktif"
            value={metrics.contractsActive}
            hint="Kontrak berstatus ACTIVE"
            tone="success"
          />
          <MetricCard
            label="Segera Berakhir"
            value={metrics.contractsExpiringSoon}
            hint="Kontrak EXPIRING_SOON (sisa ≤ 30 hari)"
            tone={metrics.contractsExpiringSoon > 0 ? "warning" : "default"}
          />
          <MetricCard
            label="Klaim Mendesak"
            value={metrics.pendingClaims}
            hint="Tiket PENDING / IN_REVIEW"
            tone={metrics.pendingClaims > 0 ? "danger" : "default"}
          />
        </div>
      </section>

      {/* Baris kedua: JobRun + daftar ringkas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Status JobRun terakhir */}
        <section
          aria-label="Status Daily Automation Job"
          className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 shadow-sm lg:col-span-1"
        >
          <h2 className="text-sm font-semibold text-[#26221B]">
            Daily Automation Job
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#6F675A]">
            Cron 01:00 UTC (08:00 WIB) — email H-30/H-14/H-7, transisi status
            kontrak, dan purge retensi. Satu baris JobRun per eksekusi.
          </p>

          {metrics.lastJobRun ? (
            <div className="mt-4 rounded-[12px] border border-[#E3D5BC] bg-[#F8F7F4] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#6F675A]">
                  Eksekusi terakhir
                </span>
                <Badge
                  tone={
                    metrics.lastJobRun.status === "SUCCESS"
                      ? "success"
                      : metrics.lastJobRun.status === "FAILED"
                        ? "danger"
                        : "warning"
                  }
                >
                  {
                    jobRunStatusLabels[
                      metrics.lastJobRun.status as JobRunStatus
                    ]
                  }
                </Badge>
              </div>
              <p className="mt-2 text-sm font-medium text-[#26221B]">
                {formatWib(metrics.lastJobRun.startedAt)}
              </p>
              <p className="mt-1 text-xs text-[#6F675A]">
                Kunci:{" "}
                <span className="font-mono text-[#26221B]">
                  {metrics.lastJobRun.jobKey}
                </span>
                {metrics.lastJobRun.durationMs != null && (
                  <>
                    {" "}
                    · Durasi {formatDuration(metrics.lastJobRun.durationMs)}
                  </>
                )}
              </p>
              {metrics.lastJobRun.finishedAt && (
                <p className="mt-1 text-xs text-[#6F675A]">
                  Selesai {formatWib(metrics.lastJobRun.finishedAt)}
                </p>
              )}
              {metrics.lastJobRun.errorMessage && (
                <p className="mt-2 rounded-[8px] bg-white px-3 py-2 text-xs leading-relaxed text-[#9C2020]">
                  {metrics.lastJobRun.errorMessage}
                </p>
              )}
              {showJobAlert && (
                <p className="mt-3 text-xs font-medium text-[#9C2020]">
                  Gagal {metrics.recentFailures} eksekusi terakhir
                  berturut-turut — perlu tindak lanjut.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-[12px] border border-dashed border-[#E3D5BC] bg-[#F8F7F4] px-4 py-6 text-center">
              <p className="text-sm font-medium text-[#6F675A]">
                Belum ada eksekusi tercatat
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#6F675A]">
                JobRun pertama akan muncul setelah cron harian berjalan.
              </p>
            </div>
          )}
        </section>

        {/* Kontrak segera berakhir */}
        <section
          aria-label="Kontrak segera berakhir"
          className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 shadow-sm lg:col-span-1"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[#26221B]">
              Kontrak Segera Berakhir
            </h2>
            {metrics.contractsExpiringSoon > 0 && (
              <span className={["inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", statusToneClasses.warning].join(" ")}>
                {metrics.contractsExpiringSoon} kontrak
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#6F675A]">
            Diurutkan berdasarkan tanggal berakhir terdekat.
          </p>

          {metrics.expiringContractsPreview.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-3">
              {metrics.expiringContractsPreview.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-[12px] border border-[#E3D5BC] bg-[#F8F7F4] px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-medium text-[#064E3B]">
                      {c.contractNumber}
                    </p>
                    <p className="truncate text-sm font-medium text-[#26221B]">
                      {c.workerName} → {c.clientName}
                    </p>
                    <p className="text-xs text-[#6F675A]">
                      Berakhir {formatTanggal(c.endDate)} · {sisaHari(c.endDate)}
                    </p>
                  </div>
                  <span className={["shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", statusToneClasses.warning].join(" ")}>
                    Segera
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-[12px] border border-dashed border-[#E3D5BC] bg-[#F8F7F4] px-4 py-8 text-center">
              <p className="text-sm text-[#6F675A]">Tidak ada kontrak yang segera berakhir.</p>
              <p className="mt-1 text-xs text-[#6F675A]">
                Kontrak dengan sisa ≤ 30 hari akan muncul di sini.
              </p>
            </div>
          )}

          <div className="mt-4">
            <Link
              href="#"
              aria-disabled="true"
              onClick={(e) => e.preventDefault()}
              className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-pill)] border border-[#E3D5BC] bg-white px-5 text-sm font-medium text-[#6F675A] opacity-60"
            >
              Lihat semua kontrak — segera
            </Link>
          </div>
        </section>

        {/* Tiket klaim mendesak */}
        <section
          aria-label="Tiket klaim mendesak"
          className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 shadow-sm lg:col-span-1"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[#26221B]">
              Tiket Klaim Mendesak
            </h2>
            {metrics.pendingClaims > 0 && (
              <span className={["inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", statusToneClasses.danger].join(" ")}>
                {metrics.pendingClaims} tiket
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#6F675A]">
            Klaim PENDING dan IN_REVIEW — perlu ditindaklanjuti CS.
          </p>

          {metrics.pendingClaimsPreview.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-3">
              {metrics.pendingClaimsPreview.map((cl) => (
                <li
                  key={cl.id}
                  className="flex flex-col gap-1 rounded-[12px] border border-[#E3D5BC] bg-[#F8F7F4] px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium text-[#064E3B]">
                      {cl.claimNumber}
                    </span>
                    <Badge tone={warrantyClaimStatusTone[cl.status as WarrantyClaimStatus]}>
                      {warrantyClaimStatusLabels[cl.status as WarrantyClaimStatus]}
                    </Badge>
                  </div>
                  <p className="truncate text-sm font-medium text-[#26221B]">
                    {cl.contractNumber} · {cl.clientName}
                  </p>
                  <p className="text-xs text-[#6F675A]">
                    Dibuat {formatTanggal(cl.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-[12px] border border-dashed border-[#E3D5BC] bg-[#F8F7F4] px-4 py-8 text-center">
              <p className="text-sm text-[#6F675A]">Tidak ada tiket mendesak.</p>
              <p className="mt-1 text-xs text-[#6F675A]">
                Klaim baru dengan status PENDING akan muncul di sini.
              </p>
            </div>
          )}

          <div className="mt-4">
            <Link
              href="#"
              aria-disabled="true"
              onClick={(e) => e.preventDefault()}
              className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-pill)] border border-[#E3D5BC] bg-white px-5 text-sm font-medium text-[#6F675A] opacity-60"
            >
              Kelola klaim — segera
            </Link>
          </div>
        </section>
      </div>

      {/* Catatan kaki operasional */}
      <p className="max-w-[720px] text-xs leading-relaxed text-[#6F675A]">
        Catatan: statistik dihitung real-time dari database. Halaman ini
        menampilkan pratinjau 5 entri terbaru per kategori; daftar lengkap dan
        aksi (filter, dispatch kandidat, konfirmasi invoice) akan hadir pada
        task berikutnya.
      </p>
    </div>
  );
}

function formatWib(d: Date): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

function formatTanggal(d: Date): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function sisaHari(endDate: Date): string {
  const nowWib = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );
  const end = new Date(endDate);
  const diffMs = end.getTime() - nowWib.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `lewat ${Math.abs(diffDays)} hari`;
  if (diffDays === 0) return "berakhir hari ini";
  return `sisa ${diffDays} hari`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} dtk`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return `${m} mnt ${rem} dtk`;
}
