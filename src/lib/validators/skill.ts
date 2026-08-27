// Validator Skill — PRD §7.2, Task 15
// Vocabulary terkontrol: CRUD oleh Super Admin, aktif/nonaktif.
// Dipakai dua lapis: klien (form pengaturan) dan server (Server Action).

import { z } from "zod";

/** Nama skill: 2–80 karakter, tidak boleh kosong/whitespace saja. */
export const skillNameSchema = z
  .string()
  .trim()
  .min(2, "Nama keahlian minimal 2 karakter.")
  .max(80, "Nama keahlian maksimal 80 karakter.")
  .refine((v) => v.length > 0, "Nama keahlian wajib diisi.");

export const createSkillSchema = z.object({
  name: skillNameSchema,
});

export const updateSkillSchema = z.object({
  id: z.string().cuid("ID keahlian tidak valid."),
  name: skillNameSchema,
  isActive: z.boolean(),
});

export const toggleSkillSchema = z.object({
  id: z.string().cuid("ID keahlian tidak valid."),
  isActive: z.boolean(),
});

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
export type ToggleSkillInput = z.infer<typeof toggleSkillSchema>;
