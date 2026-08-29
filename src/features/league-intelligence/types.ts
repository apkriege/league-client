import type { TeamProfile } from "@api/teams/types";

export type IntelligenceStanding = {
  playerId: number;
  name: string;
  points: number;
  rounds: number;
  avgGross: number;
  avgNet: number;
  birdies?: number;
  eagles?: number;
  startingHandicap?: number | null;
  currentHandicap?: number | null;
  handicapChange: number | null;
};

export type IntelligenceTeamStanding = {
  teamId: number;
  name: string;
  points: number;
  eventsPlayed: number;
};

export type PlayerTrend = {
  playerId: number;
  name: string;
  avgGross: Array<number | null>;
  avgNet: Array<number | null>;
};

export type HeadToHeadHistory = {
  playerId: number;
  playerName: string;
  opponentId: number;
  opponentName: string;
  wins: number;
  losses: number;
  ties: number;
};

export type PlayerCourseHistory = {
  playerId: number;
  playerName: string;
  courseId: number;
  rounds: number;
  avgGross: number;
  avgNet: number;
};

export type LeagueIntelligenceMetrics = {
  standingsMode?: string;
  standings?: IntelligenceStanding[];
  teamStandings?: IntelligenceTeamStanding[];
  playerWeeklyTrends?: { labels: string[]; holes?: number[]; players: PlayerTrend[] };
  headToHead?: HeadToHeadHistory[];
  playerCourseHistory?: PlayerCourseHistory[];
  seasonSummary?: {
    totalRounds?: number;
    avgGross?: number;
    avgNet?: number;
    avgHandicapChange?: number;
  };
  records?: {
    lowGross?: LeagueSeasonRecord | null;
    lowNet?: LeagueSeasonRecord | null;
    mostBirdies?: LeagueSeasonRecord | null;
    mostPoints?: LeagueSeasonRecord | null;
  };
  skins?: {
    gross: LeagueSkinLeader[];
    net: LeagueSkinLeader[];
  };
};

export type LeagueSeasonRecord = {
  value: number;
  playerName: string;
  eventName?: string;
  eventDate?: string;
  eventTimeZone?: string;
};

export type LeagueSkinLeader = {
  playerId: number;
  name: string;
  skins: number;
};

export type LeagueRosterPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  handicap?: number | null;
  type?: string | null;
};

export type IntelligenceFlightPlayer = {
  playerId: number;
  opponentId?: number | null;
  teamId?: number | null;
  player?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    handicap?: number | null;
    seasonPoints?: number | null;
    teamId?: number | null;
  };
};

export type IntelligenceFlightTeam = {
  teamId: number;
  opponentId?: number | null;
  team?: {
    id?: number;
    name?: string;
    seasonPoints?: number | null;
    players?: Array<{ id: number }>;
  } | null;
};

export type IntelligenceEvent = {
  id: number;
  name: string;
  startsAt: string;
  timeZone?: string;
  status?: string;
  isComplete?: boolean;
  format?: string;
  scoringFormat?: string;
  holes?: number;
  courseId?: number;
  course?: { id?: number; name?: string } | null;
  tee?: { name?: string } | null;
  _count?: { rounds?: number };
  canEnterScores?: boolean;
  canEditScores?: boolean;
  flights?: Array<{
    id: number;
    players?: IntelligenceFlightPlayer[];
    teams?: IntelligenceFlightTeam[];
  }>;
};

export type EventInsightScore = {
  hole: number;
  gross: number;
  net: number;
  par: number;
};

export type EventInsightRound = {
  playerId: number;
  player: { firstName: string; lastName: string };
  gross: number;
  net: number;
  preHandicap?: number | null;
  postHandicap?: number | null;
  pointsEarned?: number | null;
  matchPoints?: number | null;
  eagles?: number;
  birdies?: number;
  pars?: number;
  bogeys?: number;
  scores?: EventInsightScore[];
};

export type EventInsightSkin = {
  playerId: number;
  name?: string;
  hole: number | string;
  scoreLabel?: string;
  gross?: number;
  net?: number;
};

export type EventInsightTeamStanding = {
  rank?: number;
  teamId: number;
  name: string;
  players?: Array<{ playerId: number; name: string; points: number }>;
  playerPoints?: number;
  teamPoints?: number;
  totalPoints: number;
};

export type EventInsightInput = {
  name: string;
  holes?: number;
  format?: "individual" | "team";
  scoringFormat?: "stroke" | "match";
  pointsEnabled?: boolean;
  flights?: Array<{
    players?: Array<{
      playerId: number;
      opponentId?: number | null;
    }>;
    teams?: Array<{
      teamId: number;
      opponentId?: number | null;
    }>;
  }>;
  metrics?: {
    scores?: EventInsightRound[];
    skins?: {
      playerSkins?: EventInsightSkin[];
      playerNetSkins?: EventInsightSkin[];
    };
    teamStandings?: EventInsightTeamStanding[];
    leaderboards?: {
      playerPoints?: Array<{ playerId: number; name: string; handicap?: number | null; value: number }>;
      playerLowGross?: Array<{ playerId: number; name: string; handicap?: number | null; value: number }>;
      playerLowNet?: Array<{ playerId: number; name: string; handicap?: number | null; value: number }>;
    };
    scoreDistribution?: {
      thisEvent: EventScoreDistribution;
      seasonAvg: EventScoreDistribution;
    };
  };
};

export type EventScoreDistribution = {
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
  tripleBogeys: number;
};

export type EventStoryHighlightKind = "hot" | "battle" | "momentum" | "achievement";

export type EventStoryHighlight = {
  kind: EventStoryHighlightKind;
  label: string;
  title: string;
  detail: string;
  stat: string;
};

export type EventRoundStory = {
  headline: string;
  highlights: EventStoryHighlight[];
};

export type LeagueAdminInput = {
  endDate?: string;
  billingStatus?: string;
  billingExempt?: boolean;
  billingPaidGolfers?: number;
  numPlayers?: number;
  seasonStatus?: string;
  renewedLeague?: { id: number } | null;
  players?: LeagueRosterPlayer[];
};

export type TeamIntelligenceInput = TeamProfile;

export type InsightTone = "positive" | "attention" | "neutral";
