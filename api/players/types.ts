export type PlayerRoundScore = {
  hole: number | string;
  gross?: number | string | null;
  net?: number | string | null;
  par?: number | string | null;
};

export type PlayerRound = {
  id?: number | string;
  eventId: number | string;
  eventName?: string;
  date?: string | null;
  startsAt?: string | null;
  timeZone?: string | null;
  holesPlayed?: number | string | null;
  gross?: number | string | null;
  net?: number | string | null;
  adjusted?: number | string | null;
  courseRating?: number | string | null;
  courseSlope?: number | string | null;
  points?: number | string | null;
  putts?: number | string | null;
  eagles?: number | string | null;
  birdies?: number | string | null;
  pars?: number | string | null;
  bogeys?: number | string | null;
  doubleBogeys?: number | string | null;
  differential?: number | string | null;
  preHandicap?: number | string | null;
  postHandicap?: number | string | null;
  scores?: PlayerRoundScore[];
  course?: { id?: number; name?: string | null } | null;
  tee?: { id?: number; name?: string | null } | null;
  event?: { startSide?: string | null } | null;
};

export type PlayerIntelligenceHole = {
  courseId: number;
  courseName: string;
  teeName: string;
  hole: number;
  par: number;
  samples: number;
  averageToPar: number;
  leagueAverageToPar: number | null;
  versusLeague: number | null;
};

export type PlayerIntelligence = {
  sample: { rounds: number; holes: number; comparableHoles: number };
  pulse: {
    averageToPar: number | null;
    recentAverageToPar: number | null;
    formDelta: number | null;
    consistency: number | null;
  };
  takeaways: Array<{
    tone: "positive" | "attention" | "neutral";
    title: string;
    detail: string;
  }>;
  trend: Array<{
    roundId: number;
    eventName: string;
    date: string;
    toPar: number;
    rollingAverage: number;
  }>;
  parSplits: Array<{
    par: number;
    holes: number;
    averageToPar: number | null;
    leagueAverageToPar: number | null;
    versusLeague: number | null;
  }>;
  holeInsights: {
    strengths: PlayerIntelligenceHole[];
    opportunities: PlayerIntelligenceHole[];
  };
  courseSplits: Array<{
    courseId: number;
    courseName: string;
    teeName: string;
    holesPlayed: number;
    rounds: number;
    averageGross: number;
    averageNet: number;
    averageToPar: number;
    bestGross: number;
  }>;
  ringers: Array<{
    courseId: number;
    courseName: string;
    teeName: string;
    rounds: number;
    holes: number;
    score: number;
    toPar: number;
  }>;
  personalRecords: Array<{
    holes: number;
    rounds: number;
    lowGross: number;
    lowNet: number;
    bestPoints: number;
    mostBirdies: number;
    bestRound: {
      eventName: string;
      date: string;
      gross: number;
      toPar: number;
    } | null;
  }>;
  streaks: {
    currentParOrBetter: number;
    bestParOrBetter: number;
    currentRoundsWithBirdie: number;
  };
  categoryRankings: Array<{
    key: string;
    label: string;
    description: string;
    rank: number;
    total: number;
    value: number;
    direction: "asc" | "desc";
  }>;
  seasonHistory: Array<{
    leagueId: number;
    leagueName: string;
    year: number;
    rounds: number;
    averageToPar: number | null;
    averagePoints: number | null;
    handicap: number;
  }>;
  headToHead: {
    wins: number;
    losses: number;
    ties: number;
    opponents: Array<{
      opponentId: number;
      opponentName: string;
      matches: number;
      wins: number;
      losses: number;
      ties: number;
      pointsFor: number;
      pointsAgainst: number;
      averageNetMargin: number;
      lastPlayed: string;
    }>;
  };
  teamRivalries: Array<{
    opponentId: number;
    opponentName: string;
    matches: number;
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number;
    pointsAgainst: number;
    lastPlayed: string;
  }>;
};

export type PlayerStatsResponse = {
  player: {
    id: number;
    firstName: string;
    lastName: string;
    handicap: number;
    startingHandicap: number;
    seasonPoints: number;
    seasonRank: number | null;
    type: string;
    team: { id: number; name: string } | null;
  };
  stats: {
    rounds: number;
    totalPoints: number;
    avgPoints: number;
    bestPoints: number;
    avgGross: number;
    avgNet: number;
    lowGross: number;
    lowNet: number;
    avgPutts: number;
    totalBirdies: number;
    totalEagles: number;
    totalNetBirdies: number;
    totalNetEagles: number;
    totalPars: number;
    totalBogeys: number;
    totalDoubleBogeys: number;
    totalTripleBogeys: number;
    startingHandicap: number;
    currentHandicap: number;
    handicapChange: number;
  } | null;
  rounds: PlayerRound[];
  handicapHoleBasis: number;
  intelligence: PlayerIntelligence;
};
