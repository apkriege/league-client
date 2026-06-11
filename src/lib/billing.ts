export const BILLING_MIN_GOLFERS = Math.max(
  1,
  Number(import.meta.env.VITE_BILLING_MIN_GOLFERS || 8)
);
export const BILLING_PRICE_PER_GOLFER = Math.max(
  0,
  Number(import.meta.env.VITE_BILLING_PRICE_PER_GOLFER || 10)
);

export const formatBillingPrice = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
