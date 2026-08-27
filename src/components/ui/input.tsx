import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ invalid, className, ...props }: InputProps) {
  return (
    <input
      className={[
        "flex h-11 w-full rounded-[12px] border bg-white px-3 text-sm text-[#26221B] placeholder:text-[#9A9387]",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B]/20 focus-visible:border-[#064E3B]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "min-h-[44px]",
        invalid ? "border-[#C0392B] bg-[#FFF5F4]" : "border-[#E3D5BC]",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}
