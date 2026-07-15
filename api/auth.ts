import apiClient from "./client";

export function login(email: string, password: string) {
  return apiClient.post("/auth/login", { email, password });
}

export function loginWithLeagueCode(code: string) {
  return apiClient.post("/auth/league-code", { code });
}

export function register(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  return apiClient.post("/auth/register", data);
}

export function logout() {
  return apiClient.post("/auth/logout");
}
