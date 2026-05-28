import PageHeader from "@/components/layout/PageHeader";
import { useLeagueEvents } from "@api/league/queries";
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock,
  Flag,
  Layers,
  MapPin,
  Medal,
  ShieldHalf,
  Timer,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  scheduled: {
    label: "Scheduled",
    icon: <CircleDashed size={12} strokeWidth={2.5} />,
    className: "bg-blue-50 text-blue-600 border border-blue-200",
  },
  active: {
    label: "In Progress",
    icon: <Timer size={12} strokeWidth={2.5} />,
    className: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  complete: {
    label: "Complete",
    icon: <CheckCircle2 size={12} strokeWidth={2.5} />,
    className: "bg-green-50 text-green-600 border border-green-200",
  },
};

function normalizeEventStatus(status?: string) {
  if (status === "completed" || status === "complete") return "complete";
  if (status === "upcoming" || status === "scheduled") return "scheduled";
  if (status === "active") return "active";
  return "scheduled";
}

export default function Schedule() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const { data: events, isLoading } = useLeagueEvents(Number(leagueId));

  // Always define arrays to avoid undefined
  const sortedEvents = useMemo(
    () =>
      Array.isArray(events)
        ? [...events].sort(
            (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        : [],
    [events]
  );

  const nextUpcoming = useMemo(
    () =>
      sortedEvents
        .filter((event: any) => normalizeEventStatus(event.status) !== "complete")
        .slice(0, 2),
    [sortedEvents]
  );

  return (
    <div>
      <PageHeader title="Schedule" icon={<CalendarDays size={14} />} iconText="LEAGUE" />

      <div className="mt-6 space-y-8">
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Next 2 Rounds
          </h2>
          <div className="flex flex-col gap-3">
            {nextUpcoming.length > 0 ? (
              nextUpcoming.map((event: any) => (
                <EventCard
                  key={event.id}
                  event={event}
                  leagueId={leagueId!}
                  onClick={() => navigate(`/league/${leagueId}/events/${event.id}`)}
                />
              ))
            ) : (
              <div className="text-gray-400 text-sm py-8 text-center">No upcoming rounds</div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            All Rounds
          </h2>
          <div className="flex flex-col gap-3">
            {sortedEvents.length > 0 ? (
              sortedEvents.map((event: any) => (
                <EventCard
                  key={event.id}
                  event={event}
                  leagueId={leagueId!}
                  onClick={() => navigate(`/league/${leagueId}/events/${event.id}`)}
                />
              ))
            ) : (
              <div className="text-gray-400 text-sm py-8 text-center">No rounds scheduled yet</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function EventCard({ event, onClick }: { event: any; leagueId: string; onClick: () => void }) {
  const normalizedStatus = normalizeEventStatus(event.status);
  const status = STATUS_CONFIG[normalizedStatus] ?? STATUS_CONFIG["scheduled"];
  const date = new Date(event.date);

  return (
    <div
      onClick={onClick}
      className="group bg-white border rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-gray-300"
    >
      <div className="flex items-stretch">
        {/* Date block */}
        <div className="flex flex-col items-center justify-center px-5 py-4 rounded-l-lg min-w-[72px] border-r bg-primary/5 border-primary/10">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
            {date.toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-2xl font-black leading-none text-primary">{date.getDate()}</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {date.toLocaleDateString("en-US", { weekday: "short" })}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 px-4 py-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="font-semibold text-gray-800 leading-tight">{event.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-gray-400" strokeWidth={2} />
                <span className="text-xs text-gray-500">{event.course?.name}</span>
                {event.tee?.name && (
                  <>
                    <span className="text-gray-300 text-xs">&bull;</span>
                    <span className="text-xs text-gray-500">{event.tee.name} tees</span>
                  </>
                )}
              </div>
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${status.className}`}
            >
              {status.icon}
              {status.label}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <MetaChip icon={<Clock size={11} />} label={event.startTime} />
            <MetaChip icon={<Flag size={11} />} label={`${event.holes} holes`} />
            <MetaChip
              icon={<ShieldHalf size={11} />}
              label={event.format.charAt(0).toUpperCase() + event.format.slice(1)}
            />
            <MetaChip
              icon={<Medal size={11} />}
              label={`${event.scoringFormat.charAt(0).toUpperCase() + event.scoringFormat.slice(1)} play`}
            />
            {event.type && event.type !== "regular" && (
              <MetaChip
                icon={<Layers size={11} />}
                label={event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              />
            )}
            {event.startSide && event.startSide !== "front" && (
              <MetaChip icon={<Calendar size={11} />} label={`${event.startSide} nine`} />
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center pr-4 pl-2">
          <ChevronRight
            size={16}
            className="text-gray-300 group-hover:text-gray-500 transition-colors"
            strokeWidth={2}
          />
        </div>
      </div>
    </div>
  );
}

function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-gray-500">
      <span className="text-gray-400">{icon}</span>
      {label}
    </div>
  );
}
