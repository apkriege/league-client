import { getEventLocalDate } from "@/utils/eventDate";
import { formatTime } from "@/utils/format";
import SurfaceCard from "@/components/layout/SurfaceCard";
import {
  Award,
  Ban,
  CheckCircle2,
  CircleDashed,
  Clock,
  Edit,
  Flag,
  MapPin,
  Timer,
} from "lucide-react";
import type { ReactNode } from "react";

const statuses: Record<string, { label: string; icon: ReactNode; className: string }> = {
  upcoming: {
    label: "Scheduled",
    icon: <CircleDashed size={12} strokeWidth={2.5} />,
    className: "border border-blue-200 bg-blue-50 text-blue-600",
  },
  active: {
    label: "In Progress",
    icon: <Timer size={12} strokeWidth={2.5} />,
    className: "border border-amber-200 bg-amber-50 text-amber-600",
  },
  completed: {
    label: "Complete",
    icon: <CheckCircle2 size={12} strokeWidth={2.5} />,
    className: "border border-green-200 bg-green-50 text-green-600",
  },
  canceled: {
    label: "Canceled",
    icon: <Ban size={12} strokeWidth={2.5} />,
    className: "border border-slate-200 bg-slate-100 text-slate-500",
  },
};

type LeagueEventRowProps = {
  event: any;
  isAdmin: boolean;
  onView: () => void;
  onEdit: () => void;
};

export default function LeagueEventRow({
  event,
  isAdmin,
  onView,
  onEdit,
}: LeagueEventRowProps) {
  const status = statuses[event.status] ?? statuses.upcoming;
  const date = getEventLocalDate(event.startsAt, event.timeZone);
  const normalizedStatus = String(event?.status || "").toLowerCase();
  const canEditEvent =
    !event?.isComplete && normalizedStatus !== "completed" && normalizedStatus !== "canceled";

  return (
    <SurfaceCard
      onClick={onView}
      className="group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-900/30 hover:bg-slate-900/2 hover:shadow-lg"
    >
      <div className="flex items-stretch">
        <div className="flex min-w-14 flex-col items-center justify-center border-r border-slate-900/10 bg-slate-900/5 px-3 py-3">
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
            {date.toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-xl font-black leading-none text-slate-900">{date.getDate()}</span>
          <span className="text-[9px] font-medium text-gray-400">
            {date.toLocaleDateString("en-US", { weekday: "short" })}
          </span>
        </div>

        <div className="flex-1 px-3 py-2.5">
          <div className="mb-1">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="min-w-0 truncate text-sm font-semibold leading-tight text-gray-800">
                {event.name}
              </h3>
              <StatusChip status={status} />
            </div>
            <div className="mt-0.5 flex items-center gap-1">
              <MapPin size={10} className="text-gray-400" strokeWidth={2} />
              <span className="text-xs text-gray-400">{event.course?.name}</span>
              {event.tee?.name && (
                <>
                  <span className="text-xs text-gray-300">&bull;</span>
                  <span className="text-xs text-gray-400">{event.tee.name} tees</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {event.startsAt && (
              <MetaChip icon={<Clock size={10} />} label={formatTime(event.startsAt, event.timeZone)} />
            )}
            <MetaChip icon={<Flag size={10} />} label={`${event.holes}h`} />
            {event.scoringFormat && (
              <MetaChip
                icon={<Award size={10} />}
                label={event.scoringFormat.charAt(0).toUpperCase() + event.scoringFormat.slice(1)}
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 py-1 pl-1 pr-3">
          {isAdmin && canEditEvent && (
            <button
              onClick={(clickEvent) => {
                clickEvent.stopPropagation();
                onEdit();
              }}
              className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 shadow-xs transition-colors hover:border-slate-900/30 hover:bg-slate-900/10 hover:text-slate-900"
              title="Edit"
            >
              <Edit size={13} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </SurfaceCard>
  );
}

function MetaChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 text-[10px] text-gray-400">
      <span className="text-gray-300">{icon}</span>
      {label}
    </div>
  );
}

function StatusChip({ status }: { status: (typeof statuses)[string] }) {
  return (
    <div
      className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
    >
      {status.icon}
      {status.label}
    </div>
  );
}
