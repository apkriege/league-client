export type ScoreDistribution = {
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
  tripleBogeys: number;
};

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
  date: string;
  gross?: number | string | null;
  net?: number | string | null;
  points?: number | string | null;
  putts?: number | string | null;
  eagles?: number | string | null;
  birdies?: number | string | null;
  pars?: number | string | null;
  bogeys?: number | string | null;
  differential?: number | string | null;
  preHandicap?: number | string | null;
  postHandicap?: number | string | null;
  scores?: PlayerRoundScore[];
  course?: { name?: string | null } | null;
  tee?: { name?: string | null } | null;
  event?: { startSide?: string | null } | null;
};
