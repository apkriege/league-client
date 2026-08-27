import apiClient from "../client";

export type CheckoutPurpose = "registration" | "seat_upgrade" | "league_season" | "league_capacity";

export type CreateCheckoutSessionPayload = {
  purpose?: CheckoutPurpose;
  leagueId?: number;
  renewedFromLeagueId?: number;
  billingDraftKey?: string;
  requestedGolfers?: number;
  successUrl?: string;
  cancelUrl?: string;
};

export type CheckoutConfirmation = {
  sessionId: string;
  status: "succeeded" | "processing" | "failed";
  purpose: CheckoutPurpose;
  message: string | null;
};

export const createCheckoutSession = async (payload: CreateCheckoutSessionPayload = {}) => {
  const response = await apiClient.post<{
    alreadyCovered?: boolean;
    sessionId: string | null;
    url: string | null;
    customerId: string | null;
    priceId: string | null;
    quantity: number;
    targetGolfers: number;
  }>("/payments/checkout-session", payload);

  return response.data;
};

export const getStripeState = async () => {
  const response = await apiClient.get<{ stripe: any; billing: any }>("/payments/stripe-state");
  return response.data;
};

export const redeemPaymentBypassCode = async (code: string) => {
  const response = await apiClient.post<{ message: string; billing: any }>(
    "/payments/bypass-code",
    { code }
  );
  return response.data;
};

export const confirmCheckoutSession = async (sessionId: string) => {
  const response = await apiClient.get<CheckoutConfirmation>(
    `/payments/checkout-session/${encodeURIComponent(sessionId)}`
  );
  return response.data;
};
