import Card from "@/components/layout/Card";
import Divider from "@/components/layout/Divider";
import { ClipboardCheck } from "lucide-react";
import { useCreateCheckoutSession } from "@api/payments/mutations";
import { useToast } from "@/context/ToastContext";

interface ReviewFormProps {
  leagueData: any;
  handleBack: () => void;
}

export default function ReviewForm({ leagueData, handleBack }: ReviewFormProps) {
  const { show } = useToast();
  const createCheckoutSession = useCreateCheckoutSession();
  const players = leagueData?.players || [];
  const teams = leagueData?.teams || [];

  const handleStartCheckout = () => {
    const productName = leagueData?.name
      ? `${leagueData.name} League Setup`
      : "League Setup Payment";

    createCheckoutSession.mutate(
      {
        productName,
        unitAmount: 2000,
        currency: "usd",
        quantity: 1,
        successUrl: `${window.location.origin}/admin/league/create?checkout=success`,
        cancelUrl: `${window.location.origin}/admin/league/create?checkout=cancel`,
      },
      {
        onSuccess: (data) => {
          if (!data?.url) {
            show("Could not start checkout. Please try again.", "error");
            return;
          }

          window.location.href = data.url;
        },
        onError: () => {
          show("Failed to create Stripe checkout session.", "error");
        },
      }
    );
  };

  return (
    <div>
      <div className="badge badge-secondary mb-2 font-semibold rounded-full text-[10px]">
        <ClipboardCheck size={14} />
        <span>REVIEW</span>
      </div>
      <h1 className="text-3xl font-extrabold mb-2">Review Your League Setup</h1>
      <p className="text-sm text-gray-500 mb-6 w-2/3">
        Take a final look at your league details before launching. Review your players, teams, and
        settings to ensure everything is ready for tee-off. You can go back and make changes if
        needed.
      </p>
      <div className="flex">
        <div className="w-2/3"></div>
        <div className="w-1/3">
          <Card className="p-4 border bg-base-100/90">
            <div>
              <h2 className="text-lg font-bold mb-3">League Summary</h2>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">{players.length}</span> Players
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">{teams.length}</span> Teams
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Format: <span className="font-medium">{leagueData.format}</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Scoring: <span className="font-medium">{leagueData.scoring}</span>
              </p>
            </div>
            <Divider className="my-4" />
            <div className="grid grid-cols-3 gap-2">
              <button type="button" className="btn btn-secondary w-full" onClick={handleBack}>
                Back
              </button>

              <button
                type="button"
                className="btn btn-primary w-full col-span-2"
                onClick={handleStartCheckout}
                disabled={createCheckoutSession.isPending}
              >
                {createCheckoutSession.isPending ? "Starting Checkout..." : "Pay with Stripe"}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
