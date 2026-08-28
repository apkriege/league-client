import type { ReactNode } from "react";

export default function DataSection({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header className="px-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-emerald-300 shadow-sm">
              {icon}
            </span>
            <h2 className="text-lg font-black tracking-tight text-slate-950">{title}</h2>
          </div>
          {action}
        </div>
      </header>
      {children}
    </section>
  );
}
