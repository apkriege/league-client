import Players from "./forms/PlayersForm";
import TeamsForm from "./forms/TeamsForm";
import ReviewForm from "./forms/ReviewForm";
import { FormProvider, useForm } from "react-hook-form";
import { useCreateLeague } from "@api/league/mutations";
import { useCreateCheckoutSession } from "@api/payments/mutations";
import { useStripeState } from "@api/payments/queries";
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import InfoForm from "./forms/InfoForm";
import { useToast } from "@/context/ToastContext";
import Stepper from "@/components/layout/Stepper";
import { BILLING_MIN_GOLFERS } from "@/lib/billing";
import { useAppStore } from "@/stores/appStore";

const defaultLeagueData = {
  name: "",
  description: "",
  numPlayers: BILLING_MIN_GOLFERS,
  type: "season",
  format: "team",
  access: "public",
  contactFirstName: "",
  contactLastName: "",
  contactEmail: "",
  contactPhone: "",
  startDate: new Date(),
  endDate: new Date(),
  players: [],
  teams: [],
};

const DRAFT_STORAGE_KEY = "create-league-draft";

const modelLeagueData = (league: any) => {
  const { players, teams, ...info } = league;

  const isSeason = info.type === "season";
  const isTeamSeason = isSeason && info.format === "team";

  return {
    ...info,
    numPlayers: Math.max(BILLING_MIN_GOLFERS, (players || []).length, Number(info.numPlayers || 0)),
    format: isSeason ? info.format : null,
    players: (players || []).map((p: any) => ({
      ...p,
      id: Number(p.id),
    })),
    teams: isTeamSeason ? teams : [],
  };
};

export default function CreateLeague() {
  const { show } = useToast();
  const topRef = useRef<HTMLDivElement>(null);
  const createLeague = useCreateLeague();
  const createCheckoutSession = useCreateCheckoutSession();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const {
    data: stripeState,
    isLoading: billingLoading,
    refetch: refetchStripeState,
  } = useStripeState(Boolean(user));

  const [step, setStep] = useState(1);

  const leagueForm = useForm({
    defaultValues: defaultLeagueData,
  });

  const currentType = String(leagueForm.watch("type") || "").toLowerCase();
  const currentFormat = String(leagueForm.watch("format") || "").toLowerCase();
  const currentSteps =
    currentType === "season" && currentFormat === "team"
      ? ["info", "players", "teams", "review"]
      : ["info", "players", "review"];

  useEffect(() => {
    const draft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!draft) {
      if (user) {
        leagueForm.reset({
          ...defaultLeagueData,
          contactFirstName: user.firstName || "",
          contactLastName: user.lastName || "",
          contactEmail: user.email || "",
          contactPhone: user.phone || "",
        });
      }
      return;
    }

    try {
      const parsed = JSON.parse(draft);
      leagueForm.reset({
        ...defaultLeagueData,
        ...parsed,
        startDate: parsed?.startDate ? new Date(parsed.startDate) : defaultLeagueData.startDate,
        endDate: parsed?.endDate ? new Date(parsed.endDate) : defaultLeagueData.endDate,
      });
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [leagueForm, user]);

  useEffect(() => {
    const subscription = leagueForm.watch((values) => {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
    });

    return () => subscription.unsubscribe();
  }, [leagueForm]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");

    if (!checkoutStatus) return;

    if (checkoutStatus === "registration_success") {
      refetchStripeState();
      show("Golfer slot payment completed successfully.", "success");
      setStep(currentSteps.length);
    } else if (checkoutStatus === "registration_cancel") {
      show("Golfer slot checkout was canceled.", "warning");
      setStep(currentSteps.length);
    } else if (checkoutStatus === "upgrade_success") {
      refetchStripeState();
      show("Additional golfer payment completed successfully.", "success");
      setStep(currentSteps.length);
    } else if (checkoutStatus === "upgrade_cancel") {
      show("Additional golfer checkout was canceled.", "warning");
      setStep(currentSteps.length);
    }

    params.delete("checkout");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", nextUrl);
  }, [currentSteps.length, refetchStripeState, show]);

  const handleSubmit = () => {
    if (billingLoading) {
      show("Checking billing status. Please try again in a moment.", "warning");
      return;
    }

    const data = leagueForm.getValues();
    const modeledData = modelLeagueData(data);
    const includedGolfers = Number(stripeState?.billing?.includedGolfers || 0);
    const allocatedGolfers = Number(stripeState?.billing?.allocatedGolfers || 0);
    const requestedGolfers = Math.max(
      BILLING_MIN_GOLFERS,
      modeledData.players.length,
      Number(modeledData.numPlayers || 0)
    );
    const targetIncludedGolfers = allocatedGolfers + requestedGolfers;

    if (!stripeState?.billing?.hasCompletedRegistration || includedGolfers < BILLING_MIN_GOLFERS) {
      createCheckoutSession.mutate(
        {
          purpose: "registration",
          requestedGolfers: BILLING_MIN_GOLFERS,
          successUrl: `${window.location.origin}/leagues/create?checkout=registration_success`,
          cancelUrl: `${window.location.origin}/leagues/create?checkout=registration_cancel`,
        },
        {
          onSuccess: (checkout) => {
            if (!checkout?.url) {
              show("Could not start registration checkout. Please try again.", "error");
              return;
            }
            window.location.href = checkout.url;
          },
          onError: (error: any) => {
            show(error?.message || "Failed to start registration checkout.", "error");
          },
        }
      );
      return;
    }

    if (targetIncludedGolfers > includedGolfers) {
      createCheckoutSession.mutate(
        {
          purpose: "seat_upgrade",
          requestedGolfers: targetIncludedGolfers,
          successUrl: `${window.location.origin}/leagues/create?checkout=upgrade_success`,
          cancelUrl: `${window.location.origin}/leagues/create?checkout=upgrade_cancel`,
        },
        {
          onSuccess: (checkout) => {
            if (!checkout?.url) {
              show("Could not start golfer upgrade checkout. Please try again.", "error");
              return;
            }
            window.location.href = checkout.url;
          },
          onError: (error: any) => {
            show(error?.message || "Failed to start golfer upgrade checkout.", "error");
          },
        }
      );
      return;
    }

    createLeague.mutate(modeledData, {
      onSuccess: (league) => {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
        navigate(`/league/${league.id}/admin`);
      },
      onError: (error) => {
        show((error as any)?.message || "Failed to create league.", "error");
      },
    });
  };

  const leagueData = leagueForm.watch();
  const steps =
    leagueData.type === "season" && leagueData.format === "team"
      ? ["info", "players", "teams", "review"]
      : ["info", "players", "review"];
  const footerIncludedGolfers = Number(stripeState?.billing?.includedGolfers || 0);
  const footerAllocatedGolfers = Number(stripeState?.billing?.allocatedGolfers || 0);
  const footerRequestedGolfers = Math.max(
    BILLING_MIN_GOLFERS,
    (leagueData.players || []).length,
    Number(leagueData.numPlayers || 0)
  );
  const footerNeedsRegistrationPayment =
    !stripeState?.billing?.hasCompletedRegistration || footerIncludedGolfers < BILLING_MIN_GOLFERS;
  const footerAdditionalGolfersRequired = Math.max(
    0,
    footerAllocatedGolfers + footerRequestedGolfers - footerIncludedGolfers
  );
  const finalActionLabel = footerNeedsRegistrationPayment
    ? `Pay for ${BILLING_MIN_GOLFERS} Golfers`
    : footerAdditionalGolfersRequired > 0
      ? `Pay for ${footerAdditionalGolfersRequired} More Golfers`
      : "Create League";

  const goToStep = (nextStep: number) => {
    setStep(Math.max(1, Math.min(steps.length, nextStep)));
  };

  useEffect(() => {
    setStep((prev) => Math.max(1, Math.min(steps.length, prev)));
  }, [steps.length]);

  return (
    <div>
      <div ref={topRef} />
      <div>
        <FormProvider {...leagueForm}>
          <div className="step-body">
            {step === 1 && <InfoForm />}
            {step === 2 && <Players />}
            {steps.length === 4 && step === 3 && <TeamsForm />}
            {((steps.length === 4 && step === 4) || (steps.length === 3 && step === 3)) && (
              <ReviewForm
                leagueData={leagueData}
                billing={stripeState?.billing}
                isBillingLoading={billingLoading}
              />
            )}
          </div>
        </FormProvider>
      </div>
      {step <= steps.length && (
        <Stepper
          step={step}
          totalSteps={steps.length}
          isSubmitting={createLeague.isPending || createCheckoutSession.isPending || billingLoading}
          smoothScroll
          scrollTargetRef={topRef}
          nextLabel={
            step === steps.length
              ? billingLoading
                ? "Checking Billing..."
                : finalActionLabel
              : undefined
          }
          onBack={() => {
            goToStep(Math.max(1, step - 1));
          }}
          onNext={() => {
            if (step === steps.length) {
              handleSubmit();
              return;
            }

            goToStep(step + 1);
          }}
        />
      )}
    </div>
  );
}
