"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createMajikanAction, lookupMajikanAction, resendInviteAction } from "./actions";

type MajikanRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: Date;
};

function formatTanggal(d: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Makassar",
  }).format(new Date(d));
}

// ============================================================
// Komponen utama — alur deal CS Task 17
// ============================================================

export function MajikanDealClient({ initialList }: { initialList: MajikanRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Pencarian
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupResult, setLookupResult] = useState<
    | null
    | { found: true; majikan: { id: string; name: string; email: string; phone: string | null; address: string | null } }
    | { found: false }
  >(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Form buat baru
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Resend
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const handleLookup = () => {
    setLookupError(null);
    setLookupResult(null);
    const fd = new FormData();
    fd.set("email", lookupEmail);
    fd.set("phone", lookupPhone);
    startTransition(async () => {
      const res = await lookupMajikanAction(fd);
      if (!res.ok) {
        setLookupError(res.error);
        return;
      }
      if (!res.found) setLookupResult({ found: false });
      else setLookupResult({ found: true, majikan: res.majikan });
    });
  };

  const handleCreate = () => {
    setCreateError(null);
    setCreateSuccess(null);
    setFieldErrors({});
    const fd = new FormData();
    fd.set("name", name);
    fd.set("email", email);
    fd.set("phone", phone);
    fd.set("address", address);
    startTransition(async () => {
      const res = await createMajikanAction(fd);
      if (!res.ok) {
        setCreateError(res.error);
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        return;
      }
      if (res.reused) {
        setCreateSuccess(`Akun Majikan sudah ada — dipakai ulang (ID: ${res.majikanId}). Tidak ada akun baru dibuat.`);
        setCreateError(null);
        router.refresh();
        return;
      }
      if (!res.reused) {
        const inviteNote = res.inviteSent
          ? "Email undangan pembuatan kata sandi telah dikirim ke alamat Majikan."
          : "Akun berhasil dibuat, namun email undangan belum terkirim — silakan kirim ulang undangan di bawah.";
        setCreateSuccess(`Akun Majikan baru berhasil dibuat (ID: ${res.majikanId}). ${inviteNote}`);
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
        router.refresh();
      }
    });
  };

  const handleResend = (targetEmail: string) => {
    setResendMsg(null);
    const fd = new FormData();
    fd.set("email", targetEmail);
    startTransition(async () => {
      const res = await resendInviteAction(fd);
      if (!res.ok) setResendMsg(res.error);
      else setResendMsg(`Undangan pembuatan kata sandi telah dikirim ulang ke ${targetEmail}.`);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Kartu 1: Cek existing — wajib sebelum buat baru */}
      <section className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-[#26221B]">1. Cek Akun Majikan</h2>
        <p className="mt-1 text-xs leading-relaxed text-[#6F675A]">
          Wajib cek terlebih dahulu by email atau nomor telepon. Bila sudah ada, akun yang sama dipakai ulang untuk
          kontrak berikutnya — tidak dibuat akun baru.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lookup-email">Email</Label>
            <Input
              id="lookup-email"
              type="email"
              placeholder="contoh: budi@mail.com"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              autoComplete="email"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lookup-phone">Nomor Telepon</Label>
            <Input
              id="lookup-phone"
              type="tel"
              placeholder="08xx atau 628xx"
              value={lookupPhone}
              onChange={(e) => setLookupPhone(e.target.value)}
              autoComplete="tel"
              className="h-11"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleLookup}
            disabled={pending || (!lookupEmail.trim() && !lookupPhone.trim())}
            variant="primary"
            size="md"
            className="min-h-[44px]"
          >
            {pending ? "Mencari…" : "Cek Akun"}
          </Button>
          {lookupError && <span className="text-sm text-[#C0392B]">{lookupError}</span>}
        </div>

        {lookupResult && (
          <div
            className={[
              "mt-4 rounded-[12px] border px-4 py-4",
              lookupResult.found ? "border-[#BFE3D0] bg-[#EEF8F1]" : "border-[#E3D5BC] bg-[#F8F7F4]",
            ].join(" ")}
          >
            {lookupResult.found ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="success">Ditemukan — dipakai ulang</Badge>
                  <span className="text-sm font-medium text-[#26221B]">{lookupResult.majikan.name}</span>
                  <span className="text-xs text-[#6F675A]">· {lookupResult.majikan.email}</span>
                  {lookupResult.majikan.phone && <span className="text-xs text-[#6F675A]">· {lookupResult.majikan.phone}</span>}
                </div>
                <p className="text-xs leading-relaxed text-[#6F675A]">
                  Tidak perlu membuat akun baru. Lanjutkan ke pembuatan kontrak dengan memilih Majikan ini. Satu akun
                  Majikan dipakai untuk semua kontraknya.
                </p>
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    className="min-h-[44px]"
                    disabled={pending}
                    onClick={() => handleResend(lookupResult.majikan.email)}
                  >
                    Kirim Ulang Undangan Kata Sandi
                  </Button>
                </div>
                {resendMsg && <p className="text-xs text-[#064E3B]">{resendMsg}</p>}
              </div>
            ) : (
              <p className="text-sm text-[#6F675A]">
                Tidak ditemukan akun Majikan dengan email/telepon tersebut. Silakan buat akun baru di bawah.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Kartu 2: Buat akun baru */}
      <section className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-[#26221B]">2. Buat Akun Majikan Baru</h2>
        <p className="mt-1 text-xs leading-relaxed text-[#6F675A]">
          Hanya bila cek di atas tidak menemukan akun. Akun baru otomatis menerima email undangan pembuatan kata sandi
          — Majikan menetapkan kata sandinya sendiri, CS tidak mengetahui password tersebut.
        </p>

        <div className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-name">
                Nama Lengkap <span className="text-[#C0392B]">*</span>
              </Label>
              <Input
                id="create-name"
                placeholder="Nama Majikan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && <span className="text-xs text-[#C0392B]">{fieldErrors.name}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-email">
                Email <span className="text-[#C0392B]">*</span>
              </Label>
              <Input
                id="create-email"
                type="email"
                placeholder="majikan@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && <span className="text-xs text-[#C0392B]">{fieldErrors.email}</span>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-phone">
                Nomor Telepon <span className="text-[#C0392B]">*</span>
              </Label>
              <Input
                id="create-phone"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                invalid={Boolean(fieldErrors.phone)}
              />
              {fieldErrors.phone && <span className="text-xs text-[#C0392B]">{fieldErrors.phone}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-address">Alamat</Label>
              <Textarea
                id="create-address"
                placeholder="Alamat lengkap Majikan (opsional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className={fieldErrors.address ? "border-[#C0392B] bg-[#FFF5F4]" : undefined}
              />
              {fieldErrors.address && <span className="text-xs text-[#C0392B]">{fieldErrors.address}</span>}
            </div>
          </div>
        </div>

        {createError && <p className="mt-3 rounded-[8px] bg-[#FFF5F4] px-3 py-2 text-sm text-[#C0392B]">{createError}</p>}
        {createSuccess && (
          <p className="mt-3 rounded-[8px] bg-[#EEF8F1] px-3 py-2 text-sm text-[#064E3B]">{createSuccess}</p>
        )}

        <div className="mt-4">
          <Button
            type="button"
            onClick={handleCreate}
            disabled={pending || !name.trim() || !email.trim() || !phone.trim()}
            variant="primary"
            size="md"
            className="min-h-[44px]"
          >
            {pending ? "Memproses…" : "Buat Akun Majikan"}
          </Button>
        </div>
      </section>

      {/* Kartu 3: Daftar Majikan existing — dipakai ulang antar kontrak */}
      <section className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-[#26221B]">Daftar Majikan Terdaftar</h2>
          <p className="text-xs leading-relaxed text-[#6F675A]">
            Akun di bawah dipakai ulang untuk setiap kontrak baru majikan tersebut. Kirim ulang undangan bila Majikan
            belum mengaktifkan kata sandinya.
          </p>
        </div>

        {resendMsg && <p className="mt-3 text-xs text-[#064E3B]">{resendMsg}</p>}

        {initialList.length === 0 ? (
          <div className="mt-4 rounded-[12px] border border-dashed border-[#E3D5BC] bg-[#F8F7F4] px-4 py-10 text-center">
            <p className="text-sm font-medium text-[#6F675A]">Belum ada akun Majikan</p>
            <p className="mt-1 text-xs leading-relaxed text-[#6F675A]">Akun pertama akan dibuat oleh CS saat deal.</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-[12px] border border-[#E3D5BC]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#F8F7F4] text-xs font-semibold text-[#6F675A]">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Telepon</th>
                  <th className="px-4 py-3">Terdaftar</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3D5BC]">
                {initialList.map((m) => (
                  <tr key={m.id} className="bg-white">
                    <td className="px-4 py-3 font-medium text-[#26221B]">{m.name}</td>
                    <td className="px-4 py-3 text-[#6F675A]">{m.email}</td>
                    <td className="px-4 py-3 text-[#6F675A]">{m.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-[#6F675A]">{formatTanggal(m.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleResend(m.email)}
                        className="inline-flex min-h-[44px] items-center rounded-full border border-[#064E3B] bg-white px-4 text-xs font-medium text-[#064E3B] hover:bg-[#DCEDE6] disabled:opacity-50"
                      >
                        Kirim Ulang Undangan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Catatan operasional */}
      <div className="rounded-[12px] border border-[#E3D5BC] bg-[#F8E7C9] px-4 py-4">
        <p className="text-xs font-semibold text-[#6F675A]">Catatan Operasional</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-[#6F675A]">
          <li>Tidak ada self-register CLIENT — akun Majikan hanya dibuat CS di halaman ini.</li>
          <li>Satu email / satu telepon = satu akun. Akun dipakai lintas kontrak.</li>
          <li>Akun baru menerima email undangan berisi tautan pembuatan kata sandi (berlaku terbatas, 1 jam).</li>
          <li>Bila email tidak sampai, gunakan tombol Kirim Ulang Undangan.</li>
        </ul>
      </div>
    </div>
  );
}
