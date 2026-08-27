// api calls
import apiClient from "../client";
import type {
  AdminBillingDashboard,
  AdminLeagueListItem,
  AdminUser,
  GeneratedPaymentBypassCode,
  PaymentBypassCode,
  SeasonSyncResponse,
} from "./types";

// calls
export async function getAdminLeagues() {
  const response = await apiClient.get<AdminLeagueListItem[]>("/admin/leagues");
  return response.data;
}

export async function getAdminUsers() {
  const response = await apiClient.get<AdminUser[]>("/users");
  return response.data;
}

export async function syncAdminLeagueSeason(leagueId: number) {
  const response = await apiClient.post<SeasonSyncResponse>(`/leagues/${leagueId}/season-sync`);
  return response.data;
}

export async function getAdminBilling() {
  const response = await apiClient.get<AdminBillingDashboard>("/admin/billing");
  return response.data;
}

export async function getPaymentBypassCodes() {
  const response = await apiClient.get<PaymentBypassCode[]>("/admin/payment-bypass-codes");
  return response.data;
}

export async function createPaymentBypassCode(input: {
  label?: string;
  expiresInDays: number;
}) {
  const response = await apiClient.post<GeneratedPaymentBypassCode>(
    "/admin/payment-bypass-codes",
    input
  );
  return response.data;
}

export async function revokePaymentBypassCode(id: number) {
  await apiClient.delete(`/admin/payment-bypass-codes/${id}`);
}

export async function updateLeagueLifecycle(input: {
  leagueId: number;
  status: "archived" | "reopened";
}) {
  const response = await apiClient.patch(`/admin/leagues/${input.leagueId}/lifecycle`, {
    status: input.status,
  });
  return response.data;
}

export async function correctLeagueRenewalLink(leagueId: number) {
  const response = await apiClient.delete(`/admin/leagues/${leagueId}/renewal-link`);
  return response.data;
}
