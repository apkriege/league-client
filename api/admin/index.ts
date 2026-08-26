// api calls
import apiClient from "../client";
import type {
  AdminBillingDashboard,
  AdminLeagueListItem,
  GeneratedPaymentBypassCode,
  PaymentBypassCode,
  SeasonSyncResponse,
} from "./types";

// calls
export async function getAdminLeagues() {
  const response = await apiClient.get<AdminLeagueListItem[]>("/admin/leagues");
  return response.data;
}

export async function syncAdminLeagueSeason(leagueId: number) {
  const response = await apiClient.post<SeasonSyncResponse>(`/leagues/${leagueId}/season-sync`);
  return response.data;
}

export async function getAdminLeague(leagueId: number) {
  const response = await apiClient.get(`/admin/leagues/${leagueId}`);
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
