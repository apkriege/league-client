import type { HTMLAttributes, ThHTMLAttributes } from "react";

export function ScoreValueCell({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`text-center text-xs font-bold ${className}`.trim()}
      {...props}
    />
  );
}

export function ScoreHeaderCell({
  className = "",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`p-2 text-center ${className}`.trim()} {...props} />;
}

export function HoleScoreHeader({
  hole,
  className = "",
}: {
  hole: { num: number; par?: number | null; hcp?: number | null; handicap?: number | null };
  className?: string;
}) {
  const handicap = hole.hcp ?? hole.handicap;

  return (
    <ScoreHeaderCell className={`min-w-12 ${className}`.trim()}>
      <span className="block text-xs font-black leading-none text-slate-800">{hole.num}</span>
      <span className="mt-1 block whitespace-nowrap text-[9px] font-semibold leading-none text-slate-500">
        Par {hole.par ?? "—"}
      </span>
      <span className="mt-0.5 block whitespace-nowrap text-[9px] font-semibold leading-none text-slate-400">
        Hcp {handicap ?? "—"}
      </span>
    </ScoreHeaderCell>
  );
}
