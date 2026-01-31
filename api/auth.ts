import apiClient from "./client";

export function login(email: string, password: string) {
  return apiClient.post("/auth/login", { email, password });
}

export function logout() {
  return apiClient.post("/auth/logout");
}
