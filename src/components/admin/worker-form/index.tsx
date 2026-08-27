"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { STEPS, StepIdentitas, StepKeahlian, StepDokumen, StepRiwayat, StepGaji, StepConsent } from "./steps";
import type { WorkerFormValues } from "./steps";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
} from "@/lib/validators/worker";
import { createWorkerAction } from "@/app/admin/pekerja/actions";

// Resolver per langkah — dipakai untuk validasi sebelum lanjut
const stepSchemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, step6Schema] as const;

function getStepResolver(step: number) {
  const schema = stepSchemas[step - 1];
  // step3 butuh File, tidak divalidasi via resolver awal — dilewati di validasi langkah
  if (step === 3) return undefined;
  return zodResolver(schema as never);
}

export function WorkerForm({ skills }: { skills: { id: string; name: string }[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<WorkerFormValues>({
    // Resolver dinamis per langkah: validasi hanya langkah aktif saat next
    // Untuk langkah 3 (file), validasi manual
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: (getStepResolver(step) as any) ?? undefined,
    mode: "onChange",
    defaultValues: {
      nik: "",
      noKk: "",
      fullName: "",
      nickname: "",
      birthDate: "",
      religion: "" as never,
      maritalStatus: "" as never,
      ethnicity: "",
      domicileAddress: "",
      guarantorName: "",
      guarantorPhone: "",
      guarantorRelation: "",
      category: "" as never,
      skillIds: [],
      stayIn: false,
      petTolerance: false,
      willingOutOfCity: false,
      trainingCertificates: [],
      photoProfile: null,
      ktpDocument: null,
      mcuReport: null,
      skckDocument: null,
      skckVerified: false,
      experiences: [],
      expectedSalary: "",
      dataConsent: false as never,
    },
  });

  const { register, control, watch, setValue, trigger, handleSubmit, getValues, formState } = form;
  const errors = formState.errors;
  const selectedSkills = watch("skillIds");
  const watchCategory = watch("category");
  const watchFiles = {
    photoProfile: watch("photoProfile"),
    ktpDocument: watch("ktpDocument"),
    mcuReport: watch("mcuReport"),
    skckDocument: watch("skckDocument"),
  };

  const toggleSkill = (id: string) => {
    const cur: string[] = getValues("skillIds") ?? [];
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    setValue("skillIds", next, { shouldValidate: true, shouldDirty: true });
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    if (step === 1) {
      const ok = await trigger(["nik", "noKk", "fullName", "nickname", "birthDate", "religion", "maritalStatus", "ethnicity", "domicileAddress", "guarantorName", "guarantorPhone", "guarantorRelation"]);
      if (!ok) return false;
      // validasi manual dengan zod untuk pesan presisi
      const parsed = step1Schema.safeParse(getValues());
      if (!parsed.success) {
        // set error pertama ke form
        const first = parsed.error.issues[0];
        if (first?.path[0]) setSubmitError(first.message);
        return false;
      }
      return true;
    }
    if (step === 2) {
      const vals = getValues();
      const parsed = step2Schema.safeParse(vals);
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        setSubmitError(first.message);
        // set error ke field terkait agar FieldError tampil
        if (first.path[0] === "category") form.setError("category" as never, { message: first.message });
        if (first.path[0] === "skillIds") form.setError("skillIds" as never, { message: first.message });
        return false;
      }
      return true;
    }
    if (step === 3) {
      const vals = getValues();
      // cek file wajib
      if (!vals.photoProfile) {
        setSubmitError("Foto profil wajib diunggah (JPG/PNG maks 2 MB).");
        form.setError("photoProfile" as never, { message: "Foto profil wajib diunggah." });
        return false;
      }
      if (!vals.ktpDocument) {
        setSubmitError("Dokumen KTP wajib diunggah (JPG/PNG maks 5 MB).");
        form.setError("ktpDocument" as never, { message: "KTP wajib diunggah." });
        return false;
      }
      const parsed = step3Schema.safeParse({
        photoProfile: vals.photoProfile,
        ktpDocument: vals.ktpDocument,
        mcuReport: vals.mcuReport,
        skckDocument: vals.skckDocument,
        skckVerified: vals.skckVerified,
      });
      if (!parsed.success) {
        setSubmitError(parsed.error.issues[0].message);
        return false;
      }
      return true;
    }
    if (step === 4) {
      const parsed = step4Schema.safeParse({ experiences: getValues("experiences") });
      if (!parsed.success) {
        setSubmitError(parsed.error.issues[0].message);
        return false;
      }
      return true;
    }
    if (step === 5) {
      const parsed = step5Schema.safeParse({ expectedSalary: getValues("expectedSalary") });
      if (!parsed.success) {
        setSubmitError(parsed.error.issues[0].message);
        form.setError("expectedSalary" as never, { message: parsed.error.issues[0].message });
        return false;
      }
      return true;
    }
    if (step === 6) {
      const parsed = step6Schema.safeParse({ dataConsent: getValues("dataConsent") });
      if (!parsed.success) {
        setSubmitError(parsed.error.issues[0].message);
        form.setError("dataConsent" as never, { message: parsed.error.issues[0].message });
        return false;
      }
      return true;
    }
    return true;
  };

  const goNext = async () => {
    setSubmitError(null);
    const ok = await validateCurrentStep();
    if (!ok) return;
    setStep((s) => Math.min(6, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    setSubmitError(null);
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (values: WorkerFormValues) => {
    // validasi langkah 6 lagi sebelum kirim
    const ok = await validateCurrentStep();
    if (!ok) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      // payload JSON tanpa file
      const payload = {
        nik: values.nik,
        noKk: values.noKk,
        fullName: values.fullName,
        nickname: values.nickname,
        birthDate: values.birthDate,
        religion: values.religion,
        maritalStatus: values.maritalStatus,
        ethnicity: values.ethnicity,
        domicileAddress: values.domicileAddress,
        guarantorName: values.guarantorName,
        guarantorPhone: values.guarantorPhone,
        guarantorRelation: values.guarantorRelation,
        category: values.category,
        skillIds: values.skillIds,
        stayIn: values.stayIn,
        petTolerance: values.petTolerance,
        willingOutOfCity: values.willingOutOfCity,
        trainingCertificates: values.trainingCertificates ?? [],
        skckVerified: values.skckVerified,
        experiences: values.experiences ?? [],
        expectedSalary: values.expectedSalary,
        dataConsent: values.dataConsent,
      };
      fd.append("payload", JSON.stringify(payload));
      if (values.photoProfile) fd.append("photoProfile", values.photoProfile);
      if (values.ktpDocument) fd.append("ktpDocument", values.ktpDocument);
      if (values.mcuReport) fd.append("mcuReport", values.mcuReport);
      if (values.skckDocument) fd.append("skckDocument", values.skckDocument);

      const res = await createWorkerAction(fd);
      if (!res.ok) {
        setSubmitError(res.error);
        return;
      }
      router.push(`/admin/pekerja?created=${res.workerId}`);
      router.refresh();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Gagal menyimpan data pekerja.");
    } finally {
      setSubmitting(false);
    }
  };

  // Adapter register untuk StepIdentitas (butuh register generik)
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* Stepper */}
      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => {
          const active = step === s.key;
          const done = step > s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={async () => {
                // izinkan mundur bebas; maju hanya bila validasi langkah saat ini lolos
                if (s.key < step) {
                  setStep(s.key);
                  return;
                }
                if (s.key === step) return;
                // coba validasi berurutan sampai target
                for (let cur = step; cur < s.key; cur++) {
                  const ok = await validateCurrentStepAndSet(cur);
                  if (!ok) return;
                  setStep(cur + 1);
                }
              }}
              className={[
                "flex min-h-[44px] items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-[#064E3B] bg-[#064E3B] text-white"
                  : done
                    ? "border-[#DCEDE6] bg-[#DCEDE6] text-[#064E3B]"
                    : "border-[#E3D5BC] bg-white text-[#6F675A]",
              ].join(" ")}
              aria-current={active ? "step" : undefined}
            >
              <span
                className={[
                  "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                  active ? "bg-white text-[#064E3B]" : done ? "bg-[#064E3B] text-white" : "bg-[#F8E7C9] text-[#6F675A]",
                ].join(" ")}
              >
                {done ? "✓" : s.key}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.key}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[#26221B]">
            Langkah {step}: {STEPS[step - 1].label}
          </h2>
          <p className="text-sm text-[#6F675A]">{STEPS[step - 1].hint}</p>
        </div>

        {step === 1 && <StepIdentitas register={register} errors={errors} />}
        {step === 2 && (
          <StepKeahlian
            register={register}
            control={control}
            errors={errors}
            watchCategory={watchCategory as string}
            skills={skills}
            toggleSkill={toggleSkill}
            selectedSkills={selectedSkills ?? []}
          />
        )}
        {step === 3 && <StepDokumen register={register} errors={errors} setValue={setValue} watchFiles={watchFiles as never} />}
        {step === 4 && <StepRiwayat control={control} register={register} errors={errors} />}
        {step === 5 && <StepGaji register={register} errors={errors} />}
        {step === 6 && <StepConsent register={register} errors={errors} />}

        {submitError && (
          <div role="alert" className="mt-4 rounded-[12px] border border-[#F0B8B8] bg-[#FAE7E6] px-4 py-3 text-sm text-[#9C2020]">
            {submitError}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="sand" disabled={step === 1} onClick={goPrev}>
          Kembali
        </Button>
        <div className="flex gap-2">
          {step < 6 ? (
            <Button type="button" onClick={goNext}>
              Lanjut
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Pekerja"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );

  // helper validasi per langkah untuk klik stepper
  async function validateCurrentStepAndSet(cur: number): Promise<boolean> {
    // sementara set step ke cur untuk trigger validasi yang benar
    // gunakan getValues + schema langsung
    const vals = getValues();
    if (cur === 1) {
      const p = step1Schema.safeParse(vals);
      if (!p.success) {
        setSubmitError(p.error.issues[0].message);
        return false;
      }
    } else if (cur === 2) {
      const p = step2Schema.safeParse(vals);
      if (!p.success) {
        setSubmitError(p.error.issues[0].message);
        return false;
      }
    } else if (cur === 3) {
      if (!vals.photoProfile || !vals.ktpDocument) {
        setSubmitError("Lengkapi foto profil dan KTP sebelum lanjut.");
        return false;
      }
      const p = step3Schema.safeParse({
        photoProfile: vals.photoProfile,
        ktpDocument: vals.ktpDocument,
        mcuReport: vals.mcuReport,
        skckDocument: vals.skckDocument,
        skckVerified: vals.skckVerified,
      });
      if (!p.success) {
        setSubmitError(p.error.issues[0].message);
        return false;
      }
    } else if (cur === 4) {
      const p = step4Schema.safeParse({ experiences: vals.experiences });
      if (!p.success) {
        setSubmitError(p.error.issues[0].message);
        return false;
      }
    } else if (cur === 5) {
      const p = step5Schema.safeParse({ expectedSalary: vals.expectedSalary });
      if (!p.success) {
        setSubmitError(p.error.issues[0].message);
        return false;
      }
    }
    return true;
  }
}
