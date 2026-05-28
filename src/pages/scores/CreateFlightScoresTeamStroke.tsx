import Button from "@/components/layout/Button";
import { useCreateEventScores, useUpdateEventScores } from "@api/league/mutations";
import { Flag } from "lucide-react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { calculateStrokeplayPops } from "./util";

export const CreateFlightScoresTeamStroke = ({
  flight,
  event,
  isEditMode,
  onSaveSuccess,
  onCancel,
}: any) => {
  const { leagueId, eventId } = useParams();

  const startingHole = event.startSide === "front" ? 1 : 10;
  const holes = event.tee.holes
    .slice(startingHole - 1, startingHole + event.holes - 1)
    .map((hole: any, idx: number) => ({ ...hole, num: idx + startingHole }));

  const team1Id = Number(flight?.teams?.[0]?.teamId ?? 0);
  const team2Id = Number(flight?.teams?.[1]?.teamId ?? 0);
  const team1Name = String(flight?.teams?.[0]?.team?.name || "Team 1");
  const team2Name = String(flight?.teams?.[1]?.team?.name || "Team 2");

  const team1Players = (flight.players || []).filter((p: any) => Number(p.teamId) === team1Id);
  const team2Players = (flight.players || []).filter((p: any) => Number(p.teamId) === team2Id);
  const players = [...team1Players, ...team2Players];

  const getEffectiveHandicap = (playerEntry: any) => {
    const preHandicap = Number(playerEntry?.player?.rounds?.[0]?.preHandicap);
    if (isEditMode && Number.isFinite(preHandicap)) return preHandicap;
    return Number(playerEntry?.player?.handicap ?? 0);
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
  const watchedPlayers = methods.watch("players");

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

  const saveScores = () => {
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
        { onSuccess: () => onSaveSuccess?.() }
      );
      return;
    }

    createMutation.mutate(
      { leagueId: Number(leagueId), eventId: Number(eventId), data: scoresData },
      { onSuccess: () => onSaveSuccess?.() }
    );
  };

  const renderPlayerRow = (player: any) => {
    const p = player.player;
    const displayHandicap = Math.round(getEffectiveHandicap(player));

    return (
      <tr key={player.playerId} className="text-sm">
        <td className="p-2 text-xs flex flex-col">
          <span className="font-semibold">
            {p.firstName} {p.lastName}
          </span>
          <span className="text-[10px]">Handicap: {displayHandicap}</span>
        </td>
        {holes.map((hole: any, holeIdx: number) => (
          <td key={hole.num} className="p-2">
            <div className="relative">
              <input
                type="number"
                min="1"
                max="10"
                className="w-full min-w-10 border rounded h-8 text-center"
                value={watchedPlayers?.[player.playerId]?.scores?.[holeIdx] ?? ""}
                onChange={(e) => handleHoleChange(e, holeIdx, player.playerId)}
              />
              {popsForHole(player.playerId, hole.num) > 0 && (
                <span className="absolute bottom-1 left-1 pointer-events-none flex items-center justify-center gap-0.5">
                  {Array.from({ length: popsForHole(player.playerId, hole.num) }).map((_, idx) => (
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
        <td className="font-bold text-center text-xs">0</td>
      </tr>
    );
  };

  const renderTeamPointsRow = (teamName: string, team: 1 | 2) => (
    <tr aria-hidden="true" className="bg-gray-100">
      <td className="font-semibold text-xs">{teamName} Best Ball</td>
      {holes.map((hole: any, holeIdx: number) => (
        <td key={hole.num} className="p-2 font-bold text-center text-xs">
          {getTeamPointsAtHole(team, holeIdx)}
        </td>
      ))}
      <td />
      <td />
      <td className="p-2 font-bold text-center text-xs">{getTeamTotalPoints(team)}</td>
    </tr>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
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
        <div className="border rounded-lg">
          <div className="w-full overflow-x-auto">
            <table className="min-w-max w-full text-left table-sm table-auto">
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
                  <th className="p-2 text-center">Points</th>
                </tr>
              </thead>
              <tbody>
                {team1Players.map((player: any) => renderPlayerRow(player))}
                {team1Players.length > 0 &&
                  team2Players.length > 0 &&
                  renderTeamPointsRow(team1Name, 1)}
                {team2Players.map((player: any) => renderPlayerRow(player))}
                {team1Players.length > 0 &&
                  team2Players.length > 0 &&
                  renderTeamPointsRow(team2Name, 2)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
