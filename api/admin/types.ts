export type BillingCapacityStatus = "active" | "unpaid" | "over_allocated";
export type BillingTransactionStatus = "paid" | "partially_refunded" | "refunded";

export type AdminBillingSummary = {
  completedPayments: number;
  customerAccounts: number;
  purchasedSeats: number;
  refundedSeats: number;
  activePaidSeats: number;
  grossRevenueCents: number;
  refundedRevenueCents: number;
  netRevenueCents: number;
  currency: string;
  pricePerGolferCents: number;
};

export type AdminBillingAccount = {
  userId: number;
  name: string;
  email: string;
  role: string;
  stripeCustomerId: string | null;
  leagueCount: number;
  minimumGolfers: number;
  pricePerGolferCents: number;
  currency: string;
  includedGolfers: number;
  allocatedGolfers: number;
  availableGolfers: number;
  hasCompletedRegistration: boolean;
  capacityStatus: BillingCapacityStatus;
};

export type AdminBillingTransaction = {
  id: number;
  sessionId: string;
  paymentIntentId: string | null;
  purpose: string;
  quantity: number;
  refundedQuantity: number;
  targetGolfers: number;
  status: BillingTransactionStatus;
  grossAmountCents: number;
  refundedAmountCents: number;
  netAmountCents: number;
  currency: string;
  createdAt: string;
  refundedAt: string | null;
  userId: number;
  userName: string;
  userEmail: string | null;
  stripeCustomerId: string | null;
  leagueId: number | null;
  leagueName: string | null;
};

export type AdminBillingDashboard = {
  summary: AdminBillingSummary;
  accounts: AdminBillingAccount[];
  transactions: AdminBillingTransaction[];
  transactionLimit: number;
};
