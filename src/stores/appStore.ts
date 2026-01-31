import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  user: any;
  setUser: (user: any) => void;
  clearUser: () => void;
  leagueId: number;
  playerId: number;
  setLeagueId: (leagueId: number) => void;
  setPlayerId: (playerId: number) => void;
  clearLeagueId: () => void;
}

export const useAppStore = create<AppState>(
  persist(
    (set) => ({
      user: null,
      setUser: (user: any) => set({ user }),
      clearUser: () => set({ user: null }),
      leagueId: null,
      playerId: null,
      setLeagueId: (leagueId: number) => set({ leagueId }),
      setPlayerId: (playerId: number) => set({ playerId }),
      clearLeagueId: () => set({ leagueId: null, playerId: null }),
    }),
    {
      name: "app-store",
    }
  ) as any
);
