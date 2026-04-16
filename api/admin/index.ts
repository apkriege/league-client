// api calls
import apiClient from "../client";

// calls
export async function getAdminLeagues() {
  const response = await apiClient.get("/admin/leagues");
  return response.data;
}

export async function getAdminLeague(leagueId: number) {
  const response = await apiClient.get(`/admin/leagues/${leagueId}`);
  return response.data;
}
