"use client";

import { useFieldArray, type Control, type FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label, FieldError, FieldHint } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { religionLabels, maritalStatusLabels, workerCategoryLabels } from "@/messages/labels";
import { religionValues, maritalStatusValues, workerCategoryValues } from "@/lib/validators/worker";
import type { ReligionValue, MaritalStatusValue, WorkerCategoryValue } from "@/lib/validators/worker";

// ============================================================
// Tipe form gabungan — dipakai WorkerForm
// ============================================================

export type WorkerFormValues = {
  // Step 1
  nik: string;
  noKk: string;
  fullName: string;
  nickname: string;
  birthDate: string;
  religion: ReligionValue | "";
  maritalStatus: MaritalStatusValue | "";
  ethnicity: string;
  domicileAddress: string;
  guarantorName: string;
  guarantorPhone: string;
  guarantorRelation: string;
  // Step 2
  category: WorkerCategoryValue | "";
  skillIds: string[];
  stayIn: boolean;
  petTolerance: boolean;
  willingOutOfCity: boolean;
  trainingCertificates: { name: string; url: string }[];
  // Step 3
  photoProfile: File | null;
  ktpDocument: File | null;
  mcuReport: File | null;
  skckDocument: File | null;
  skckVerified: boolean;
  // Step 4
  experiences: { employerLocation: string; position: string; startDate: string; endDate: string; reasonForLeaving: string }[];
  // Step 5
  expectedSalary: string;
  // Step 6
  dataConsent: boolean;
};

// Langkah
export const STEPS = [
  { key: 1, label: "Identitas", hint: "Data diri & wali" },
  { key: 2, label: "Keahlian", hint: "Kategori & keterampilan" },
  { key: 3, label: "Dokumen & MCU", hint: "Foto & berkas" },
  { key: 4, label: "Riwayat", hint: "Pengalaman kerja" },
  { key: 5, label: "Gaji", hint: "Standar harapan" },
  { key: 6, label: "Persetujuan", hint: "Consent UU PDP" },
] as const;

// ── Step 1 ──
export function StepIdentitas({
  register,
  errors,
}: {
  register: import("react-hook-form").UseFormRegister<WorkerFormValues>;
  errors: FieldErrors<WorkerFormValues>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="nik">NIK (16 digit) *</Label>
          <Input id="nik" inputMode="numeric" placeholder="3201234567890123" invalid={!!errors.nik} {...register("nik")} />
          <FieldError message={errors.nik?.message} />
        </div>
        <div>
          <Label htmlFor="noKk">No. KK (opsional)</Label>
          <Input id="noKk" inputMode="numeric" placeholder="16 digit bila ada" invalid={!!errors.noKk} {...register("noKk")} />
          <FieldError message={errors.noKk?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Nama Lengkap *</Label>
          <Input id="fullName" placeholder="Siti Aminah" invalid={!!errors.fullName} {...register("fullName")} />
          <FieldError message={errors.fullName?.message} />
        </div>
        <div>
          <Label htmlFor="nickname">Nama Panggilan *</Label>
          <Input id="nickname" placeholder="Siti" invalid={!!errors.nickname} {...register("nickname")} />
          <FieldError message={errors.nickname?.message} />
          <FieldHint>Tampil di katalog publik.</FieldHint>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="birthDate">Tanggal Lahir *</Label>
          <Input id="birthDate" type="date" invalid={!!errors.birthDate} {...register("birthDate")} />
          <FieldError message={errors.birthDate?.message} />
          <FieldHint>Usia 17–70 tahun.</FieldHint>
        </div>
        <div>
          <Label htmlFor="ethnicity">Suku *</Label>
          <Input id="ethnicity" placeholder="Bugis" invalid={!!errors.ethnicity} {...register("ethnicity")} />
          <FieldError message={errors.ethnicity?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="religion">Agama *</Label>
          <Select id="religion" invalid={!!errors.religion} {...register("religion")}>
            <option value="">Pilih agama</option>
            {religionValues.map((v) => (
              <option key={v} value={v}>
                {religionLabels[v as keyof typeof religionLabels] ?? v}
              </option>
            ))}
          </Select>
          <FieldError message={errors.religion?.message} />
        </div>
        <div>
          <Label htmlFor="maritalStatus">Status Pernikahan *</Label>
          <Select id="maritalStatus" invalid={!!errors.maritalStatus} {...register("maritalStatus")}>
            <option value="">Pilih status</option>
            {maritalStatusValues.map((v) => (
              <option key={v} value={v}>
                {maritalStatusLabels[v as keyof typeof maritalStatusLabels] ?? v}
              </option>
            ))}
          </Select>
          <FieldError message={errors.maritalStatus?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="domicileAddress">Alamat Domisili *</Label>
        <Textarea id="domicileAddress" placeholder="Jl. Mawar No. 10, Makassar" invalid={!!errors.domicileAddress} {...register("domicileAddress")} />
        <FieldError message={errors.domicileAddress?.message} />
        <FieldHint>Privat, tidak tampil di katalog publik.</FieldHint>
      </div>

      <div className="rounded-[12px] border border-[#E3D5BC] bg-[#F8F7F4] p-4">
        <p className="text-sm font-semibold text-[#26221B]">Wali / Penjamin Darurat</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="guarantorName">Nama Wali *</Label>
            <Input id="guarantorName" placeholder="Nama wali" invalid={!!errors.guarantorName} {...register("guarantorName")} />
            <FieldError message={errors.guarantorName?.message} />
          </div>
          <div>
            <Label htmlFor="guarantorPhone">Telepon Wali *</Label>
            <Input id="guarantorPhone" inputMode="tel" placeholder="0813xxxxxxx" invalid={!!errors.guarantorPhone} {...register("guarantorPhone")} />
            <FieldError message={errors.guarantorPhone?.message} />
          </div>
        </div>
        <div className="mt-3">
          <Label htmlFor="guarantorRelation">Hubungan (opsional)</Label>
          <Input id="guarantorRelation" placeholder="Orang tua / Saudara" invalid={!!errors.guarantorRelation} {...register("guarantorRelation")} />
          <FieldError message={errors.guarantorRelation?.message} />
        </div>
      </div>
    </div>
  );
}

// ── Step 2 ──
export function StepKeahlian({
  register,
  control,
  errors,
  watchCategory,
  skills,
  toggleSkill,
  selectedSkills,
}: {
  register: import("react-hook-form").UseFormRegister<WorkerFormValues>;
  control: Control<WorkerFormValues>;
  errors: FieldErrors<WorkerFormValues>;
  watchCategory: string;
  skills: { id: string; name: string }[];
  toggleSkill: (id: string) => void;
  selectedSkills: string[];
}) {
  void control;
  void watchCategory;
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label htmlFor="category">Kategori Layanan *</Label>
        <Select id="category" invalid={!!errors.category} {...register("category")}>
          <option value="">Pilih kategori</option>
          {workerCategoryValues.map((v) => (
            <option key={v} value={v}>
              {workerCategoryLabels[v as keyof typeof workerCategoryLabels] ?? v}
            </option>
          ))}
        </Select>
        <FieldError message={errors.category?.message} />
      </div>

      <div>
        <Label>Keahlian *</Label>
        <p className="mt-1 text-xs text-[#6F675A]">Pilih minimal 1 keahlian (vocabulary terkontrol). Maksimal 12.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((s) => {
            const active = selectedSkills.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSkill(s.id)}
                className={[
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors min-h-[36px]",
                  active ? "border-[#064E3B] bg-[#064E3B] text-white" : "border-[#E3D5BC] bg-white text-[#26221B] hover:bg-[#F8E7C9]",
                ].join(" ")}
                aria-pressed={active}
              >
                {s.name}
              </button>
            );
          })}
        </div>
        {skills.length === 0 && <FieldHint>Belum ada skill aktif. Hubungi Super Admin.</FieldHint>}
        <FieldError message={errors.skillIds?.message} />
      </div>

      <div className="grid gap-3 rounded-[12px] border border-[#E3D5BC] bg-[#F8F7F4] p-4">
        <Checkbox label="Bersedia menginap (stay-in)" {...register("stayIn")} />
        <Checkbox label="Toleransi hewan peliharaan" {...register("petTolerance")} />
        <Checkbox label="Bersedia ditempatkan di luar kota" {...register("willingOutOfCity")} />
      </div>
    </div>
  );
}

// ── Step 3 ──
export function StepDokumen({
  register,
  errors,
  setValue,
  watchFiles,
}: {
  register: import("react-hook-form").UseFormRegister<WorkerFormValues>;
  errors: FieldErrors<WorkerFormValues>;
  setValue: import("react-hook-form").UseFormSetValue<WorkerFormValues>;
  watchFiles: { photoProfile: File | null; ktpDocument: File | null; mcuReport: File | null; skckDocument: File | null };
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[12px] border border-[#F3D9A8] bg-[#FFFBEB] px-4 py-3">
        <p className="text-xs font-semibold text-[#8A4B08]">Aturan unggah</p>
        <p className="mt-1 text-xs leading-relaxed text-[#6F675A]">
          Foto profil JPG/PNG maks 2 MB. Dokumen sensitif (KTP, MCU, SKCK) wajib JPG/PNG maks 5 MB — satu pipeline watermark (PRD §5.3 #2). Dokumen sensitif tidak pernah terekspos via URL mentah; akses via proxy bertanda tangan dengan watermark dinamis.
        </p>
      </div>

      <FileField
        id="photoProfile"
        label="Foto Profil *"
        hint="JPG/PNG maks 2 MB"
        file={watchFiles.photoProfile}
        error={errors.photoProfile?.message}
        onChange={(f) => setValue("photoProfile", f, { shouldValidate: true })}
      />
      <FileField
        id="ktpDocument"
        label="KTP *"
        hint="JPG/PNG maks 5 MB"
        file={watchFiles.ktpDocument}
        error={errors.ktpDocument?.message}
        onChange={(f) => setValue("ktpDocument", f, { shouldValidate: true })}
      />
      <FileField
        id="mcuReport"
        label="Laporan MCU (opsional)"
        hint="JPG/PNG maks 5 MB — hasil pemeriksaan kesehatan"
        file={watchFiles.mcuReport}
        error={errors.mcuReport?.message}
        onChange={(f) => setValue("mcuReport", f, { shouldValidate: true })}
      />
      <FileField
        id="skckDocument"
        label="Dokumen SKCK (opsional)"
        hint="JPG/PNG maks 5 MB"
        file={watchFiles.skckDocument}
        error={errors.skckDocument?.message}
        onChange={(f) => setValue("skckDocument", f, { shouldValidate: true })}
      />
      <Checkbox label="SKCK terverifikasi" hint="Centang bila SKCK sudah divalidasi CS" {...register("skckVerified")} />
    </div>
  );
}

function FileField({
  id,
  label,
  hint,
  file,
  error,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  error?: string;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="mt-1 block w-full rounded-[12px] border border-[#E3D5BC] bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#064E3B] file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-[#05382B] min-h-[44px]"
      />
      <FieldHint>{hint}{file ? ` — terpilih: ${file.name} (${Math.round(file.size / 1024)} KB)` : ""}</FieldHint>
      <FieldError message={error} />
    </div>
  );
}

// ── Step 4 ──
export function StepRiwayat({
  control,
  register,
  errors,
}: {
  control: Control<WorkerFormValues>;
  register: import("react-hook-form").UseFormRegister<WorkerFormValues>;
  errors: FieldErrors<WorkerFormValues>;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "experiences" });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#26221B]">Riwayat Majikan</p>
          <p className="text-xs text-[#6F675A]">Opsional — tambah bila ada pengalaman sebelumnya.</p>
        </div>
        <button
          type="button"
          onClick={() =>
            append({ employerLocation: "", position: "", startDate: "", endDate: "", reasonForLeaving: "" })
          }
          className="inline-flex min-h-[44px] items-center rounded-full border border-[#064E3B] bg-white px-4 text-sm font-medium text-[#064E3B] hover:bg-[#DCEDE6]"
        >
          + Tambah Riwayat
        </button>
      </div>

      {fields.length === 0 && (
        <p className="rounded-[12px] border border-dashed border-[#E3D5BC] bg-[#F8F7F4] px-4 py-6 text-center text-sm text-[#6F675A]">
          Belum ada riwayat. Tekan “Tambah Riwayat” bila pekerja pernah bekerja sebelumnya.
        </p>
      )}

      {fields.map((field, idx) => (
        <div key={field.id} className="rounded-[12px] border border-[#E3D5BC] bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#26221B]">Pengalaman #{idx + 1}</p>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-sm font-medium text-[#C0392B] hover:underline min-h-[44px] px-2"
            >
              Hapus
            </button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Lokasi Majikan *</Label>
              <Input placeholder="Makassar" invalid={!!errors.experiences?.[idx]?.employerLocation} {...register(`experiences.${idx}.employerLocation` as const)} />
              <FieldError message={errors.experiences?.[idx]?.employerLocation?.message} />
            </div>
            <div>
              <Label>Posisi *</Label>
              <Input placeholder="ART / Baby Sitter" invalid={!!errors.experiences?.[idx]?.position} {...register(`experiences.${idx}.position` as const)} />
              <FieldError message={errors.experiences?.[idx]?.position?.message} />
            </div>
            <div>
              <Label>Tanggal Mulai *</Label>
              <Input type="date" invalid={!!errors.experiences?.[idx]?.startDate} {...register(`experiences.${idx}.startDate` as const)} />
              <FieldError message={errors.experiences?.[idx]?.startDate?.message} />
            </div>
            <div>
              <Label>Tanggal Selesai (opsional)</Label>
              <Input type="date" invalid={!!errors.experiences?.[idx]?.endDate} {...register(`experiences.${idx}.endDate` as const)} />
              <FieldError message={errors.experiences?.[idx]?.endDate?.message} />
            </div>
          </div>
          <div className="mt-3">
            <Label>Alasan Berhenti *</Label>
            <Textarea placeholder="Selesai kontrak / pindah kota ..." invalid={!!errors.experiences?.[idx]?.reasonForLeaving} {...register(`experiences.${idx}.reasonForLeaving` as const)} />
            <FieldError message={errors.experiences?.[idx]?.reasonForLeaving?.message} />
          </div>
        </div>
      ))}
      <FieldError message={errors.experiences?.message} />
    </div>
  );
}

// ── Step 5 ──
export function StepGaji({
  register,
  errors,
}: {
  register: import("react-hook-form").UseFormRegister<WorkerFormValues>;
  errors: FieldErrors<WorkerFormValues>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="expectedSalary">Gaji Harapan (IDR) *</Label>
        <Input
          id="expectedSalary"
          inputMode="numeric"
          placeholder="Contoh: 2500000"
          invalid={!!errors.expectedSalary}
          {...register("expectedSalary")}
        />
        <FieldError message={errors.expectedSalary?.message} />
        <FieldHint>Masukkan angka tanpa titik/koma. Rentang Rp500.000 – Rp50.000.000.</FieldHint>
      </div>
      <div className="rounded-[12px] border border-[#E3D5BC] bg-[#F8F7F4] px-4 py-3">
        <p className="text-xs leading-relaxed text-[#6F675A]">Nilai ini dipakai sebagai acuan Smart Matching Engine dan negosiasi kontrak. Pastikan sesuai standar kategori yang dipilih.</p>
      </div>
    </div>
  );
}

// ── Step 6 ──
export function StepConsent({
  register,
  errors,
}: {
  register: import("react-hook-form").UseFormRegister<WorkerFormValues>;
  errors: FieldErrors<WorkerFormValues>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[12px] border border-[#E3D5BC] bg-white p-4">
        <p className="text-sm font-semibold text-[#26221B]">Persetujuan Pemrosesan Data Pribadi (UU PDP)</p>
        <p className="mt-2 text-sm leading-relaxed text-[#6F675A]">
          Dengan mencentang persetujuan ini, pekerja menyetujui bahwa CV Restu Bunda Mariyati memproses data pribadi (NIK, alamat, dokumen KTP/MCU/SKCK, dan riwayat kerja) untuk keperluan penempatan tenaga kerja, pencocokan dengan calon majikan, dan kewajiban pelaporan. Waktu persetujuan akan direkam (`dataConsentAt`). Tanpa persetujuan, data tidak dapat disimpan (AGENTS.md Aturan 7).
        </p>
      </div>
      <label className="flex gap-3 rounded-[12px] border border-[#E3D5BC] bg-[#FFFBEB] p-4 cursor-pointer">
        <input type="checkbox" className="mt-1 size-[18px] shrink-0 accent-[#064E3B]" {...register("dataConsent")} />
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-[#26221B]">Saya menyetujui pemrosesan data pribadi untuk penempatan *</span>
          <span className="text-xs leading-relaxed text-[#6F675A]">Wajib dicentang agar formulir dapat disimpan.</span>
        </span>
      </label>
      <FieldError message={errors.dataConsent?.message} />
    </div>
  );
}
