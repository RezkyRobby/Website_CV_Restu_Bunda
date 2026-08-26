/**
 * Pasangan warna status fungsional — DESIGN.md §2 (Warna Status)
 * Dipakai bersama kamus label; jangan hardcode warna per komponen.
 */

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export const statusToneClasses: Record<StatusTone, string> = {
  success: "text-[#064E3B] bg-[#DCEDE6]",
  warning: "text-[#8A4B08] bg-[#FBEEDC]",
  danger: "text-[#9C2020] bg-[#FAE7E6]",
  info: "text-[#1E4FBF] bg-[#E8EFFC]",
  neutral: "text-[#57534E] bg-[#F0EEE9]",
};

import type {
  ContractStatus,
  PaymentStatus,
  ReplacementOfferStatus,
  WarrantyClaimStatus,
  WorkerStatus,
} from "@/generated/prisma/enums";

export const workerStatusTone: Record<WorkerStatus, StatusTone> = {
  STANDBY: "success",
  INTERVIEW: "warning",
  PLACED: "info",
  ON_LEAVE: "info",
  BLACKLIST: "danger",
};

export const contractStatusTone: Record<ContractStatus, StatusTone> = {
  ACTIVE: "success",
  EXPIRING_SOON: "warning",
  COMPLETED: "neutral",
  TERMINATED: "danger",
};

export const warrantyClaimStatusTone: Record<WarrantyClaimStatus, StatusTone> = {
  PENDING: "warning",
  IN_REVIEW: "warning",
  CANDIDATES_OFFERED: "info",
  RESOLVED: "neutral",
  REJECTED: "danger",
};

export const replacementOfferStatusTone: Record<ReplacementOfferStatus, StatusTone> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "danger",
};

export const paymentStatusTone: Record<PaymentStatus, StatusTone> = {
  DRAFT: "info",
  PAID: "success",
};

export function toneClass(tone: StatusTone): string {
  return statusToneClasses[tone];
}
