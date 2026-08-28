import { buildEventRecap } from "./eventRecap";
import type {
  EventInsightInput,
  EventInsightRound,
  EventInsightScore,
  EventRoundStory,
  EventStoryHighlight,
} from "./types";

const playerName = (round: EventInsightRound) =>
  `${round.player.firstName} ${round.player.lastName}`.trim();

const plural = (value: number, singular: string, pluralValue = `${singular}s`) =>
  `${value} ${value === 1 ? singular : pluralValue}`;

const signed = (value: number) => `${value > 0 ? "+" : ""}${value}`;

const sortedScores = (round: EventInsightRound) =>
  [...(round.scores ?? [])]
    .filter(
      (score) =>
        Number.isFinite(Number(score.hole)) &&
        Number.isFinite(Number(score.gross)) &&
        Number.isFinite(Number(score.net)) &&
        Number.isFinite(Number(score.par)),
    )
    .sort((left, right) => Number(left.hole) - Number(right.hole));

const toPar = (scores: EventInsightScore[], mode: "gross" | "net") =>
  scores.reduce((total, score) => total + Number(score[mode]) - Number(score.par), 0);

const buildHotHand = (
  rounds: EventInsightRound[],
): { highlight: EventStoryHighlight; playerName: string } | null => {
  const candidates = rounds
    .map((round) => {
      const scores = sortedScores(round);
      const eagles = scores.filter((score) => Number(score.gross) <= Number(score.par) - 2).length;
      const birdies = scores.filter((score) => Number(score.gross) === Number(score.par) - 1).length;
      return {
        playerId: round.playerId,
        name: playerName(round),
        gross: Number(round.gross),
        eagles,
        birdies,
        underPar: eagles + birdies,
        grossToPar: toPar(scores, "gross"),
      };
    })
    .filter((candidate) => Number.isFinite(candidate.gross))
    .sort(
      (left, right) =>
        right.eagles - left.eagles ||
        right.underPar - left.underPar ||
        left.grossToPar - right.grossToPar ||
        left.gross - right.gross ||
        left.name.localeCompare(right.name),
    );

  const hot = candidates[0];
  if (!hot) return null;

  if (hot.underPar === 0) {
    return {
      playerName: hot.name,
      highlight: {
        kind: "hot",
        label: "Scoring pace",
        title: `${hot.name} set the number`,
        detail: `${hot.gross} gross was the lowest card in the field.`,
        stat: `${hot.gross} gross`,
      },
    };
  }

  const scoring = [
    hot.eagles > 0 ? plural(hot.eagles, "eagle") : null,
    hot.birdies > 0 ? plural(hot.birdies, "birdie") : null,
  ].filter((value): value is string => value != null);

  return {
    playerName: hot.name,
    highlight: {
      kind: "hot",
      label: "Hot hand",
      title: `${hot.name} brought the heat`,
      detail: `${scoring.join(" and ")} produced the round's strongest scoring burst.`,
      stat: plural(hot.underPar, "red number"),
    },
  };
};

type BattleCandidate = {
  left: EventInsightRound;
  right: EventInsightRound;
  finalMargin: number;
  leadChanges: number;
  sharedHoles: number;
  tightHoles: number;
  assigned: boolean;
};

const matchupKeys = (event: EventInsightInput) => {
  const keys = new Set<string>();
  for (const flight of event.flights ?? []) {
    for (const player of flight.players ?? []) {
      const playerId = Number(player.playerId);
      const opponentId = Number(player.opponentId);
      if (playerId <= 0 || opponentId <= 0 || playerId === opponentId) continue;
      keys.add([playerId, opponentId].sort((left, right) => left - right).join(":"));
    }
  }
  return keys;
};

const analyzeBattle = (
  left: EventInsightRound,
  right: EventInsightRound,
  assigned: boolean,
): BattleCandidate | null => {
  const rightByHole = new Map(sortedScores(right).map((score) => [Number(score.hole), score]));
  const shared = sortedScores(left).flatMap((leftScore) => {
    const rightScore = rightByHole.get(Number(leftScore.hole));
    return rightScore ? [{ left: leftScore, right: rightScore }] : [];
  });
  if (shared.length === 0) return null;

  let runningDifference = 0;
  let previousLeader = 0;
  let leadChanges = 0;
  let tightHoles = 0;
  for (const hole of shared) {
    runningDifference += Number(hole.left.net) - Number(hole.right.net);
    if (Math.abs(runningDifference) <= 1) tightHoles += 1;
    const leader = Math.sign(runningDifference);
    if (leader !== 0 && previousLeader !== 0 && leader !== previousLeader) leadChanges += 1;
    if (leader !== 0) previousLeader = leader;
  }

  return {
    left,
    right,
    finalMargin: Math.abs(Number(left.net) - Number(right.net)),
    leadChanges,
    sharedHoles: shared.length,
    tightHoles,
    assigned,
  };
};

const buildPlayerBattle = (event: EventInsightInput): EventStoryHighlight | null => {
  const rounds = event.metrics?.scores ?? [];
  const assignedKeys = matchupKeys(event);
  const candidates: BattleCandidate[] = [];

  for (let leftIndex = 0; leftIndex < rounds.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < rounds.length; rightIndex += 1) {
      const left = rounds[leftIndex];
      const right = rounds[rightIndex];
      const key = [Number(left.playerId), Number(right.playerId)]
        .sort((a, b) => a - b)
        .join(":");
      const candidate = analyzeBattle(left, right, assignedKeys.has(key));
      if (candidate) candidates.push(candidate);
    }
  }

  const assignedCandidates = candidates.filter((candidate) => candidate.assigned);
  const pool = assignedCandidates.length > 0 ? assignedCandidates : candidates;
  const battle = pool.sort(
    (left, right) =>
      right.leadChanges - left.leadChanges ||
      right.tightHoles - left.tightHoles ||
      left.finalMargin - right.finalMargin ||
      right.sharedHoles - left.sharedHoles,
  )[0];
  if (!battle) return null;

  const marginDetail =
    battle.finalMargin === 0
      ? "finished level"
      : `finished ${plural(battle.finalMargin, "net stroke")} apart`;
  const tensionDetail =
    battle.leadChanges > 0
      ? `The lead changed ${battle.leadChanges === 1 ? "once" : `${battle.leadChanges} times`} and they ${marginDetail}.`
      : `${battle.tightHoles} of ${battle.sharedHoles} scored holes stayed within one stroke before they ${marginDetail}.`;

  return {
    kind: "battle",
    label: battle.assigned ? "Featured matchup" : "Duel of the day",
    title: `${playerName(battle.left)} vs ${playerName(battle.right)}`,
    detail: tensionDetail,
    stat:
      battle.leadChanges > 0
        ? plural(battle.leadChanges, "lead change")
        : battle.finalMargin === 0
          ? "Dead even"
          : `${battle.finalMargin}-stroke finish`,
  };
};

const buildTeamBattle = (event: EventInsightInput): EventStoryHighlight | null => {
  const teams = [...(event.metrics?.teamStandings ?? [])].sort(
    (left, right) =>
      Number(right.totalPoints) - Number(left.totalPoints) || left.name.localeCompare(right.name),
  );
  if (event.format !== "team" || teams.length < 2) return null;

  const leader = teams[0];
  const runnerUp = teams[1];
  const margin = Math.round(Math.abs(Number(leader.totalPoints) - Number(runnerUp.totalPoints)) * 10) / 10;
  return {
    kind: "battle",
    label: "Team race",
    title: `${leader.name} vs ${runnerUp.name}`,
    detail:
      margin === 0
        ? "The top two teams finished level on total points."
        : `${leader.name} earned the edge by ${plural(margin, "point")}.`,
    stat: margin === 0 ? "Dead even" : `${margin}-point margin`,
  };
};

const buildMomentum = (rounds: EventInsightRound[]): EventStoryHighlight | null => {
  const candidates = rounds
    .flatMap((round) => {
      const scores = sortedScores(round);
      if (scores.length < 6) return [];
      const opening = scores.slice(0, 3);
      const closing = scores.slice(-3);
      const openingToPar = toPar(opening, "net");
      const closingToPar = toPar(closing, "net");
      return [{
        round,
        openingToPar,
        closingToPar,
        improvement: openingToPar - closingToPar,
      }];
    })
    .sort(
      (left, right) =>
        right.improvement - left.improvement ||
        left.closingToPar - right.closingToPar ||
        playerName(left.round).localeCompare(playerName(right.round)),
    );

  const momentum = candidates[0];
  if (!momentum) return null;

  if (momentum.improvement > 0) {
    return {
      kind: "momentum",
      label: "Momentum swing",
      title: `${playerName(momentum.round)} flipped the script`,
      detail: `The closing three played ${plural(momentum.improvement, "stroke")} better than the opening three (${signed(momentum.closingToPar)} to par).`,
      stat: `${momentum.improvement}-stroke swing`,
    };
  }

  const strongestFinish = [...candidates].sort(
    (left, right) => left.closingToPar - right.closingToPar,
  )[0];
  return {
    kind: "momentum",
    label: "Closing kick",
    title: `${playerName(strongestFinish.round)} finished strongest`,
    detail: `No one improved on the opening pace, but ${signed(strongestFinish.closingToPar)} across the closing three led the field.`,
    stat: `${signed(strongestFinish.closingToPar)} closing 3`,
  };
};

const buildAchievement = (event: EventInsightInput): EventStoryHighlight | null => {
  const grossSkins = event.metrics?.skins?.playerSkins ?? [];
  const netSkins = event.metrics?.skins?.playerNetSkins ?? [];
  const names = new Map(
    (event.metrics?.scores ?? []).map((round) => [Number(round.playerId), playerName(round)]),
  );
  const skinCounts = new Map<number, { gross: number; net: number; name: string }>();

  for (const [kind, skins] of [
    ["gross", grossSkins],
    ["net", netSkins],
  ] as const) {
    for (const skin of skins) {
      const playerId = Number(skin.playerId);
      const existing = skinCounts.get(playerId) ?? {
        gross: 0,
        net: 0,
        name: skin.name || names.get(playerId) || "Unknown player",
      };
      existing[kind] += 1;
      skinCounts.set(playerId, existing);
    }
  }

  const collector = [...skinCounts.values()].sort(
    (left, right) =>
      right.gross + right.net - (left.gross + left.net) ||
      right.gross - left.gross ||
      left.name.localeCompare(right.name),
  )[0];
  if (collector) {
    const total = collector.gross + collector.net;
    return {
      kind: "achievement",
      label: "Skin collector",
      title: `${collector.name} owned the pin sheet`,
      detail: `${plural(collector.gross, "gross skin")} and ${plural(collector.net, "net skin")} made up the biggest haul.`,
      stat: plural(total, "skin"),
    };
  }

  const steady = (event.metrics?.scores ?? [])
    .flatMap((round) => {
      const scores = sortedScores(round);
      if (scores.length === 0) return [];
      const parOrBetter = scores.filter((score) => Number(score.gross) <= Number(score.par)).length;
      const overPar = scores.length - parOrBetter;
      return [{ round, holes: scores.length, parOrBetter, overPar }];
    })
    .sort(
      (left, right) =>
        right.parOrBetter - left.parOrBetter ||
        left.overPar - right.overPar ||
        Number(left.round.gross) - Number(right.round.gross),
    )[0];
  if (!steady) return null;

  return {
    kind: "achievement",
    label: "Steady hand",
    title: `${playerName(steady.round)} kept control`,
    detail: `${steady.parOrBetter} of ${steady.holes} holes finished at par or better.`,
    stat: `${steady.parOrBetter} par-or-better`,
  };
};

export function buildEventStory(
  event: EventInsightInput,
  providedRecap?: NonNullable<ReturnType<typeof buildEventRecap>>,
): EventRoundStory | null {
  const rounds = event.metrics?.scores ?? [];
  const recap = providedRecap ?? buildEventRecap(event);
  if (!recap || rounds.length === 0) return null;

  const hotHand = buildHotHand(rounds);
  const battle = buildTeamBattle(event) ?? buildPlayerBattle(event);
  const momentum = buildMomentum(rounds);
  const achievement = buildAchievement(event);
  const highlights = [hotHand?.highlight, battle, momentum, achievement].filter(
    (highlight): highlight is EventStoryHighlight => highlight != null,
  );

  const headline = recap.upset
    ? `${recap.winner.name} delivered the upset with a playing handicap ${recap.upset.handicapGap} strokes above ${recap.upset.runnerUp}.`
    : hotHand && hotHand.playerName !== recap.winner.name
      ? `${recap.winner.name} took the result while ${hotHand.playerName} supplied the hottest card.`
      : `${recap.winner.name} paired the result with the round's strongest scoring performance.`;

  return { headline, highlights };
}
