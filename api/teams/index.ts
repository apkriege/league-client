// api calls
import apiClient from "../client";
import type { TeamProfile } from "./types";

// calls
export async function createTeam(leagueId: number, teamData: any) {
  const response = await apiClient.post(`/leagues/${leagueId}/teams`, teamData);
  return response.data;
}

export async function updateTeam(id: number, teamData: any) {
  const response = await apiClient.put(`/teams/${id}`, teamData);
  return response.data;
}

export async function deleteTeam(id: number) {
  const response = await apiClient.delete(`/teams/${id}`);
  return response.data;
}

export async function getTeam(id: number): Promise<TeamProfile> {
  const response = await apiClient.get<TeamProfile>(`/teams/${id}`);
  return response.data;
}

export async function getTeamPlayers(teamId: number) {
  const response = await apiClient.get(`/team/${teamId}/players`);
  return response.data;
}
