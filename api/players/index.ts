// api calls
import apiClient from "../client";
import type { PlayerStatsResponse } from "./types";

// calls
export async function createPlayers(leagueId: number, players: any[]) {
  const response = await apiClient.post(`/leagues/${leagueId}/players/batch`, { players });
  return response.data;
}

export async function updatePlayer(id: number, playerData: any) {
  const response = await apiClient.put(`/players/${id}`, playerData);
  return response.data;
}

export async function deletePlayer(id: number) {
  const response = await apiClient.delete(`/players/${id}`);
  return response.data;
}

export async function getPlayerStats(
  leagueId: number,
  playerId: number,
): Promise<PlayerStatsResponse> {
  const response = await apiClient.get(`/leagues/${leagueId}/players/${playerId}/stats`);
  return response.data;
}
