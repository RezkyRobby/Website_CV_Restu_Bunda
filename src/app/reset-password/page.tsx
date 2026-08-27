import { Suspense } from "react";
import { ResetPasswordClient } from "./reset-password.client";

export const metadata = {
  title: "Atur Ulang Kata Sandi — Restu Bunda",
  description: "Buat kata sandi baru untuk akun Portal Majikan melalui tautan undangan.",
};

/**
 * Halaman Reset Password — tujuan invite set-password (Task 17).
 * Diakses via tautan di email undangan yang dikirim saat CS membuat akun Majikan
 * (Better-Auth requestPasswordReset → sendResetPassword → email invite).
 * Token valid 1 jam; halaman memvalidasi token via redirect-callback atau input manual.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[480px] px-4 py-10 text-sm text-[#6F675A]">Memuat...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
