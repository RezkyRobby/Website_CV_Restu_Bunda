"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const tokenFromUrl = params.get("token") ?? "";
  const errorFromUrl = params.get("error") ?? "";

  const initialError =
    errorFromUrl === "INVALID_TOKEN"
      ? "Tautan tidak valid atau sudah kedaluwarsa. Silakan minta CS mengirim ulang undangan."
      : errorFromUrl
        ? `Terjadi kesalahan: ${errorFromUrl}`
        : null;

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError);

  const handleSubmit = () => {
    setError(null);
    setMessage(null);

    if (!token.trim()) {
      setError("Token tautan tidak ditemukan. Buka kembali tautan dari email undangan.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await authClient.resetPassword({
          newPassword: password,
          token: token.trim(),
        });
        // better-auth 1.x mengembalikan { data, error } atau throw — tangani keduanya.
        const maybeError = (res as unknown as { error?: { message?: string } })?.error;
        if (maybeError) {
          setError(maybeError.message ?? "Gagal mengatur kata sandi. Tautan mungkin sudah kedaluwarsa.");
          return;
        }
        setMessage("Kata sandi berhasil dibuat. Anda akan dialihkan ke halaman utama untuk login.");
        setPassword("");
        setConfirm("");
        setTimeout(() => router.push("/"), 1600);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal mengatur kata sandi.";
        setError(msg.includes("INVALID_TOKEN") ? "Tautan tidak valid atau sudah kedaluwarsa." : msg);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] px-4 py-10 text-[#26221B]">
      <div className="mx-auto max-w-[480px] rounded-[16px] border border-[#E3D5BC] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-wide text-[#064E3B]">CV Restu Bunda Mariyati</p>
          <h1 className="text-xl font-semibold leading-tight text-[#26221B] sm:text-2xl">Buat Kata Sandi</h1>
          <p className="text-sm leading-relaxed text-[#6F675A]">
            Atur kata sandi untuk akun Portal Majikan Anda. Tautan undangan berlaku terbatas (1 jam). Bila tautan
            kedaluwarsa, hubungi CS untuk mengirim ulang undangan.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rp-token">Token Undangan</Label>
            <Input
              id="rp-token"
              placeholder="Token dari tautan email"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
            />
            <span className="text-xs text-[#6F675A]">Biasanya terisi otomatis bila membuka tautan dari email.</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rp-password">Kata Sandi Baru</Label>
            <Input
              id="rp-password"
              type="password"
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rp-confirm">Konfirmasi Kata Sandi</Label>
            <Input
              id="rp-confirm"
              type="password"
              placeholder="Ulangi kata sandi"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && <p className="mt-4 rounded-[8px] bg-[#FFF5F4] px-3 py-2 text-sm text-[#C0392B]">{error}</p>}
        {message && <p className="mt-4 rounded-[8px] bg-[#EEF8F1] px-3 py-2 text-sm text-[#064E3B]">{message}</p>}

        <div className="mt-6 flex flex-col gap-3">
          <Button type="button" onClick={handleSubmit} disabled={pending} variant="primary" size="md" className="min-h-[44px]">
            {pending ? "Memproses…" : "Simpan Kata Sandi"}
          </Button>
          <Link href="/" className="text-center text-sm text-[#6F675A] underline underline-offset-4 hover:text-[#26221B]">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
