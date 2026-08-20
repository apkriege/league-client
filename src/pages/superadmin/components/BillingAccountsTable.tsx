import Table, { type Column } from "@/components/Table";
import type { AdminBillingAccount } from "@api/admin/types";
import Chip from "@mui/material/Chip";

const STATUS_LABELS = {
  active: "Active",
  exempt: "Payment exempt",
  unpaid: "Not paid",
  over_allocated: "Over allocated",
} as const;

type BillingAccountsTableProps = {
  accounts: AdminBillingAccount[];
};

export default function BillingAccountsTable({ accounts }: BillingAccountsTableProps) {
  const columns: Column<AdminBillingAccount>[] = [
    {
      key: "name",
      label: "Administrator",
      render: (_value, account) => (
        <div>
          <p className="text-sm font-semibold text-slate-950">{account.name}</p>
          <p className="text-xs text-slate-500">{account.email}</p>
        </div>
      ),
    },
    {
      key: "stripeCustomerId",
      label: "Stripe customer",
      render: (value) =>
        value ? (
          <code className="text-[11px] text-slate-600">{String(value)}</code>
        ) : (
          <span className="text-xs text-slate-400">Not created</span>
        ),
    },
    {
      key: "capacityStatus",
      label: "Status",
      render: (value) => (
        <Chip
          label={STATUS_LABELS[value as AdminBillingAccount["capacityStatus"]]}
          size="small"
          color={
            value === "active" || value === "exempt"
              ? "success"
              : value === "over_allocated"
                ? "error"
                : "default"
          }
          variant="outlined"
        />
      ),
    },
    { key: "leagueCount", label: "Leagues", width: "90px" },
    { key: "includedGolfers", label: "Paid spots", width: "105px" },
    { key: "allocatedGolfers", label: "Allocated", width: "105px" },
    { key: "availableGolfers", label: "Available", width: "105px" },
  ];

  return (
    <Table
      data={accounts}
      columns={columns}
      heading="Administrator Capacity"
      searchPlaceholder="Search administrators..."
      variant="clean"
    />
  );
}
