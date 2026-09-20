import type {
  HTMLAttributes,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

export function ScorecardTableFrame({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`overflow-x-auto rounded-xl border border-slate-200 ${className}`.trim()}
      {...props}
    />
  );
}

export function ScorecardIdentityCell({
  primary,
  secondary,
  action,
  className = "",
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <td className={`min-w-44 p-3 text-xs ${className}`.trim()}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-bold text-slate-900">{primary}</div>
          {secondary ? (
            <div className="mt-0.5 text-[10px] leading-4 text-slate-500">{secondary}</div>
          ) : null}
        </div>
        {action}
      </div>
    </td>
  );
}

export function ScoreValueCell({
  className = "",
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`p-2 text-center text-xs font-bold tabular-nums ${className}`.trim()}
      {...props}
    />
  );
}

export function ScoreSummaryCell({
  value,
  label,
  className = "",
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & {
  value: ReactNode;
  label: ReactNode;
}) {
  return (
    <td className={`p-2 text-center font-bold ${className}`.trim()} {...props}>
      <div className="flex flex-col items-center leading-tight">
        <span className="text-sm tabular-nums">{value}</span>
        <span className="text-[10px] text-slate-500">{label}</span>
      </div>
    </td>
  );
}

export function ScoreHeaderCell({
  className = "",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`whitespace-nowrap p-2 text-center ${className}`.trim()} {...props} />;
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
