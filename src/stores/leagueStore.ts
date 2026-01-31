import type { League } from "@/types/league";
import { create } from "zustand";

interface LeagueState {
  league: League | null;
  setLeague: (league: League | null) => void;
  clearLeague: () => void;
}

export const useLeagueStore = create<LeagueState>((set) => ({
  league: null,
  setLeague: (league: League | null) => set({ league }),
  clearLeague: () => set({ league: null }),
}));
