// Client Better-Auth (React) — untuk autentikasi di komponen sisi klien.
// Sesuai dokumentasi: berfungsi pada domain yang sama, baseURL tidak wajib.

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});