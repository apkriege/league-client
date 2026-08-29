import type {
  EventInsightInput,
  EventInsightRound,
  EventInsightScore,
  InsightTone,
} from "./types";

export type EventPlayerImpact = {
  playerId: number;
  name: string;
  points: number;
  gross: number;
  net: number;
  grossToPar: number;
  netToPar: number;
  redNumbers: number;
  parOrBetter: number;
  doublesOrWorse: number;
  bounceBacks: number;
  longestControlStreak: number;
  closingToPar: number | null;
  openingToPar: number | null;
  finishSwing: number | null;
};

export type EventHoleProfile = {
  hole: number;
  par: number;
  averageGrossToPar: number;
  averageNetToPar: number;
  grossRange: number;
  birdiesOrBetter: number;
  doublesOrWorse: number;
  scores: number;
};

export type EventAward = {
  id: "hot" | "closer" | "bounceback" | "control" | "skins" | "surge";
  label: string;
  title: string;
  detail: string;
  stat: string;
  playerId: number;
  tone: InsightTone;
};

export type EventMatchup = {
  left: { playerId: number; name: string; holesWon: number };
  right: { playerId: number; name: string; holesWon: number };
  ties: number;
  leadChanges: number;
  finalMargin: number;
  label: "Back-and-forth" | "Down to the wire" | "Controlled";
};

export type EventTeamMatchup = {
  left: { teamId: number; name: string; points: number };
  right: { teamId: number; name: string; points: number };
  margin: number;
  label: "Dead even" | "Photo finish" | "Clear edge";
};

const roundOne = (value: number) => Math.round(value * 10) / 10;
const signed = (value: number) => `${value > 0 ? "+" : ""}${value}`;
const playerName = (round: EventInsightRound) =>
  `${round.player.firstName} ${round.player.lastName}`.trim();
const points = (round: EventInsightRound) =>
  roundOne(Number(round.pointsEarned || 0) + Number(round.matchPoints || 0));
const validScores = (round: EventInsightRound) =>
  [...(round.scores ?? [])]
    .filter(
      (score) =>
        Number.isFinite(Number(score.hole)) &&
        Number.isFinite(Number(score.gross)) &&
        Number.isFinite(Number(score.net)) &&
        Number.isFinite(Number(score.par)),
    )
    .sort((left, right) => left.hole - right.hole);
const scoreToPar = (scores: EventInsightScore[], mode: "gross" | "net") =>
  scores.reduce((sum, score) => sum + Number(score[mode]) - Number(score.par), 0);

function longestControlStreak(scores: EventInsightScore[]) {
  let longest = 0;
  let current = 0;
  for (const [index, score] of scores.entries()) {
    const previous = scores[index - 1];
    if (previous && score.hole !== previous.hole + 1) current = 0;
    if (score.gross <= score.par) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

function countBounceBacks(scores: EventInsightScore[]) {
  return scores.slice(1).filter((score, index) => {
    const previous = scores[index];
    return (
      score.hole === previous.hole + 1 &&
      previous.gross > previous.par &&
      score.gross <= score.par
    );
  }).length;
}

function buildPlayerImpact(rounds: EventInsightRound[]): EventPlayerImpact[] {
  return rounds.map((round) => {
    const scores = validScores(round);
    const opening = scores.length >= 6 ? scores.slice(0, 3) : [];
    const closing = scores.length >= 6 ? scores.slice(-3) : [];
    const openingToPar = opening.length ? scoreToPar(opening, "net") : null;
    const closingToPar = closing.length ? scoreToPar(closing, "net") : null;
    return {
      playerId: round.playerId,
      name: playerName(round),
      points: points(round),
      gross: Number(round.gross),
      net: Number(round.net),
      grossToPar: scoreToPar(scores, "gross"),
      netToPar: scoreToPar(scores, "net"),
      redNumbers: scores.filter((score) => score.gross < score.par).length,
      parOrBetter: scores.filter((score) => score.gross <= score.par).length,
      doublesOrWorse: scores.filter((score) => score.gross >= score.par + 2).length,
      bounceBacks: countBounceBacks(scores),
      longestControlStreak: longestControlStreak(scores),
      closingToPar,
      openingToPar,
      finishSwing:
        openingToPar != null && closingToPar != null ? openingToPar - closingToPar : null,
    };
  });
}

function buildHoleProfiles(rounds: EventInsightRound[]): EventHoleProfile[] {
  const byHole = new Map<number, EventInsightScore[]>();
  for (const round of rounds) {
    for (const score of validScores(round)) {
      const scores = byHole.get(score.hole) ?? [];
      scores.push(score);
      byHole.set(score.hole, scores);
    }
  }

  return [...byHole.entries()]
    .map(([hole, scores]) => {
      const grossToPar = scores.map((score) => score.gross - score.par);
      const netToPar = scores.map((score) => score.net - score.par);
      const grossScores = scores.map((score) => score.gross);
      return {
        hole,
        par: scores[0]?.par ?? 0,
        averageGrossToPar: roundOne(grossToPar.reduce((sum, value) => sum + value, 0) / scores.length),
        averageNetToPar: roundOne(netToPar.reduce((sum, value) => sum + value, 0) / scores.length),
        grossRange: Math.max(...grossScores) - Math.min(...grossScores),
        birdiesOrBetter: grossToPar.filter((value) => value < 0).length,
        doublesOrWorse: grossToPar.filter((value) => value >= 2).length,
        scores: scores.length,
      };
    })
    .sort((left, right) => left.hole - right.hole);
}

function buildMatchups(event: EventInsightInput, rounds: EventInsightRound[]): EventMatchup[] {
  const byPlayer = new Map(rounds.map((round) => [round.playerId, round]));
  const matchupKeys = new Set<string>();
  for (const flight of event.flights ?? []) {
    for (const player of flight.players ?? []) {
      const left = Number(player.playerId);
      const right = Number(player.opponentId || 0);
      if (left > 0 && right > 0 && left !== right) {
        matchupKeys.add([left, right].sort((a, b) => a - b).join(":"));
      }
    }
  }

  return [...matchupKeys].flatMap<EventMatchup>((key) => {
    const [leftId, rightId] = key.split(":").map(Number);
    const leftRound = byPlayer.get(leftId);
    const rightRound = byPlayer.get(rightId);
    if (!leftRound || !rightRound) return [];
    const rightByHole = new Map(validScores(rightRound).map((score) => [score.hole, score]));
    const shared = validScores(leftRound).flatMap((leftScore) => {
      const rightScore = rightByHole.get(leftScore.hole);
      return rightScore ? [{ left: leftScore, right: rightScore }] : [];
    });
    if (shared.length === 0) return [];

    let leftWins = 0;
    let rightWins = 0;
    let ties = 0;
    let running = 0;
    let previousLeader = 0;
    let leadChanges = 0;
    for (const hole of shared) {
      const difference = hole.left.net - hole.right.net;
      if (difference < 0) leftWins += 1;
      else if (difference > 0) rightWins += 1;
      else ties += 1;
      running += difference;
      const leader = Math.sign(running);
      if (leader !== 0 && previousLeader !== 0 && leader !== previousLeader) leadChanges += 1;
      if (leader !== 0) previousLeader = leader;
    }
    const finalMargin = Math.abs(leftWins - rightWins);
    return [{
      left: { playerId: leftId, name: playerName(leftRound), holesWon: leftWins },
      right: { playerId: rightId, name: playerName(rightRound), holesWon: rightWins },
      ties,
      leadChanges,
      finalMargin,
      label: leadChanges > 0
        ? "Back-and-forth"
        : finalMargin <= 1
          ? "Down to the wire"
          : "Controlled",
    }];
  }).sort(
    (left, right) =>
      right.leadChanges - left.leadChanges || left.finalMargin - right.finalMargin,
  );
}

function buildTeamMatchups(event: EventInsightInput): EventTeamMatchup[] {
  const standings = new Map(
    (event.metrics?.teamStandings ?? []).map((team) => [team.teamId, team]),
  );
  const keys = new Set<string>();
  for (const flight of event.flights ?? []) {
    for (const team of flight.teams ?? []) {
      const left = Number(team.teamId);
      const right = Number(team.opponentId || 0);
      if (left > 0 && right > 0 && left !== right) {
        keys.add([left, right].sort((a, b) => a - b).join(":"));
      }
    }
  }

  return [...keys].flatMap<EventTeamMatchup>((key) => {
    const [leftId, rightId] = key.split(":").map(Number);
    const left = standings.get(leftId);
    const right = standings.get(rightId);
    if (!left || !right) return [];
    const margin = roundOne(Math.abs(left.totalPoints - right.totalPoints));
    return [{
      left: { teamId: left.teamId, name: left.name, points: left.totalPoints },
      right: { teamId: right.teamId, name: right.name, points: right.totalPoints },
      margin,
      label: margin === 0 ? "Dead even" : margin <= 1 ? "Photo finish" : "Clear edge",
    }];
  }).sort((left, right) => left.margin - right.margin);
}

function buildAwards(event: EventInsightInput, players: EventPlayerImpact[]): EventAward[] {
  if (players.length === 0) return [];
  const awards: EventAward[] = [];
  const push = (award: EventAward) => awards.push(award);
  const hot = [...players].sort(
    (a, b) => b.redNumbers - a.redNumbers || a.grossToPar - b.grossToPar,
  )[0];
  const closer = [...players]
    .filter((player) => player.closingToPar != null)
    .sort((a, b) => Number(a.closingToPar) - Number(b.closingToPar))[0];
  const bounceback = [...players].sort(
    (a, b) => b.bounceBacks - a.bounceBacks || a.netToPar - b.netToPar,
  )[0];
  const control = [...players].sort(
    (a, b) => b.longestControlStreak - a.longestControlStreak || a.grossToPar - b.grossToPar,
  )[0];
  const surge = [...players]
    .filter((player) => player.finishSwing != null && player.finishSwing > 0)
    .sort((a, b) => Number(b.finishSwing) - Number(a.finishSwing))[0];
  const skinCounts = new Map<number, number>();
  for (const skin of [
    ...(event.metrics?.skins?.playerSkins ?? []),
    ...(event.metrics?.skins?.playerNetSkins ?? []),
  ]) {
    skinCounts.set(skin.playerId, (skinCounts.get(skin.playerId) ?? 0) + 1);
  }
  const skinLeader = [...skinCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const skinPlayer = skinLeader ? players.find((player) => player.playerId === skinLeader[0]) : null;

  if (hot.redNumbers > 0) push({ id: "hot", label: "Hot hand", title: hot.name, detail: "Created the most gross red numbers in the field.", stat: `${hot.redNumbers} red`, playerId: hot.playerId, tone: "attention" });
  if (closer) push({ id: "closer", label: "Closer", title: closer.name, detail: "Owned the best net closing-three stretch.", stat: `${signed(Number(closer.closingToPar))} closing`, playerId: closer.playerId, tone: "positive" });
  if (bounceback.bounceBacks > 0) push({ id: "bounceback", label: "Bounce-back artist", title: bounceback.name, detail: "Answered the most over-par holes with par or better.", stat: `${bounceback.bounceBacks} responses`, playerId: bounceback.playerId, tone: "positive" });
  if (control.longestControlStreak > 0) push({ id: "control", label: "Steady hand", title: control.name, detail: "Put together the longest gross par-or-better run.", stat: `${control.longestControlStreak} holes`, playerId: control.playerId, tone: "neutral" });
  if (skinPlayer && skinLeader) push({ id: "skins", label: "Skin collector", title: skinPlayer.name, detail: "Claimed the event's largest combined gross and net haul.", stat: `${skinLeader[1]} skins`, playerId: skinPlayer.playerId, tone: "attention" });
  if (surge) push({ id: "surge", label: "Biggest surge", title: surge.name, detail: "Improved the most from the opening three to the closing three.", stat: `${surge.finishSwing} strokes`, playerId: surge.playerId, tone: "positive" });
  return awards.slice(0, 6);
}

function rankPlayers(players: EventPlayerImpact[], usePoints: boolean) {
  return [...players].sort((left, right) =>
    usePoints
      ? right.points - left.points || left.net - right.net || left.gross - right.gross
      : left.net - right.net || left.gross - right.gross || right.points - left.points,
  );
}

function buildDecisiveSwing(
  players: EventPlayerImpact[],
  rounds: EventInsightRound[],
  usePoints: boolean,
) {
  if (players.length < 2) return null;
  const ranked = rankPlayers(players, usePoints);
  const winnerRound = rounds.find((round) => round.playerId === ranked[0].playerId);
  const runnerRound = rounds.find((round) => round.playerId === ranked[1].playerId);
  if (!winnerRound || !runnerRound) return null;
  const runnerByHole = new Map(validScores(runnerRound).map((score) => [score.hole, score]));
  const swings = validScores(winnerRound).flatMap((winnerScore) => {
    const runnerScore = runnerByHole.get(winnerScore.hole);
    return runnerScore
      ? [{ hole: winnerScore.hole, strokes: runnerScore.net - winnerScore.net }]
      : [];
  }).sort((a, b) => b.strokes - a.strokes || a.hole - b.hole);
  const swing = swings[0];
  return swing && swing.strokes > 0
    ? {
        hole: swing.hole,
        strokes: swing.strokes,
        winner: ranked[0].name,
        runnerUp: ranked[1].name,
      }
    : null;
}

export function buildEventDashboard(event: EventInsightInput) {
  const rounds = event.metrics?.scores ?? [];
  const players = buildPlayerImpact(rounds);
  const usePoints = event.pointsEnabled !== false && players.some((player) => player.points > 0);
  const holes = buildHoleProfiles(rounds);
  const hardestHole = [...holes].sort(
    (a, b) => b.averageGrossToPar - a.averageGrossToPar || b.doublesOrWorse - a.doublesOrWorse,
  )[0] ?? null;
  const opportunityHole = [...holes]
    .filter((hole) => hole.birdiesOrBetter > 0)
    .sort((a, b) => b.birdiesOrBetter - a.birdiesOrBetter || a.averageGrossToPar - b.averageGrossToPar)[0] ?? null;
  const chaosHole = [...holes].sort(
    (a, b) => b.grossRange - a.grossRange || b.doublesOrWorse - a.doublesOrWorse,
  )[0] ?? null;
  const distribution = event.metrics?.scoreDistribution;

  return {
    players: rankPlayers(players, usePoints),
    holes,
    hardestHole,
    opportunityHole,
    chaosHole,
    matchups: buildMatchups(event, rounds),
    teamMatchups: buildTeamMatchups(event),
    awards: buildAwards(event, players),
    decisiveSwing: buildDecisiveSwing(players, rounds, usePoints),
    fieldComparison: distribution
      ? (["eagles", "birdies", "pars", "bogeys", "doubleBogeys"] as const).map((key) => ({
          key,
          event: Number(distribution.thisEvent[key] || 0),
          usual: Number(distribution.seasonAvg[key] || 0),
          difference: roundOne(
            Number(distribution.thisEvent[key] || 0) - Number(distribution.seasonAvg[key] || 0),
          ),
        }))
      : [],
  };
}
