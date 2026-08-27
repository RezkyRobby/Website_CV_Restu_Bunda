// Form Kontrak — PRD §5.3 #4 & AGENTS.md Task 18
// Field: tanggal mulai, durasi bulan (min. 3 + pratinjau endDate),
// agreedSalary, placementFee, warrantyDays (default 90),
// maxReplacements (default 2), additionalClauses.
// Validasi dua lapis: Zod di klien (React Hook Form) sejajar dengan Server Action.
// Tap target min 44px, pesan Bahasa Indonesia formal, mobile-first.

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, FieldError, FieldHint } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { kontrakSchema, calcEndDate, formatTanggalIndo } from "@/lib/validators/kontrak";
import type { KontrakInput } from "@/lib/validators/kontrak";
import { createKontrakAction } from "@/app/admin/kontrak/actions";

type Option = { id: string; label: string; sub?: string };

/** Nilai default form — warrantyDays 90, maxReplacements 2 sesuai PRD. */
const DEFAULTS: Partial<KontrakInput> = {
  startDate: "",
  durationMonths: 3 as never,
  agreedSalary: "",
  placementFee: "",
  warrantyDays: 90 as never,
  maxReplacements: 2 as never,
  additionalClauses: "",
};

function rupiahToNumberForSubmit(value: string): string {
  // Pertahankan string berformat angka murni untuk Zod (parseRupiah di dalam skema meng-handle titik/koma).
  // Kirim apa adanya; zod akan parse via parseRupiah.
  return value;
}

export function KontrakForm({
  majikanOptions,
  workerOptions,
}: {
  majikanOptions: { id: string; name: string; email: string; phone: string | null }[];
  workerOptions: { id: string; fullName: string; nickname: string; category: string; expectedSalary: unknown }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Select options mapped
  const majikanSelect: Option[] = useMemo(
    () =>
      majikanOptions.map((m) => ({
        id: m.id,
        label: `${m.name} — ${m.email}`,
        sub: m.phone ?? undefined,
      })),
    [majikanOptions],
  );

  const workerSelect: Option[] = useMemo(
    () =>
      workerOptions.map((w) => ({
        id: w.id,
        label: `${w.fullName} (@${w.nickname}) — ${w.category}`,
        sub: `Harapan Rp ${Number(w.expectedSalary ?? 0).toLocaleString("id-ID")}`,
      })),
    [workerOptions],
  );

  const form = useForm<KontrakInput>({
    resolver: zodResolver(kontrakSchema as never),
    mode: "onChange",
    defaultValues: {
      clientId: "" as never,
      workerId: "" as never,
      startDate: "",
      durationMonths: 3 as never,
      agreedSalary: "",
      placementFee: "",
      warrantyDays: 90 as never,
      maxReplacements: 2 as never,
      additionalClauses: "",
      ...DEFAULTS,
    } as KontrakInput,
  });

  const { register, watch, setValue, handleSubmit, formState } = form;
  const errors = formState.errors;

  const startDate = watch("startDate");
  const durationMonths = watch("durationMonths");
  const agreedSalary = watch("agreedSalary");
  const placementFee = watch("placementFee");

  const previewEndDate = useMemo(() => {
    const dur = Number(durationMonths);
    if (!startDate || !Number.isFinite(dur) || dur < 3) return "";
    return calcEndDate(startDate, dur);
  }, [startDate, durationMonths]);

  // Format rupiah on change — jaga UX: tampilkan ribuan separator saat ketik
  const handleRupiahChange = (field: "agreedSalary" | "placementFee", raw: string) => {
    // Izinkan hanya digits; format dengan toLocaleString
    const digits = raw.replace(/[^0-9]/g, "");
    if (!digits) {
      setValue(field, "" as never, { shouldValidate: true, shouldDirty: true });
      return;
    }
    const formatted = Number(digits).toLocaleString("id-ID");
    setValue(field, formatted as never, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSuccessMsg(null);

    const fd = new FormData();
    fd.set("clientId", values.clientId);
    fd.set("workerId", values.workerId);
    fd.set("startDate", values.startDate);
    fd.set("durationMonths", String(values.durationMonths));
    fd.set("agreedSalary", rupiahToNumberForSubmit(values.agreedSalary as unknown as string));
    fd.set("placementFee", rupiahToNumberForSubmit(values.placementFee as unknown as string));
    fd.set("warrantyDays", String(values.warrantyDays ?? 90));
    fd.set("maxReplacements", String(values.maxReplacements ?? 2));
    fd.set("additionalClauses", String(values.additionalClauses ?? ""));

    startTransition(async () => {
      const res = await createKontrakAction(fd);
      if (!res.ok) {
        setSubmitError(res.error);
        if (res.fieldErrors) {
          for (const [k, msg] of Object.entries(res.fieldErrors)) {
            // Map ke field error untuk tampil di bawah input
            try {
              form.setError(k as never, { message: msg });
            } catch {}
          }
        }
        return;
      }
      setSuccessMsg(`Kontrak ${res.contractNumber} berhasil dibuat. Berakhir ${formatTanggalIndo(res.endDate)}.`);
      // Reset ringkas, lalu refresh daftar
      router.push("/admin/kontrak");
      router.refresh();
    });
  });

  const hasOptions = majikanSelect.length > 0 && workerSelect.length > 0;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {!hasOptions && (
        <div role="alert" className="rounded-[12px] border border-[#F3D9A8] bg-[#FBEEDC] px-4 py-3 text-sm leading-relaxed text-[#8A4B08]">
          {majikanOptions.length === 0 && <p>Belum ada akun Majikan. Buat akun Majikan terlebih dahulu di menu Majikan sebelum membuat kontrak.</p>}
          {majikanOptions.length > 0 && workerOptions.length === 0 && (
            <p>Tidak ada pekerja berstatus Siap Tugas. Hanya pekerja STANDBY yang dapat dikontrak — registrasi pekerja baru terlebih dahulu.</p>
          )}
        </div>
      )}

      {/* Baris 1: Majikan & Pekerja */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="clientId">Majikan *</Label>
          <Select id="clientId" invalid={!!errors.clientId} {...register("clientId")}>
            <option value="">Pilih Majikan</option>
            {majikanSelect.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </Select>
          <FieldError message={errors.clientId?.message as string} />
          <FieldHint>Akun CLIENT — dibuat/di-reuse via menu Majikan saat deal.</FieldHint>
        </div>
        <div>
          <Label htmlFor="workerId">Pekerja *</Label>
          <Select id="workerId" invalid={!!errors.workerId} {...register("workerId")}>
            <option value="">Pilih Pekerja (STANDBY)</option>
            {workerSelect.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </Select>
          <FieldError message={errors.workerId?.message as string} />
          <FieldHint>Hanya pekerja berstatus Siap Tugas yang tampil.</FieldHint>
        </div>
      </div>

      {/* Baris 2: Tanggal mulai & Durasi */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="startDate">Tanggal Mulai *</Label>
          <Input id="startDate" type="date" invalid={!!errors.startDate} {...register("startDate")} />
          <FieldError message={errors.startDate?.message as string} />
        </div>
        <div>
          <Label htmlFor="durationMonths">Durasi (bulan) *</Label>
          <Input
            id="durationMonths"
            type="number"
            inputMode="numeric"
            min={3}
            max={36}
            placeholder="Minimal 3"
            invalid={!!errors.durationMonths}
            {...register("durationMonths", { valueAsNumber: true })}
          />
          <FieldError message={errors.durationMonths?.message as string} />
          <FieldHint>Minimal 3 bulan sesuai PRD.</FieldHint>
        </div>
      </div>

      {/* Pratinjau endDate — sesuai Task 18: pratinjau tanggal selesai otomatis */}
      <div
        aria-live="polite"
        className={[
          "rounded-[12px] border px-4 py-3 text-sm",
          previewEndDate ? "border-[#DCEDE6] bg-[#EEF6F1] text-[#064E3B]" : "border-[#E3D5BC] bg-[#F8F7F4] text-[#6F675A]",
        ].join(" ")}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">Pratinjau tanggal selesai:</span>
          {previewEndDate ? (
            <span className="font-semibold tabular-nums">{formatTanggalIndo(previewEndDate)} ({previewEndDate})</span>
          ) : (
            <span className="italic">Isi tanggal mulai dan durasi untuk melihat pratinjau.</span>
          )}
        </div>
        {previewEndDate && (
          <p className="mt-1 text-xs leading-relaxed opacity-80">
            Dihitung sebagai: tanggal mulai + durasi bulan, berakhir sehari sebelum tanggal yang sama di bulan target (inklusif).
          </p>
        )}
      </div>

      {/* Baris 3: Gaji & Biaya penempatan */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="agreedSalary">Gaji Disepakati (Rp) *</Label>
          <Input
            id="agreedSalary"
            inputMode="numeric"
            placeholder="Contoh: 2.500.000"
            invalid={!!errors.agreedSalary}
            value={agreedSalary as unknown as string}
            onChange={(e) => handleRupiahChange("agreedSalary", e.target.value)}
          />
          <FieldError message={errors.agreedSalary?.message as string} />
          <FieldHint>Nominal bulanan yang disepakati dengan Majikan.</FieldHint>
        </div>
        <div>
          <Label htmlFor="placementFee">Biaya Penempatan (Rp) *</Label>
          <Input
            id="placementFee"
            inputMode="numeric"
            placeholder="Contoh: 3.000.000"
            invalid={!!errors.placementFee}
            value={placementFee as unknown as string}
            onChange={(e) => handleRupiahChange("placementFee", e.target.value)}
          />
          <FieldError message={errors.placementFee?.message as string} />
          <FieldHint>Nominal penagihan awal (invoice PLACEMENT_FEE DRAFT dibuat saat rilis SPK — Task 19).</FieldHint>
        </div>
      </div>

      {/* Baris 4: Garansi & Kuota */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="warrantyDays">Masa Garansi (hari)</Label>
          <Input
            id="warrantyDays"
            type="number"
            inputMode="numeric"
            min={0}
            max={365}
            placeholder="90"
            invalid={!!errors.warrantyDays}
            {...register("warrantyDays", { valueAsNumber: true })}
          />
          <FieldError message={errors.warrantyDays?.message as string} />
          <FieldHint>Default 90 hari. Berjalan paralel sejak tanggal mulai.</FieldHint>
        </div>
        <div>
          <Label htmlFor="maxReplacements">Kuota Tukar</Label>
          <Input
            id="maxReplacements"
            type="number"
            inputMode="numeric"
            min={0}
            max={5}
            placeholder="2"
            invalid={!!errors.maxReplacements}
            {...register("maxReplacements", { valueAsNumber: true })}
          />
          <FieldError message={errors.maxReplacements?.message as string} />
          <FieldHint>Default 2. Sisa kuota = max − terpakai.</FieldHint>
        </div>
      </div>

      {/* Klausul tambahan */}
      <div>
        <Label htmlFor="additionalClauses">Klausul Tambahan (opsional)</Label>
        <Textarea
          id="additionalClauses"
          rows={4}
          placeholder="Tambahkan ketentuan khusus bila ada (mis. jam kerja, tugas tambahan, ketentuan lembur)…"
          invalid={!!errors.additionalClauses}
          {...register("additionalClauses")}
        />
        <FieldError message={errors.additionalClauses?.message as string} />
        <FieldHint>Akan tercantum pada SPK (Task 20). Kosongkan bila tidak ada.</FieldHint>
      </div>

      {/* Pesan */}
      {submitError && (
        <div role="alert" className="rounded-[12px] border border-[#F0B8B8] bg-[#FAE7E6] px-4 py-3 text-sm leading-relaxed text-[#9C2020]">
          {submitError}
        </div>
      )}
      {successMsg && (
        <div role="status" className="rounded-[12px] border border-[#DCEDE6] bg-[#EEF6F1] px-4 py-3 text-sm leading-relaxed text-[#064E3B]">
          {successMsg}
        </div>
      )}

      {/* Aksi */}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending} className="min-h-[44px]">
          {pending ? "Menyimpan…" : "Simpan Draft Kontrak"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-[44px]"
          onClick={() => router.push("/admin/kontrak")}
          disabled={pending}
        >
          Batal
        </Button>
      </div>

      <p className="text-xs leading-relaxed text-[#6F675A]">
        Catatan: Draft kontrak dibuat berstatus Aktif. Rilis SPK resmi (pekerja Ditempatkan + invoice DRAFT + PDF) ditangani pada langkah berikutnya (Task 19).
      </p>
    </form>
  );
}
