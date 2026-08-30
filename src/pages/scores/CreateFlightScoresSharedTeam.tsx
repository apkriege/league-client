import Button from "@/components/layout/Button";
import PanelBar from "@/components/layout/PanelBar";
import SurfaceCard from "@/components/layout/SurfaceCard";
import Table from "@/components/Table";
import { useToast } from "@/context/useToast";
import { deriveScoringMode, SCORING_MODES } from "@/features/scoring/scoringModes";
import {
  calculateAlternateShotHandicap,
  calculateScrambleHandicap,
} from "@/features/scoring/teamHandicap";
import { useCreateEventScores, useUpdateEventScores } from "@api/league/mutations";
import { Flag } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useParams } from "react-router";
import { ScoreDraftStatus } from "./ScoreDraftStatus";
import { ScoreHeaderCell, ScoreValueCell } from "./components/ScoreTableCell";
import { getEventScoringHoles, getPlayerCourseHandicap } from "./scoringSetup";
import { calculateStrokeplayPops } from "./util";
import { useScoreDraft } from "./useScoreDraft";
import { formatTime } from "@/utils/format";

type SharedTeamScoreProps = {
  flight: Record<string, unknown> & { id: number; startsAt?: string; teams?: TeamAssignment[]; players?: PlayerAssignment[] };
  event: Record<string, unknown> & {
    format?: unknown;
    scoringMode?: unknown;
    scoringConfig?: unknown;
    teamRounds?: TeamRound[];
    timeZone?: string;
  };
  isEditMode: boolean;
  leaguePlayers?: unknown[];
  eventPlayerIds?: number[];
  onFlightPlayersUpdated?: () => unknown;
  onSaveSuccess?: () => void;
  onCancel?: () => void;
};

type TeamAssignment = {
  teamId: number;
  team?: { name?: string };
};

type PlayerAssignment = {
  playerId: number;
  teamId?: number | null;
  player?: { firstName?: string; lastName?: string; handicap?: number };
};

type TeamRound = {
  teamId: number;
  flightId?: number | null;
  scores?: Array<{ hole: number; gross: number }>;
};

type SharedScoreForm = {
  teams: Array<{ teamId: number; scores: Array<number | ""> }>;
};

export function CreateFlightScoresSharedTeam({
  flight,
  event,
  isEditMode,
  onSaveSuccess,
  onCancel,
}: SharedTeamScoreProps) {
  const { leagueId, eventId } = useParams();
  const { show } = useToast();
  const holes = getEventScoringHoles(event);
  const mode = deriveScoringMode(event);
  const teamAssignments = flight.teams ?? [];
  const savedRounds = event.teamRounds ?? [];
  const methods = useForm<SharedScoreForm>({
    defaultValues: {
      teams: teamAssignments.map((assignment) => {
          const savedRound = savedRounds.find(
            (round) =>
              Number(round.teamId) === Number(assignment.teamId) &&
              Number(round.flightId) === Number(flight.id),
          );
          const savedByHole = new Map(
            (savedRound?.scores ?? []).map((score) => [Number(score.hole), Number(score.gross)]),
          );
          return {
            teamId: assignment.teamId,
            scores: holes.map((hole: { num: number }) => savedByHole.get(hole.num) ?? ""),
          };
        }),
    },
  });
  const watchedTeams = useWatch({ control: methods.control, name: "teams" });
  const createMutation = useCreateEventScores();
  const updateMutation = useUpdateEventScores();
  const scoreDraft = useScoreDraft({
    methods,
    leagueId,
    eventId,
    flightId: flight.id,
    enabled: !isEditMode,
  });

  const getTeamPlayers = (teamId: number) =>
    (flight.players ?? []).filter((player) => Number(player.teamId) === Number(teamId));
  const getTeamHandicap = (teamId: number) => {
    const handicaps = getTeamPlayers(teamId).map((player) => getPlayerCourseHandicap(player));
    const base =
      mode === "scramble"
        ? calculateScrambleHandicap(handicaps)
        : calculateAlternateShotHandicap(handicaps);
    const config = event.scoringConfig as { handicapAllowance?: number } | undefined;
    return Math.round(base * Number(config?.handicapAllowance ?? 1));
  };
  const popsByTeamId = new Map(
    teamAssignments.map((team) => [
      Number(team.teamId),
      calculateStrokeplayPops(getTeamHandicap(Number(team.teamId)), holes),
    ]),
  );
  const getFormTeam = (teamId: number) =>
    watchedTeams?.find((team) => Number(team.teamId) === Number(teamId));
  const getTotal = (teamId: number) =>
    (getFormTeam(teamId)?.scores ?? []).reduce<number>(
      (total, score) => total + (Number(score) || 0),
      0,
    );
  const getNet = (teamId: number) => getTotal(teamId) - getTeamHandicap(teamId);

  const submit = () => {
    const invalid = teamAssignments.some((team) => {
      const scores = getFormTeam(team.teamId)?.scores;
      return (
        !Array.isArray(scores) ||
        scores.length !== holes.length ||
        scores.some((score) => !Number.isInteger(Number(score)) || Number(score) < 1 || Number(score) > 30)
      );
    });
    if (invalid) {
      show("Enter a score from 1 to 30 for every team and hole.", "error");
      return;
    }

    const data = {
      eventId: Number(eventId),
      flightId: flight.id,
      teamScores: teamAssignments.map((team) => ({
        teamId: Number(team.teamId),
        scores: holes.reduce<Record<number, number>>((scores, hole: { num: number }, index: number) => {
          scores[hole.num] = Number(getFormTeam(team.teamId)?.scores?.[index]);
          return scores;
        }, {}),
      })),
    };
    const mutation = isEditMode ? updateMutation : createMutation;
    mutation.mutate(
      { leagueId: Number(leagueId), eventId: Number(eventId), data },
      {
        onSuccess: () => {
          scoreDraft.clearDraft();
          onSaveSuccess?.();
        },
      },
    );
  };

  return (
    <SurfaceCard>
      <PanelBar variant="header">
        <div className="flex items-center gap-2">
          <Flag size={14} className="text-slate-400" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Flight {formatTime(flight.startsAt, event.timeZone)}
            </h3>
            <p className="text-[11px] text-slate-500">{SCORING_MODES[mode].label} · one score per team</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={submit}>
            {isEditMode ? "Save Changes" : "Submit Scores"}
          </Button>
        </div>
      </PanelBar>
      <div className="p-4 sm:p-5">
        <ScoreDraftStatus
          hasDraft={scoreDraft.hasDraft}
          savedAt={scoreDraft.savedAt}
          onClear={scoreDraft.clearDraft}
        />
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <Table
            data={teamAssignments}
            search={false}
            pagination={false}
            variant="clean"
            noBorder
            tableClassName="score-table"
            renderTable={(teams) => (
              <>
                <thead>
                  <tr className="text-xs text-slate-700">
                    <th className="min-w-44 pl-4">Team</th>
                    {holes.map((hole: { num: number }) => (
                      <ScoreHeaderCell key={hole.num}>{hole.num}</ScoreHeaderCell>
                    ))}
                    <th className="text-center">Gross</th>
                    <th className="text-center">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, teamIndex) => {
                    const teamId = Number(team.teamId);
                    const players = getTeamPlayers(teamId);
                    return (
                      <tr key={teamId} className="text-sm">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{team.team?.name || `Team ${teamId}`}</p>
                          <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                            {players.map((player) => `${player.player?.firstName ?? ""} ${player.player?.lastName ?? ""}`.trim()).join(" · ")}
                            {` · ${getTeamHandicap(teamId)} hcp`}
                          </p>
                        </td>
                        {holes.map((hole: { num: number }, index: number) => {
                          const pops = popsByTeamId.get(teamId)?.get(hole.num) || 0;
                          return (
                            <td key={hole.num} className="p-2">
                              <div className="relative">
                                <input
                                  aria-label={`${team.team?.name || `Team ${teamId}`} hole ${hole.num}`}
                                  type="number"
                                  min={1}
                                  max={30}
                                  className="score-input"
                                  {...methods.register(`teams.${teamIndex}.scores.${index}`, {
                                    setValueAs: (value) => value === "" ? "" : Number(value),
                                  })}
                                />
                                {pops > 0 && (
                                  <span className="score-medals" aria-label={`${pops} handicap strokes`}>
                                    {Array.from({ length: pops }).map((_, popIndex) => (
                                      <span key={popIndex} className="h-1 w-1 rounded-full bg-slate-900" />
                                    ))}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <ScoreValueCell>{getTotal(teamId)}</ScoreValueCell>
                        <ScoreValueCell>{getNet(teamId)}</ScoreValueCell>
                      </tr>
                    );
                  })}
                </tbody>
              </>
            )}
          />
        </div>
      </div>
    </SurfaceCard>
  );
}
