import apiClient from "../client";

export type CreateCheckoutSessionPayload = {
  productName?: string;
  unitAmount?: number;
  currency?: string;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
};

export const createCheckoutSession = async (payload: CreateCheckoutSessionPayload = {}) => {
  const response = await apiClient.post<{
    sessionId: string;
    url: string;
    customerId: string;
    productId: string;
    defaultPriceId: string;
  }>("/payments/checkout-session", payload);

  return response.data;
};

export const getStripeState = async () => {
  const response = await apiClient.get<{ stripe: any }>("/payments/stripe-state");
  return response.data;
};
