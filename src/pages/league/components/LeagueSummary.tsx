import { CalendarDays, Flag, User } from "lucide-react";

type LeagueSummaryProps = {
  season?: string;
  format?: string;
  type?: string;
  contact?: string;
};

export default function LeagueSummary({ season, format, type, contact }: LeagueSummaryProps) {
  const details = [
    { label: "Season", value: season || "Dates not set", icon: CalendarDays },
    { label: "League format", value: [format, type].filter(Boolean).join(" · ") || "Not configured", icon: Flag },
    { label: "League contact", value: contact || "No contact listed", icon: User },
  ];

  return (
    <dl className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-3">
      {details.map(({ label, value, icon: Icon }) => (
        <div key={label} className="flex min-w-0 items-start gap-3 border-b border-slate-200 px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-950 text-emerald-300">
            <Icon size={13} strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <dt className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</dt>
            <dd className="mt-1 break-words text-xs font-bold capitalize leading-5 text-slate-900">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
