// api calls
import apiClient from "../client";

// calls
export async function getLeagueMetrics(leagueId: number, periodId?: number | null) {
  const response = await apiClient.get(`/leagues/${leagueId}/metrics`, {
    params: periodId ? { periodId } : undefined,
  });
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

export async function rotateLeagueViewerAccessCode(leagueId: number) {
  const response = await apiClient.post(`/leagues/${leagueId}/viewer-access-code/rotate`);
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

export async function getLeagueEvents(leagueId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/events`);
  return response.data;
}

export async function getLeagueEvent(leagueId: number, eventId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/events/${eventId}`);
  return response.data;
}

export async function createLeagueEvent(leagueId: number, eventData: any) {
  const response = await apiClient.post(`/leagues/${leagueId}/event`, eventData);
  return response.data;
}

export async function getLeagueEventScores(leagueId: number, eventId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/events/${eventId}/scores`);
  return response.data;
}

export async function createLeagueEvents(
  leagueId: number,
  payload: { events: any[]; scoringPeriods?: any[] }
) {
  const response = await apiClient.post(`/leagues/${leagueId}/events`, payload);
  return response.data;
}

export async function updateLeagueEvent(leagueId: number, eventId: number, eventData: any) {
  const response = await apiClient.put(`/leagues/${leagueId}/events/${eventId}`, eventData);
  return response.data;
}

export async function deleteLeagueEvent(leagueId: number, eventId: number) {
  const response = await apiClient.delete(`/leagues/${leagueId}/events/${eventId}`);
  return response.data;
}

export async function cancelLeagueEvent(leagueId: number, eventId: number) {
  const response = await apiClient.patch(`/leagues/${leagueId}/events/${eventId}/cancel`);
  return response.data;
}

export async function createEventScores(leagueId: number, eventId: number, scoresData: any) {
  const response = await apiClient.post(
    `/leagues/${leagueId}/events/${eventId}/scores`,
    scoresData
  );
  return response.data;
}

export async function updateEventScores(leagueId: number, eventId: number, scoresData: any) {
  const response = await apiClient.put(`/leagues/${leagueId}/events/${eventId}/scores`, scoresData);
  return response.data;
}
