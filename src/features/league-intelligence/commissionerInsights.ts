import type {
  InsightTone,
  IntelligenceEvent,
  LeagueAdminInput,
  LeagueIntelligenceMetrics,
} from "./types";
import { getScoringFamilyForEvent } from "@/features/scoring/scoringModes";
import { getLeagueCapacity } from "@/lib/billing";

const dayMs = 24 * 60 * 60 * 1000;

export function buildCommissionerInsights({
  league,
  events,
  metrics,
  now = new Date(),
}: {
  league: LeagueAdminInput;
  events: IntelligenceEvent[];
  metrics?: LeagueIntelligenceMetrics;
  now?: Date;
}) {
  const regularPlayers = (league.players ?? []).filter(
    (player) => String(player.type || "player").toLowerCase() === "player",
  );
  const paidGolfers = getLeagueCapacity(league);
  const unpaidGolfers = league.entitlement?.status === "bypassed"
    ? 0
    : Math.max(0, regularPlayers.length - paidGolfers);
  const sortedEvents = [...events]
    .filter((event) => !["canceled", "cancelled"].includes(String(event.status)))
    .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime());
  const scheduleGaps = sortedEvents.slice(1).flatMap((event, index) => {
    const previous = sortedEvents[index];
    const days = Math.round(
      (new Date(event.startsAt).getTime() - new Date(previous.startsAt).getTime()) / dayMs,
    );
    return days > 21 ? [{ from: previous.name, to: event.name, days }] : [];
  });
  const missingScores = events.filter((event) => {
    const status = String(event.status || "").toLowerCase();
    if (!["active", "complete", "completed"].includes(status)) return false;
    const assignedPlayers = new Set(
      (event.flights ?? []).flatMap((flight) =>
        [
          ...(flight.players ?? []).map((player) => player.playerId),
          ...(flight.teams ?? []).flatMap((assignment) =>
            (assignment.team?.players ?? []).map((player) => player.id),
          ),
        ],
      ),
    ).size;
    return assignedPlayers > Number(event._count?.rounds || 0);
  });
  const unbalancedFlights = events.flatMap((event) => {
    const playerCounts = (event.flights ?? []).map((flight) => flight.players?.length ?? 0);
    const countSpread = playerCounts.length > 1
      ? Math.max(...playerCounts) - Math.min(...playerCounts)
      : 0;
    const missingPlayerOpponent =
      getScoringFamilyForEvent(event) === "match" &&
      (event.flights ?? []).some((flight) =>
        (flight.teams?.length ?? 0) === 0 &&
        (flight.players ?? []).some((player) => !player.opponentId),
      );
    const missingTeamOpponent =
      getScoringFamilyForEvent(event) === "match" &&
      (event.flights ?? []).some((flight) =>
        (flight.teams ?? []).some((team) => !team.opponentId),
      );
    return countSpread > 1 || missingPlayerOpponent || missingTeamOpponent
      ? [{ eventId: event.id, name: event.name }]
      : [];
  });
  const endDate = league.endDate ? new Date(league.endDate) : null;
  const daysToEnd = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / dayMs) : null;
  const renewalNeeded =
    daysToEnd != null && daysToEnd <= 60 && daysToEnd >= -30 && !league.renewedLeague;
  const rosterRounds = new Map((metrics?.standings ?? []).map((row) => [row.playerId, row.rounds]));
  const maxRounds = Math.max(0, ...rosterRounds.values());
  const inactiveGolfers = regularPlayers.filter(
    (player) => maxRounds >= 2 && Number(rosterRounds.get(player.id) || 0) <= maxRounds - 2,
  );

  const items: Array<{
    key: string;
    tone: InsightTone;
    title: string;
    detail: string;
    count: number;
  }> = [
    ...(unpaidGolfers > 0
      ? [{ key: "billing", tone: "attention" as const, title: "Roster exceeds paid capacity", detail: `${unpaidGolfers} ${unpaidGolfers === 1 ? "golfer needs" : "golfers need"} coverage. Review the roster or billing.`, count: unpaidGolfers }]
      : []),
    ...(missingScores.length > 0
      ? [{ key: "scores", tone: "attention" as const, title: "Scores need attention", detail: `${missingScores.length} ${missingScores.length === 1 ? "event may have" : "events may have"} missing scores. Review score entry.`, count: missingScores.length }]
      : []),
    ...(unbalancedFlights.length > 0
      ? [{ key: "flights", tone: "attention" as const, title: "Flight assignments need review", detail: `${unbalancedFlights.length} ${unbalancedFlights.length === 1 ? "event has" : "events have"} uneven flights or missing opponents.`, count: unbalancedFlights.length }]
      : []),
    ...(inactiveGolfers.length > 0
      ? [{ key: "participation", tone: "neutral" as const, title: "Participation follow-up", detail: `${inactiveGolfers.length} ${inactiveGolfers.length === 1 ? "golfer is" : "golfers are"} at least two rounds behind. Check absences or scores.`, count: inactiveGolfers.length }]
      : []),
    ...(scheduleGaps.length > 0
      ? [{ key: "schedule", tone: "neutral" as const, title: "Long schedule gap", detail: `${Math.max(...scheduleGaps.map((gap) => gap.days))} days between events. Confirm or add an event.`, count: scheduleGaps.length }]
      : []),
    ...(renewalNeeded
      ? [{ key: "renewal", tone: "attention" as const, title: "Next season is not prepared", detail: `${Math.max(0, Number(daysToEnd))} days remain. Review next season setup.`, count: 1 }]
      : []),
  ];

  return {
    health: items.filter((item) => item.tone === "attention").length === 0 ? "ready" as const : "attention" as const,
    items,
    unpaidGolfers,
    missingScores,
    unbalancedFlights,
    inactiveGolfers,
    scheduleGaps,
    renewalNeeded,
    daysToEnd,
  };
}
