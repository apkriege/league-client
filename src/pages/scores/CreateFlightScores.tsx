import { ScoreHeaderCell, ScoreValueCell } from "./components/ScoreTableCell";
import PanelBar from "@/components/layout/PanelBar";
import SurfaceCard from "@/components/layout/SurfaceCard";
import Table from "@/components/Table";
import { Fragment, useState } from "react";
import Button from "@/components/layout/Button";
import { useCreateEventScores, useUpdateEventScores } from "@api/league/mutations";
import { useUpdateFlightPlayers } from "@api/flight/mutations";
import { ArrowLeftRight, Flag } from "lucide-react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { isSubPlayer } from "./playerSwapUtils";
import {
  calculateMatchplayPops,
  createTeamScoringHelpers,
  sortFlightTeamsByHandicap,
} from "./util";
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

export const CreateFlightScores = ({
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
  const numericLeagueId = Number(leagueId);
  const numericEventId = Number(eventId);

  const holes = getEventScoringHoles(event);

  const { t1Id, t2Id, team1: sortedTeam1, team2: sortedTeam2 } = sortFlightTeamsByHandicap(flight);

  const getEffectiveHandicap = (playerEntry: any) => {
    return getPlayerCourseHandicap(playerEntry);
  };

  const getSavedOpponentId = (playerEntry: any) => {
    const flightOpponentId = Number(playerEntry?.opponentId ?? 0);
    if (flightOpponentId > 0) {
      return flightOpponentId;
    }

    const roundOpponentId = Number(playerEntry?.player?.rounds?.[0]?.opponentId ?? 0);
    return roundOpponentId > 0 ? roundOpponentId : null;
  };

  const hasTeams = t1Id != null || t2Id != null;
  const team1 = hasTeams
    ? (flight.players || []).filter((p: any) => Number(p.teamId) === Number(t1Id))
    : [...sortedTeam1];
  const team2Base = hasTeams
    ? (flight.players || []).filter((p: any) => Number(p.teamId) === Number(t2Id))
    : [...sortedTeam2];
  const team2 = (() => {
    const team2ByPlayerId = new Map(team2Base.map((p: any) => [Number(p.playerId), p]));
    const usedTeam2Ids = new Set<number>();
    const orderedTeam2: any[] = [];

    team1.forEach((player: any) => {
      const opponentId = Number(getSavedOpponentId(player) ?? 0);
      const opponent: any = team2ByPlayerId.get(opponentId);
      if (!opponent) return;

      const opponentPlayerId = Number(opponent.playerId);
      if (usedTeam2Ids.has(opponentPlayerId)) return;

      orderedTeam2.push(opponent);
      usedTeam2Ids.add(opponentPlayerId);
    });

    if (orderedTeam2.length === 0) {
      return team2Base;
    }

    const remaining = team2Base.filter((player: any) => !usedTeam2Ids.has(Number(player.playerId)));
    return [...orderedTeam2, ...remaining];
  })();

  const [swappedPlayersBySlot, setSwappedPlayersBySlot] = useState<Record<string, any>>({});
  const [editingSwapSlot, setEditingSwapSlot] = useState<string | null>(null);
  const [swapCandidateId, setSwapCandidateId] = useState<number | null>(null);

  const getSlotKey = (team: 1 | 2, idx: number) => `${team}-${idx}`;

  const getActiveTeamsFromSwaps = (swapsBySlot: Record<string, any>) => {
    const resolvedTeam1 = team1.map(
      (player: any, idx: number) => swapsBySlot[getSlotKey(1, idx)] ?? player
    );
    const resolvedTeam2 = team2.map(
      (player: any, idx: number) => swapsBySlot[getSlotKey(2, idx)] ?? player
    );

    return { resolvedTeam1, resolvedTeam2 };
  };

  const buildFlightPlayersPayload = (resolvedTeam1: any[], resolvedTeam2: any[]) => {
    const playerPayload = [...resolvedTeam1, ...resolvedTeam2].map((player: any) => ({
      playerId: Number(player.playerId),
      teamId: player?.teamId ?? player?.player?.teamId ?? null,
      opponentId: null,
    }));

    const byPlayerId = new Map(playerPayload.map((entry: any) => [Number(entry.playerId), entry]));
    const resolvedMatchups = Math.min(resolvedTeam1.length, resolvedTeam2.length);

    for (let i = 0; i < resolvedMatchups; i++) {
      const leftId = Number(resolvedTeam1[i]?.playerId);
      const rightId = Number(resolvedTeam2[i]?.playerId);

      const left = byPlayerId.get(leftId);
      const right = byPlayerId.get(rightId);
      if (!left || !right) continue;

      left.opponentId = rightId;
      right.opponentId = leftId;
    }

    return playerPayload;
  };

  const buildSwappedEntry = (baseEntry: any, replacement: any) => ({
    ...baseEntry,
    playerId: Number(replacement.id),
    teamId: baseEntry?.teamId ?? replacement?.teamId ?? null,
    player: {
      ...baseEntry?.player,
      ...replacement,
      id: Number(replacement.id),
      rounds: [],
    },
  });

  const activeTeam1 = team1.map(
    (player: any, idx: number) => swappedPlayersBySlot[getSlotKey(1, idx)] ?? player
  );
  const activeTeam2 = team2.map(
    (player: any, idx: number) => swappedPlayersBySlot[getSlotKey(2, idx)] ?? player
  );

  const activePlayerIds = new Set(
    [...activeTeam1, ...activeTeam2].map((player: any) => Number(player.playerId))
  );
  const eventPlayerIdSet = new Set((eventPlayerIds || []).map((id: number) => Number(id)));

  const getSwapCandidates = (slotTeam: 1 | 2, slotIdx: number, currentPlayerId: number) => {
    const baseEntry = slotTeam === 1 ? team1[slotIdx] : team2[slotIdx];
    const currentEntry = slotTeam === 1 ? activeTeam1[slotIdx] : activeTeam2[slotIdx];
    const baseTeamId = Number(baseEntry?.teamId ?? baseEntry?.player?.teamId ?? 0);

    const sameTeamPlayers = (leaguePlayers || []).filter(
      (p: any) => Number(p?.teamId ?? 0) === baseTeamId
    );
    const subs = (leaguePlayers || []).filter((p: any) => isSubPlayer(p));

    const uniqueById = new Map<number, any>();
    if (currentEntry?.player) {
      uniqueById.set(Number(currentEntry.playerId), {
        ...currentEntry.player,
        id: Number(currentEntry.playerId),
      });
    }
    [...sameTeamPlayers, ...subs].forEach((player: any) => {
      const id = Number(player?.id);
      if (id > 0) uniqueById.set(id, player);
    });

    return Array.from(uniqueById.values()).filter((candidate: any) => {
      const candidateId = Number(candidate.id);
      if (candidateId === currentPlayerId) return true;
      if (activePlayerIds.has(candidateId)) return false;
      if (isSubPlayer(candidate)) return true;
      return !eventPlayerIdSet.has(candidateId);
    });
  };

  const startSwap = (slotTeam: 1 | 2, slotIdx: number, currentPlayerId: number) => {
    setEditingSwapSlot(getSlotKey(slotTeam, slotIdx));
    setSwapCandidateId(currentPlayerId);
  };

  const cancelSwap = () => {
    setEditingSwapSlot(null);
    setSwapCandidateId(null);
  };

  const saveSwap = async (slotTeam: 1 | 2, slotIdx: number, currentPlayer: any) => {
    if (!swapCandidateId) return;

    const slotKey = getSlotKey(slotTeam, slotIdx);
    const baseEntry = slotTeam === 1 ? team1[slotIdx] : team2[slotIdx];
    const currentId = Number(currentPlayer.playerId);
    const nextId = Number(swapCandidateId);

    let nextSwaps = { ...swappedPlayersBySlot };

    if (nextId === Number(baseEntry.playerId)) {
      delete nextSwaps[slotKey];
    } else {
      const replacement = (leaguePlayers || []).find(
        (player: any) => Number(player?.id) === nextId
      );
      if (!replacement) {
        cancelSwap();
        return;
      }

      nextSwaps = {
        ...nextSwaps,
        [slotKey]: buildSwappedEntry(baseEntry, replacement),
      };
    }

    const { resolvedTeam1, resolvedTeam2 } = getActiveTeamsFromSwaps(nextSwaps);
    const payloadPlayers = buildFlightPlayersPayload(resolvedTeam1, resolvedTeam2);

    try {
      await updateFlightPlayersMutation.mutateAsync({
        flightId: Number(flight.id),
        players: payloadPlayers,
      });

      const oldScores = methods.getValues(`players.${currentId}.scores`) ?? [];
      methods.setValue(`players.${nextId}.scores`, oldScores, {
        shouldDirty: true,
        shouldTouch: true,
      });

      if (nextId !== currentId) {
        methods.unregister(`players.${currentId}`);
      }

      await onFlightPlayersUpdated?.();
      setSwappedPlayersBySlot({});
      cancelSwap();
    } catch (error) {
      console.error("Failed to persist swapped flight players:", error);
    }
  };

  const matchupCount = Math.min(activeTeam1.length, activeTeam2.length);
  const popsByPlayerId = new Map<number, Map<number, number>>();
  const allPlayers = [...activeTeam1, ...activeTeam2];
  const allPlayersById = new Map(
    allPlayers.map((player: any) => [Number(player.playerId), player])
  );

  const getPlayerEntry = (playerId: number) => allPlayersById.get(Number(playerId));

  for (let i = 0; i < matchupCount; i++) {
    const left = activeTeam1[i];
    const right = activeTeam2[i];

    const leftForPops = { ...left.player, handicap: getEffectiveHandicap(left) };
    const rightForPops = { ...right.player, handicap: getEffectiveHandicap(right) };

    const [leftPops, rightPops] = calculateMatchplayPops(leftForPops, rightForPops, holes);
    popsByPlayerId.set(Number(left.playerId), leftPops);
    popsByPlayerId.set(Number(right.playerId), rightPops);
  }

  const methods = useForm({
    defaultValues: {
      players: flight.players.reduce((acc: any, p: any) => {
        const playerScores = isEditMode
          ? holes.map((hole: any, holeIdx: number) => {
              const roundScores = p?.player?.rounds?.[0]?.scores ?? [];
              const scoreByHole = roundScores.find(
                (scoreEntry: any) => Number(scoreEntry?.hole) === Number(hole?.num)
              );
              const score = scoreByHole?.gross ?? roundScores?.[holeIdx]?.gross;
              return score ? String(score) : "";
            })
          : Array.from({ length: holes.length }, () => "");

        acc[p.playerId] = {
          scores: playerScores,
        };
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
      {
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  };

  const getPlayerTotalScore = (playerId: number) => {
    const scores = watchedPlayers?.[playerId]?.scores;
    if (!Array.isArray(scores)) return 0;
    return scores.reduce((sum: number, score: any) => sum + (Number(score) || 0), 0);
  };

  const getPlayerNetScore = (playerId: number) => {
    const total = getPlayerTotalScore(playerId);
    const playerEntry = getPlayerEntry(playerId);
    const hcp = getEffectiveHandicap(playerEntry);
    return total - Math.round(hcp);
  };

  const saveScores = () => {
    const playersInFlight = [...activeTeam1, ...activeTeam2];
    const validationMessage = validateHoleScores({ watchedPlayers, players: playersInFlight, holes });
    if (validationMessage) {
      show(validationMessage, "error");
      return;
    }

    const scoresData = {
      eventId: numericEventId,
      flightId: flight.id,
      players: playersInFlight.map((player: any) => {
        const playerId = Number(player.playerId);
        const data = watchedPlayers?.[playerId] ?? { scores: [] };

        return {
          playerId,
          opponentId: getOpponentId(playerId),
          scores: holes.reduce((acc: any, hole: any, idx: number) => {
            acc[hole.num] = Number(data.scores?.[idx]) || 0;
            return acc;
          }, {} as any),
          putts: [],
          gross: getPlayerTotalScore(playerId),
          net: getPlayerNetScore(playerId),
          points: getPlayerPoints({ playerId }),
          matchPoints: getPlayerMatchPoints({ playerId }),
        };
      }),
      teams:
        t1Id != null && t2Id != null
          ? [
              { teamId: t1Id, points: getTeamWinBonus(1) },
              { teamId: t2Id, points: getTeamWinBonus(2) },
            ]
          : [],
    };

    try {
      if (isEditMode) {
        updateMutation.mutate(
          {
            leagueId: numericLeagueId,
            eventId: numericEventId,
            data: scoresData,
          },
          {
            onSuccess: () => {
              scoreDraft.clearDraft();
              onSaveSuccess?.();
            },
          }
        );
      } else {
        createMutation.mutate(
          {
            leagueId: numericLeagueId,
            eventId: numericEventId,
            data: scoresData,
          },
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

  // Get opponent ID for a player based on their team and matchup index
  const getOpponentId = (playerId: number) => {
    if (isEditMode) {
      const playerEntry = getPlayerEntry(playerId);
      const savedOpponentId = getSavedOpponentId(playerEntry);
      if (savedOpponentId) {
        return savedOpponentId;
      }
    }

    const team1Ids = activeTeam1.map((p: any) => Number(p.playerId));
    const team2Ids = activeTeam2.map((p: any) => Number(p.playerId));

    const numericPlayerId = Number(playerId);
    const isTeam1 = team1Ids.includes(numericPlayerId);
    const matchupIdx = isTeam1
      ? team1Ids.indexOf(numericPlayerId)
      : team2Ids.indexOf(numericPlayerId);

    if (matchupIdx < 0 || matchupIdx >= matchupCount) {
      return null;
    }

    return Number(isTeam1 ? activeTeam2[matchupIdx]?.playerId : activeTeam1[matchupIdx]?.playerId);
  };

  const popsForHole = (playerId: number, holeNum: number) => {
    return popsByPlayerId.get(Number(playerId))?.get(holeNum) || 0;
  };

  const getPlayerMatchup = (playerId: number) => {
    const numericPlayerId = Number(playerId);
    const team1Idx = activeTeam1.findIndex((p: any) => Number(p.playerId) === numericPlayerId);
    const team2Idx = activeTeam2.findIndex((p: any) => Number(p.playerId) === numericPlayerId);
    const isTeam1Player = team1Idx !== -1;
    const matchupIdx = isTeam1Player ? team1Idx : team2Idx;

    if (matchupIdx < 0 || matchupIdx >= matchupCount) {
      return null;
    }

    const opponent = isTeam1Player ? activeTeam2[matchupIdx] : activeTeam1[matchupIdx];
    return { opponent, matchupIdx };
  };

  const matchupSummaryByPlayerId = new Map<
    number,
    {
      holePoints: number;
      playerNetTotal: number;
      opponentNetTotal: number;
      playedHoles: number;
    }
  >();

  const getMatchupSummaryForPlayer = (playerId: number) => {
    const cached = matchupSummaryByPlayerId.get(playerId);
    if (cached) return cached;

    const matchup = getPlayerMatchup(playerId);
    if (!matchup) {
      const empty = { holePoints: 0, playerNetTotal: 0, opponentNetTotal: 0, playedHoles: 0 };
      matchupSummaryByPlayerId.set(playerId, empty);
      return empty;
    }

    const { opponent } = matchup;
    const pointsPerMatchup = Number(event?.ptsPerHole) || 0;

    let holePoints = 0;
    let playerNetTotal = 0;
    let opponentNetTotal = 0;
    let playedHoles = 0;

    holes.forEach((hole: any, holeIdx: number) => {
      const playerScore = watchedPlayers?.[playerId]?.scores?.[holeIdx] ?? 0;
      const opponentScore = watchedPlayers?.[opponent.playerId]?.scores?.[holeIdx] ?? 0;

      if (!playerScore || !opponentScore) return;

      const playerNet = playerScore - popsForHole(playerId, hole.num);
      const opponentNet = opponentScore - popsForHole(opponent.playerId, hole.num);
      playerNetTotal += playerNet;
      opponentNetTotal += opponentNet;
      playedHoles++;

      if (pointsPerMatchup > 0) {
        if (playerNet === opponentNet) {
          holePoints += pointsPerMatchup / 2;
        } else if (playerNet < opponentNet) {
          holePoints += pointsPerMatchup;
        }
      }
    });

    const summary = {
      holePoints,
      playerNetTotal,
      opponentNetTotal,
      playedHoles,
    };

    matchupSummaryByPlayerId.set(playerId, summary);
    return summary;
  };

  // Get points for a player based on their net score compared to their opponent
  const getPlayerPoints = (player: any) => {
    return getMatchupSummaryForPlayer(Number(player.playerId)).holePoints;
  };

  // Get match points for a player based on their net score compared to their opponent
  const getPlayerMatchPoints = (player: any) => {
    const pointsPerMatch = Number(event?.ptsPerMatch) || 0;
    if (pointsPerMatch <= 0) return 0;

    const { playerNetTotal, opponentNetTotal, playedHoles } = getMatchupSummaryForPlayer(
      Number(player.playerId)
    );

    if (playedHoles === 0) return 0;

    if (playerNetTotal < opponentNetTotal) {
      return pointsPerMatch;
    }

    if (playerNetTotal === opponentNetTotal) {
      return pointsPerMatch / 2;
    }

    return 0;
  };

  const getTeamPlayerPointsTotal = (team: 1 | 2) => {
    const players = team === 1 ? activeTeam1 : activeTeam2;
    return players.reduce(
      (sum: number, player: any) => sum + getPlayerPoints(player) + getPlayerMatchPoints(player),
      0
    );
  };

  const getScoreAtHole = (player: any, holeIdx: number) => {
    return Number(watchedPlayers?.[player.playerId]?.scores?.[holeIdx] ?? 0);
  };

  const { getTeamPointsForHole, getTeamWinBonus, getTeamMedalPoints, getTeamTotalPoints } =
    createTeamScoringHelpers({
      event,
      holes,
      team1: activeTeam1,
      team2: activeTeam2,
      matchupCount,
      popsForHole,
      getScoreAtHole,
      getTeamPlayerPointsTotal,
    });

  const renderPlayerRow = (player: any, team: 1 | 2, idx: number) => {
    const p = player.player;
    const slotKey = getSlotKey(team, idx);
    const swapCandidates = getSwapCandidates(team, idx, Number(player.playerId));
    const isEditingSwap = editingSwapSlot === slotKey;

    return (
      <tr key={player.playerId} className="text-sm">
        <td className="p-2 text-xs">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold">
              {p.firstName} {p.lastName}
            </span>
            {!isEditingSwap ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-900 hover:underline"
                onClick={() => startSwap(team, idx, Number(player.playerId))}
              >
                <ArrowLeftRight size={10} />
                Swap
              </button>
            ) : (
              <div className="flex flex-col gap-1.5">
                <select
                  className="h-7 min-w-36 rounded border border-gray-200 bg-white px-2 text-[10px]"
                  value={swapCandidateId ?? ""}
                  onChange={(e) => setSwapCandidateId(Number(e.target.value))}
                >
                  {swapCandidates.map((candidate: any) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.firstName} {candidate.lastName}
                      {isSubPlayer(candidate) ? " - Sub" : ""}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="h-6 rounded bg-slate-900 px-2 text-[10px] font-semibold text-white"
                    onClick={() => saveSwap(team, idx, player)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="h-6 rounded border border-gray-200 px-2 text-[10px] font-semibold text-gray-600"
                    onClick={cancelSwap}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          <PlayerHandicapSummary entry={player} />
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
        <ScoreValueCell>{getPlayerTotalScore(player.playerId)}</ScoreValueCell>
        <ScoreValueCell>{getPlayerNetScore(player.playerId)}</ScoreValueCell>
        <ScoreValueCell>
          {getPlayerPoints(player) + getPlayerMatchPoints(player)}
        </ScoreValueCell>
      </tr>
    );
  };

  const renderTeamPointsRow = (label: string, team: 1 | 2) => (
    <tr aria-hidden="true" className="bg-gray-200">
      <td>{label}</td>
      {holes.map((hole: any, holeIdx: number) => (
        <td key={hole.num} className="p-2 font-bold text-center">
          {getTeamPointsForHole(team, hole, holeIdx)}
        </td>
      ))}
      <td />
      <td className="p-2 font-bold text-center">
        <div className="flex flex-col items-center leading-tight">
          <span className="text-sm">{getTeamMedalPoints(team)}</span>
          <span className="text-[10px]">Medal</span>
        </div>
      </td>
      <td className="p-2 font-bold text-center">
        <div className="flex flex-col items-center leading-tight">
          <span className="text-sm">{getTeamTotalPoints(team)}</span>
          <span className="text-[10px]">Total</span>
        </div>
      </td>
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
          <Table
            data={[1 as const, 2 as const]}
            search={false}
            variant="clean"
            noBorder
            tableClassName="score-table"
            renderTable={(visibleTeams) => (
              <>
                <thead>
                  <tr className="text-xs text-gray-700">
                    <th>Player</th>
                    {holes.map((hole: any) => (
                      <ScoreHeaderCell key={hole.num}>
                        {hole.num}
                      </ScoreHeaderCell>
                    ))}
                    <th>Total</th>
                    <th>Net</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTeams.map((team) => {
                    const teamPlayers = team === 1 ? activeTeam1 : activeTeam2;
                    return (
                      <Fragment key={team}>
                        {teamPlayers.map((player: any, idx: number) =>
                          renderPlayerRow(player, team, idx),
                        )}
                        {activeTeam1.length > 0 &&
                          activeTeam2.length > 0 &&
                          renderTeamPointsRow(`Team ${team} Points`, team)}
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
