export const BILLING_MIN_GOLFERS = Math.max(
  1,
  Number(import.meta.env.VITE_BILLING_MIN_GOLFERS || 8)
);
export const BILLING_PRICE_PER_GOLFER = Math.max(
  0,
  Number(import.meta.env.VITE_BILLING_PRICE_PER_GOLFER || 10)
);

export type SeasonEntitlement = {
  requiredGolfers: number;
  paidGolfers: number;
  refundedGolfers: number;
  status: string;
};

type LeagueWithEntitlement = { entitlement?: SeasonEntitlement | null };

export const getLeagueCapacity = (league?: LeagueWithEntitlement | null) =>
  Math.max(0, Number(league?.entitlement?.requiredGolfers || 0));

export const getLeagueBillingStatus = (league?: LeagueWithEntitlement | null) => {
  const entitlement = league?.entitlement;
  if (!entitlement) return "payment_due" as const;
  if (entitlement?.status === "bypassed") return "exempt" as const;
  const netPaid = Math.max(
    0,
    Number(entitlement?.paidGolfers || 0) - Number(entitlement?.refundedGolfers || 0)
  );
  return netPaid >= getLeagueCapacity(league) ? "active" as const : "payment_due" as const;
};

export const getLeagueBillableGolfers = (players: Array<{ type?: unknown }> = []) => {
  const regularPlayers = players.filter(
    (player) => String(player?.type || "player").trim().toLowerCase() === "player"
  ).length;
  return Math.max(BILLING_MIN_GOLFERS, regularPlayers);
};

export const formatBillingPrice = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
