export type League = {
  id?: number;
  name: string;
  description: string;
  numPlayers: number;
  type: "public" | "private" | string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  startDate: Date;
  endDate: Date;
  players: Player[];
  teams: Teams[];
  events?: Event[];
};

export type Player = {
  id?: number;
  leagueId?: number;
  teamId?: number;
  firstName: string;
  lastName: string;
  email: string;
  type: "player" | "sub" | string;
  handicap: number;
};

export type Teams = {
  id?: number;
  name: string;
  players: Player[];
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
