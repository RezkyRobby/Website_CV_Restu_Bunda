import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "sand";
type Size = "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#064E3B] text-white hover:bg-[#05382B] border border-transparent",
  secondary:
    "bg-transparent text-[#064E3B] border border-[#064E3B] hover:bg-[#DCEDE6]",
  sand: "bg-[#F3EAD8] text-[#26221B] border border-transparent hover:bg-[#E3D5BC]",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 px-6 text-[15px]",
  lg: "h-12 px-7 text-[16px]",
};

/**
 * Tombol — DESIGN.md §5.1 / §5.2
 * Pill radius, tinggi 44–48px, transisi fast, tanpa shadow.
 */
export function Button({
  variant = "primary",
  size = "lg",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] font-medium leading-none",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#064E3B] focus-visible:outline-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "min-h-[44px]",
        variantClasses[variant],
        sizeClasses[size],
        className ?? "",
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
};

export function LinkButton({
  href,
  variant = "primary",
  size = "lg",
  className,
  children,
  target,
  rel,
}: LinkButtonProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] font-medium leading-none no-underline",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#064E3B] focus-visible:outline-offset-2",
        "min-h-[44px]",
        variantClasses[variant],
        sizeClasses[size],
        className ?? "",
      ].join(" ")}
    >
      {children}
    </a>
  );
}
