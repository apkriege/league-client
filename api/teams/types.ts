export type TeamPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  handicap: number | null;
};

export type TeamEventPointsRow = {
  id: number;
  eventId: number;
  points: number;
};

export type TeamEventPlayerRound = {
  id: number;
  playerId: number;
  playerName: string;
  date: string | null;
  gross: number | null;
  net: number | null;
  points: number;
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
};

export type TeamEventResult = {
  id: number;
  name: string;
  startsAt: string;
  timeZone: string;
  format: string;
  scoringFormat: string;
  type: string;
  status: string;
  isComplete: boolean;
  holes: number;
  courseName: string | null;
  flightId: number | null;
  flightStartsAt: string | null;
  isAssigned: boolean;
  opponents: Array<{
    id: number;
    name: string;
    playerPoints: number;
    teamPoints: number;
    totalPoints: number | null;
  }>;
  playerPoints: number;
  teamPoints: number;
  totalPoints: number | null;
  playerRounds: TeamEventPlayerRound[];
};

export type TeamProfile = {
  id: number;
  name: string;
  leagueId: number | null;
  seasonPoints: number;
  seasonRank: number | null;
  players: TeamPlayer[];
  teamEventPoints: TeamEventPointsRow[];
  teamLeaderboard: Array<{
    id: number;
    name: string;
    seasonPoints: number;
    seasonRank: number | null;
  }>;
  eventResults: TeamEventResult[];
};
