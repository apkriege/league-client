import apiClient from "../client";

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

export async function getLeagueAnnouncements(leagueId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/announcements`);
  return response.data;
}

export async function createLeagueAnnouncement(
  leagueId: number,
  payload: { title: string; body: string }
) {
  const response = await apiClient.post(`/leagues/${leagueId}/announcements`, payload);
  return response.data;
}

export async function updateLeagueAnnouncement(
  leagueId: number,
  announcementId: number,
  payload: { title?: string; body?: string }
) {
  const response = await apiClient.put(
    `/leagues/${leagueId}/announcements/${announcementId}`,
    payload
  );
  return response.data;
}

export async function deleteLeagueAnnouncement(leagueId: number, announcementId: number) {
  const response = await apiClient.delete(`/leagues/${leagueId}/announcements/${announcementId}`);
  return response.data;
}

export async function getLeagueAuditLogs(leagueId: number) {
  const response = await apiClient.get(`/leagues/${leagueId}/audit-logs`);
  return response.data;
}
