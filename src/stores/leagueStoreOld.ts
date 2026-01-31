import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { info, currPlayers, currTeams, events } from "./leagueInitData";

const defaultInfo = {
  name: "",
  description: "",
  numPlayers: 0,
  type: "public",
  contactFirst: "",
  contactLast: "",
  contactEmail: "",
  contactPhone: "",
  startDate: new Date(),
  endDate: new Date(),
};

export type League = {
  players: Player[];
  teams: Teams[];
  events: Event[];
};

type Info = {
  name: string;
  description: string;
  numPlayers: number;
  type: "public" | "private" | string;
  contactFirst: string;
  contactLast: string;
  contactEmail: string;
  contactPhone: string;
  startDate: Date;
  endDate: Date;
};

type Player = {
  id: number;
  leagueId?: number;
  teamId?: number;
  first: string;
  last: string;
  email: string;
  type: "player" | "sub";
  handicap: number;
};

type Teams = {
  id: number;
  name: string;
  players: Player[];
};

type Event = {
  leagueId: number;
  courseId: number;
  teeId: number;
  name: string;
  type: "regular" | "playoff" | "championship" | "off" | "makeup";
  format: "individual" | "team" | "mixed";
  startSide: "front" | "back" | "both";
  holes: number;
  date: Date;
  startTime: string;
  interval: number;
  scoringFormat: "stroke" | "match";
  ptsPerHole: number;
  ptsPerMatch: number;
  ptsPerTeamWin: number;
  strokePoints: number[];
  status: "scheduled" | "completed" | "cancelled";
  flights: any[];
};

interface LeagueState {
  info: Info;
  players: Player[];
  teams: Teams[];
  events: Event[];
  setInfo: (info: any) => void;
  setPlayers: (players: Player[]) => void;
  setTeams: (teams: Teams[]) => void;
  setEvents: (events: Event[]) => void;
}

export const useLeagueStoreOld = create<LeagueState>()(
  persist(
    devtools((set) => ({
      info: info,
      players: currPlayers,
      teams: currTeams,
      events: events,
      setLeague: (info: Info) => set({ info }),
      setPlayers: (players: Player[]) => set({ players }),
      setTeams: (teams: Teams[]) => set({ teams }),
      setEvents: (events: Event[]) => set({ events }),
      clearAll: () => set({ info: defaultInfo, players: [], teams: [], events: [] }),
    })),
    { name: "league-store" }
  )
);
