import type { InputHTMLAttributes } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export function Checkbox({ label, hint, className, ...props }: CheckboxProps) {
  return (
    <label className={["flex cursor-pointer gap-3", className ?? ""].join(" ")}>
      <input
        type="checkbox"
        className="mt-1 size-[18px] shrink-0 rounded-[4px] border border-[#C4B9A6] accent-[#064E3B]"
        {...props}
      />
      {(label || hint) && (
        <span className="flex flex-col">
          {label && <span className="text-sm font-medium text-[#26221B]">{label}</span>}
          {hint && <span className="text-xs leading-relaxed text-[#6F675A]">{hint}</span>}
        </span>
      )}
    </label>
  );
}
