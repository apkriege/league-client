import PanelBar from "@/components/layout/PanelBar";
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
      <PanelBar>
        <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
          <Trophy size={15} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Season Team Leaderboard</h2>
          <p className="text-xs text-gray-400">Current team ranking</p>
        </div>
      </PanelBar>

      <div className="max-h-56 overflow-auto border-t border-gray-100">
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
                className={`grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-2 border-b border-gray-100 px-4 py-2.5 last:border-b-0 transition ${
                  isCurrentTeam
                    ? "bg-slate-900 text-white"
                    : "text-gray-700 hover:bg-gray-50"
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
