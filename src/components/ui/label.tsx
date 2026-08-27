import type { LabelHTMLAttributes } from "react";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={["text-sm font-medium text-[#26221B]", className ?? ""].join(" ")} {...props} />;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs leading-relaxed text-[#C0392B]">{message}</p>;
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs leading-relaxed text-[#6F675A]">{children}</p>;
}
