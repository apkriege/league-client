// api calls
import apiClient from "../client";

export async function getEvent(id: number) {
  const response = await apiClient.get(`/events/${id}`);
  return response.data;
}

export async function getEvents(leagueId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/events`);
  return response.data;
}
