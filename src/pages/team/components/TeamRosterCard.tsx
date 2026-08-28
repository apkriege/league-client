import SurfaceCard from "@/components/layout/SurfaceCard";
import { formatHandicap } from "@/utils/handicap";
import type { TeamPlayer } from "@api/teams/types";
import { Users } from "lucide-react";
import { Link } from "react-router";

type TeamRosterCardProps = {
  players: TeamPlayer[];
  leagueId: number;
  averageHandicap: number | null;
};

const getPlayerName = (player: TeamPlayer) =>
  `${player.firstName || ""} ${player.lastName || ""}`.trim() || "Unnamed player";

const getInitials = (player: TeamPlayer) =>
  `${player.firstName?.trim().charAt(0) || ""}${player.lastName?.trim().charAt(0) || ""}`.toUpperCase() ||
  "?";

export default function TeamRosterCard({
  players,
  leagueId,
  averageHandicap,
}: TeamRosterCardProps) {
  return (
    <SurfaceCard as="section">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <Users size={13} className="text-emerald-600" strokeWidth={2.5} />
          <h3 className="text-xs font-bold text-slate-900">Team Roster</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
            {players.length} {players.length === 1 ? "player" : "players"}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
            Avg HCP {averageHandicap == null ? "—" : formatHandicap(averageHandicap)}
          </span>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
        {players.length === 0 ? (
          <p className="text-sm text-gray-400">No players are currently assigned.</p>
        ) : (
          players.map((player) => (
            <Link
              key={player.id}
              to={`/league/${leagueId}/player/${player.id}`}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 transition hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-[11px] font-black text-emerald-300">
                {getInitials(player)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold text-slate-800">
                  {getPlayerName(player)}
                </span>
                <span className="text-[10px] text-slate-400">
                  HCP {formatHandicap(player.handicap)}
                </span>
              </span>
            </Link>
          ))
        )}
      </div>
    </SurfaceCard>
  );
}
