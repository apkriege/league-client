import { ScoreHeaderCell, ScoreValueCell } from "./components/ScoreTableCell";
import PanelBar from "@/components/layout/PanelBar";
import SurfaceCard from "@/components/layout/SurfaceCard";
import Table from "@/components/Table";
import Button from "@/components/layout/Button";
import { useUpdateFlightPlayers } from "@api/flight/mutations";
import { useCreateEventScores, useUpdateEventScores } from "@api/league/mutations";
import { Flag } from "lucide-react";
import { Fragment, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useParams } from "react-router";
import {
  PlayerSwapControl,
} from "./PlayerSwapControl";
import { buildSwappedPlayerEntry, getSwapCandidates } from "./playerSwapUtils";
import { calculateMatchplayPops } from "./util";
import { ScoreDraftStatus } from "./ScoreDraftStatus";
import { useScoreDraft } from "./useScoreDraft";
import { useToast } from "@/context/useToast";
import { validateHoleScores } from "./scoreValidation";
import { formatTime } from "@/utils/format";
import {
  getEventScoringHoles,
  getPlayerCourseHandicap,
} from "./scoringSetup";
import PlayerHandicapSummary from "./components/PlayerHandicapSummary";

export const CreateFlightScoresIndividualMatch = ({
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

  const [allPlayers, setAllPlayers] = useState<any[]>(flight.players ?? []);
  const allPlayersById = new Map(allPlayers.map((p: any) => [Number(p.playerId), p]));

  const getEffectiveHandicap = (playerEntry: any) => {
    return getPlayerCourseHandicap(playerEntry);
  };

  // Prefer the persisted flight pairing, then pair any unassigned players by position.
  const buildPairs = (playersToPair: any[] = allPlayers): [any, any][] => {
    const playersById = new Map(playersToPair.map((p: any) => [Number(p.playerId), p]));
    const usedIds = new Set<number>();
    const pairs: [any, any][] = [];
    for (const player of playersToPair) {
      if (usedIds.has(Number(player.playerId))) continue;
      const opponentId = Number(
        player?.opponentId ?? player?.player?.rounds?.[0]?.opponentId ?? 0
      );
      const opponent = playersById.get(opponentId);
      if (opponent && !usedIds.has(Number(opponent.playerId))) {
        pairs.push([player, opponent]);
        usedIds.add(Number(player.playerId));
        usedIds.add(Number(opponent.playerId));
      }
    }

    const remaining = playersToPair.filter((player: any) => !usedIds.has(Number(player.playerId)));
    for (let i = 0; i + 1 < remaining.length; i += 2) {
      pairs.push([remaining[i], remaining[i + 1]]);
    }
    return pairs;
  };

  const pairs = buildPairs();

  const opponentMap = new Map<number, any>();
  for (const [p1, p2] of pairs) {
    opponentMap.set(Number(p1.playerId), p2);
    opponentMap.set(Number(p2.playerId), p1);
  }

  // Pops between each matched pair
  const popsByPlayerId = new Map<number, Map<number, number>>();
  for (const [p1, p2] of pairs) {
    const left = { ...p1.player, handicap: getEffectiveHandicap(p1) };
    const right = { ...p2.player, handicap: getEffectiveHandicap(p2) };
    const [leftPops, rightPops] = calculateMatchplayPops(left, right, holes);
    popsByPlayerId.set(Number(p1.playerId), leftPops);
    popsByPlayerId.set(Number(p2.playerId), rightPops);
  }

  const popsForHole = (playerId: number, holeNum: number) =>
    popsByPlayerId.get(Number(playerId))?.get(holeNum) || 0;

  const methods = useForm({
    defaultValues: {
      players: allPlayers.reduce((acc: any, p: any) => {
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
  const watchedPlayers = useWatch({ control: methods.control, name: "players" });
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
    const playerEntry = allPlayersById.get(playerId);
    const hcp = Math.round(getEffectiveHandicap(playerEntry));
    return getPlayerTotalScore(playerId) - hcp;
  };

  const getMatchupPoints = (playerId: number) => {
    const opponent = opponentMap.get(Number(playerId));
    if (!opponent) return { holePoints: 0, matchPoints: 0 };

    const opponentId = Number(opponent.playerId);
    const ptsPerHole = Number(event?.ptsPerHole) || 0;
    const ptsPerMatch = Number(event?.ptsPerMatch) || 0;

    let holePoints = 0;
    let playerNetTotal = 0;
    let opponentNetTotal = 0;
    let playedHoles = 0;

    holes.forEach((hole: any, holeIdx: number) => {
      const playerGross = Number(watchedPlayers?.[playerId]?.scores?.[holeIdx] ?? 0);
      const opponentGross = Number(watchedPlayers?.[opponentId]?.scores?.[holeIdx] ?? 0);
      if (!playerGross || !opponentGross) return;

      const playerNet = playerGross - popsForHole(playerId, hole.num);
      const opponentNet = opponentGross - popsForHole(opponentId, hole.num);
      playerNetTotal += playerNet;
      opponentNetTotal += opponentNet;
      playedHoles++;

      if (ptsPerHole > 0) {
        if (playerNet === opponentNet) holePoints += ptsPerHole / 2;
        else if (playerNet < opponentNet) holePoints += ptsPerHole;
      }
    });

    let matchPoints = 0;
    if (ptsPerMatch > 0 && playedHoles > 0) {
      if (playerNetTotal < opponentNetTotal) matchPoints = ptsPerMatch;
      else if (playerNetTotal === opponentNetTotal) matchPoints = ptsPerMatch / 2;
    }

    return { holePoints, matchPoints };
  };

  const getHolePointValues = (playerId: number) => {
    const opponent = opponentMap.get(Number(playerId));
    if (!opponent) return holes.map(() => 0);

    const opponentId = Number(opponent.playerId);
    const ptsPerHole = Number(event?.ptsPerHole) || 0;

    return holes.map((hole: any, holeIdx: number) => {
      const playerGross = Number(watchedPlayers?.[playerId]?.scores?.[holeIdx] ?? 0);
      const opponentGross = Number(watchedPlayers?.[opponentId]?.scores?.[holeIdx] ?? 0);
      if (!playerGross || !opponentGross || ptsPerHole <= 0) return 0;

      const playerNet = playerGross - popsForHole(playerId, hole.num);
      const opponentNet = opponentGross - popsForHole(opponentId, hole.num);

      if (playerNet === opponentNet) return ptsPerHole / 2;
      if (playerNet < opponentNet) return ptsPerHole;
      return 0;
    });
  };

  const buildFlightPlayersPayload = (playersToSave: any[]) => {
    const pairList = buildPairs(playersToSave);
    const opponentByPlayerId = new Map<number, number>();

    pairList.forEach(([left, right]) => {
      opponentByPlayerId.set(Number(left.playerId), Number(right.playerId));
      opponentByPlayerId.set(Number(right.playerId), Number(left.playerId));
    });

    return playersToSave.map((player: any) => ({
      playerId: Number(player.playerId),
      teamId: player?.teamId ?? player?.player?.teamId ?? null,
      opponentId: opponentByPlayerId.get(Number(player.playerId)) ?? null,
    }));
  };

  const savePlayerSwap = async (playerIndex: number, replacementId: number) => {
    const currentEntry = allPlayers[playerIndex];
    const currentId = Number(currentEntry?.playerId);
    const nextId = Number(replacementId);
    if (!currentEntry || !nextId || nextId === currentId) return;

    const candidates = getSwapCandidates({
      currentEntry,
      leaguePlayers,
      eventPlayerIds,
      activePlayerIds: allPlayers.map((player: any) => Number(player.playerId)),
      teamOnly: false,
    });
    const replacement = candidates.find((player: any) => Number(player?.id) === nextId);
    if (!replacement) return;

    const nextPlayers = allPlayers.map((player: any, index: number) =>
      index === playerIndex ? buildSwappedPlayerEntry(player, replacement) : player
    );

    await updateFlightPlayersMutation.mutateAsync({
      flightId: Number(flight.id),
      players: buildFlightPlayersPayload(nextPlayers),
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
    setAllPlayers(Array.isArray(refreshedPlayers) ? refreshedPlayers : nextPlayers);
  };

  const saveScores = () => {
    const validationMessage = validateHoleScores({ watchedPlayers, players: allPlayers, holes });
    if (validationMessage) {
      show(validationMessage, "error");
      return;
    }

    const scoresData = {
      eventId: Number(eventId),
      flightId: flight.id,
      players: Object.entries(watchedPlayers).map(([playerId, data]: any) => {
        const numPlayerId = Number(playerId);
        const opponent = opponentMap.get(numPlayerId);
        const { holePoints, matchPoints } = getMatchupPoints(numPlayerId);
        return {
          playerId: numPlayerId,
          opponentId: opponent ? Number(opponent.playerId) : null,
          scores: holes.reduce((acc: any, hole: any, idx: number) => {
            acc[hole.num] = Number(data.scores?.[idx]) || 0;
            return acc;
          }, {} as any),
          putts: [],
          gross: getPlayerTotalScore(numPlayerId),
          net: getPlayerNetScore(numPlayerId),
          points: holePoints,
          matchPoints,
        };
      }),
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

  const renderPlayerRow = (player: any, playerIndex: number) => {
    const p = player.player;
    const { holePoints, matchPoints } = getMatchupPoints(Number(player.playerId));
    const holePointValues = getHolePointValues(Number(player.playerId));
    const swapCandidates = getSwapCandidates({
      currentEntry: player,
      leaguePlayers,
      eventPlayerIds,
      activePlayerIds: allPlayers.map((entry: any) => Number(entry.playerId)),
      teamOnly: false,
    });

    return (
      <Fragment key={player.playerId}>
        <tr className="text-sm">
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
            <PlayerHandicapSummary
              entry={player}
              className="block text-[10px] text-gray-500"
            />
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
          <ScoreValueCell>{holePoints}</ScoreValueCell>
          <ScoreValueCell>{matchPoints}</ScoreValueCell>
          <ScoreValueCell>{holePoints + matchPoints}</ScoreValueCell>
        </tr>
        <tr className="bg-slate-50 text-[11px] text-gray-600">
          <td className="p-2 font-semibold">Hole Pts</td>
          {holePointValues.map((value: number, idx: number) => (
            <td key={holes[idx]?.num ?? idx} className="p-2 text-center font-semibold">
              {value || "-"}
            </td>
          ))}
          <td className="w-px whitespace-nowrap" />
          <td className="w-px whitespace-nowrap" />
          <td className="w-px whitespace-nowrap text-center font-bold">{holePoints}</td>
          <td className="w-px whitespace-nowrap" />
          <td className="w-px whitespace-nowrap" />
        </tr>
      </Fragment>
    );
  };

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
          <Table
            data={pairs}
            search={false}
            pagination={false}
            variant="clean"
            noBorder
            tableClassName="score-table"
            renderTable={(visiblePairs) => (
              <>
                <thead>
                  <tr className="text-xs text-gray-700">
                    <th className="py-2 pr-2 pl-4">Player</th>
                    {holes.map((hole: any) => (
                      <ScoreHeaderCell key={hole.num}>
                        {hole.num}
                      </ScoreHeaderCell>
                    ))}
                    <th className="w-px whitespace-nowrap p-2 text-center">Total</th>
                    <th className="w-px whitespace-nowrap p-2 text-center">Net</th>
                    <th className="w-px whitespace-nowrap p-2 text-center">Hole Pts</th>
                    <th className="w-px whitespace-nowrap p-2 text-center">Match Pts</th>
                    <th className="w-px whitespace-nowrap p-2 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePairs.map((pair) => {
                    const [p1, p2] = pair;
                    const pairIdx = pairs.indexOf(pair);
                    return (
                      <Fragment key={pairIdx}>
                        {pairIdx > 0 && (
                          <tr aria-hidden="true">
                            <td colSpan={holes.length + 6} className="h-2 bg-gray-50" />
                          </tr>
                        )}
                        <tr className="bg-gray-50 text-[11px] font-semibold text-gray-500">
                          <td className="p-2" colSpan={holes.length + 6}>
                            Matchup {pairIdx + 1}: {p1.player.firstName} {p1.player.lastName} vs{" "}
                            {p2.player.firstName} {p2.player.lastName}
                          </td>
                        </tr>
                        {renderPlayerRow(p1, allPlayers.findIndex((p: any) => Number(p.playerId) === Number(p1.playerId)))}
                        {renderPlayerRow(p2, allPlayers.findIndex((p: any) => Number(p.playerId) === Number(p2.playerId)))}
                      </Fragment>
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
};
