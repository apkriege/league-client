import { BrainCircuit } from "lucide-react";
import type { ReactNode } from "react";

export default function IntelligenceShell({
  kicker,
  title,
  description,
  aside,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 shadow-sm">
      <div className="relative overflow-hidden bg-slate-950 px-5 py-4 text-white sm:px-6">
        <div className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300">
              <BrainCircuit size={14} strokeWidth={2.5} />
              <p className="text-[9px] font-black uppercase tracking-[0.2em]">{kicker}</p>
            </div>
            <h2 className="mt-1.5 text-xl font-black tracking-tight sm:text-2xl">{title}</h2>
            <p className="mt-1 max-w-2xl text-[11px] leading-4 text-slate-400">{description}</p>
          </div>
          {aside}
        </div>
      </div>
      {children}
    </section>
  );
}

export function InsightMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail: string;
}) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{detail}</p>
    </div>
  );
}

export function ToneDot({ tone }: { tone: "positive" | "attention" | "neutral" }) {
  const color = tone === "positive" ? "bg-emerald-500" : tone === "attention" ? "bg-amber-500" : "bg-blue-500";
  return <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${color}`} />;
}
