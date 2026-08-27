type MetricCardProps = {
  label: string;
  value: string | number;
  hint: string;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneAccent: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "border-[#E3D5BC]",
  success: "border-[#DCEDE6]",
  warning: "border-[#FBEEDC]",
  danger: "border-[#FAE7E6]",
};

/**
 * Kartu metrik ringkas — angka tabular-nums, tap target ≥44px (AGENTS.md § Definition of Done).
 */
export function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: MetricCardProps) {
  return (
    <div
      className={[
        "rounded-[16px] border bg-white p-5 shadow-sm",
        toneAccent[tone],
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6F675A]">
        {label}
      </p>
      <p className="mt-2 font-semibold tabular-nums text-[#26221B] max-[375px]:text-[28px] text-[32px] leading-none">
        {value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-[#6F675A]">{hint}</p>
    </div>
  );
}
