import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import LoadingState from "@/components/layout/LoadingState";
import DataSection from "@/components/layout/DataSection";
import SummaryPill from "@/components/layout/SummaryPill";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { formatHandicap } from "@/utils/handicap";
import TeamIntelligence from "@/features/league-intelligence/components/TeamIntelligence";
import { useTeam } from "@api/teams/queries";
import { CalendarDays, ChevronLeft, Target, Users } from "lucide-react";
import { Link, useParams } from "react-router";
import TeamEventResultsTable from "./components/TeamEventResultsTable";
import TeamRosterCard from "./components/TeamRosterCard";
import TeamSeasonLeaderboard from "./components/TeamSeasonLeaderboard";

export default function Team() {
  const { leagueId, teamId } = useParams();
  const numericLeagueId = Number(leagueId);
  const numericTeamId = Number(teamId);
  const hasValidTeamId = Number.isFinite(numericTeamId) && numericTeamId > 0;
  const { data: team, isLoading, isError, error } = useTeam(numericTeamId, hasValidTeamId);

  if (isLoading) {
    return <LoadingState>Loading team...</LoadingState>;
  }

  if (isError) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={
          status === 404 ? "Team Not Found" : status === 403 ? "Access Denied" : "Unable to Load Team"
        }
        message={getApiErrorMessage(error, "The team page could not be loaded right now.")}
        variant={status === 404 ? "notFound" : status === 403 ? "forbidden" : "error"}
        actionTo={numericLeagueId ? `/league/${numericLeagueId}/teams` : "/leagues"}
        actionLabel="Back to Teams"
      />
    );
  }

  if (!team) {
    return (
      <PageState
        title="Team Not Found"
        message="The requested team could not be found."
        variant="notFound"
        actionTo={numericLeagueId ? `/league/${numericLeagueId}/teams` : "/leagues"}
        actionLabel="Back to Teams"
      />
    );
  }

  if (Number(team.leagueId) !== numericLeagueId) {
    return (
      <PageState
        title="Team Not Found"
        message="This team does not belong to the league in the current address."
        variant="notFound"
        actionTo={`/league/${numericLeagueId}/teams`}
        actionLabel="Back to Teams"
      />
    );
  }

  const players = Array.isArray(team.players) ? team.players : [];
  const eventResults = Array.isArray(team.eventResults) ? team.eventResults : [];
  const handicapValues = players
    .map((player) => player.handicap)
    .filter((handicap): handicap is number => handicap != null && Number.isFinite(handicap));
  const avgHandicap = handicapValues.length
    ? handicapValues.reduce((sum, handicap) => sum + handicap, 0) / handicapValues.length
    : null;
  const teamLeaderboard = Array.isArray(team.teamLeaderboard) ? team.teamLeaderboard : [];

  return (
    <div className="pb-10">
      <Link
        to={numericLeagueId ? `/league/${numericLeagueId}/teams` : "/leagues"}
        className="mb-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-400 transition hover:text-slate-900"
      >
        <ChevronLeft size={14} />
        Back to teams
      </Link>

      <PageHeader title={team.name || "Team"} />

      <div className="mb-8 mt-5 flex flex-wrap gap-2.5">
        <SummaryPill icon={<Users size={12} />}>
          {players.length} {players.length === 1 ? "player" : "players"}
        </SummaryPill>
        <SummaryPill icon={<Target size={12} />}>
          Avg HCP {avgHandicap == null ? "—" : formatHandicap(avgHandicap)}
        </SummaryPill>
        <SummaryPill icon={<CalendarDays size={12} />}>
          {eventResults.length} scheduled {eventResults.length === 1 ? "event" : "events"}
        </SummaryPill>
      </div>

      <div className="space-y-9">
        <TeamIntelligence team={team} />

        <DataSection title="Roster and Standings" icon={<Users size={16} strokeWidth={2.5} />}>
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <TeamRosterCard
              players={players}
              leagueId={numericLeagueId}
              averageHandicap={avgHandicap}
            />
            <TeamSeasonLeaderboard
              teams={teamLeaderboard}
              currentTeamId={numericTeamId}
              leagueId={numericLeagueId}
            />
          </div>
        </DataSection>

        <DataSection title="Season Results" icon={<CalendarDays size={16} strokeWidth={2.5} />}>
          <TeamEventResultsTable events={eventResults} leagueId={numericLeagueId} />
        </DataSection>
      </div>
    </div>
  );
}
