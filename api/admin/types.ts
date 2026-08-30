export type BillingCapacityStatus = "active" | "exempt" | "unpaid" | "over_allocated";
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
  paymentExempt: boolean;
  capacityStatus: BillingCapacityStatus;
};

export type AdminBillingTransaction = {
  id: number;
  adminId: number;
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

export type PaymentBypassCodeStatus = "active" | "redeemed" | "expired" | "revoked";

export type PaymentBypassCodeUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export type PaymentBypassCode = {
  id: number;
  codeHint: string;
  label: string | null;
  status: PaymentBypassCodeStatus;
  expiresAt: string | null;
  redeemedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  createdBy: PaymentBypassCodeUser;
  redeemedBy: PaymentBypassCodeUser | null;
};

export type GeneratedPaymentBypassCode = {
  code: string;
  record: Omit<PaymentBypassCode, "createdBy" | "redeemedBy">;
};

export type AdminLeagueListItem = {
  id: number;
  adminId: number;
  name: string;
  type: string;
  format?: string | null;
  completedRoundCount: number;
  roundCount: number;
  contactFirstName?: string | null;
  contactLastName?: string | null;
  contactEmail?: string | null;
  startDate: string;
  endDate: string;
  seasonStatus?: "active" | "archived" | "reopened" | string;
  entitlement: {
    requiredGolfers: number;
    paidGolfers: number;
    refundedGolfers: number;
    status: string;
  };
  renewedFromLeague?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  renewedLeague?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  _count: {
    players: number;
    events: number;
  };
};

export type SeasonSyncResult = {
  leagueId: number;
  eventsProcessed: number;
  roundsUpdated: number;
  scoresUpdated: number;
  playersUpdated: number;
  teamPointRowsUpdated: number;
  skippedEvents: Array<{
    eventId: number;
    name: string;
    reason: string;
  }>;
};

export type SeasonSyncResponse = {
  message: string;
  result: SeasonSyncResult;
};

export type AdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string | null;
  role: "USER" | "ADMIN" | "SUPER" | string;
  phone: string | null;
  emailVerifiedAt: string | null;
  managedLeagueCount: number;
  playerProfileCount: number;
  createdAt: string;
  updatedAt: string;
};
