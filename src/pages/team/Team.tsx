import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import { useLeague } from "@api/league/queries";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { ShieldHalf, Users } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams } from "react-router";

export default function Team() {
  const { leagueId, teamId } = useParams();
  const numericLeagueId = Number(leagueId);
  const numericTeamId = Number(teamId);
  const { data: league, isLoading, isError, error } = useLeague(numericLeagueId);

  const team = useMemo(
    () => league?.teams?.find((item: any) => Number(item.id) === numericTeamId) ?? null,
    [league?.teams, numericTeamId]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Loading team...
      </div>
    );
  }

  if (isError) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={
          status === 404
            ? "League Not Found"
            : status === 403
              ? "Access Denied"
              : "Unable to Load Team"
        }
        message={getApiErrorMessage(error, "The team page could not be loaded right now.")}
        variant={status === 404 ? "notFound" : status === 403 ? "forbidden" : "error"}
      />
    );
  }

  if (!league || !team) {
    return (
      <PageState
        title="Team Not Found"
        message="The requested team could not be found in this league."
        variant="notFound"
        actionTo={numericLeagueId ? `/league/${numericLeagueId}/teams` : "/leagues"}
        actionLabel="Back to Teams"
      />
    );
  }

  const players = Array.isArray(team.players) ? team.players : [];

  return (
    <div>
      <PageHeader
        title={team.name || "Team"}
        subTitle={`Team roster for ${league.name}`}
        icon={<ShieldHalf size={14} />}
        iconText="TEAM"
      />

      <div className="mt-6 rounded-xl border border-base-300 bg-base-100 shadow-sm">
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Users size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-base-content">Roster</p>
              <p className="text-xs text-base-content/60">{players.length} players</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          {players.length === 0 ? (
            <p className="text-sm text-base-content/60">
              No players are currently assigned to this team.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {players.map((player: any) => (
                <Link
                  key={player.id}
                  to={`/league/${leagueId}/player/${player.id}`}
                  className="rounded-xl border border-base-300 bg-base-50 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                >
                  <p className="text-sm font-semibold text-primary">
                    {player.firstName} {player.lastName}
                  </p>
                  <p className="mt-1 text-xs text-base-content/60">
                    Handicap: {player.handicap ?? "-"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
