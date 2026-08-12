import LoadingState from "@/components/layout/LoadingState";
import PageHeader from "@/components/layout/PageHeader";
import PageState from "@/components/layout/PageState";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { useAdminBilling } from "@api/admin/queries";
import { ExternalLink, Info } from "lucide-react";
import BillingAccountsTable from "./components/BillingAccountsTable";
import BillingSummaryCards from "./components/BillingSummaryCards";
import BillingTransactionsTable from "./components/BillingTransactionsTable";

export default function BillingAdmin() {
  const { data, isLoading, isError, error } = useAdminBilling();

  if (isLoading) return <LoadingState>Loading billing...</LoadingState>;

  if (isError || !data) {
    const status = getApiErrorStatus(error);
    return (
      <PageState
        title={status === 403 ? "Access Denied" : "Unable to Load Billing"}
        message={getApiErrorMessage(error, "The billing dashboard could not be loaded right now.")}
        variant={status === 403 ? "forbidden" : "error"}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeader
          title="Billing"
          subTitle="Monitor paid golfer capacity and completed Stripe checkouts across every administrator."
        />
        <a
          href="https://dashboard.stripe.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Open Stripe Dashboard
          <ExternalLink size={14} />
        </a>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-900">
        <Info className="mt-0.5 shrink-0" size={15} />
        <p>
          This is a read-only view of completed payments recorded by League Night. Dollar values
          use the configured per-golfer price; use Stripe for exact totals, failed payments, open
          disputes, receipts, and issuing refunds.
        </p>
      </div>

      <BillingSummaryCards summary={data.summary} />
      <BillingAccountsTable accounts={data.accounts} />
      <BillingTransactionsTable transactions={data.transactions} limit={data.transactionLimit} />
    </div>
  );
}
