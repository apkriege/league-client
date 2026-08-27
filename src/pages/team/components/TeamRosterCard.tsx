import PanelBar from "@/components/layout/PanelBar";
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PanelBar>
          <div className="rounded-lg bg-slate-900/10 p-2 text-slate-900">
            <Users size={15} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Team Roster</h2>
            <p className="text-xs text-gray-400">Current players and handicaps</p>
          </div>
        </PanelBar>
        <div className="mr-4 flex items-center gap-2 text-[10px] font-bold text-gray-500">
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1">
            {players.length} {players.length === 1 ? "player" : "players"}
          </span>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1">
            Avg HCP {averageHandicap == null ? "—" : formatHandicap(averageHandicap)}
          </span>
        </div>
      </div>

      <div className="grid gap-2 border-t border-gray-100 px-4 py-3 sm:grid-cols-2 lg:grid-cols-3">
        {players.length === 0 ? (
          <p className="text-sm text-gray-400">No players are currently assigned.</p>
        ) : (
          players.map((player) => (
            <Link
              key={player.id}
              to={`/league/${leagueId}/player/${player.id}`}
              className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 transition hover:border-slate-900/20 hover:bg-slate-900/5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900/10 text-[11px] font-black text-slate-900">
                {getInitials(player)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-gray-800">
                  {getPlayerName(player)}
                </span>
                <span className="text-[10px] text-gray-400">
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
