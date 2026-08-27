import apiClient from "../client";

export async function updateFlightPlayers(flightId: number, players: any[]) {
  const response = await apiClient.put(`/flights/${flightId}/players`, { players });
  return response.data;
}
