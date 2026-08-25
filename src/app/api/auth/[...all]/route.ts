// Route handler Better-Auth — mount di /api/auth/[...all].
// Semua endpoint auth (sign-in, sign-out, session, dll.) dilayani di sini.

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
