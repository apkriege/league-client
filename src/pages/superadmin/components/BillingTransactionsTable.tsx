import Table, { type Column } from "@/components/Table";
import type { AdminBillingTransaction } from "@api/admin/types";
import Chip from "@mui/material/Chip";
import { formatBillingCurrency, formatBillingDate, formatCheckoutPurpose } from "../billingFormat";

const STATUS_LABELS = {
  paid: "Paid",
  partially_refunded: "Partial refund",
  refunded: "Refunded",
} as const;

type BillingTransactionsTableProps = {
  transactions: AdminBillingTransaction[];
  limit: number;
};

export default function BillingTransactionsTable({
  transactions,
  limit,
}: BillingTransactionsTableProps) {
  const columns: Column<AdminBillingTransaction>[] = [
    {
      key: "createdAt",
      label: "Date",
      width: "155px",
      render: (value) => <span className="text-xs text-slate-600">{formatBillingDate(String(value))}</span>,
    },
    {
      key: "userName",
      label: "Administrator",
      render: (_value, transaction) => (
        <div>
          <p className="text-sm font-semibold text-slate-950">{transaction.userName}</p>
          <p className="text-xs text-slate-500">{transaction.userEmail || "Account removed"}</p>
        </div>
      ),
    },
    {
      key: "purpose",
      label: "Purpose",
      render: (value) => <span className="text-xs capitalize">{formatCheckoutPurpose(String(value))}</span>,
    },
    {
      key: "leagueName",
      label: "League",
      render: (value) => <span className="text-xs">{value ? String(value) : "Account-wide"}</span>,
    },
    {
      key: "quantity",
      label: "Spots",
      width: "90px",
      render: (_value, transaction) => (
        <span className="text-xs font-semibold">
          {transaction.quantity}
          {transaction.refundedQuantity > 0 ? ` / ${transaction.refundedQuantity} refunded` : ""}
        </span>
      ),
    },
    {
      key: "netAmountCents",
      label: "Net value",
      width: "110px",
      render: (value, transaction) => (
        <span className="text-xs font-semibold">
          {formatBillingCurrency(Number(value), transaction.currency)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "125px",
      render: (value) => (
        <Chip
          label={STATUS_LABELS[value as AdminBillingTransaction["status"]]}
          size="small"
          color={value === "paid" ? "success" : value === "refunded" ? "default" : "warning"}
          variant="outlined"
        />
      ),
    },
    {
      key: "sessionId",
      label: "Stripe session",
      render: (value) => (
        <code className="block max-w-36 truncate text-[10px] text-slate-500" title={String(value)}>
          {String(value)}
        </code>
      ),
    },
  ];

  return (
    <Table
      data={transactions}
      columns={columns}
      heading={`Latest Transactions (up to ${limit})`}
      searchPlaceholder="Search transactions..."
      variant="clean"
    />
  );
}
