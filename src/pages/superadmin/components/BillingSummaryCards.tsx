import Card from "@/components/layout/Card";
import type { AdminBillingSummary } from "@api/admin/types";
import { CreditCard, RotateCcw, Users, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import { formatBillingCurrency } from "../billingFormat";

type BillingSummaryCardsProps = {
  summary: AdminBillingSummary;
};

function SummaryCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="h-full p-4!">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <div className="rounded-xl bg-sky-50 p-2.5 text-sky-700">{icon}</div>
      </div>
    </Card>
  );
}

export default function BillingSummaryCards({ summary }: BillingSummaryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        icon={<WalletCards size={18} />}
        label="Net capacity value"
        value={formatBillingCurrency(summary.netRevenueCents, summary.currency)}
        detail={`${formatBillingCurrency(summary.pricePerGolferCents, summary.currency)} per paid spot`}
      />
      <SummaryCard
        icon={<CreditCard size={18} />}
        label="Completed payments"
        value={summary.completedPayments.toLocaleString()}
        detail={`${summary.customerAccounts.toLocaleString()} Stripe customer accounts`}
      />
      <SummaryCard
        icon={<Users size={18} />}
        label="Active paid spots"
        value={summary.activePaidSeats.toLocaleString()}
        detail={`${summary.purchasedSeats.toLocaleString()} purchased total`}
      />
      <SummaryCard
        icon={<RotateCcw size={18} />}
        label="Refunded spots"
        value={summary.refundedSeats.toLocaleString()}
        detail={formatBillingCurrency(summary.refundedRevenueCents, summary.currency)}
      />
    </div>
  );
}
