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
  acceptedPolicies: boolean;
  invitationToken?: string;
}) {
  return apiClient.post("/auth/register", data);
}

export function logout() {
  return apiClient.post("/auth/logout");
}

export function requestPasswordReset(email: string) {
  return apiClient.post("/auth/password-reset/request", { email });
}

export function completePasswordReset(token: string, password: string) {
  return apiClient.post("/auth/password-reset/complete", { token, password });
}

export function verifyEmail(token: string) {
  return apiClient.post("/auth/email-verification/verify", { token });
}

export function resendEmailVerification(email: string) {
  return apiClient.post("/auth/email-verification/resend", { email });
}
