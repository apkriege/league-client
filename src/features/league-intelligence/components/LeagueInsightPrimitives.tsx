import type { ReactNode } from "react";

export function LeagueInsightSection({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-slate-900">{title}</h3>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function LeagueInsightEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="m-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center text-xs leading-5 text-slate-500">
      {children}
    </div>
  );
}

export function LeagueInsightBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
      {children}
    </span>
  );
}
