// api calls
import apiClient from "../client";

// calls
export async function getAdminLeagues() {
  const response = await apiClient.get("/admin/leagues");
  return response.data;
}

export async function getLeague(id: number) {
  const response = await apiClient.get(`/leagues/${id}`);
  return response.data;
}

export async function getLeagues() {
  const response = await apiClient.get("/leagues");
  return response.data;
}

export async function createLeague(leagueData: any) {
  const response = await apiClient.post("/leagues", leagueData);
  return response.data;
}

export async function updateLeague(id: number, leagueData: any) {
  const response = await apiClient.put(`/leagues/${id}`, leagueData);
  return response.data;
}

export async function deleteLeague(id: number) {
  const response = await apiClient.delete(`/leagues/${id}`);
  return response.data;
}

export async function createLeagueEvent(leagueId: number, eventData: any) {
  const response = await apiClient.post(`/leagues/${leagueId}/event`, eventData);
  return response.data;
}

export async function createLeagueEvents(leagueId: number, eventsData: any[]) {
  const response = await apiClient.post(`/leagues/${leagueId}/events`, {
    events: eventsData,
  });
  return response.data;
}

export async function getLeagueEvents(leagueId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/events`);
  return response.data;
}

export async function getLeagueEvent(leagueId: number, eventId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/events/${eventId}`);
  return response.data;
}

export async function getLeagueEventScores(leagueId: number, eventId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/events/${eventId}/scores`);
  return response.data;
}

export async function submitEventScores(leagueId: number, eventId: number, scoresData: any) {
  const response = await apiClient.post(
    `/leagues/${leagueId}/events/${eventId}/scores`,
    scoresData
  );
  return response.data;
}

export async function getLeaguePlayers(leagueId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/players`);
  return response.data;
}

export async function getLeagueTeams(leagueId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/teams`);
  return response.data;
}

export async function getUserLeagues(userId: number) {
  const response = await apiClient.get(`/users/${userId}/leagues`);
  return response.data;
}
