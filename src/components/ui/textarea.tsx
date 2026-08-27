import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function Textarea({ invalid, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={[
        "flex min-h-[88px] w-full rounded-[12px] border bg-white px-3 py-2.5 text-sm text-[#26221B] placeholder:text-[#9A9387]",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B]/20 focus-visible:border-[#064E3B]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        invalid ? "border-[#C0392B] bg-[#FFF5F4]" : "border-[#E3D5BC]",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}
