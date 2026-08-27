// Modul pengiriman email — PRD §5.4 & AGENTS.md Aturan 3.
// Nodemailer + Gmail SMTP untuk email undangan set-password dan pengingat
// kontrak H-30/H-14/H-7 (Daily Automation Job, flag catch-up anti-duplikasi).

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// ============================================================
// Konfigurasi transporter
// ============================================================

export type MailerConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

/** Membaca konfigurasi dari environment. */
export function getMailerConfig(): MailerConfig {
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER ?? "";
  const pass = process.env.SMTP_PASS ?? "";
  const from = process.env.SMTP_FROM ?? user ?? "noreply@restubunda.local";

  return {
    host,
    port,
    secure: port === 465,
    user,
    pass,
    from,
  };
}

/** Apakah kredensial SMTP sudah terisi. */
export function isMailerConfigured(): boolean {
  const { host, user, pass } = getMailerConfig();
  return Boolean(host && user && pass);
}

let cachedTransporter: Transporter | null = null;

/**
 * Membuat atau mengembalikan transporter Nodemailer yang sudah dikonfigurasi.
 * Singleton agar koneksi dapat dipakai ulang antar pengiriman.
 */
export function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const { host, port, secure, user, pass } = getMailerConfig();

  if (!user || !pass) {
    throw new Error(
      "Konfigurasi SMTP belum lengkap. Isi SMTP_HOST, SMTP_USER, dan SMTP_PASS di file .env."
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  cachedTransporter = transporter;
  return transporter;
}

/** Mereset transporter yang di-cache — dipakai pada pengujian. */
export function resetTransporterCache(): void {
  cachedTransporter = null;
}

/** Menguji koneksi SMTP tanpa mengirim email. */
export async function verifyMailerConnection(): Promise<void> {
  const transporter = getTransporter();
  await transporter.verify();
}

// ============================================================
// Helper umum
// ============================================================

export type SendMailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

/**
 * Mengirim email generik. Pesan error berbahasa Indonesia.
 */
export async function sendMail(options: SendMailOptions): Promise<void> {
  const transporter = getTransporter();
  const { from } = getMailerConfig();

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text ?? stripHtml(options.html),
    replyTo: options.replyTo,
  });
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================================
// Template email — Bahasa Indonesia formal
// ============================================================

function wrapEmailHtml(title: string, bodyContent: string): string {
  // Tata letak email sederhana tanpa dependensi eksternal.
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f7f5;font-family:Inter,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:32px auto;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e4df;">
    <tr>
      <td style="padding:24px 28px 0 28px;">
        <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#8b7e74;font-weight:600;">CV Restu Bunda Mariyati</p>
        <h1 style="margin:8px 0 0 0;font-size:20px;line-height:1.4;color:#1a1a1a;">${escapeHtml(title)}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 28px 28px 28px;font-size:14px;line-height:1.7;color:#3a3a3a;">
        ${bodyContent}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background-color:#faf8f6;border-top:1px solid #e8e4df;font-size:12px;line-height:1.6;color:#8b7e74;">
        <p style="margin:0;">Pesan ini dikirim otomatis oleh sistem CV Restu Bunda Mariyati. Mohon tidak membalas email ini — hubungi CS kami bila memerlukan bantuan.</p>
      </td>
    </tr>
  </table>
  <p style="text-align:center;font-size:11px;color:#b0a89f;margin:0 0 32px 0;">© ${new Date().getFullYear()} CV Restu Bunda Mariyati — Platform Penempatan Tenaga Kerja Resmi.</p>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================
// Email undangan set-password (akun Majikan baru — PRD §5.4 #1)
// ============================================================

export type InviteEmailParams = {
  to: string;
  clientName: string;
  inviteUrl: string;
};

/**
 * Mengirim email undangan pembuatan kata sandi untuk akun Majikan baru
 * yang dibuat oleh CS saat deal (tanpa self-register).
 */
export async function sendInviteSetPasswordEmail(params: InviteEmailParams): Promise<void> {
  const title = "Undangan Aktivasi Akun Portal Majikan";

  const body = `
    <p style="margin:0 0 12px 0;">Yth. Bapak/Ibu <strong>${escapeHtml(params.clientName)}</strong>,</p>
    <p style="margin:0 0 12px 0;">Akun Portal Majikan Anda di CV Restu Bunda Mariyati telah dibuat oleh staf kami. Silakan buat kata sandi untuk mengakses portal dan memantau kontrak serta dossier pekerja yang bertugas.</p>
    <p style="text-align:center;margin:20px 0;">
      <a href="${escapeHtml(params.inviteUrl)}" style="display:inline-block;padding:12px 24px;background-color:#1a1a1a;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Buat Kata Sandi</a>
    </p>
    <p style="margin:0 0 12px 0;font-size:13px;color:#6b6b6b;">Tautan berlaku terbatas. Bila tombol tidak berfungsi, salin tautan berikut ke peramban Anda:<br />
      <a href="${escapeHtml(params.inviteUrl)}" style="color:#1a1a1a;word-break:break-all;">${escapeHtml(params.inviteUrl)}</a>
    </p>
    <p style="margin:0;font-size:13px;color:#6b6b6b;">Bila Anda tidak merasa mendaftar, abaikan email ini — tidak ada tindakan lebih lanjut yang diperlukan.</p>
  `;

  await sendMail({
    to: params.to,
    subject: "Aktivasi Akun Portal Majikan — CV Restu Bunda Mariyati",
    html: wrapEmailHtml(title, body),
  });
}

// ============================================================
// Email pengingat kontrak H-30 / H-14 / H-7 (Daily Automation Job)
// ============================================================

export type ContractReminderParams = {
  to: string;
  clientName: string;
  contractNumber: string;
  workerNickname: string;
  endDate: Date;
  daysRemaining: 30 | 14 | 7;
};

function formatTanggalIndonesia(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Makassar",
  }).format(date);
}

/**
 * Mengirim email pengingat masa kontrak akan habis (H-30 / H-14 / H-7).
 * Dipanggil oleh Daily Automation Job dengan query kondisional catch-up:
 *   endDate ≤ hari ini + X hari DAN flag masih false — anti-duplikasi.
 */
export async function sendContractReminderEmail(params: ContractReminderParams): Promise<void> {
  const { daysRemaining } = params;
  const title = `Pengingat Kontrak — ${daysRemaining} Hari Menjelang Berakhir`;
  const tanggalSelesai = formatTanggalIndonesia(params.endDate);

  const body = `
    <p style="margin:0 0 12px 0;">Yth. Bapak/Ibu <strong>${escapeHtml(params.clientName)}</strong>,</p>
    <p style="margin:0 0 12px 0;">Kami mengingatkan bahwa kontrak penempatan <strong>${escapeHtml(params.contractNumber)}</strong> untuk pekerja <strong>${escapeHtml(params.workerNickname)}</strong> akan berakhir pada <strong>${escapeHtml(tanggalSelesai)}</strong> — tersisa <strong>${daysRemaining} hari</strong> lagi.</p>
    <p style="margin:0 0 12px 0;">Silakan hubungi CS kami bila Bapak/Ibu berkenan memperpanjang kontrak, atau bila ada penyesuaian yang diperlukan. Perpanjangan akan diproses sebagai kontrak baru dengan nomor SPK baru; kontrak saat ini tetap berlaku hingga tanggal selesai.</p>
    <p style="margin:0 0 12px 0;font-size:13px;color:#6b6b6b;">Tanggal selesai kontrak: <strong>${escapeHtml(tanggalSelesai)}</strong> (zona Asia/Makassar). Pesan ini hanya dikirim satu kali untuk tonggak H-${daysRemaining}.</p>
  `;

  await sendMail({
    to: params.to,
    subject: `[H-${daysRemaining}] Pengingat Masa Kontrak ${escapeHtml(params.contractNumber)} — CV Restu Bunda Mariyati`,
    html: wrapEmailHtml(title, body),
  });
}

// ============================================================
// Email verifikasi / reset generik (opsional — dipakai Better-Auth hook)
// ============================================================

export type GenericEmailParams = {
  to: string;
  subject: string;
  title: string;
  bodyHtml: string;
};

/** Pengiriman email generik dengan wrapper HTML yang seragam. */
export async function sendGenericEmail(params: GenericEmailParams): Promise<void> {
  await sendMail({
    to: params.to,
    subject: params.subject,
    html: wrapEmailHtml(params.title, params.bodyHtml),
  });
}
