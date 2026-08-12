import { ScoreHeaderCell, ScoreValueCell } from "./components/ScoreTableCell";
import PanelBar from "@/components/layout/PanelBar";
import SurfaceCard from "@/components/layout/SurfaceCard";
import { useState } from "react";
import Button from "@/components/layout/Button";
import { useUpdateFlightPlayers } from "@api/flight/mutations";
import { useCreateEventScores, useUpdateEventScores } from "@api/league/mutations";
import { Flag } from "lucide-react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import {
  buildSwappedPlayerEntry,
  getSwapCandidates,
  PlayerSwapControl,
} from "./PlayerSwapControl";
import { calculateStrokeplayPops } from "./util";
import { ScoreDraftStatus, useScoreDraft } from "./useScoreDraft";
import { useToast } from "@/context/ToastContext";
import { validateHoleScores } from "./scoreValidation";
import { formatTime } from "@/utils/format";
import { getEventScoringHoles, getPlayerCourseHandicap } from "./scoringSetup";

export const CreateFlightScoresTeamStroke = ({
  flight,
  event,
  leaguePlayers = [],
  eventPlayerIds = [],
  isEditMode,
  onFlightPlayersUpdated,
  onSaveSuccess,
  onCancel,
}: any) => {
  const { leagueId, eventId } = useParams();
  const { show } = useToast();

  const holes = getEventScoringHoles(event);

  const team1Id = Number(flight?.teams?.[0]?.teamId ?? 0);
  const team2Id = Number(flight?.teams?.[1]?.teamId ?? 0);
  const team1Name = String(flight?.teams?.[0]?.team?.name || "Team 1");
  const team2Name = String(flight?.teams?.[1]?.team?.name || "Team 2");

  const [team1Players, setTeam1Players] = useState<any[]>(
    (flight.players || []).filter((p: any) => Number(p.teamId) === team1Id)
  );
  const [team2Players, setTeam2Players] = useState<any[]>(
    (flight.players || []).filter((p: any) => Number(p.teamId) === team2Id)
  );
  const players = [...team1Players, ...team2Players];

  const getEffectiveHandicap = (playerEntry: any) => {
    return getPlayerCourseHandicap(playerEntry);
  };

  const popsByPlayerId = new Map<number, Map<number, number>>();
  for (const player of players) {
    const hcp = getEffectiveHandicap(player);
    popsByPlayerId.set(Number(player.playerId), calculateStrokeplayPops(hcp, holes));
  }

  const popsForHole = (playerId: number, holeNum: number) =>
    popsByPlayerId.get(Number(playerId))?.get(holeNum) || 0;

  const methods = useForm({
    defaultValues: {
      players: players.reduce((acc: any, p: any) => {
        const playerScores = isEditMode
          ? holes.map((hole: any, holeIdx: number) => {
              const roundScores = p?.player?.rounds?.[0]?.scores ?? [];
              const scoreByHole = roundScores.find(
                (s: any) => Number(s?.hole) === Number(hole?.num)
              );
              const score = scoreByHole?.gross ?? roundScores?.[holeIdx]?.gross;
              return score ? String(score) : "";
            })
          : Array.from({ length: holes.length }, () => "");
        acc[p.playerId] = { scores: playerScores };
        return acc;
      }, {}),
    },
  });

  const createMutation = useCreateEventScores();
  const updateMutation = useUpdateEventScores();
  const updateFlightPlayersMutation = useUpdateFlightPlayers();
  const watchedPlayers = methods.watch("players");
  const scoreDraft = useScoreDraft({
    methods,
    leagueId,
    eventId,
    flightId: flight.id,
    enabled: !isEditMode,
  });

  const handleHoleChange = (e: any, holeIndex: number, playerId: number) => {
    const val = e.target.value;
    if (val === "") {
      methods.setValue(`players.${playerId}.scores.${holeIndex}`, "", {
        shouldDirty: true,
        shouldTouch: true,
      });
      return;
    }
    const parsed = parseInt(val, 10);
    methods.setValue(
      `players.${playerId}.scores.${holeIndex}`,
      Number.isNaN(parsed) ? "" : parsed,
      { shouldDirty: true, shouldTouch: true }
    );
  };

  const getPlayerTotalScore = (playerId: number) => {
    const scores = watchedPlayers?.[playerId]?.scores;
    if (!Array.isArray(scores)) return 0;
    return scores.reduce((sum: number, s: any) => sum + (Number(s) || 0), 0);
  };

  const getPlayerNetScore = (playerId: number) => {
    const playerEntry = players.find((p: any) => Number(p.playerId) === playerId);
    const hcp = Math.round(getEffectiveHandicap(playerEntry));
    return getPlayerTotalScore(playerId) - hcp;
  };

  const getPlayerNetAtHole = (playerId: number, holeIdx: number) => {
    const gross = Number(watchedPlayers?.[playerId]?.scores?.[holeIdx] ?? 0);
    if (!gross) return null;
    const holeNum = holes[holeIdx]?.num;
    return gross - popsForHole(playerId, holeNum);
  };

  const getBestBallForHole = (teamPlayers: any[], holeIdx: number) => {
    let best: number | null = null;
    for (const player of teamPlayers) {
      const net = getPlayerNetAtHole(Number(player.playerId), holeIdx);
      if (net == null) continue;
      if (best == null || net < best) {
        best = net;
      }
    }
    return best;
  };

  const pointsPerHole = Number(event?.ptsPerHole) || 0;
  const getTeamPointsAtHole = (team: 1 | 2, holeIdx: number) => {
    const left = getBestBallForHole(team1Players, holeIdx);
    const right = getBestBallForHole(team2Players, holeIdx);

    if (left == null || right == null || pointsPerHole <= 0) return 0;
    if (left === right) return pointsPerHole / 2;

    if (team === 1) return left < right ? pointsPerHole : 0;
    return right < left ? pointsPerHole : 0;
  };

  const getTeamTotalPoints = (team: 1 | 2) => {
    return holes.reduce((sum: number, _hole: any, holeIdx: number) => {
      return sum + getTeamPointsAtHole(team, holeIdx);
    }, 0);
  };

  const savePlayerSwap = async (team: 1 | 2, playerIndex: number, replacementId: number) => {
    const teamPlayers = team === 1 ? team1Players : team2Players;
    const currentEntry = teamPlayers[playerIndex];
    const currentId = Number(currentEntry?.playerId);
    const nextId = Number(replacementId);
    if (!currentEntry || !nextId || nextId === currentId) return;

    const candidates = getSwapCandidates({
      currentEntry,
      leaguePlayers,
      eventPlayerIds,
      activePlayerIds: players.map((player: any) => Number(player.playerId)),
      teamOnly: true,
    });
    const replacement = candidates.find((player: any) => Number(player?.id) === nextId);
    if (!replacement) return;

    const nextTeamPlayers = teamPlayers.map((player: any, index: number) =>
      index === playerIndex ? buildSwappedPlayerEntry(player, replacement) : player
    );
    const nextTeam1 = team === 1 ? nextTeamPlayers : team1Players;
    const nextTeam2 = team === 2 ? nextTeamPlayers : team2Players;
    const nextPlayers = [...nextTeam1, ...nextTeam2];

    await updateFlightPlayersMutation.mutateAsync({
      flightId: Number(flight.id),
      players: nextPlayers.map((player: any) => ({
        playerId: Number(player.playerId),
        teamId: player?.teamId ?? player?.player?.teamId ?? null,
        opponentId: null,
      })),
    });

    const oldScores = methods.getValues(`players.${currentId}.scores`) ?? [];
    methods.setValue(`players.${nextId}.scores`, oldScores, {
      shouldDirty: true,
      shouldTouch: true,
    });
    methods.unregister(`players.${currentId}`);
    const refreshed = await onFlightPlayersUpdated?.();
    const refreshedPlayers = refreshed?.data?.flights?.find(
      (candidate: any) => Number(candidate.id) === Number(flight.id)
    )?.players;
    if (Array.isArray(refreshedPlayers)) {
      setTeam1Players(
        refreshedPlayers.filter((player: any) => Number(player.teamId) === team1Id)
      );
      setTeam2Players(
        refreshedPlayers.filter((player: any) => Number(player.teamId) === team2Id)
      );
    } else if (team === 1) {
      setTeam1Players(nextTeamPlayers);
    } else {
      setTeam2Players(nextTeamPlayers);
    }
  };

  const saveScores = () => {
    const validationMessage = validateHoleScores({ watchedPlayers, players, holes });
    if (validationMessage) {
      show(validationMessage, "error");
      return;
    }

    const scoresData = {
      eventId: Number(eventId),
      flightId: flight.id,
      players: players.map((player: any) => {
        const playerId = Number(player.playerId);
        const data = watchedPlayers?.[playerId] ?? { scores: [] };

        return {
          playerId,
          opponentId: null,
          scores: holes.reduce((acc: any, hole: any, idx: number) => {
            acc[hole.num] = Number(data.scores?.[idx]) || 0;
            return acc;
          }, {} as any),
          putts: [],
          gross: getPlayerTotalScore(playerId),
          net: getPlayerNetScore(playerId),
          points: 0,
          matchPoints: 0,
        };
      }),
      teams:
        team1Id > 0 && team2Id > 0
          ? [
              { teamId: team1Id, points: getTeamTotalPoints(1) },
              { teamId: team2Id, points: getTeamTotalPoints(2) },
            ]
          : [],
    };

    if (isEditMode) {
      updateMutation.mutate(
        { leagueId: Number(leagueId), eventId: Number(eventId), data: scoresData },
        {
          onSuccess: () => {
            scoreDraft.clearDraft();
            onSaveSuccess?.();
          },
        }
      );
      return;
    }

    createMutation.mutate(
      { leagueId: Number(leagueId), eventId: Number(eventId), data: scoresData },
      {
        onSuccess: () => {
          scoreDraft.clearDraft();
          onSaveSuccess?.();
        },
      }
    );
  };

  const renderPlayerRow = (player: any, team: 1 | 2, playerIndex: number) => {
    const p = player.player;
    const displayHandicap = Math.round(getEffectiveHandicap(player));
    const swapCandidates = getSwapCandidates({
      currentEntry: player,
      leaguePlayers,
      eventPlayerIds,
      activePlayerIds: players.map((entry: any) => Number(entry.playerId)),
      teamOnly: true,
    });

    return (
      <tr key={player.playerId} className="text-sm">
        <td className="p-2 text-xs">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold">
              {p.firstName} {p.lastName}
            </span>
            <PlayerSwapControl
              currentPlayerId={Number(player.playerId)}
              candidates={swapCandidates}
              isSaving={updateFlightPlayersMutation.isPending}
              onSwap={(replacementId) => savePlayerSwap(team, playerIndex, replacementId)}
            />
          </div>
          <span className="text-[10px]">Handicap: {displayHandicap}</span>
        </td>
        {holes.map((hole: any, holeIdx: number) => (
          <td key={hole.num} className="p-2">
            <div className="relative">
              <input
                type="number"
                min="1"
                max="10"
                className="score-input"
                value={watchedPlayers?.[player.playerId]?.scores?.[holeIdx] ?? ""}
                onChange={(e) => handleHoleChange(e, holeIdx, player.playerId)}
              />
              {popsForHole(player.playerId, hole.num) > 0 && (
                <span className="score-medals">
                  {Array.from({ length: popsForHole(player.playerId, hole.num) }).map((_, idx) => (
                    <span key={idx} className="h-1 w-1 rounded-full bg-black" />
                  ))}
                </span>
              )}
            </div>
          </td>
        ))}
        <ScoreValueCell>
          {getPlayerTotalScore(Number(player.playerId))}
        </ScoreValueCell>
        <ScoreValueCell>
          {getPlayerNetScore(Number(player.playerId))}
        </ScoreValueCell>
        <ScoreValueCell>0</ScoreValueCell>
      </tr>
    );
  };

  const renderTeamPointsRow = (teamName: string, team: 1 | 2) => (
    <tr aria-hidden="true" className="bg-gray-100">
      <td className="font-semibold text-xs">{teamName} Best Ball</td>
      {holes.map((hole: any, holeIdx: number) => (
        <ScoreValueCell key={hole.num} className="p-2">
          {getTeamPointsAtHole(team, holeIdx)}
        </ScoreValueCell>
      ))}
      <td />
      <td />
      <ScoreValueCell className="p-2">{getTeamTotalPoints(team)}</ScoreValueCell>
    </tr>
  );

  return (
    <SurfaceCard>
      <PanelBar variant="header">
        <div className="flex items-center gap-2">
          <Flag size={14} className="text-gray-400" strokeWidth={2} />
          <h3 className="text-sm font-semibold text-gray-800">
            Flight {formatTime(flight.startsAt, event.timeZone)}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              methods.reset();
              onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={saveScores}>
            {isEditMode ? "Save Changes" : "Submit Scores"}
          </Button>
        </div>
      </PanelBar>

      <div className="p-4">
        <div className="mb-3">
          <ScoreDraftStatus
            hasDraft={scoreDraft.hasDraft}
            savedAt={scoreDraft.savedAt}
            onClear={scoreDraft.clearDraft}
          />
        </div>
        <div className="border rounded-lg">
          <div className="w-full overflow-x-auto">
            <table className="score-table">
              <thead>
                <tr className="text-xs text-gray-700">
                  <th>Player</th>
                  {holes.map((hole: any) => (
                    <ScoreHeaderCell key={hole.num}>
                      {hole.num}
                    </ScoreHeaderCell>
                  ))}
                  <ScoreHeaderCell>Total</ScoreHeaderCell>
                  <ScoreHeaderCell>Net</ScoreHeaderCell>
                  <ScoreHeaderCell>Points</ScoreHeaderCell>
                </tr>
              </thead>
              <tbody>
                {team1Players.map((player: any, idx: number) => renderPlayerRow(player, 1, idx))}
                {team1Players.length > 0 &&
                  team2Players.length > 0 &&
                  renderTeamPointsRow(team1Name, 1)}
                {team2Players.map((player: any, idx: number) => renderPlayerRow(player, 2, idx))}
                {team1Players.length > 0 &&
                  team2Players.length > 0 &&
                  renderTeamPointsRow(team2Name, 2)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
};
