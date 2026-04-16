// api calls
import apiClient from "../client";

export async function createLeagueEvents(leagueId: number, eventsData: any[]) {
  const response = await apiClient.post(`/leagues/${leagueId}/events`, {
    events: eventsData,
  });
  return response.data;
}

export async function updateLeagueEvent(eventId: number, eventData: any) {
  const response = await apiClient.put(`/admin/events/${eventId}`, eventData);
  return response.data;
}

export async function deleteLeagueEvent(eventId: number) {
  const response = await apiClient.delete(`/admin/events/${eventId}`);
  return response.data;
}

export async function submitEventScores(leagueId: number, eventId: number, scoresData: any) {
  const response = await apiClient.post(
    `/leagues/${leagueId}/events/${eventId}/scores`,
    scoresData
  );
  return response.data;
}
