import apiClient from "../client";

export async function getNotifications() {
  const response = await apiClient.get("/notifications");
  return response.data;
}

export async function markNotificationRead(id: number) {
  const response = await apiClient.put(`/notifications/${id}/read`);
  return response.data;
}

export async function getInvitation(token: string) {
  const response = await apiClient.get(`/invitations/${token}`);
  return response.data;
}

export async function claimInvitation(token: string) {
  const response = await apiClient.post(`/invitations/${token}/claim`);
  return response.data;
}

export async function getLeagueInvitations(leagueId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/invitations`);
  return response.data;
}

export async function createLeagueInvitations(
  leagueId: number,
  payload: { playerIds?: number[]; emails?: string[] }
) {
  const response = await apiClient.post(`/leagues/${leagueId}/invitations`, payload);
  return response.data;
}

export async function revokeLeagueInvitation(leagueId: number, invitationId: number) {
  const response = await apiClient.delete(`/leagues/${leagueId}/invitations/${invitationId}`);
  return response.data;
}

export async function createLeagueNotification(
  leagueId: number,
  payload: { title: string; body: string; includeAdmin?: boolean }
) {
  const response = await apiClient.post(`/leagues/${leagueId}/notifications`, payload);
  return response.data;
}

export async function getLeagueOnboarding(leagueId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/onboarding`);
  return response.data;
}

export async function updateLeagueOnboarding(
  leagueId: number,
  payload: { key: string; dismissed?: boolean }
) {
  const response = await apiClient.put(`/leagues/${leagueId}/onboarding`, payload);
  return response.data;
}

export async function getLeagueAuditLogs(leagueId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/audit-logs`);
  return response.data;
}
