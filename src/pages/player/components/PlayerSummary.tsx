import type { ReactNode } from "react";
import SummaryPill from "@/components/layout/SummaryPill";

type DisplayValue = ReactNode;

export function StatMini({ label, value }: { label: string; value: DisplayValue }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}

export function InfoChip({
  icon,
  text,
  strong = false,
  capitalize = false,
}: {
  icon?: ReactNode;
  text: DisplayValue;
  strong?: boolean;
  capitalize?: boolean;
}) {
  return (
    <SummaryPill icon={icon} strong={strong} className={capitalize ? "capitalize" : ""}>
      {text}
    </SummaryPill>
  );
}
