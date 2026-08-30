import Table, { type Column } from "@/components/Table";
import SurfaceCard from "@/components/layout/SurfaceCard";
import { formatTime } from "@/utils/format";
import { formatEventDate } from "@/utils/eventDate";
import { getScoringModeLabel } from "@/features/scoring/scoringModes";
import type { TeamEventResult } from "@api/teams/types";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import { CalendarDays } from "lucide-react";

type TeamEventResultsTableProps = {
  events: TeamEventResult[];
  leagueId: number;
};

const formatPoints = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const getOpponentLabel = (event: TeamEventResult) => {
  if (event.type.toLowerCase() === "off") return "Off week";
  if (event.opponents.length > 0) return event.opponents.map((opponent) => opponent.name).join(", ");
  return event.isAssigned ? "Opponent TBD" : "Not assigned";
};

const getStatus = (event: TeamEventResult) => {
  const status = event.status.toLowerCase();
  const type = event.type.toLowerCase();

  if (status === "canceled") return { label: "Canceled", className: "bg-red-50 text-red-600" };
  if (type === "off") return { label: "Off", className: "bg-slate-100 text-slate-500" };
  if (status === "completed") {
    return { label: "Complete", className: "bg-emerald-50 text-emerald-700" };
  }
  return { label: "Scheduled", className: "bg-blue-50 text-blue-700" };
};

export default function TeamEventResultsTable({ events, leagueId }: TeamEventResultsTableProps) {
  const navigate = useNavigate();
  const columns = useMemo<Column<TeamEventResult>[]>(
    () => [
      {
        key: "startsAt",
        label: "Event",
        sortable: false,
        render: (_value, event) => (
          <div className="min-w-44">
            <p className="text-xs font-semibold text-slate-800">{event.name}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              {formatEventDate(
                event.startsAt,
                { month: "short", day: "numeric", year: "numeric" },
                "en-US",
                event.timeZone,
              )}
              {event.flightStartsAt
                ? ` · ${formatTime(event.flightStartsAt, event.timeZone)}`
                : ""}
            </p>
            {event.courseName && (
              <p className="mt-0.5 truncate text-[10px] text-slate-400">{event.courseName}</p>
            )}
          </div>
        ),
      },
      {
        key: "opponents",
        label: "Opponent",
        sortable: false,
        render: (_value, event) => (
          <div className="min-w-32">
            <p className="text-xs font-semibold text-slate-700">{getOpponentLabel(event)}</p>
            {event.isAssigned && event.holes > 0 && (
              <p className="mt-0.5 text-[10px] capitalize text-slate-400">
                {event.holes} holes · {getScoringModeLabel(event)}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "totalPoints",
        label: "Points Earned",
        sortable: false,
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right",
        render: (_value, event) =>
          event.totalPoints == null ? (
            <span className="text-xs font-semibold text-slate-300">—</span>
          ) : (
            <div className="min-w-28">
              <p className="text-sm font-black text-slate-900">
                {formatPoints(event.totalPoints)}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                {formatPoints(event.playerPoints)} player · {formatPoints(event.teamPoints)} team
              </p>
            </div>
          ),
      },
      {
        key: "opponents",
        label: "Opponent Points",
        sortable: false,
        headerClassName: "[&>div]:justify-end",
        cellClassName: "text-right",
        render: (_value, event) =>
          event.opponents.length === 0 ||
          event.opponents.every((opponent) => opponent.totalPoints == null) ? (
            <span className="text-xs font-semibold text-slate-300">—</span>
          ) : (
            <div className="min-w-28 space-y-1">
              {event.opponents.map((opponent) => (
                <div key={opponent.id}>
                  <p className="text-sm font-black text-slate-700">
                    {opponent.totalPoints == null ? "—" : formatPoints(opponent.totalPoints)}
                  </p>
                  {opponent.totalPoints != null && (
                    <p className="text-[10px] text-slate-400">
                      {formatPoints(opponent.playerPoints)} player · {formatPoints(opponent.teamPoints)} team
                    </p>
                  )}
                </div>
              ))}
            </div>
          ),
      },
      {
        key: "status",
        label: "Status",
        sortable: false,
        render: (_value, event) => {
          const status = getStatus(event);
          return (
            <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${status.className}`}>
              {status.label}
            </span>
          );
        },
      },
    ],
    [],
  );

  const completedCount = events.filter(
    (event) => event.status.toLowerCase() === "completed",
  ).length;

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <CalendarDays size={13} className="text-emerald-600" strokeWidth={2.5} />
          <h3 className="text-xs font-bold text-slate-900">Event Results and Matchups</h3>
        </div>
        <span className="text-[10px] font-medium text-slate-400">
          {completedCount} completed
        </span>
      </div>
      <Table
        data={events}
        columns={columns}
        search={false}
        pagination={false}
        variant="clean"
        size="sm"
        noBorder
        className="!rounded-none !shadow-none"
        onRowClick={(event) => navigate(`/league/${leagueId}/events/${event.id}`)}
        tableClassName="w-full min-w-[52rem] border-collapse"
      />
    </SurfaceCard>
  );
}
