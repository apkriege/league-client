import PaymentAccessCodeForm from "./PaymentAccessCodeForm";
import { useState } from "react";
import { useQueryClient, useIsMutating } from "@tanstack/react-query";
import { useLeague } from "@api/league/queries";
import { useCreateCheckoutSession } from "@api/payments/mutations";
import Modal from "@/components/layout/Modal";
import Button from "@/components/layout/Button";
import { getApiErrorMessage } from "@/lib/apiError";
import { getLeagueCapacity } from "@/lib/billing";
import { useAppStore } from "@/stores/appStore";

export default function TrialExpiredModal({ leagueId, onClose, backLabel = "Back to scores", onActivated, title = "Your free trial is over" }: {
  leagueId: number; onClose: () => void; backLabel?: string; title?: string; onActivated?: () => void | Promise<unknown>;
}) {
  const { data: league, isLoading, isError, refetch } = useLeague(leagueId);
  const userId = useAppStore((state) => state.user?.id);
  const checkout = useCreateCheckoutSession();
  const isApplyingCode = useIsMutating({ mutationKey: ["payment-access-code"] }) > 0;
  const isBusy = checkout.isPending || isApplyingCode;
  const queryClient = useQueryClient();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const ownsLeague = league && Number(league.adminId) === Number(userId);
  const capacity = getLeagueCapacity(league);

  const startCheckout = async () => {
    setCheckoutError(null);
    try {
      const result = await checkout.mutateAsync({
        purpose: "league_capacity", leagueId, requestedGolfers: capacity,
        successUrl: `${window.location.origin}/league/${leagueId}/admin?checkout=season_payment_success`,
        cancelUrl: `${window.location.origin}/league/${leagueId}/admin?checkout=season_payment_cancel`,
      });
      if (result.alreadyCovered) {
        await queryClient.invalidateQueries({ queryKey: ["league", leagueId] });
        await (onActivated ?? onClose)();
        return;
      }
      if (!result.url) throw new Error("Checkout is unavailable. Please try again.");
      window.location.assign(result.url);
    } catch (error) {
      setCheckoutError(getApiErrorMessage(error, "Unable to start checkout. Please try again."));
    }
  };

  return <Modal isOpen title={title} onClose={() => { if (!isBusy) onClose(); }}>
    <div className="space-y-4">
      <p className="text-sm leading-6 text-slate-600">Have a free code? Enter it below for full access to this league. Otherwise, continue to checkout.</p>
      {isLoading ? <p className="text-xs text-slate-500">Loading league billing...</p>
        : isError || !league || capacity <= 0 ? <div role="alert" className="space-y-2 text-sm text-red-700">
          <p>Unable to load league billing.</p><Button variant="default" onClick={() => void refetch()}>Try again</Button>
        </div>
        : !ownsLeague ? <p className="text-sm text-slate-600">Ask your league administrator to activate the league before submitting these scores.</p>
        : null}
      {ownsLeague && !isError && capacity > 0 && <PaymentAccessCodeForm leagueId={leagueId} disabled={checkout.isPending} onRedeemed={onActivated ?? onClose} />}
      {checkoutError && <p role="alert" className="text-sm text-red-700">{checkoutError}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="default" disabled={isBusy} onClick={onClose}>{backLabel}</Button>
        {ownsLeague && <Button variant="primary" disabled={isBusy || isLoading || isError || capacity <= 0} onClick={() => void startCheckout()}>
          {checkout.isPending ? "Preparing checkout..." : "Continue to checkout"}
        </Button>}
      </div>
    </div>
  </Modal>;
}
