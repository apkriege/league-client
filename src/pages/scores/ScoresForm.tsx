import PageHeader from "@/components/layout/PageHeader";
import { useSubmitEventScores } from "@api/league/mutations";
import { useLeagueEvent } from "@api/league/queries";
import { useToast } from "@/context/ToastContext";
import { CloudLightning } from "lucide-react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { calculateMatchplayPops } from "./util";
import Button from "@/components/layout/Button";

export default function ScoresForm() {
  const { leagueId, eventId } = useParams();

  const { data: event } = useLeagueEvent(Number(leagueId)!, Number(eventId)!);

  if (!event) {
    return <div>Loading event...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Event Scores"
        subTitle="Enter scores for the event"
        icon={<CloudLightning size={14} />}
        iconText="SCORES"
      />

      <div className="flex flex-col gap-4">
        {event.flights.map((flight: any) => (
          <FlightScores key={flight.id} flight={flight} event={event} />
        ))}
      </div>
    </div>
  );
}

const FlightScores = ({ flight, event }: any) => {
  const { show } = useToast();
  const scoreMutation = useSubmitEventScores();

  const startingHole = event.startSide === "front" ? 1 : 10;
  const holes = event.tee.holes
    .slice(startingHole - 1, startingHole + event.holes - 1)
    .map((hole: any, idx: number) => ({ ...hole, num: idx + startingHole }));

  const t1Id = flight.teams[0].teamId;
  const t2Id = flight.teams[1].teamId;

  const byHandicap = (a: any, b: any) => {
    const aHcp = Number(a?.player?.handicap ?? 999);
    const bHcp = Number(b?.player?.handicap ?? 999);
    return aHcp - bHcp;
  };

  const team1 = flight.players.filter((p: any) => p.teamId === t1Id).sort(byHandicap);
  const team2 = flight.players.filter((p: any) => p.teamId === t2Id).sort(byHandicap);

  // Better players are matched by index: team1[0] vs team2[0], team1[1] vs team2[1], etc.
  const popsByPlayerId = new Map<number, Map<number, number>>();
  const matchupCount = Math.min(team1.length, team2.length);

  for (let i = 0; i < matchupCount; i++) {
    const left = team1[i];
    const right = team2[i];

    const [leftPops, rightPops] = calculateMatchplayPops(left.player, right.player, holes);
    popsByPlayerId.set(Number(left.playerId), leftPops);
    popsByPlayerId.set(Number(right.playerId), rightPops);
  }

  const randomScore = () => Math.floor(Math.random() * 6) + 3;

  const methods = useForm({
    defaultValues: {
      players: flight.players.reduce((acc: any, p: any) => {
        acc[p.playerId] = {
          scores: Array.from({ length: holes.length }, () => randomScore()),
        };
        return acc;
      }, {}),
    },
  });

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
      {
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  };

  const totalScore = (p: any) => {
    const scores = watchedPlayers?.[p.playerId]?.scores;
    if (!Array.isArray(scores)) return 0;
    return scores.reduce((sum: number, score: any) => sum + (Number(score) || 0), 0);
  };

  const popsForHole = (playerId: number, holeNum: number) => {
    return popsByPlayerId.get(Number(playerId))?.get(holeNum) || 0;
  };

  const getPlayerPoints = (player: any) => {
    const pointsPerMatchup = Number(event?.ptsPerHole) || 0;
    const pointsPerMatch = Number(event?.ptsPerMatch) || 0;

    const team1Idx = team1.findIndex((p: any) => p.playerId === player.playerId);
    const team2Idx = team2.findIndex((p: any) => p.playerId === player.playerId);
    const isTeam1Player = team1Idx !== -1;
    const matchupIdx = isTeam1Player ? team1Idx : team2Idx;

    if (matchupIdx < 0 || matchupIdx >= matchupCount) return 0;

    const opponent = isTeam1Player ? team2[matchupIdx] : team1[matchupIdx];
    let totalPoints = 0;
    let playerNetTotal = 0;
    let opponentNetTotal = 0;
    let playedHoles = 0;

    holes.forEach((hole: any, holeIdx: number) => {
      const playerScore = watchedPlayers?.[player.playerId]?.scores?.[holeIdx] ?? 0;
      const opponentScore = watchedPlayers?.[opponent.playerId]?.scores?.[holeIdx] ?? 0;

      if (!playerScore || !opponentScore) return;

      const playerNet = playerScore - popsForHole(player.playerId, hole.num);
      const opponentNet = opponentScore - popsForHole(opponent.playerId, hole.num);
      playerNetTotal += playerNet;
      opponentNetTotal += opponentNet;
      playedHoles++;

      if (pointsPerMatchup > 0) {
        if (playerNet === opponentNet) {
          totalPoints += pointsPerMatchup / 2;
        } else if (playerNet < opponentNet) {
          totalPoints += pointsPerMatchup;
        }
      }
    });

    if (pointsPerMatch > 0 && playedHoles > 0) {
      if (playerNetTotal < opponentNetTotal) {
        totalPoints += pointsPerMatch;
      } else if (playerNetTotal === opponentNetTotal) {
        totalPoints += pointsPerMatch / 2;
      }
    }

    return totalPoints;
  };

  const renderPlayerRow = (player: any) => {
    const p = player.player;

    return (
      <tr key={player.playerId} className="text-sm">
        <td className="p-2 text-xs flex flex-col">
          <span className="font-semibold">
            {p.firstName} {p.lastName}
          </span>
          <span className="text-[10px]">Handicap: {p.handicap}</span>
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
        <td className="font-bold text-center text-xs">{totalScore(player)}</td>
        <td className="font-bold text-center text-xs">{totalScore(player) - p.handicap}</td>
        <td className="font-bold text-center text-xs">{getPlayerPoints(player)}</td>
      </tr>
    );
  };

  const getTeamPointsForHole = (team: 1 | 2, hole: any, holeIdx: number) => {
    const pointsPerMatchup = Number(event?.ptsPerHole) || 0;
    let teamPoints = 0;

    for (let i = 0; i < matchupCount; i++) {
      const p1 = team1[i];
      const p2 = team2[i];

      const p1Score = watchedPlayers?.[p1.playerId]?.scores?.[holeIdx] ?? 0;
      const p2Score = watchedPlayers?.[p2.playerId]?.scores?.[holeIdx] ?? 0;

      if (p1Score && p2Score && pointsPerMatchup > 0) {
        const p1Net = p1Score - popsForHole(p1.playerId, hole.num);
        const p2Net = p2Score - popsForHole(p2.playerId, hole.num);

        if (p1Net === p2Net) {
          teamPoints += pointsPerMatchup / 2;
        } else if (team === 1 && p1Net < p2Net) {
          teamPoints += pointsPerMatchup;
        } else if (team === 2 && p2Net < p1Net) {
          teamPoints += pointsPerMatchup;
        }
      }
    }

    return teamPoints;
  };

  const getTeamPlayerPointsTotal = (team: 1 | 2) => {
    const players = team === 1 ? team1 : team2;
    return players.reduce((sum: number, player: any) => sum + getPlayerPoints(player), 0);
  };

  const getTeamNetTotal = (team: 1 | 2) => {
    const players = team === 1 ? team1 : team2;
    let netTotal = 0;

    players.forEach((player: any) => {
      holes.forEach((hole: any, holeIdx: number) => {
        const score = watchedPlayers?.[player.playerId]?.scores?.[holeIdx] ?? 0;
        if (!score) return;
        netTotal += score - popsForHole(player.playerId, hole.num);
      });
    });

    return netTotal;
  };

  const getTeamWinBonus = (team: 1 | 2) => {
    const bonus = Number(event?.ptsPerTeamWin) || 0;
    if (bonus <= 0) return 0;

    const team1Net = getTeamNetTotal(1);
    const team2Net = getTeamNetTotal(2);

    if (team1Net === 0 && team2Net === 0) return 0;
    if (team1Net === team2Net) return bonus / 2;

    const winner = team1Net < team2Net ? 1 : 2;
    return team === winner ? bonus : 0;
  };

  const getTeamMatchBonusTotal = (team: 1 | 2) => {
    const pointsPerMatch = Number(event?.ptsPerMatch) || 0;
    if (pointsPerMatch <= 0) return 0;

    let total = 0;

    for (let i = 0; i < matchupCount; i++) {
      const p1 = team1[i];
      const p2 = team2[i];

      let p1NetTotal = 0;
      let p2NetTotal = 0;
      let playedHoles = 0;

      holes.forEach((hole: any, holeIdx: number) => {
        const p1Score = watchedPlayers?.[p1.playerId]?.scores?.[holeIdx] ?? 0;
        const p2Score = watchedPlayers?.[p2.playerId]?.scores?.[holeIdx] ?? 0;

        if (!p1Score || !p2Score) return;

        p1NetTotal += p1Score - popsForHole(p1.playerId, hole.num);
        p2NetTotal += p2Score - popsForHole(p2.playerId, hole.num);
        playedHoles++;
      });

      if (playedHoles === 0) continue;

      if (p1NetTotal === p2NetTotal) {
        total += pointsPerMatch / 2;
      } else if (
        (team === 1 && p1NetTotal < p2NetTotal) ||
        (team === 2 && p2NetTotal < p1NetTotal)
      ) {
        total += pointsPerMatch;
      }
    }

    return total;
  };

  const getTeamMedalPoints = (team: 1 | 2) => {
    return getTeamMatchBonusTotal(team) + getTeamWinBonus(team);
  };

  const getTeamTotalPoints = (team: 1 | 2) => {
    return getTeamPlayerPointsTotal(team) + getTeamWinBonus(team);
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

  const saveScores = () => {
    const playersScores = methods.getValues("players") || {};

    const data = Object.entries(playersScores).map(([playerId, scoreData]: any) => {
      const scoresArray = Array.isArray(scoreData?.scores) ? scoreData.scores : [];
      const scores = holes.reduce((acc: Record<number, number>, hole: any, idx: number) => {
        const val = Number(scoresArray[idx]);
        if (Number.isFinite(val) && val > 0) {
          acc[hole.num] = val;
        }
        return acc;
      }, {});

      return {
        flightId: Number(flight.id),
        playerId: parseInt(playerId, 10),
        scores,
      };
    });

    scoreMutation.mutate(
      {
        leagueId: Number(event.leagueId),
        eventId: Number(event.id),
        data,
      },
      {
        onSuccess: () => {
          show("Scores submitted successfully!", "success");
        },
        onError: (error: any) => {
          console.error("Error submitting scores:", error);
          show("Failed to submit scores. Please try again.", "error");
        },
      }
    );
  };

  return (
    <div className="border rounded-lg">
      <div className="bg-primary rounded-t-lg">
        <p className="text-white text-xs font-medium p-2">Flight {flight.name}</p>
      </div>

      <table className="w-full text-left table-sm table-auto">
        <thead className="">
          <tr className="text-xs text-gray-700">
            <th>Player</th>
            {holes.map((hole: any) => (
              <th key={hole.num} className="p-2 text-center">
                {hole.num}
              </th>
            ))}
            <th>Total</th>
            <th>Net</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {team1.map((player: any) => renderPlayerRow(player))}
          {team1.length > 0 && team2.length > 0 && renderTeamPointsRow("Team 1 Points", 1)}
          {team2.map((player: any) => renderPlayerRow(player))}
          {team1.length > 0 && team2.length > 0 && renderTeamPointsRow("Team 2 Points", 2)}
        </tbody>
      </table>
      <div className="flex justify-end">
        <Button className="m-2" onClick={() => methods.reset()}>
          Reset Scores
        </Button>
        <Button
          variant="primary"
          className="m-2"
          onClick={() => {
            if (!scoreMutation.isPending) saveScores();
          }}
        >
          {scoreMutation.isPending ? "Submitting..." : "Submit Scores"}
        </Button>
      </div>
    </div>
  );
};
