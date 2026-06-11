import apiClient from "../client";

export type CreateCheckoutSessionPayload = {
  purpose?: "registration" | "seat_upgrade";
  requestedGolfers?: number;
  successUrl?: string;
  cancelUrl?: string;
};

export const createCheckoutSession = async (payload: CreateCheckoutSessionPayload = {}) => {
  const response = await apiClient.post<{
    sessionId: string;
    url: string;
    customerId: string;
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
