import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkerDetail } from "@/server/workers";
import {
  workerCategoryLabels,
  workerStatusLabels,
  religionLabels,
  maritalStatusLabels,
} from "@/messages/labels";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Dossier Pekerja ${id.slice(0, 8)} — Restu Bunda`,
    description: "Detail dossier pekerja untuk verifikasi upload & relasi.",
  };
}

/** Halaman detail dossier pekerja — Task 14: verifikasi upload Cloudinary + relasi skills & WorkerExperience. */
export default async function PekerjaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const worker = await getWorkerDetail(id);

  if (!worker) notFound();

  const isPendingUrl = (url: string | null | undefined) => !url || url.startsWith("pending:");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/pekerja"
          className="inline-flex min-h-[44px] items-center rounded-full border border-[#E3D5BC] bg-white px-4 text-sm font-medium text-[#6F675A] hover:bg-[#F8F7F4]"
        >
          ← Daftar Pekerja
        </Link>
        <span className="inline-flex rounded-full border border-[#DCEDE6] bg-[#EEF6F1] px-3 py-1 text-xs font-medium text-[#064E3B]">
          {workerStatusLabels[worker.status as never] ?? worker.status}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-tight text-[#26221B] sm:text-[28px]">
          {worker.fullName} <span className="text-base font-normal text-[#6F675A]">@{worker.nickname}</span>
        </h1>
        <p className="text-sm text-[#6F675A]">
          {workerCategoryLabels[worker.category as never] ?? worker.category} · NIK {worker.nik} · Suku {worker.ethnicity}
        </p>
      </div>

      {/* Ringkasan */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[16px] border border-[#E3D5BC] bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#6F675A]">Status</p>
          <p className="mt-1 font-medium text-[#26221B]">{workerStatusLabels[worker.status as never] ?? worker.status}</p>
        </div>
        <div className="rounded-[16px] border border-[#E3D5BC] bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#6F675A]">Gaji Harapan</p>
          <p className="mt-1 font-medium tabular-nums text-[#26221B]">Rp {Number(worker.expectedSalary).toLocaleString("id-ID")}</p>
        </div>
        <div className="rounded-[16px] border border-[#E3D5BC] bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#6F675A]">Kategori</p>
          <p className="mt-1 font-medium text-[#26221B]">{workerCategoryLabels[worker.category as never] ?? worker.category}</p>
        </div>
      </div>

      {/* Identitas */}
      <section className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[#26221B]">Identitas & Wali</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[#6F675A]">NIK / No. KK</dt>
            <dd className="font-medium text-[#26221B]">{worker.nik} {worker.noKk ? ` / ${worker.noKk}` : ""}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#6F675A]">Tanggal Lahir</dt>
            <dd className="font-medium text-[#26221B]">{new Date(worker.birthDate).toLocaleDateString("id-ID")}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#6F675A]">Agama / Status Nikah</dt>
            <dd className="font-medium text-[#26221B]">
              {(religionLabels[worker.religion as never] ?? worker.religion)} / {(maritalStatusLabels[worker.maritalStatus as never] ?? worker.maritalStatus)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[#6F675A]">Domisili</dt>
            <dd className="font-medium text-[#26221B]">{worker.domicileAddress}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#6F675A]">Wali</dt>
            <dd className="font-medium text-[#26221B]">{worker.guarantorName} · {worker.guarantorPhone} {worker.guarantorRelation ? `(${worker.guarantorRelation})` : ""}</dd>
          </div>
          <div>
            <dt className="text-xs text-[#6F675A]">Consent UU PDP</dt>
            <dd className="font-medium text-[#26221B]">{worker.dataConsentAt ? new Date(worker.dataConsentAt).toLocaleString("id-ID", { timeZone: "Asia/Makassar" }) : "—"}</dd>
          </div>
        </dl>
      </section>

      {/* Keahlian — relasi WorkerSkill */}
      <section className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[#26221B]">Keahlian & Preferensi</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {worker.skills.length === 0 ? (
            <span className="text-sm text-[#6F675A]">Belum ada keahlian tertaut.</span>
          ) : (
            worker.skills.map(({ skill }) => (
              <span key={skill.id} className="rounded-full border border-[#064E3B] bg-[#EEF6F1] px-3 py-1 text-sm font-medium text-[#064E3B]">
                {skill.name}
              </span>
            ))
          )}
        </div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          <span className={worker.stayIn ? "font-medium text-[#064E3B]" : "text-[#6F675A]"}>Menginap: {worker.stayIn ? "Ya" : "Tidak"}</span>
          <span className={worker.petTolerance ? "font-medium text-[#064E3B]" : "text-[#6F675A]"}>Toleransi hewan: {worker.petTolerance ? "Ya" : "Tidak"}</span>
          <span className={worker.willingOutOfCity ? "font-medium text-[#064E3B]" : "text-[#6F675A]"}>Luar kota: {worker.willingOutOfCity ? "Ya" : "Tidak"}</span>
        </div>
        {Array.isArray(worker.trainingCertificates) && (worker.trainingCertificates as unknown[]).length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-[#6F675A]">Sertifikat</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-[#26221B]">
              {(worker.trainingCertificates as { name: string; url?: string }[]).map((c, i) => (
                <li key={i}>{c.name} {c.url ? <a href={c.url} target="_blank" rel="noreferrer" className="text-[#064E3B] underline">tautan</a> : null}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Dokumen — Task 14: foto 2 MB, sensitif 5 MB, JPG/PNG, satu pipeline watermark */}
      <section className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[#26221B]">Dokumen & MCU</h2>
        <p className="mt-1 text-xs leading-relaxed text-[#6F675A]">
          Foto profil JPG/PNG maks 2 MB. Dokumen sensitif (KTP, MCU, SKCK) JPG/PNG maks 5 MB — satu pipeline watermark. Akses sensitif via proxy bertanda tangan (Task 21).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <DocPreview label="Foto Profil" url={worker.photoProfileUrl} pending={isPendingUrl(worker.photoProfileUrl)} hint="Maks 2 MB — JPG/PNG" />
          <DocPreview label="KTP" url={worker.ktpDocumentUrl} pending={isPendingUrl(worker.ktpDocumentUrl)} hint="Maks 5 MB — JPG/PNG — watermark" sensitive />
          <DocPreview label="MCU" url={worker.mcuReportUrl} pending={isPendingUrl(worker.mcuReportUrl)} hint="Opsional — JPG/PNG" sensitive />
          <DocPreview label="SKCK" url={worker.skckDocumentUrl} pending={isPendingUrl(worker.skckDocumentUrl)} hint={worker.skckVerified ? "Terverifikasi" : "Belum verifikasi"} sensitive />
        </div>
      </section>

      {/* Riwayat — relasi WorkerExperience */}
      <section className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-[#26221B]">Riwayat Majikan ({worker.experiences.length})</h2>
        {worker.experiences.length === 0 ? (
          <p className="mt-2 text-sm text-[#6F675A]">Belum ada riwayat majikan tercatat.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {worker.experiences.map((exp) => (
              <div key={exp.id} className="rounded-[12px] border border-[#E3D5BC] bg-[#F8F7F4] px-4 py-3">
                <p className="text-sm font-medium text-[#26221B]">{exp.position} · {exp.employerLocation}</p>
                <p className="text-xs text-[#6F675A]">
                  {new Date(exp.startDate).toLocaleDateString("id-ID")} – {exp.endDate ? new Date(exp.endDate).toLocaleDateString("id-ID") : "sekarang"} · Alasan: {exp.reasonForLeaving}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DocPreview({ label, url, pending, hint, sensitive }: { label: string; url: string | null | undefined; pending: boolean; hint: string; sensitive?: boolean }) {
  if (!url || pending) {
    return (
      <div className="rounded-[12px] border border-dashed border-[#E3D5BC] bg-[#F8F7F4] p-4">
        <p className="text-sm font-medium text-[#26221B]">{label}</p>
        <p className="text-xs text-[#6F675A]">{hint}</p>
        <p className="mt-2 text-xs text-[#8A4B08]">{url?.startsWith("pending:") ? `Menunggu unggah: ${url}` : "Belum ada berkas."}</p>
      </div>
    );
  }
  const isCloudinary = url.includes("cloudinary.com") || url.includes("res.cloudinary");
  return (
    <div className="rounded-[12px] border border-[#E3D5BC] bg-[#F8F7F4] p-4">
      <p className="text-sm font-medium text-[#26221B]">{label}</p>
      <p className="text-xs text-[#6F675A]">{hint}</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={label} className="mt-3 max-h-[220px] w-full rounded-[12px] border border-[#E3D5BC] bg-white object-contain" />
      <p className="mt-2 break-all text-[11px] text-[#6F675A]">{sensitive ? "URL mentah tidak diekspos ke katalog publik; akses via proxy (Task 21)." : ""} {isCloudinary ? "Tersimpan di Cloudinary." : ""}</p>
      <a href={url} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-xs font-medium text-[#064E3B] underline">Buka berkas</a>
    </div>
  );
}
