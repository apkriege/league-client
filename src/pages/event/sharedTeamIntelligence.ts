import type { EventInsightInput } from "@/features/league-intelligence/types";

export type SharedTeamIntelligenceEvent = EventInsightInput & {
  holes: number;
  startSide?: string;
  teamRounds?: Array<{
    teamId: number;
    team?: { name?: string | null } | null;
    gross: number;
    net: number;
    pointsEarned?: number | null;
    matchPoints?: number | null;
    scores?: Array<{ hole: number; gross: number; net: number; par: number }>;
  }>;
};

export const withSharedTeamScores = (
  event: SharedTeamIntelligenceEvent,
): SharedTeamIntelligenceEvent => {
  if ((event.metrics?.scores?.length ?? 0) > 0 || (event.teamRounds?.length ?? 0) === 0) {
    return event;
  }
  return {
    ...event,
    metrics: {
      ...event.metrics,
      scores: event.teamRounds?.map((round) => ({
        playerId: round.teamId,
        teamId: round.teamId,
        player: { firstName: round.team?.name || "Team", lastName: "" },
        gross: Number(round.gross),
        net: Number(round.net),
        pointsEarned: Number(round.pointsEarned || 0),
        matchPoints: Number(round.matchPoints || 0),
        scores: (round.scores ?? []).map((score) => ({
          hole: Number(score.hole),
          gross: Number(score.gross),
          net: Number(score.net),
          par: Number(score.par),
        })),
      })),
    },
  };
};
