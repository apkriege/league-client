import {
  calculateAlternateShotHandicap,
  calculateScrambleHandicap,
} from "@/features/scoring/teamHandicap";
import { deriveScoringMode } from "@/features/scoring/scoringModes";
import { getPlayerHandicapIndex, getPlayerScoringHoles } from "./scoringSetup";

type SharedTeamPlayer = {
  playerId: number;
  teamId?: number | null;
  handicapIndex?: unknown;
  player?: {
    firstName?: string;
    lastName?: string;
    handicap?: unknown;
    gender?: string;
  };
};

type SharedTeamFlight = {
  teams?: Array<{ teamId: number; team?: { name?: string } }>;
  players?: SharedTeamPlayer[];
};

type SharedTeamEvent = {
  format?: unknown;
  scoringMode?: unknown;
  scoringConfig?: unknown;
  strokePoints?: unknown;
  scoringHoles?: unknown;
  scoringHolesByGender?: unknown;
};

export type SharedTeamHandicapSetup = {
  teamId: number;
  teamName: string;
  players: SharedTeamPlayer[];
  holes: Array<{ num: number; par: number; hcp: number }>;
  baseTeamHandicap: number;
  playingHandicap: number;
};

export const buildSharedTeamHandicapSetups = (
  event: SharedTeamEvent,
  flight: SharedTeamFlight,
): SharedTeamHandicapSetup[] => {
  const mode = deriveScoringMode(event);
  if (mode !== "scramble" && mode !== "alternate-shot") return [];

  const prepared = (flight.teams ?? []).map((assignment) => {
    const teamId = Number(assignment.teamId);
    const players = (flight.players ?? []).filter(
      (player) => Number(player.teamId) === teamId,
    );
    const scorecardGender = String(
      event.scoringConfig && typeof event.scoringConfig === "object"
        ? (event.scoringConfig as Record<string, unknown>).sharedTeamScorecard || "male"
        : "male",
    );
    const holes = getPlayerScoringHoles(event, { player: { gender: scorecardGender } });
    const playerHandicaps = players.map(getPlayerHandicapIndex);
    const baseTeamHandicap =
      mode === "scramble"
        ? calculateScrambleHandicap(playerHandicaps)
        : calculateAlternateShotHandicap(playerHandicaps);

    return {
      teamId,
      teamName: String(assignment.team?.name || `Team ${teamId}`),
      players,
      holes,
      baseTeamHandicap,
    };
  });

  const scoringConfig =
    event.scoringConfig && typeof event.scoringConfig === "object"
      ? event.scoringConfig as Record<string, unknown>
      : {};
  const allowance = Number(scoringConfig.handicapAllowance ?? 1);
  return prepared.map((team) => ({
    ...team,
    playingHandicap: Math.round(team.baseTeamHandicap * allowance),
  }));
};
