// api calls
import apiClient from "../client";

// calls

export async function getPlayers() {
  const response = await apiClient.get("/players");
  return response.data;
}

export async function getPlayerById(id: number) {
  const response = await apiClient.get(`/players/${id}`);
  return response.data;
}

export async function createPlayer(playerData: any) {
  const response = await apiClient.post("/players", playerData);
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
