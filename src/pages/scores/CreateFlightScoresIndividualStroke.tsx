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

export const CreateFlightScoresIndividualStroke = ({
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

  const startingHole = event.startSide === "front" ? 1 : 10;
  const holes = event.tee.holes
    .slice(startingHole - 1, startingHole + event.holes - 1)
    .map((hole: any, idx: number) => ({ ...hole, num: idx + startingHole }));

  const [players, setPlayers] = useState<any[]>(flight.players ?? []);

  const getEffectiveHandicap = (playerEntry: any) => {
    const preHandicap = Number(playerEntry?.player?.rounds?.[0]?.preHandicap);
    if (isEditMode && Number.isFinite(preHandicap)) return preHandicap;
    return Number(playerEntry?.player?.handicap ?? 0);
  };

  // Per-hole handicap stroke allocation for each player
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

  // Stableford points: net diff vs par → eagle+=4, birdie=3, par=2, bogey=1, double+=0
  const getPlayerStablefordPoints = (playerId: number) => {
    const scores = watchedPlayers?.[playerId]?.scores;
    if (!Array.isArray(scores)) return 0;
    return holes.reduce((total: number, hole: any, idx: number) => {
      const gross = Number(scores[idx]) || 0;
      if (!gross) return total;
      const net = gross - popsForHole(playerId, hole.num);
      const diff = net - (hole.par ?? 4);
      if (diff <= -2) return total + 4;
      if (diff === -1) return total + 3;
      if (diff === 0) return total + 2;
      if (diff === 1) return total + 1;
      return total;
    }, 0);
  };

  const savePlayerSwap = async (playerIndex: number, replacementId: number) => {
    const currentEntry = players[playerIndex];
    const currentId = Number(currentEntry?.playerId);
    const nextId = Number(replacementId);
    if (!currentEntry || !nextId || nextId === currentId) return;

    const candidates = getSwapCandidates({
      currentEntry,
      leaguePlayers,
      eventPlayerIds,
      activePlayerIds: players.map((player: any) => Number(player.playerId)),
      teamOnly: false,
    });
    const replacement = candidates.find((player: any) => Number(player?.id) === nextId);
    if (!replacement) return;

    const nextPlayers = players.map((player: any, index: number) =>
      index === playerIndex ? buildSwappedPlayerEntry(player, replacement) : player
    );
    const payload = nextPlayers.map((player: any) => ({
      playerId: Number(player.playerId),
      teamId: player?.teamId ?? player?.player?.teamId ?? null,
      opponentId: null,
    }));

    await updateFlightPlayersMutation.mutateAsync({
      flightId: Number(flight.id),
      players: payload,
    });

    const oldScores = methods.getValues(`players.${currentId}.scores`) ?? [];
    methods.setValue(`players.${nextId}.scores`, oldScores, {
      shouldDirty: true,
      shouldTouch: true,
    });
    methods.unregister(`players.${currentId}`);
    setPlayers(nextPlayers);
    await onFlightPlayersUpdated?.();
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
      players: Object.entries(watchedPlayers).map(([playerId, data]: any) => ({
        playerId: Number(playerId),
        opponentId: null,
        scores: holes.reduce((acc: any, hole: any, idx: number) => {
          acc[hole.num] = Number(data.scores?.[idx]) || 0;
          return acc;
        }, {} as any),
        putts: [],
        gross: getPlayerTotalScore(Number(playerId)),
        net: getPlayerNetScore(Number(playerId)),
        points: getPlayerStablefordPoints(Number(playerId)),
        matchPoints: 0,
      })),
      teams: [],
    };

    try {
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
      } else {
        createMutation.mutate(
          { leagueId: Number(leagueId), eventId: Number(eventId), data: scoresData },
          {
            onSuccess: () => {
              scoreDraft.clearDraft();
              onSaveSuccess?.();
            },
          }
        );
      }
    } catch (error) {
      console.error("Error submitting scores:", error);
    }
  };

  return (
    <div className="surface-card">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Flag size={14} className="text-gray-400" strokeWidth={2} />
          <h3 className="text-sm font-semibold text-gray-800">Flight {flight.startTime}</h3>
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
      </div>

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
                    <th key={hole.num} className="p-2 text-center">
                      {hole.num}
                    </th>
                  ))}
                  <th className="p-2 text-center">Total</th>
                  <th className="p-2 text-center">Net</th>
                  <th className="p-2 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player: any, playerIndex: number) => {
                  const p = player.player;
                  const displayHandicap = Math.round(getEffectiveHandicap(player));
                  const swapCandidates = getSwapCandidates({
                    currentEntry: player,
                    leaguePlayers,
                    eventPlayerIds,
                    activePlayerIds: players.map((entry: any) => Number(entry.playerId)),
                    teamOnly: false,
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
                            onSwap={(replacementId) => savePlayerSwap(playerIndex, replacementId)}
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
                                {Array.from({
                                  length: popsForHole(player.playerId, hole.num),
                                }).map((_, idx) => (
                                  <span key={idx} className="h-1 w-1 rounded-full bg-black" />
                                ))}
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                      <td className="font-bold text-center text-xs">
                        {getPlayerTotalScore(Number(player.playerId))}
                      </td>
                      <td className="font-bold text-center text-xs">
                        {getPlayerNetScore(Number(player.playerId))}
                      </td>
                      <td className="font-bold text-center text-xs">
                        {getPlayerStablefordPoints(Number(player.playerId))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
