import SurfaceCard from "@/components/layout/SurfaceCard";
import type { TeamProfile } from "@api/teams/types";
import { Trophy } from "lucide-react";
import { Link } from "react-router";

type TeamSeasonLeaderboardProps = {
  teams: TeamProfile["teamLeaderboard"];
  currentTeamId: number;
  leagueId: number;
};

const formatPoints = (value: number) =>
  Number.isInteger(Number(value)) ? String(Number(value)) : Number(value).toFixed(1);

export default function TeamSeasonLeaderboard({
  teams,
  currentTeamId,
  leagueId,
}: TeamSeasonLeaderboardProps) {
  return (
    <SurfaceCard as="section">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-emerald-600" strokeWidth={2.5} />
          <h3 className="text-xs font-bold text-slate-900">Team Standings</h3>
        </div>
        <span className="text-[10px] font-medium text-slate-400">{teams.length} ranked</span>
      </div>

      <div className="max-h-64 overflow-auto">
        {teams.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">No team standings are available yet.</p>
        ) : (
          teams.map((team, index) => {
            const isCurrentTeam = Number(team.id) === currentTeamId;
            const rank = team.seasonRank ?? index + 1;

            return (
              <Link
                key={team.id}
                to={`/league/${leagueId}/team/${team.id}`}
                aria-current={isCurrentTeam ? "page" : undefined}
                className={`grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-2 border-b border-slate-100 px-4 py-3 last:border-b-0 transition ${
                  isCurrentTeam
                    ? "bg-slate-950 text-white"
                    : "text-slate-700 hover:bg-emerald-50/35"
                }`}
              >
                <span className={`text-xs font-black ${isCurrentTeam ? "text-white/60" : "text-gray-400"}`}>
                  {rank}
                </span>
                <span className="truncate text-xs font-semibold">{team.name}</span>
                <span className={`text-xs font-black ${isCurrentTeam ? "text-white" : "text-slate-900"}`}>
                  {formatPoints(team.seasonPoints)} pts
                </span>
              </Link>
            );
          })
        )}
      </div>
    </SurfaceCard>
  );
}
