import SurfaceCard from "@/components/layout/SurfaceCard";
import { formatHandicap } from "@/utils/handicap";
import { ArrowUpRight, ShieldHalf, SquarePen, Trash2 } from "lucide-react";
import { Link } from "react-router";

export type TeamDirectoryPlayer = {
  id: number | string;
  firstName?: string | null;
  lastName?: string | null;
  handicap?: number | null;
};

export type TeamDirectoryItem = {
  id: number | string;
  name?: string | null;
  players?: TeamDirectoryPlayer[];
};

type TeamDirectoryCardProps = {
  team: TeamDirectoryItem;
  leagueId: number;
  canManage: boolean;
  onEdit: (team: TeamDirectoryItem) => void;
  onRemove: (team: TeamDirectoryItem) => void;
};

const getPlayerName = (player: TeamDirectoryPlayer) =>
  `${player.firstName || ""} ${player.lastName || ""}`.trim() || "Unnamed player";

const getPlayerInitials = (player: TeamDirectoryPlayer) =>
  `${player.firstName?.trim().charAt(0) || ""}${player.lastName?.trim().charAt(0) || ""}`.toUpperCase() ||
  "?";

const getTeamInitials = (name: string) => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  return initials || "T";
};

export default function TeamDirectoryCard({
  team,
  leagueId,
  canManage,
  onEdit,
  onRemove,
}: TeamDirectoryCardProps) {
  const teamName = String(team.name || "Unnamed team");
  const teamPath = `/league/${leagueId}/team/${team.id}`;
  const players = [...(team.players ?? [])].sort((left, right) =>
    getPlayerName(left).localeCompare(getPlayerName(right))
  );
  const visiblePlayers = players.slice(0, 4);
  const remainingPlayers = players.length - visiblePlayers.length;

  return (
    <SurfaceCard
      as="article"
      className="group flex h-full flex-col border-slate-200 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_18px_42px_-24px_rgba(15,23,42,0.45)]"
    >
      <div className="relative border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-emerald-50/60 px-4 py-4 sm:px-5">
        <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full bg-emerald-100/60 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-950 text-xs font-black tracking-wide text-emerald-300 shadow-sm">
            {getTeamInitials(teamName)}
          </span>

          <div className="min-w-0 flex-1 pt-0.5">
            <Link
              to={teamPath}
              className="inline-flex max-w-full items-center gap-1.5 text-base font-black tracking-tight text-slate-950 transition group-hover:text-emerald-700"
            >
              <span className="truncate">{teamName}</span>
              <ArrowUpRight size={13} className="shrink-0" strokeWidth={2.5} />
            </Link>
          </div>

          {canManage ? (
            <div className="relative flex shrink-0 items-center gap-1">
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-emerald-700 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                aria-label={`Edit ${teamName}`}
                title={`Edit ${teamName}`}
                onClick={() => onEdit(team)}
              >
                <SquarePen size={13} />
              </button>
              <button
                type="button"
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-red-600 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                aria-label={`Remove ${teamName}`}
                title={`Remove ${teamName}`}
                onClick={() => onRemove(team)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <Link to={teamPath} className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldHalf size={12} className="text-emerald-600" strokeWidth={2.5} />
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
              Roster
            </p>
          </div>
          {remainingPlayers > 0 ? (
            <span className="text-[10px] font-bold text-slate-400">+{remainingPlayers} more</span>
          ) : null}
        </div>

        {visiblePlayers.length === 0 ? (
          <div className="flex flex-1 items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-5 text-xs text-slate-400">
            No players assigned yet
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {visiblePlayers.map((player) => (
              <div
                key={player.id}
                className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-2.5 py-2"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-[9px] font-black text-slate-700 shadow-sm ring-1 ring-slate-200">
                  {getPlayerInitials(player)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-bold text-slate-800">
                    {getPlayerName(player)}
                  </span>
                  <span className="block text-[9px] text-slate-400">
                    HCP {formatHandicap(player.handicap)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 transition group-hover:text-emerald-700">
          <span>View team profile</span>
          <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 transition group-hover:bg-emerald-600 group-hover:text-white">
            <ArrowUpRight size={11} strokeWidth={2.5} />
          </span>
        </div>
      </Link>
    </SurfaceCard>
  );
}
