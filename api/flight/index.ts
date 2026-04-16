import apiClient from "../client";

// admin routes
export async function getFlight(flightId: number) {
  const response = await apiClient.get(`/admin/flight/${flightId}`);
  return response.data;
}

export async function updateFlightPlayers(flightId: number, players: any[]) {
  const response = await apiClient.put(`/admin/flight/${flightId}/players`, { players });
  return response.data;
}

// user routes
