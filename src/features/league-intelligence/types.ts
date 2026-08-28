import type { TeamProfile } from "@api/teams/types";

export type IntelligenceStanding = {
  playerId: number;
  name: string;
  points: number;
  rounds: number;
  avgGross: number;
  avgNet: number;
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
  playerWeeklyTrends?: { labels: string[]; players: PlayerTrend[] };
  headToHead?: HeadToHeadHistory[];
  playerCourseHistory?: PlayerCourseHistory[];
  seasonSummary?: {
    totalRounds?: number;
    avgGross?: number;
    avgNet?: number;
    avgHandicapChange?: number;
  };
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
  scores?: EventInsightScore[];
};

export type EventInsightInput = {
  name: string;
  holes?: number;
  pointsEnabled?: boolean;
  metrics?: {
    scores?: EventInsightRound[];
  };
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
