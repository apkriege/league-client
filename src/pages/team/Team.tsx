import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import LoadingState from "@/components/layout/LoadingState";
import SectionKicker from "@/components/layout/SectionKicker";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import TeamIntelligence from "@/features/league-intelligence/components/TeamIntelligence";
import { useTeam } from "@api/teams/queries";
import { CalendarDays, ChevronLeft, Medal, Trophy } from "lucide-react";
import { Link, useParams } from "react-router";
import TeamEventResultsTable from "./components/TeamEventResultsTable";
import TeamRosterCard from "./components/TeamRosterCard";
import TeamSeasonLeaderboard from "./components/TeamSeasonLeaderboard";
import type { ReactNode } from "react";

const numberValue = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatPoints = (value: unknown) => {
  const points = numberValue(value);
  return Number.isInteger(points) ? String(points) : points.toFixed(1);
};

function StatCard({
  label,
  value,
  subText,
  icon,
}: {
  label: string;
  value: string;
  subText?: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <SectionKicker>{label}</SectionKicker>
          <p className="mt-1 text-2xl font-black leading-tight text-gray-900">{value}</p>
          {subText && <p className="mt-0.5 text-[11px] font-medium text-gray-500">{subText}</p>}
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900/10 text-slate-900">
          {icon}
        </span>
      </div>
    </div>
  );
}

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
  const teamEventPoints = Array.isArray(team.teamEventPoints) ? team.teamEventPoints : [];
  const eventResults = Array.isArray(team.eventResults) ? team.eventResults : [];
  const eventPointsTotal = teamEventPoints.reduce(
    (sum, row) => sum + numberValue(row.points),
    0
  );
  const seasonPoints = numberValue(team.seasonPoints, eventPointsTotal);
  const handicapValues = players
    .map((player) => player.handicap)
    .filter((handicap): handicap is number => handicap != null && Number.isFinite(handicap));
  const avgHandicap = handicapValues.length
    ? handicapValues.reduce((sum, handicap) => sum + handicap, 0) / handicapValues.length
    : null;
  const playerSeasonPoints = eventResults.reduce(
    (total, event) => total + numberValue(event.playerPoints),
    0,
  );
  const completedEvents = eventResults.filter(
    (event) => event.isAssigned && event.totalPoints != null,
  );
  const teamLeaderboard = Array.isArray(team.teamLeaderboard) ? team.teamLeaderboard : [];
  const leaderboardIndex = teamLeaderboard.findIndex(
    (leaderboardTeam) => Number(leaderboardTeam.id) === numericTeamId,
  );
  const seasonRank = team.seasonRank ?? (leaderboardIndex >= 0 ? leaderboardIndex + 1 : null);

  return (
    <div className="pb-8">
      <Link
        to={numericLeagueId ? `/league/${numericLeagueId}/teams` : "/leagues"}
        className="mb-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-400 transition hover:text-slate-900"
      >
        <ChevronLeft size={14} />
        Back to teams
      </Link>

      <PageHeader
        title={team.name || "Team"}
        subTitle="Team roster, season standings, and event-by-event results."
      />

      <div className="mt-6">
        <TeamIntelligence team={team} />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Team Points"
          value={formatPoints(seasonPoints)}
          subText={seasonRank ? `Rank #${seasonRank}` : "No rank yet"}
          icon={<Trophy size={18} />}
        />
        <StatCard
          label="Player Points"
          value={formatPoints(playerSeasonPoints)}
          subText="From assigned player rounds"
          icon={<Medal size={18} />}
        />
        <StatCard
          label="Events Played"
          value={String(completedEvents.length)}
          subText={`${eventResults.length} scheduled league events`}
          icon={<CalendarDays size={18} />}
        />
        <StatCard
          label="Season Rank"
          value={seasonRank ? `#${seasonRank}` : "—"}
          subText={`${teamLeaderboard.length} ${teamLeaderboard.length === 1 ? "team" : "teams"} in league`}
          icon={<Medal size={18} />}
        />
      </div>

      <div className="mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
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

      <div className="mt-6">
        <TeamEventResultsTable events={eventResults} leagueId={numericLeagueId} />
      </div>
    </div>
  );
}
