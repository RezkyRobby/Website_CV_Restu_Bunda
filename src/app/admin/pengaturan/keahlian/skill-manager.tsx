"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSkillAction, updateSkillAction, toggleSkillAction } from "./actions";

type SkillRow = { id: string; name: string; isActive: boolean };

export function SkillManager({ skills, isSuperAdmin }: { skills: SkillRow[]; isSuperAdmin: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);

  const show = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 4000);
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) {
      show("err", "Nama keahlian wajib diisi.");
      return;
    }
    const fd = new FormData();
    fd.set("name", name);
    startTransition(async () => {
      const res = await createSkillAction(fd);
      if (!res.ok) show("err", res.error);
      else {
        show("ok", "Keahlian berhasil ditambahkan.");
        setNewName("");
        router.refresh();
      }
    });
  };

  const startEdit = (s: SkillRow) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditActive(s.isActive);
  };

  const handleUpdate = () => {
    if (!editingId) return;
    const fd = new FormData();
    fd.set("id", editingId);
    fd.set("name", editName.trim());
    fd.set("isActive", editActive ? "true" : "false");
    startTransition(async () => {
      const res = await updateSkillAction(fd);
      if (!res.ok) show("err", res.error);
      else {
        show("ok", "Keahlian berhasil diperbarui.");
        setEditingId(null);
        router.refresh();
      }
    });
  };

  const handleToggle = (s: SkillRow) => {
    const nextActive = !s.isActive;
    const fd = new FormData();
    fd.set("id", s.id);
    fd.set("isActive", String(nextActive));
    startTransition(async () => {
      const res = await toggleSkillAction(fd);
      if (!res.ok) show("err", res.error);
      else {
        show("ok", nextActive ? "Keahlian diaktifkan." : "Keahlian dinonaktifkan. Tidak muncul di form registrasi baru.");
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {message && (
        <div
          role="status"
          className={[
            "rounded-[12px] border px-4 py-3 text-sm",
            message.type === "ok" ? "border-[#DCEDE6] bg-[#EEF6F1] text-[#064E3B]" : "border-[#F0B8B8] bg-[#FAE7E6] text-[#9C2020]",
          ].join(" ")}
        >
          {message.text}
        </div>
      )}

      {isSuperAdmin && (
        <section className="rounded-[16px] border border-[#E3D5BC] bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-[#26221B]">Tambah Keahlian Baru</h2>
          <p className="mt-1 text-xs text-[#6F675A]">Nama unik 2–80 karakter. Contoh: “Perawatan Lansia” atau “Memasak Harian”.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama keahlian"
              maxLength={80}
              className="min-h-[44px] flex-1 rounded-[12px] border border-[#E3D5BC] bg-white px-4 text-sm text-[#26221B] placeholder:text-[#9A9387] focus:border-[#064E3B] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={pending}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#064E3B] px-6 text-sm font-medium text-white hover:bg-[#05382B] disabled:opacity-60"
            >
              {pending ? "Menyimpan…" : "Tambah"}
            </button>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-[16px] border border-[#E3D5BC] bg-white">
        <div className="border-b border-[#E3D5BC] bg-[#F8F7F4] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#26221B]">Daftar Keahlian ({skills.length})</h2>
        </div>
        {skills.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#6F675A]">Belum ada keahlian. Tambahkan di atas.</p>
        ) : (
          <div className="divide-y divide-[#F0E8D8]">
            {skills.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                {editingId === s.id ? (
                  <div className="flex flex-1 flex-col gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={80}
                      className="min-h-[44px] w-full rounded-[12px] border border-[#E3D5BC] bg-white px-3 text-sm text-[#26221B] focus:border-[#064E3B] focus:outline-none"
                    />
                    <label className="flex items-center gap-2 text-sm text-[#26221B]">
                      <input
                        type="checkbox"
                        checked={editActive}
                        onChange={(e) => setEditActive(e.target.checked)}
                        className="size-[18px] accent-[#064E3B]"
                      />
                      Aktif (tampil di form registrasi)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleUpdate}
                        disabled={pending}
                        className="inline-flex min-h-[44px] items-center rounded-full bg-[#064E3B] px-5 text-sm font-medium text-white disabled:opacity-60"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex min-h-[44px] items-center rounded-full border border-[#E3D5BC] bg-white px-5 text-sm font-medium text-[#26221B]"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className={["inline-flex size-2 shrink-0 rounded-full", s.isActive ? "bg-[#064E3B]" : "bg-[#C4B9A6]"].join(" ")} aria-hidden />
                      <span className="truncate text-sm font-medium text-[#26221B]">{s.name}</span>
                      {!s.isActive && (
                        <span className="shrink-0 rounded-full border border-[#E3D5BC] bg-[#F8F7F4] px-2.5 py-1 text-xs text-[#6F675A]">Nonaktif</span>
                      )}
                    </div>
                    {isSuperAdmin && (
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(s)}
                          disabled={pending}
                          className="inline-flex min-h-[44px] items-center rounded-full border border-[#E3D5BC] bg-white px-4 text-sm font-medium text-[#26221B] hover:bg-[#F8F7F4] disabled:opacity-50"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(s)}
                          disabled={pending}
                          className={[
                            "inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-medium",
                            s.isActive
                              ? "border-[#F0B8B8] bg-[#FAE7E6] text-[#9C2020] hover:bg-[#F7D4D2]"
                              : "border-[#DCEDE6] bg-[#EEF6F1] text-[#064E3B] hover:bg-[#DCEDE6]",
                          ].join(" ")}
                        >
                          {s.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
