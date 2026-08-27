export type League = {
  id?: number;
  name: string;
  description: string;
  numPlayers: number;
  type: "season" | "tournament" | string;
  holeFormat: "9" | "18" | "mixed";
  format?: "individual" | "team" | null | string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  startDate: Date;
  endDate: Date;
  players: Player[];
  teams: Teams[];
  events?: Event[];
  scoringPeriods?: LeagueScoringPeriod[];
  hasRecordedScores?: boolean;
  renewedFromLeagueId?: number | null;
  renewedFromLeague?: LeagueSeasonLink | null;
  renewedLeague?: LeagueSeasonLink | null;
  billingDraftKey?: string;
  seasonStatus?: "active" | "archived" | "reopened" | string;
  billingStatus?: "active" | "exempt" | "payment_due" | string;
  archivedAt?: string | Date | null;
};

export type LeagueSeasonLink = {
  id: number;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
};

export type LeagueRenewalTemplate = {
  sourceLeague: LeagueSeasonLink;
  league: League & { renewedFromLeagueId: number };
};

export type LeagueScoringPeriod = {
  id: number;
  name: string;
  position: number;
  startDate: string | Date;
  endDate: string | Date;
};

export type Player = {
  id?: number;
  leagueId?: number;
  teamId?: number;
  firstName: string;
  lastName: string;
  email: string;
  type: "player" | "sub" | string;
  gender: "male" | "female";
  handicap: number;
  sourcePlayerId?: number;
};

export type Teams = {
  id?: number;
  name: string;
  players: number[];
};

export type Event = {
  leagueId: number;
  courseId: number;
  teeId: number;
  name: string;
  eventTpe: "regular" | "playoff" | "championship" | "off" | "makeup";
  format: "individual" | "team" | "mixed";
  startSide: "front" | "back" | "both";
  scoreType: "stroke" | "match";
  flights: any[];
};
