// api calls
import apiClient from "../client";

// calls
export async function getTeamPlayers(teamId: number) {
  const response = await apiClient.get(`/team/${teamId}/players`);
  return response.data;
}
