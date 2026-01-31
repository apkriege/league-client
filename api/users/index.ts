// api calls
import apiClient from "../client";

export async function getUserLeagues(userId: number) {
  const response = await apiClient.get(`/users/${userId}/leagues`);
  return response.data;
}
